import axios from 'axios';

const UPLOAD_API_URL = 'https://9xd63zeaqb.execute-api.us-east-1.amazonaws.com/dev/upload';

interface FileEntry {
    filename: string;
    contentType: string;
}

interface UploadInfo {
    filename: string;
    contentType: string;
    objectKey: string;
    uploadUrl: string;
}

interface PresignedUrlResponse {
    uploads: UploadInfo[];
}

/**
 * Request presigned S3 URLs for the given files.
 */
export async function getPresignedUrls(files: FileEntry[]): Promise<UploadInfo[]> {
    const response = await axios.post<PresignedUrlResponse>(UPLOAD_API_URL, { files });
    return response.data.uploads;
}

/**
 * Upload a single file to S3 using a presigned URL.
 */
export async function uploadFileToS3(
    presignedUrl: string,
    file: File,
    onProgress?: (percent: number) => void,
): Promise<void> {
    await axios.put(presignedUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (e) => {
            if (onProgress && e.total) {
                onProgress(Math.round((e.loaded * 100) / e.total));
            }
        },
    });
}

/**
 * Upload multiple files: get presigned URLs, then PUT each file to S3.
 * Returns the list of S3 object keys for the uploaded files.
 */
export async function uploadFiles(
    files: File[],
    onProgress?: (fileIndex: number, percent: number) => void,
): Promise<string[]> {
    // Step 1: get presigned URLs
    const entries: FileEntry[] = files.map((f) => ({
        filename: f.name,
        contentType: f.type || 'application/pdf',
    }));
    const uploads = await getPresignedUrls(entries);

    // Step 2: PUT each file to its presigned URL
    await Promise.all(
        uploads.map((info, idx) =>
            uploadFileToS3(info.uploadUrl, files[idx], (pct) => onProgress?.(idx, pct)),
        ),
    );

    return uploads.map((u) => u.objectKey);
}
