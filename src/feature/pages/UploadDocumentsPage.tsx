import React, { useCallback, useRef, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    IconButton,
    LinearProgress,
    CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { uploadFiles } from '../../lib/api/uploadApi';
import { getApiErrorMessage } from '../../lib/api/errors';
import { toast } from 'sonner';
import { ERRORS, SUCCESS, LOADING, PLACEHOLDERS } from '../../lib/constants/messages';

const UploadDocumentsPage: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [fileProgress, setFileProgress] = useState<Record<number, number>>({});
    const [dragOver, setDragOver] = useState(false);
    const [uploadDone, setUploadDone] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const reset = () => {
        setFiles([]);
        setUploading(false);
        setFileProgress({});
        setDragOver(false);
        setUploadDone(false);
    };

    const MAX_FILES = 20;

    const addFiles = (incoming: FileList | File[]) => {
        const pdfs = Array.from(incoming).filter((f) => f.type === 'application/pdf');
        if (pdfs.length === 0) { toast.error(ERRORS.PDF_ONLY); return; }
        const names = new Set(files.map((f) => f.name));
        const unique = pdfs.filter((f) => !names.has(f.name));
        if (files.length + unique.length > MAX_FILES) {
            toast.error(ERRORS.MAX_FILES(MAX_FILES));
            return;
        }
        setUploadDone(false);
        setFiles((prev) => [...prev, ...unique]);
    };

    const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    }, []);

    const handleUpload = async () => {
        if (files.length === 0) return;
        setUploading(true);
        setFileProgress({});
        try {
            await uploadFiles(files, (fileIdx, pct) => {
                setFileProgress((prev) => ({ ...prev, [fileIdx]: pct })); 
            });
            toast.success(SUCCESS.FILES_UPLOADED(files.length));
            setUploading(false);
            setUploadDone(true);
        } catch (err: any) {
            toast.error(getApiErrorMessage(err, ERRORS.UPLOAD_FILES));
            setUploading(false);
        }
    };

    const totalProgress =
        files.length > 0
            ? Math.round(Object.values(fileProgress).reduce((a, b) => a + b, 0) / files.length)
            : 0;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, maxWidth: 720, mx: 'auto', width: '100%', justifyContent: 'center' }}>

            {/* ── Drop zone (always visible, fixed top) ── */}
            <Box
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => !uploading && inputRef.current?.click()}
                sx={{
                    flexShrink: 0,
                    border: '2px dashed',
                    borderColor: dragOver ? '#1877F2' : '#DFE1E6',
                    borderRadius: '12px',
                    bgcolor: dragOver ? 'rgba(24,119,242,0.04)' : '#FAFBFC',
                    py: 5,
                    textAlign: 'center',
                    cursor: uploading ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': uploading ? {} : { borderColor: '#1877F2', bgcolor: 'rgba(24,119,242,0.04)' },
                }}
            >
                <CloudUploadIcon sx={{ fontSize: 48, color: '#1877F2', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#172B4D', mb: 0.5 }}>
                    {PLACEHOLDERS.DRAG_DROP}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B778C' }}>
                    {PLACEHOLDERS.OR_BROWSE}
                </Typography>
                <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf"
                    multiple
                    hidden
                    onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
                />
            </Box>

            {/* ── Scrollable file list (middle, grows to fill space) ── */}
            {files.length > 0 && (
                <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0, mt: 2 }}>
                    <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#6B778C', letterSpacing: '0.06em', textTransform: 'uppercase', mb: 1.5 }}>
                        {PLACEHOLDERS.FILES_SELECTED(files.length)}
                    </Typography>

                    {files.map((file, idx) => (
                        <Box
                            key={file.name}
                            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, px: 2, mb: 1, bgcolor: '#FFFFFF', border: '1px solid #EBECF0', borderRadius: '8px' }}
                        >
                            <InsertDriveFileIcon sx={{ color: '#1877F2', fontSize: 20, flexShrink: 0 }} />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#172B4D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {file.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6B778C' }}>
                                    {(file.size / 1024).toFixed(1)} KB
                                </Typography>
                                {uploading && fileProgress[idx] !== undefined && (
                                    <LinearProgress
                                        variant="determinate"
                                        value={fileProgress[idx]}
                                        sx={{ mt: 0.5, height: 4, borderRadius: 2, '& .MuiLinearProgress-bar': { bgcolor: '#1877F2' } }}
                                    />
                                )}
                            </Box>
                            {uploadDone
                                ? <CheckCircleIcon sx={{ color: '#00875A', fontSize: 20 }} />
                                : !uploading && (
                                    <IconButton size="small" onClick={() => removeFile(idx)}>
                                        <DeleteIcon sx={{ fontSize: 18, color: '#6B778C' }} />
                                    </IconButton>
                                )
                            }
                        </Box>
                    ))}

                    {uploading && (
                        <Box sx={{ mt: 1.5 }}>
                            <Typography variant="body2" sx={{ color: '#1877F2', fontWeight: 600, mb: 1 }}>
                                {LOADING.UPLOADING(totalProgress)}
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={totalProgress}
                                sx={{ height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { bgcolor: '#1877F2' } }}
                            />
                        </Box>
                    )}
                </Box>
            )}

            {/* ── Frozen footer buttons (always at bottom) ── */}
            <Box
                sx={{
                    flexShrink: 0,
                    mt: 2,
                    pt: 2,
                    pb: 1,
                    display: 'flex',
                    gap: 1.5,
                    justifyContent: 'flex-end',
                    borderTop: '1px solid #DFE1E6',
                }}
            >
                <Button
                    variant="outlined"
                    onClick={reset}
                    disabled={uploading}
                    sx={{ textTransform: 'none', fontWeight: 600, borderColor: '#DFE1E6', color: '#42526E', borderRadius: '8px', '&:hover': { borderColor: '#B3BAC5', bgcolor: '#EBECF0' } }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={uploading || files.length === 0}
                    startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
                    sx={{ textTransform: 'none', fontWeight: 600, bgcolor: '#1877F2', borderRadius: '8px', '&:hover': { bgcolor: '#0A52C4' } }}
                >
                    {uploading ? LOADING.UPLOADING_SHORT : 'Upload'}
                </Button>
            </Box>
        </Box>
    );
};

export default UploadDocumentsPage;
