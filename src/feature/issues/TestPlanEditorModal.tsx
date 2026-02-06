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
    Alert,
    TextField
} from '@mui/material';
import { testPlanApi } from '../../lib/api/testPlanApi';
import { toast } from 'sonner';

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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && filename) {
            fetchTestPlan();
        } else if (!open) {
            // Reset content when modal closes
            setContent('');
            setError(null);
            setLoading(false);
        }
    }, [open, filename]);

    const fetchTestPlan = async () => {
        if (!filename) return;

        setLoading(true);
        setError(null);

        try {
            const response = await testPlanApi.fetchTestPlan(filename);
            console.log('📦 API Response:', response);

            let planText = '';

            // Determine if content is a string or already parsed object
            if (typeof response.content === 'string') {
                try {
                    const contentObj = JSON.parse(response.content);
                    planText = contentObj.plan || response.content;
                } catch (e) {
                    console.warn('⚠️ Content is a string but not valid JSON, using as is');
                    planText = response.content;
                }
            } else if (response.content && typeof response.content === 'object') {
                planText = (response.content as any).plan || JSON.stringify(response.content, null, 2);
            } else {
                planText = 'No content found in test plan.';
            }

            setContent(planText);
        } catch (err: any) {
            console.error('Error fetching test plan:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to load test plan';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!filename) return;

        setSaving(true);
        setError(null);

        try {
            const response = await testPlanApi.updateTestPlan(filename, content);
            toast.success(response.message || 'Test plan saved successfully');
            onClose();
        } catch (err: any) {
            console.error('Error saving test plan:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to save test plan';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        console.log('🔴 Modal handleClose called');
        setContent('');
        setError(null);
        console.log('🔴 Calling onClose callback...');
        onClose();
        console.log('🔴 Modal close complete');
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
                        {isQaApproved ? '📋 View Test Plan (Read-Only)' : '✏️ Edit Test Plan'}
                    </Typography>
                    {isQaApproved && (
                        <Box
                            sx={{
                                px: 2,
                                py: 0.5,
                                bgcolor: '#36B37E',
                                color: 'white',
                                borderRadius: '3px',
                                fontSize: '12px',
                                fontWeight: 700,
                            }}
                        >
                            ✓ QA APPROVED
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
                ) : error ? (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                ) : (
                    <Box sx={{ height: '100%' }}>
                        <TextField
                            multiline
                            fullWidth
                            rows={15}
                            variant="outlined"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            InputProps={{
                                readOnly: isQaApproved,
                                sx: {
                                    fontFamily: 'monospace',
                                    fontSize: '14px',
                                    backgroundColor: isQaApproved ? '#F4F5F7' : 'white',
                                    '& .MuiInputBase-input': {
                                        padding: '10px',
                                    }
                                }
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
                            bgcolor: '#0052CC',
                            '&:hover': {
                                bgcolor: '#0747A6',
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
