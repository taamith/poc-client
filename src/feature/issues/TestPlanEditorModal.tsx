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
import { ERRORS, SUCCESS, LOADING, BUTTONS, HEADERS } from '../../lib/constants/messages';

interface TestPlanEditorModalProps {
    open: boolean;
    onClose: () => void;
    filename: string | null;
    isQaApproved?: boolean;
    issueTitle?: string;
}

const TestPlanEditorModal: React.FC<TestPlanEditorModalProps> = ({
    open,
    onClose,
    filename,
    isQaApproved = false,
    issueTitle,
}) => {
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
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
            const testPlanJson = extractTestPlanJson(response.content);

            if (testPlanJson) {
                setContent(jsonToReadableText(testPlanJson));
                setIsStructuredJson(true);
            } else {
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
            const errorMsg = err.response?.data?.message || err.message || ERRORS.LOAD_TEST_PLAN;
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
                const jsonObj = readableTextToJson(content);
                planPayload = JSON.stringify(jsonObj);
            } else {
                planPayload = content;
            }

            const response = await testPlanApi.updateTestPlan(filename, planPayload);
            toast.success(response.message || SUCCESS.TEST_PLAN_SAVED);
            onClose();
        } catch (err: any) {
            console.error('Error saving test plan:', err);
            const errorMsg = err.response?.data?.message || err.message || ERRORS.SAVE_TEST_PLAN;
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
                    height: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
        >
            <DialogTitle sx={{ bgcolor: '#F4F5F7', borderBottom: '2px solid #DFE1E6', pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#172B4D' }}>
                        {HEADERS.TEST_CASES(issueTitle)}
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
                            {HEADERS.QA_APPROVED}
                        </Box>
                    )}
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3, flex: 1, overflow: 'auto' }}>
                {loading ? (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                        }}
                    >
                        <CircularProgress />
                    </Box>
                ) : (
                    <TextField
                        multiline
                        fullWidth
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
                                alignItems: 'flex-start',
                                '& .MuiInputBase-input': {
                                    padding: '16px',
                                    whiteSpace: 'pre-wrap',
                                    overflow: 'visible !important',
                                },
                            },
                        }}
                        placeholder={LOADING.TEST_PLAN_CONTENT}
                    />
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
                    {BUTTONS.CLOSE}
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
                        {saving ? LOADING.SAVING : BUTTONS.SAVE}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default TestPlanEditorModal;
