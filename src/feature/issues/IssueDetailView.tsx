import React from 'react';
import { observer } from 'mobx-react-lite';
import {
    Card,
    Typography,
    Box,
    CircularProgress,
    Chip,
    Button,
    Backdrop,
    Divider,
    Paper,
    ClickAwayListener,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    LinearProgress,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { issueStore } from '../../app/store/issueStore';
import { testPlanApi } from '../../lib/api/testPlanApi';
import { uploadFiles } from '../../lib/api/uploadApi';
import { getApiErrorMessage } from '../../lib/api/errors';
import { toast } from 'sonner';
import TestPlanEditorModal from './TestPlanEditorModal';
import {
    ERRORS, SUCCESS, LOADING, BUTTONS, HEADERS, PLACEHOLDERS, CONFIRM, DEFAULTS, LABELS,
} from '../../lib/constants/messages';

const BASE_URL = 'https://bscsolutionsinc-dev-ed.develop.lightning.force.com/lightning/page/home';

interface PublishTool {
    id: string;
    name: string;
    icon: string;
}

const publishTools: PublishTool[] = [
    { id: 'confluence', name: 'Confluence', icon: '📘' },
    { id: 'azure-test-plans', name: 'Azure Test Plans', icon: '🔷' },
    { id: 'testmo', name: 'TestMo', icon: '🧪' },
    { id: 'qtest', name: 'Tricentis qTest', icon: '🔬' },
    { id: 'zephyr', name: 'Zephyr', icon: '⚡' },
    { id: 'hp-alm', name: 'HP ALM - QC', icon: '🏢' },
];

interface IssueDetailViewProps {
    mode?: 'dashboard' | 'testplans';
}

const IssueDetailView: React.FC<IssueDetailViewProps> = observer(({ mode = 'testplans' }) => {
    const showActions = mode === 'testplans';

    const isLoading = issueStore.loading;
    const isProcessing = issueStore.isGeneratingPlan;
    const issue = issueStore.selectedIssue;
    const selectedCount = issueStore.selectedIssueKeys.size;
    const isBatch = selectedCount > 1;

    const selectedKeysArray = Array.from(issueStore.selectedIssueKeys);
    const currentIndex = issue ? selectedKeysArray.indexOf(issue.key) : -1;
    const hasPrev = isBatch && currentIndex > 0;
    const hasNext = isBatch && currentIndex < selectedKeysArray.length - 1;

    const handlePrev = () => {
        if (hasPrev) {
            issueStore.fetchIssueDetail(selectedKeysArray[currentIndex - 1]);
        }
    };

    const handleNext = () => {
        if (hasNext) {
            issueStore.fetchIssueDetail(selectedKeysArray[currentIndex + 1]);
        }
    };

    const [modalOpen, setModalOpen] = React.useState<boolean>(false);
    const [selectedFilename, setSelectedFilename] = React.useState<string | null>(null);
    const [isQaApproved, setIsQaApproved] = React.useState<boolean>(false);

    const handleOpenTestPlan = (filename: string, qaApproved: boolean) => {
        setSelectedFilename(filename);
        setIsQaApproved(qaApproved);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedFilename(null);
        setIsQaApproved(false);
    };

    const [generateDialogOpen, setGenerateDialogOpen] = React.useState(false);

    const handleGenerateClick = () => setGenerateDialogOpen(true);
    const handleGenerateAllClick = () => setGenerateDialogOpen(true);

    const [publishDropdownOpen, setPublishDropdownOpen] = React.useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
    const [selectedTool, setSelectedTool] = React.useState<PublishTool | null>(null);
    const [isPublishing, setIsPublishing] = React.useState(false);

    const handleToolSelect = (tool: PublishTool) => {
        setPublishDropdownOpen(false);
        setSelectedTool(tool);
        setConfirmDialogOpen(true);
    };

    const handleConfirmPublish = async () => {
        if (!issue?.test_case_filename || !selectedTool) return;

        setIsPublishing(true);
        try {
            const response = await testPlanApi.publishTestPlan(issue.test_case_filename);
            toast.success(response.message || SUCCESS.PUBLISHED_TO(selectedTool.name));
            setConfirmDialogOpen(false);
            setSelectedTool(null);
        } catch (err: any) {
            console.error('Publish error:', err);
            const errorMsg = getApiErrorMessage(err, ERRORS.PUBLISH_TO(selectedTool.name));
            toast.error(errorMsg);
        } finally {
            setIsPublishing(false);
        }
    };

    const handleCancelPublish = () => {
        setConfirmDialogOpen(false);
        setSelectedTool(null);
    };

    // ── Optional file upload ──
    const [optFiles, setOptFiles] = React.useState<File[]>([]);
    const [optDragOver, setOptDragOver] = React.useState(false);
    const [optUploading, setOptUploading] = React.useState(false);
    const [optDone, setOptDone] = React.useState(false);
    const [optProgress, setOptProgress] = React.useState<Record<number, number>>({});
    const optInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        setOptFiles([]);
        setOptDone(false);
        setOptProgress({});
    }, [issue?.key]);

    const addOptFiles = (incoming: FileList | File[]) => {
        const pdfs = Array.from(incoming).filter((f) => f.type === 'application/pdf');
        if (pdfs.length === 0) { toast.error(ERRORS.PDF_ONLY); return; }
        const names = new Set(optFiles.map((f) => f.name));
        const unique = pdfs.filter((f) => !names.has(f.name));
        setOptDone(false);
        setOptFiles((prev) => [...prev, ...unique]);
    };

    const handleCancelGenerate = () => {
        setGenerateDialogOpen(false);
        setOptFiles([]);
        setOptDone(false);
        setOptProgress({});
    };

    const handleConfirmGenerate = async () => {
        if (optFiles.length > 0) {
            setOptUploading(true);
            setOptProgress({});
            try {
                await uploadFiles(optFiles, (idx, pct) => setOptProgress((prev) => ({ ...prev, [idx]: pct })));
                toast.success(SUCCESS.FILES_UPLOADED(optFiles.length));
                setOptDone(true);
            } catch (err: any) {
                toast.error(getApiErrorMessage(err, ERRORS.UPLOAD_FILES));
                setOptUploading(false);
                return;
            }
            setOptUploading(false);
        }
        setGenerateDialogOpen(false);
        if (isBatch && pendingCount > 0) {
            issueStore.processBatch(BASE_URL);
        } else {
            issueStore.generateTestPlan(BASE_URL);
        }
    };

    if (selectedCount === 0 && !isLoading) {
        return (
            <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, overflow: 'auto' }}>
                <Typography variant="body1" sx={{ color: '#6B778C', fontWeight: 500 }}>
                    {PLACEHOLDERS.SELECT_ISSUES}
                </Typography>
            </Card>
        );
    }

    const readyCount = Array.from(issueStore.selectedIssueKeys).filter((key) => {
        const cached = issueStore.issueDetailsCache.get(key);
        const listIssue = issueStore.issues.find(i => i.key === key);
        return !!(cached || listIssue)?.test_cases_generated;
    }).length;
    const pendingCount = selectedCount - readyCount;

    let storyLabel = LABELS.STORIES_SELECTED(selectedCount);
    if (isBatch) {
        const parts: string[] = [];
        if (pendingCount > 0) parts.push(LABELS.TO_GENERATE(pendingCount));
        if (readyCount > 0) parts.push(LABELS.READY_TO_VIEW(readyCount));
        storyLabel += ` (${parts.join(', ')})`;
    }

    const hasTestPlan = !!issue?.test_cases_generated;

    return (
        <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid #DFE1E6' }}>
            {isLoading && !isBatch && (
                <Backdrop
                    sx={{
                        color: '#fff',
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                        position: 'absolute',
                        borderRadius: '12px',
                        bgcolor: 'rgba(255, 255, 255, 0.7)'
                    }}
                    open={isLoading}
                >
                    <CircularProgress color="primary" />
                </Backdrop>
            )}

            {/* ── Header ── */}
            <Box sx={{ px: 3, py: 2, bgcolor: '#F8F9FA', borderBottom: '1px solid #DFE1E6', flexShrink: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" sx={{ color: '#1877F2', fontWeight: 700, letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
                            {storyLabel}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#172B4D', lineHeight: 1.3, wordBreak: 'break-word' }}>
                            {issue?.summary}
                        </Typography>
                        {hasTestPlan && (
                            <Chip
                                label={issue?.is_qa_approved ? 'QA Approved' : 'Test Plan Ready'}
                                size="small"
                                sx={{
                                    mt: 1,
                                    height: 22,
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    bgcolor: issue?.is_qa_approved ? '#E3FCEF' : 'rgba(24,119,242,0.08)',
                                    color: issue?.is_qa_approved ? '#006644' : '#1877F2',
                                    border: `1px solid ${issue?.is_qa_approved ? '#ABF5D1' : 'rgba(24,119,242,0.25)'}`,
                                }}
                            />
                        )}
                    </Box>

                    {showActions && (
                        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, alignItems: 'center' }}>
                            {hasTestPlan ? (
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={issue!.is_qa_approved ? <VisibilityIcon /> : <EditIcon />}
                                    onClick={() => handleOpenTestPlan(issue!.test_case_filename || '', issue!.is_qa_approved || false)}
                                    sx={{ bgcolor: '#1877F2', '&:hover': { bgcolor: '#1468D8' }, textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
                                >
                                    {issue!.is_qa_approved ? BUTTONS.VIEW : BUTTONS.EDIT}
                                </Button>
                            ) : isBatch && pendingCount > 0 ? (
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={isProcessing ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
                                    onClick={handleGenerateAllClick}
                                    disabled={isProcessing}
                                    sx={{ bgcolor: '#172B4D', '&:hover': { bgcolor: '#253858' }, textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
                                >
                                    {isProcessing ? LOADING.GENERATING : BUTTONS.GENERATE_ALL(pendingCount)}
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={isProcessing ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
                                    onClick={handleGenerateClick}
                                    disabled={isProcessing}
                                    sx={{ bgcolor: '#1877F2', '&:hover': { bgcolor: '#0A52C4' }, textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
                                >
                                    {isProcessing ? LOADING.GENERATING : BUTTONS.GENERATE}
                                </Button>
                            )}

                            {hasTestPlan && (
                                <ClickAwayListener onClickAway={() => setPublishDropdownOpen(false)}>
                                    <Box sx={{ position: 'relative' }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => setPublishDropdownOpen(!publishDropdownOpen)}
                                            endIcon={publishDropdownOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                            sx={{
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                borderColor: '#1877F2',
                                                color: '#1877F2',
                                                borderRadius: '8px',
                                                '&:hover': { borderColor: '#4a0e80', bgcolor: 'rgba(24,119,242,0.04)' },
                                            }}
                                        >
                                            {BUTTONS.PUBLISH_TO}
                                        </Button>
                                        {publishDropdownOpen && (
                                            <Paper
                                                elevation={4}
                                                sx={{ position: 'absolute', top: '100%', right: 0, mt: 0.5, borderRadius: '10px', border: '1px solid #DFE1E6', zIndex: 10, overflow: 'hidden', minWidth: 220 }}
                                            >
                                                {publishTools.map((tool) => (
                                                    <Box
                                                        key={tool.id}
                                                        onClick={() => handleToolSelect(tool)}
                                                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1.2, cursor: 'pointer', '&:hover': { bgcolor: '#F4F5F7' } }}
                                                    >
                                                        <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#EEE8FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                                                            {tool.icon}
                                                        </Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#172B4D' }}>
                                                            {tool.name}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Paper>
                                        )}
                                    </Box>
                                </ClickAwayListener>
                            )}
                        </Box>
                    )}
                </Box>
            </Box>

            {/* ── Content ── */}
            <Box sx={{ flex: 1, overflow: 'auto', px: 3, py: 2.5 }}>
                {issue && (
                    <Box>
                        <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#6B778C', letterSpacing: '0.06em', textTransform: 'uppercase', mb: 1 }}>
                            {HEADERS.DESCRIPTION}
                        </Typography>
                        <Box sx={{ p: 2, bgcolor: '#FAFBFC', border: '1px solid #EBECF0', borderRadius: '8px' }}>
                            <Typography variant="body2" sx={{ color: '#172B4D', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                                {issue.description || DEFAULTS.NO_DESCRIPTION_DISPLAY}
                            </Typography>
                        </Box>
                    </Box>
                )}

                {showActions && issueStore.generationMessage && !isBatch && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(24,119,242,0.06)', border: '1px solid rgba(24,119,242,0.2)', borderRadius: '8px' }}>
                        <Typography variant="body2" sx={{ color: '#1877F2', fontWeight: 600 }}>
                            {issueStore.generationMessage}
                        </Typography>
                    </Box>
                )}
            </Box>

            {isBatch && (
                <>
                <Divider />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, px: 3, py: 1.5, flexShrink: 0 }}>
                    <Typography variant="caption" sx={{ color: '#6B778C', fontWeight: 600, mr: 0.5 }}>
                        {currentIndex + 1} / {selectedKeysArray.length}
                    </Typography>
                    <Button size="small" variant="outlined" onClick={handlePrev} disabled={!hasPrev}
                        sx={{ minWidth: 36, px: 0, borderColor: '#DFE1E6', color: '#1877F2', borderRadius: '8px', '&:hover': { borderColor: '#1877F2' } }}>
                        <ChevronLeftIcon />
                    </Button>
                    <Button size="small" variant="outlined" onClick={handleNext} disabled={!hasNext}
                        sx={{ minWidth: 36, px: 0, borderColor: '#DFE1E6', color: '#1877F2', borderRadius: '8px', '&:hover': { borderColor: '#1877F2' } }}>
                        <ChevronRightIcon />
                    </Button>
                </Box>
                </>
            )}

            {showActions && (
            <>
            <TestPlanEditorModal
                open={modalOpen}
                onClose={handleCloseModal}
                filename={selectedFilename}
                isQaApproved={isQaApproved}
                issueTitle={issue?.summary}
            />

            {/* ── Generate dialog ── */}
            <Dialog
                open={generateDialogOpen}
                onClose={handleCancelGenerate}
                maxWidth="sm"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: '12px' } } }}
            >
                <DialogTitle sx={{ bgcolor: '#F8F9FA', borderBottom: '1px solid #DFE1E6', pb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#172B4D', fontSize: '1.05rem' }}>
                        Generate Test Plan
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B778C', mt: 0.5 }}>
                        Optionally attach supporting documents before generating.
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ pt: 2.5, pb: 2 }}>
                    <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#6B778C', letterSpacing: '0.06em', textTransform: 'uppercase', mb: 1.5 }}>
                        Supporting Documents
                        <Box component="span" sx={{ fontWeight: 400, textTransform: 'none', fontSize: '10px', ml: 0.75 }}>(optional)</Box>
                    </Typography>

                    {/* Drop zone */}
                    <Box
                        onDrop={(e) => { e.preventDefault(); setOptDragOver(false); if (e.dataTransfer.files.length) addOptFiles(e.dataTransfer.files); }}
                        onDragOver={(e) => { e.preventDefault(); setOptDragOver(true); }}
                        onDragLeave={() => setOptDragOver(false)}
                        onClick={() => !optUploading && optInputRef.current?.click()}
                        sx={{
                            border: '2px dashed',
                            borderColor: optDragOver ? '#1877F2' : '#DFE1E6',
                            borderRadius: '10px',
                            bgcolor: optDragOver ? 'rgba(24,119,242,0.04)' : '#FAFBFC',
                            py: 3,
                            textAlign: 'center',
                            cursor: optUploading ? 'default' : 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': optUploading ? {} : { borderColor: '#1877F2', bgcolor: 'rgba(24,119,242,0.04)' },
                        }}
                    >
                        <CloudUploadIcon sx={{ fontSize: 36, color: '#1877F2', mb: 0.5 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#172B4D' }}>
                            Drag & drop PDFs or click to browse
                        </Typography>
                        <input
                            ref={optInputRef}
                            type="file"
                            accept="application/pdf"
                            multiple
                            hidden
                            onChange={(e) => { if (e.target.files) addOptFiles(e.target.files); e.target.value = ''; }}
                        />
                    </Box>

                    {/* File list */}
                    {optFiles.length > 0 && (
                        <Box sx={{ mt: 1.5 }}>
                            {optFiles.map((file, idx) => (
                                <Box key={file.name} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75, px: 1.5, mb: 0.5, bgcolor: '#FFFFFF', border: '1px solid #EBECF0', borderRadius: '6px' }}>
                                    <InsertDriveFileIcon sx={{ color: '#1877F2', fontSize: 16, flexShrink: 0 }} />
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#172B4D', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {file.name}
                                    </Typography>
                                    {optUploading && optProgress[idx] !== undefined
                                        ? <LinearProgress variant="determinate" value={optProgress[idx]} sx={{ width: 60, height: 3, borderRadius: 2, '& .MuiLinearProgress-bar': { bgcolor: '#1877F2' } }} />
                                        : optDone
                                            ? <CheckCircleIcon sx={{ color: '#00875A', fontSize: 16 }} />
                                            : <IconButton size="small" onClick={() => setOptFiles((prev) => prev.filter((_, i) => i !== idx))}>
                                                <DeleteIcon sx={{ fontSize: 14, color: '#6B778C' }} />
                                            </IconButton>
                                    }
                                </Box>
                            ))}
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2, bgcolor: '#F8F9FA', borderTop: '1px solid #DFE1E6' }}>
                    <Button
                        onClick={handleCancelGenerate}
                        variant="outlined"
                        disabled={optUploading}
                        sx={{ textTransform: 'none', fontWeight: 600, borderColor: '#DFE1E6', color: '#42526E', '&:hover': { borderColor: '#B3BAC5', bgcolor: '#EBECF0' } }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmGenerate}
                        variant="contained"
                        disabled={optUploading}
                        startIcon={optUploading ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
                        sx={{ textTransform: 'none', fontWeight: 600, bgcolor: '#1877F2', borderRadius: '8px', '&:hover': { bgcolor: '#0A52C4' } }}
                    >
                        {optUploading ? 'Uploading…' : 'Generate'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={confirmDialogOpen}
                onClose={handleCancelPublish}
                maxWidth="sm"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: '10px' } } }}
            >
                <DialogTitle sx={{ bgcolor: '#F4F5F7', borderBottom: '1px solid #DFE1E6', pb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {selectedTool && (
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '8px',
                                    bgcolor: '#E8F0FE',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.4rem',
                                }}
                            >
                                {selectedTool.icon}
                            </Box>
                        )}
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#172B4D', fontSize: '1.05rem' }}>
                            {HEADERS.PUBLISH_TO(selectedTool?.name || '')}
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ pt: 3, pb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#172B4D', lineHeight: 1.7 }}>
                        {CONFIRM.PUBLISH(issue?.key || '', selectedTool?.name || '')}
                    </Typography>
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: '#F4F5F7', borderRadius: '6px' }}>
                        <Typography variant="caption" sx={{ color: '#6B778C', fontWeight: 600 }}>
                            {HEADERS.FILE}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#172B4D', fontWeight: 600, mt: 0.25, wordBreak: 'break-all' }}>
                            {issue?.test_case_filename}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2, bgcolor: '#F4F5F7', borderTop: '1px solid #DFE1E6' }}>
                    <Button
                        onClick={handleCancelPublish}
                        variant="outlined"
                        disabled={isPublishing}
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
                        onClick={handleConfirmPublish}
                        variant="contained"
                        disabled={isPublishing}
                        startIcon={isPublishing ? <CircularProgress size={18} color="inherit" /> : null}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            bgcolor: '#0D65D9',
                            '&:hover': { bgcolor: '#0A52C4' },
                        }}
                    >
                        {isPublishing ? LOADING.PUBLISHING : BUTTONS.CONFIRM_PUBLISH}
                    </Button>
                </DialogActions>
            </Dialog>
            </>
            )}
        </Card >
    );
});

export default IssueDetailView;
