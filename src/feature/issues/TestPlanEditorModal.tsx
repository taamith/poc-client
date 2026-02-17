import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    Box,
    Typography,
    TextField,
} from '@mui/material';
import { testPlanApi } from '../../lib/api/testPlanApi';
import { toast } from 'sonner';
import {
    extractTestPlanJson,
    jsonToReadableText,
    readableTextToJson,
} from '../../lib/utils/testPlanFormatter';

interface TestPlanEditorModalProps {
    open: boolean;
    onClose: () => void;
    filename: string | null;
    isQaApproved?: boolean;
}

const TestPlanEditorModal: React.FC<TestPlanEditorModalProps> = ({
    open,
    onClose,
    filename,
    isQaApproved = false,
}) => {
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    // Track whether the fetched content was structured JSON (so we can convert back on save)
    const [isStructuredJson, setIsStructuredJson] = useState<boolean>(false);

    useEffect(() => {
        if (open && filename) {
            fetchTestPlan();
        } else if (!open) {
            setContent('');
            
            setLoading(false);
            setIsStructuredJson(false);
        }
    }, [open, filename]);

    const fetchTestPlan = async () => {
        if (!filename) return;

        setLoading(true);
        

        try {
            const response = await testPlanApi.fetchTestPlan(filename);

            // Try to parse as structured test plan JSON
            const testPlanJson = extractTestPlanJson(response.content);

            if (testPlanJson) {
                // Convert JSON → readable plain text for display/editing
                setContent(jsonToReadableText(testPlanJson));
                setIsStructuredJson(true);
            } else {
                // Fallback: extract raw text
                let raw: any = response.content;
                if (typeof raw === 'string') {
                    try {
                        const parsed = JSON.parse(raw);
                        raw = parsed.plan || JSON.stringify(parsed, null, 2);
                    } catch {
                        // use as-is
                    }
                } else if (raw && typeof raw === 'object') {
                    raw = (raw as any).plan || JSON.stringify(raw, null, 2);
                }
                setContent(String(raw));
                setIsStructuredJson(false);
            }
        } catch (err: any) {
            console.error('Error fetching test plan:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to load test plan';

            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!filename) return;

        setSaving(true);
        

        try {
            let planPayload: string;

            if (isStructuredJson) {
                // Convert readable plain text back → JSON, then stringify for the API
                const jsonObj = readableTextToJson(content);
                planPayload = JSON.stringify(jsonObj);
            } else {
                planPayload = content;
            }

            const response = await testPlanApi.updateTestPlan(filename, planPayload);
            toast.success(response.message || 'Test plan saved successfully');
            onClose();
        } catch (err: any) {
            console.error('Error saving test plan:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to save test plan';

            toast.error(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setContent('');
        
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            disableEscapeKeyDown={false}
            PaperProps={{
                sx: {
                    borderRadius: '8px',
                    minHeight: '600px',
                },
            }}
        >
            <DialogTitle sx={{ bgcolor: '#F4F5F7', borderBottom: '2px solid #DFE1E6', pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#172B4D' }}>
                        {isQaApproved ? 'View Test Plan (Read-Only)' : 'Edit Test Plan'}
                    </Typography>
                    {isQaApproved && (
                        <Box
                            sx={{
                                px: 2,
                                py: 0.5,
                                bgcolor: '#5a1196',
                                color: 'white',
                                borderRadius: '3px',
                                fontSize: '12px',
                                fontWeight: 700,
                            }}
                        >
                            QA APPROVED
                        </Box>
                    )}
                </Box>
                {filename && (
                    <Typography variant="caption" sx={{ color: '#5E6C84', display: 'block', mt: 0.5 }}>
                        {filename}
                    </Typography>
                )}
            </DialogTitle>

            <DialogContent sx={{ p: 3, minHeight: '400px' }}>
                {loading ? (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '400px',
                        }}
                    >
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box sx={{ height: '100%' }}>
                        <TextField
                            multiline
                            fullWidth
                            minRows={18}
                            maxRows={30}
                            variant="outlined"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            InputProps={{
                                readOnly: isQaApproved,
                                sx: {
                                    fontFamily: '"Segoe UI", Roboto, sans-serif',
                                    fontSize: '14px',
                                    lineHeight: 1.7,
                                    backgroundColor: isQaApproved ? '#F4F5F7' : 'white',
                                    '& .MuiInputBase-input': {
                                        padding: '16px',
                                        whiteSpace: 'pre-wrap',
                                    },
                                },
                            }}
                            placeholder="Loading test plan content..."
                        />
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, bgcolor: '#F4F5F7', borderTop: '1px solid #DFE1E6' }}>
                <Button
                    onClick={handleClose}
                    variant="outlined"
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: '#DFE1E6',
                        color: '#42526E',
                        '&:hover': {
                            borderColor: '#B3BAC5',
                            bgcolor: '#EBECF0',
                        },
                    }}
                >
                    Close
                </Button>
                {!isQaApproved && (
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={saving || loading}
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            bgcolor: '#3614b2',
                            '&:hover': {
                                bgcolor: '#4a12a4',
                            },
                        }}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default TestPlanEditorModal;
