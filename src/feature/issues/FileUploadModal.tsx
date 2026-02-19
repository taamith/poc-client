import React, { useCallback, useRef, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    IconButton,
    LinearProgress,
    CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { uploadFiles } from '../../lib/api/uploadApi';
import { toast } from 'sonner';
import {
    ERRORS, SUCCESS, LOADING, BUTTONS, HEADERS, PLACEHOLDERS,
} from '../../lib/constants/messages';

interface FileUploadModalProps {
    open: boolean;
    onClose: () => void;
    onProceed: () => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ open, onClose, onProceed }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [fileProgress, setFileProgress] = useState<Record<number, number>>({});
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const reset = () => {
        setFiles([]);
        setUploading(false);
        setFileProgress({});
        setDragOver(false);
    };

    const handleClose = () => {
        if (uploading) return;
        reset();
        onClose();
    };

    const MAX_FILES = 20;

    const addFiles = (incoming: FileList | File[]) => {
        const pdfs = Array.from(incoming).filter((f) => f.type === 'application/pdf');
        if (pdfs.length === 0) {
            toast.error(ERRORS.PDF_ONLY);
            return;
        }
        const names = new Set(files.map((f) => f.name));
        const unique = pdfs.filter((f) => !names.has(f.name));
        if (files.length + unique.length > MAX_FILES) {
            toast.error(ERRORS.MAX_FILES(MAX_FILES));
            return;
        }
        setFiles((prev) => [...prev, ...unique]);
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => setDragOver(false), []);

    const handleUploadAndGenerate = async () => {
        if (files.length === 0) {
            reset();
            onProceed();
            return;
        }

        setUploading(true);
        setFileProgress({});

        try {
            await uploadFiles(files, (fileIdx, pct) => {
                setFileProgress((prev) => ({ ...prev, [fileIdx]: pct }));
            });
            toast.success(SUCCESS.FILES_UPLOADED(files.length));
            reset();
            onProceed();
        } catch (err: any) {
            console.error('Upload failed:', err);
            toast.error(err.response?.data?.message || err.message || ERRORS.UPLOAD_FILES);
            setUploading(false);
        }
    };

    const handleSkip = () => {
        reset();
        onProceed();
    };

    const totalProgress =
        files.length > 0
            ? Math.round(Object.values(fileProgress).reduce((a, b) => a + b, 0) / files.length)
            : 0;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: '8px' } }}
        >
            <DialogTitle sx={{ bgcolor: '#F4F5F7', borderBottom: '2px solid #DFE1E6', pb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#172B4D' }}>
                    {HEADERS.UPLOAD_DOCUMENTS}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B778C', display: 'block', mt: 0.5 }}>
                    {HEADERS.UPLOAD_SUBTITLE}
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Box
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => !uploading && inputRef.current?.click()}
                    sx={{
                        border: '2px dashed',
                        borderColor: dragOver ? '#5a1196' : '#DFE1E6',
                        borderRadius: '8px',
                        bgcolor: dragOver ? 'rgba(90,17,150,0.04)' : '#FAFBFC',
                        p: 4,
                        textAlign: 'center',
                        cursor: uploading ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': uploading
                            ? {}
                            : { borderColor: '#5a1196', bgcolor: 'rgba(90,17,150,0.04)' },
                    }}
                >
                    <CloudUploadIcon sx={{ fontSize: 48, color: '#5a1196', mb: 1 }} />
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#172B4D' }}>
                        {PLACEHOLDERS.DRAG_DROP}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B778C', mt: 0.5 }}>
                        {PLACEHOLDERS.OR_BROWSE}
                    </Typography>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="application/pdf"
                        multiple
                        hidden
                        onChange={(e) => {
                            if (e.target.files) addFiles(e.target.files);
                            e.target.value = '';
                        }}
                    />
                </Box>

                {files.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6B778C', mb: 1 }}>
                            {PLACEHOLDERS.FILES_SELECTED(files.length)}
                        </Typography>
                        {files.map((file, idx) => (
                            <Box
                                key={file.name}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    py: 1,
                                    px: 1.5,
                                    mb: 0.5,
                                    bgcolor: '#F4F5F7',
                                    borderRadius: '4px',
                                }}
                            >
                                <InsertDriveFileIcon sx={{ color: '#5a1196', fontSize: 20 }} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 600, color: '#172B4D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                    >
                                        {file.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#6B778C' }}>
                                        {(file.size / 1024).toFixed(1)} KB
                                    </Typography>
                                    {uploading && fileProgress[idx] !== undefined && (
                                        <LinearProgress
                                            variant="determinate"
                                            value={fileProgress[idx]}
                                            sx={{ mt: 0.5, height: 4, borderRadius: 2, '& .MuiLinearProgress-bar': { bgcolor: '#5a1196' } }}
                                        />
                                    )}
                                </Box>
                                {!uploading && (
                                    <IconButton size="small" onClick={() => removeFile(idx)}>
                                        <DeleteIcon sx={{ fontSize: 18, color: '#6B778C' }} />
                                    </IconButton>
                                )}
                            </Box>
                        ))}
                    </Box>
                )}

                {uploading && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#5a1196', fontWeight: 600, mb: 1 }}>
                            {LOADING.UPLOADING(totalProgress)}
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={totalProgress}
                            sx={{ height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { bgcolor: '#5a1196' } }}
                        />
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, bgcolor: '#F4F5F7', borderTop: '1px solid #DFE1E6', gap: 1 }}>
                <Button
                    onClick={handleClose}
                    variant="outlined"
                    disabled={uploading}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: '#DFE1E6',
                        color: '#42526E',
                        '&:hover': { borderColor: '#B3BAC5', bgcolor: '#EBECF0' },
                    }}
                >
                    {BUTTONS.CANCEL}
                </Button>
                <Button
                    onClick={handleSkip}
                    variant="outlined"
                    disabled={uploading}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: '#5a1196',
                        color: '#5a1196',
                        '&:hover': { borderColor: '#4a0e80', bgcolor: 'rgba(90,17,150,0.04)' },
                    }}
                >
                    {BUTTONS.SKIP_GENERATE}
                </Button>
                <Button
                    onClick={handleUploadAndGenerate}
                    variant="contained"
                    disabled={uploading || files.length === 0}
                    startIcon={uploading ? <CircularProgress size={18} color="inherit" /> : <CloudUploadIcon />}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        bgcolor: '#3614b2',
                        '&:hover': { bgcolor: '#4a12a4' },
                    }}
                >
                    {uploading ? LOADING.UPLOADING_SHORT : BUTTONS.UPLOAD_GENERATE}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FileUploadModal;
