import React from 'react';
import { observer } from 'mobx-react-lite';
import {
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
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined';
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

    const handlePrev = () => { if (hasPrev) issueStore.fetchIssueDetail(selectedKeysArray[currentIndex - 1]); };
    const handleNext = () => { if (hasNext) issueStore.fetchIssueDetail(selectedKeysArray[currentIndex + 1]); };

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
            toast.error(getApiErrorMessage(err, ERRORS.PUBLISH_TO(selectedTool.name)));
        } finally {
            setIsPublishing(false);
        }
    };

    const handleCancelPublish = () => {
        setConfirmDialogOpen(false);
        setSelectedTool(null);
    };

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
        if (isBatch && pendingCount > 0) issueStore.processBatch(BASE_URL);
        else issueStore.generateTestPlan(BASE_URL);
    };

    // ── Empty state ──
    if (selectedCount === 0 && !isLoading) {
        return (
            <Box sx={{
                height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: '#fff', borderRadius: '14px', border: '1px solid #EBECF0',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
                <Box sx={{ textAlign: 'center', maxWidth: 320, px: 3 }}>
                    <Box sx={{
                        width: 64, height: 64, borderRadius: '16px',
                        bgcolor: '#F0F4FF', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', mx: 'auto', mb: 2.5,
                    }}>
                        <AssignmentOutlinedIcon sx={{ fontSize: 32, color: '#1877F2' }} />
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#172B4D', mb: 1, letterSpacing: '-0.02em' }}>
                        Select a story to get started
                    </Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: '#97A0AF', lineHeight: 1.7 }}>
                        {PLACEHOLDERS.SELECT_ISSUES}
                    </Typography>
                </Box>
            </Box>
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
        <Box sx={{
            height: '100%', position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            bgcolor: '#fff', borderRadius: '14px', border: '1px solid #EBECF0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
            {isLoading && !isBatch && (
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, position: 'absolute', borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.85)' }}
                    open={isLoading}
                >
                    <CircularProgress sx={{ color: '#1877F2' }} />
                </Backdrop>
            )}

            {/* ── Top header band ── */}
            <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: '1px solid #F0F1F3', flexShrink: 0 }}>

                {/* Row 1: key badge + status chip */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    {issue?.key && (
                        <Typography sx={{
                            fontSize: '0.68rem', fontWeight: 800, color: '#1877F2',
                            bgcolor: 'rgba(24,119,242,0.1)', px: 1, py: 0.2,
                            borderRadius: '5px', letterSpacing: '0.04em', flexShrink: 0,
                        }}>
                            {issue.key}
                        </Typography>
                    )}
                    {isBatch && (
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#6B778C' }}>
                            {storyLabel}
                        </Typography>
                    )}
                    {hasTestPlan && (
                        <Chip
                            icon={issue?.is_qa_approved
                                ? <VerifiedOutlinedIcon sx={{ fontSize: '13px !important' }} />
                                : <CheckCircleIcon sx={{ fontSize: '13px !important' }} />
                            }
                            label={issue?.is_qa_approved ? 'QA Approved' : 'Test Plan Ready'}
                            size="small"
                            sx={{
                                height: 22, fontSize: '0.68rem', fontWeight: 700,
                                bgcolor: issue?.is_qa_approved ? '#E3FCEF' : 'rgba(24,119,242,0.09)',
                                color: issue?.is_qa_approved ? '#006644' : '#1877F2',
                                border: `1px solid ${issue?.is_qa_approved ? '#ABF5D1' : 'rgba(24,119,242,0.2)'}`,
                                '& .MuiChip-icon': { color: 'inherit', ml: '6px' },
                                '& .MuiChip-label': { px: 0.9 },
                            }}
                        />
                    )}
                </Box>

                {/* Row 2: title + actions */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                    <Typography sx={{
                        fontWeight: 800, fontSize: '1.05rem', color: '#172B4D',
                        lineHeight: 1.35, letterSpacing: '-0.02em', flex: 1, minWidth: 0,
                        wordBreak: 'break-word',
                    }}>
                        {issue?.summary || '—'}
                    </Typography>

                    {showActions && (
                        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, alignItems: 'center' }}>
                            {/* Primary action */}
                            {hasTestPlan ? (
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<VisibilityOutlinedIcon />}
                                    onClick={() => handleOpenTestPlan(issue!.test_case_filename || '', issue!.is_qa_approved || false)}
                                    sx={{
                                        textTransform: 'none', fontWeight: 700, borderRadius: '9px', fontSize: '0.82rem',
                                        background: 'linear-gradient(135deg, #0D65D9 0%, #1877F2 55%, #3D90F5 100%)',
                                        boxShadow: '0 2px 8px rgba(24,119,242,0.3)',
                                        '&:hover': { background: 'linear-gradient(135deg, #0A52C4 0%, #1468D8 55%, #2F84F0 100%)', boxShadow: '0 4px 12px rgba(24,119,242,0.4)' },
                                    }}
                                >
                                    {BUTTONS.VIEW}
                                </Button>
                            ) : isBatch && pendingCount > 0 ? (
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={isProcessing ? <CircularProgress size={14} color="inherit" /> : <PlayArrowRoundedIcon />}
                                    onClick={handleGenerateAllClick}
                                    disabled={isProcessing}
                                    sx={{
                                        textTransform: 'none', fontWeight: 700, borderRadius: '9px', fontSize: '0.82rem',
                                        bgcolor: '#172B4D', '&:hover': { bgcolor: '#253858' },
                                        boxShadow: '0 2px 6px rgba(23,43,77,0.25)',
                                    }}
                                >
                                    {isProcessing ? LOADING.GENERATING : BUTTONS.GENERATE_ALL(pendingCount)}
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={isProcessing ? <CircularProgress size={14} color="inherit" /> : <AutoFixHighOutlinedIcon />}
                                    onClick={handleGenerateClick}
                                    disabled={isProcessing}
                                    sx={{
                                        textTransform: 'none', fontWeight: 700, borderRadius: '9px', fontSize: '0.82rem',
                                        background: 'linear-gradient(135deg, #0D65D9 0%, #1877F2 55%, #3D90F5 100%)',
                                        boxShadow: '0 2px 8px rgba(24,119,242,0.3)',
                                        '&:hover': { background: 'linear-gradient(135deg, #0A52C4 0%, #1468D8 55%, #2F84F0 100%)', boxShadow: '0 4px 12px rgba(24,119,242,0.4)' },
                                    }}
                                >
                                    {isProcessing ? LOADING.GENERATING : BUTTONS.GENERATE}
                                </Button>
                            )}

                            {/* Publish To dropdown */}
                            {hasTestPlan && (
                                <ClickAwayListener onClickAway={() => setPublishDropdownOpen(false)}>
                                    <Box sx={{ position: 'relative' }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => setPublishDropdownOpen(!publishDropdownOpen)}
                                            startIcon={<PublishOutlinedIcon sx={{ fontSize: 16 }} />}
                                            endIcon={publishDropdownOpen ? <KeyboardArrowUpIcon sx={{ fontSize: 16 }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
                                            sx={{
                                                textTransform: 'none', fontWeight: 700, fontSize: '0.82rem',
                                                borderColor: '#DFE1E6', color: '#172B4D', borderRadius: '9px',
                                                '&:hover': { borderColor: '#1877F2', color: '#1877F2', bgcolor: 'rgba(24,119,242,0.04)' },
                                            }}
                                        >
                                            {BUTTONS.PUBLISH_TO}
                                        </Button>
                                        {publishDropdownOpen && (
                                            <Paper
                                                elevation={8}
                                                sx={{
                                                    position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                                                    borderRadius: '12px', border: '1px solid #EBECF0',
                                                    zIndex: 10, overflow: 'hidden', minWidth: 210,
                                                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                                }}
                                            >
                                                <Box sx={{ p: 0.75 }}>
                                                    {publishTools.map((tool) => (
                                                        <Box
                                                            key={tool.id}
                                                            onClick={() => handleToolSelect(tool)}
                                                            sx={{
                                                                display: 'flex', alignItems: 'center', gap: 1.5,
                                                                px: 1.25, py: 1, borderRadius: '8px', cursor: 'pointer',
                                                                '&:hover': { bgcolor: '#F4F5F7' },
                                                            }}
                                                        >
                                                            <Box sx={{ width: 30, height: 30, borderRadius: '7px', bgcolor: '#F0F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                                                                {tool.icon}
                                                            </Box>
                                                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#172B4D' }}>
                                                                {tool.name}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
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
                        {/* Description label */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
                            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#97A0AF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                {HEADERS.DESCRIPTION}
                            </Typography>
                            <Box sx={{ flex: 1, height: '1px', bgcolor: '#F0F1F3' }} />
                        </Box>
                        {/* Description body */}
                        <Box sx={{
                            p: 2.5, bgcolor: '#FAFBFC',
                            border: '1px solid #EBECF0', borderRadius: '10px',
                            position: 'relative', overflow: 'hidden',
                        }}>
                            <Box sx={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', bgcolor: '#1877F2', borderRadius: '3px 0 0 3px', opacity: 0.4 }} />
                            <Typography sx={{ fontSize: '0.85rem', color: '#172B4D', lineHeight: 1.85, whiteSpace: 'pre-wrap', pl: 0.5 }}>
                                {issue.description || DEFAULTS.NO_DESCRIPTION_DISPLAY}
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* Generation status message */}
                {showActions && issueStore.generationMessage && !isBatch && (
                    <Box sx={{
                        mt: 2.5, p: 2, borderRadius: '10px',
                        bgcolor: isProcessing ? 'rgba(24,119,242,0.05)' : 'rgba(54,179,126,0.07)',
                        border: `1px solid ${isProcessing ? 'rgba(24,119,242,0.15)' : 'rgba(54,179,126,0.25)'}`,
                        display: 'flex', alignItems: 'center', gap: 1.5,
                    }}>
                        {isProcessing
                            ? <CircularProgress size={16} sx={{ color: '#1877F2', flexShrink: 0 }} />
                            : <CheckCircleIcon sx={{ fontSize: 16, color: '#36B37E', flexShrink: 0 }} />
                        }
                        <Typography sx={{ fontSize: '0.82rem', color: isProcessing ? '#1877F2' : '#36B37E', fontWeight: 600 }}>
                            {issueStore.generationMessage}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* ── Batch navigation ── */}
            {isBatch && (
                <>
                    <Divider sx={{ borderColor: '#F0F1F3' }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 1.5, flexShrink: 0 }}>
                        <Typography sx={{ fontSize: '0.75rem', color: '#97A0AF', fontWeight: 600 }}>
                            Story {currentIndex + 1} of {selectedKeysArray.length}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.75 }}>
                            <IconButton
                                size="small" onClick={handlePrev} disabled={!hasPrev}
                                sx={{
                                    borderRadius: '8px', border: '1px solid #EBECF0', p: 0.75,
                                    color: hasPrev ? '#1877F2' : '#C1C7D0',
                                    '&:hover': { bgcolor: hasPrev ? 'rgba(24,119,242,0.06)' : 'transparent', borderColor: hasPrev ? '#1877F2' : '#EBECF0' },
                                }}
                            >
                                <ChevronLeftIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                            <IconButton
                                size="small" onClick={handleNext} disabled={!hasNext}
                                sx={{
                                    borderRadius: '8px', border: '1px solid #EBECF0', p: 0.75,
                                    color: hasNext ? '#1877F2' : '#C1C7D0',
                                    '&:hover': { bgcolor: hasNext ? 'rgba(24,119,242,0.06)' : 'transparent', borderColor: hasNext ? '#1877F2' : '#EBECF0' },
                                }}
                            >
                                <ChevronRightIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Box>
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
                        open={generateDialogOpen} onClose={handleCancelGenerate}
                        maxWidth="sm" fullWidth
                        slotProps={{ paper: { sx: { borderRadius: '16px' } } }}
                    >
                        <DialogTitle sx={{ pb: 0.5, pt: 3, px: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                                <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: '#F0F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <AutoFixHighOutlinedIcon sx={{ color: '#1877F2', fontSize: 20 }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontWeight: 800, color: '#172B4D', fontSize: '1rem', lineHeight: 1.2 }}>
                                        Generate Test Plan
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.78rem', color: '#97A0AF', mt: 0.25 }}>
                                        Optionally attach supporting documents before generating.
                                    </Typography>
                                </Box>
                            </Box>
                        </DialogTitle>

                        <DialogContent sx={{ pt: 2, pb: 1, px: 3 }}>
                            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#97A0AF', letterSpacing: '0.08em', textTransform: 'uppercase', mb: 1.5 }}>
                                Supporting Documents
                                <Box component="span" sx={{ fontWeight: 500, textTransform: 'none', fontSize: '0.68rem', ml: 0.75, color: '#B3BAC5' }}>(optional)</Box>
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
                                    borderRadius: '12px',
                                    bgcolor: optDragOver ? 'rgba(24,119,242,0.04)' : '#FAFBFC',
                                    py: 3.5, textAlign: 'center',
                                    cursor: optUploading ? 'default' : 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': optUploading ? {} : { borderColor: '#1877F2', bgcolor: 'rgba(24,119,242,0.04)' },
                                }}
                            >
                                <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: '#F0F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.25 }}>
                                    <CloudUploadOutlinedIcon sx={{ fontSize: 24, color: '#1877F2' }} />
                                </Box>
                                <Typography sx={{ fontWeight: 700, color: '#172B4D', fontSize: '0.85rem' }}>
                                    Drag & drop PDFs here
                                </Typography>
                                <Typography sx={{ fontSize: '0.75rem', color: '#97A0AF', mt: 0.4 }}>
                                    or click to browse
                                </Typography>
                                <input
                                    ref={optInputRef} type="file" accept="application/pdf"
                                    multiple hidden
                                    onChange={(e) => { if (e.target.files) addOptFiles(e.target.files); e.target.value = ''; }}
                                />
                            </Box>

                            {/* File list */}
                            {optFiles.length > 0 && (
                                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                    {optFiles.map((file, idx) => (
                                        <Box key={file.name} sx={{
                                            display: 'flex', alignItems: 'center', gap: 1.25,
                                            py: 1, px: 1.5, bgcolor: '#fff',
                                            border: '1px solid #EBECF0', borderRadius: '9px',
                                        }}>
                                            <Box sx={{ width: 28, height: 28, borderRadius: '7px', bgcolor: '#F0F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <InsertDriveFileOutlinedIcon sx={{ color: '#1877F2', fontSize: 15 }} />
                                            </Box>
                                            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#172B4D', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {file.name}
                                            </Typography>
                                            {optUploading && optProgress[idx] !== undefined
                                                ? <LinearProgress variant="determinate" value={optProgress[idx]} sx={{ width: 60, height: 3, borderRadius: 2, bgcolor: '#E8F0FE', '& .MuiLinearProgress-bar': { bgcolor: '#1877F2' } }} />
                                                : optDone
                                                    ? <CheckCircleIcon sx={{ color: '#36B37E', fontSize: 16 }} />
                                                    : <IconButton size="small" onClick={() => setOptFiles((prev) => prev.filter((_, i) => i !== idx))} sx={{ p: 0.25 }}>
                                                        <DeleteOutlineIcon sx={{ fontSize: 15, color: '#97A0AF', '&:hover': { color: '#DE350B' } }} />
                                                    </IconButton>
                                            }
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </DialogContent>

                        <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
                            <Button
                                onClick={handleCancelGenerate} variant="outlined" disabled={optUploading}
                                sx={{ textTransform: 'none', fontWeight: 600, borderColor: '#DFE1E6', color: '#6B778C', borderRadius: '9px', '&:hover': { borderColor: '#B3BAC5', bgcolor: '#F4F5F7' } }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmGenerate} variant="contained" disabled={optUploading}
                                startIcon={optUploading ? <CircularProgress size={15} color="inherit" /> : <PlayArrowRoundedIcon />}
                                sx={{
                                    textTransform: 'none', fontWeight: 700, borderRadius: '9px',
                                    background: 'linear-gradient(135deg, #0D65D9 0%, #1877F2 55%, #3D90F5 100%)',
                                    boxShadow: '0 2px 8px rgba(24,119,242,0.3)',
                                    '&:hover': { background: 'linear-gradient(135deg, #0A52C4 0%, #1468D8 55%, #2F84F0 100%)' },
                                }}
                            >
                                {optUploading ? 'Uploading…' : 'Generate'}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* ── Publish confirm dialog ── */}
                    <Dialog
                        open={confirmDialogOpen} onClose={handleCancelPublish}
                        maxWidth="sm" fullWidth
                        slotProps={{ paper: { sx: { borderRadius: '16px' } } }}
                    >
                        <DialogTitle sx={{ pt: 3, px: 3, pb: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                {selectedTool && (
                                    <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: '#F0F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                                        {selectedTool.icon}
                                    </Box>
                                )}
                                <Box>
                                    <Typography sx={{ fontWeight: 800, color: '#172B4D', fontSize: '1rem', lineHeight: 1.2 }}>
                                        {HEADERS.PUBLISH_TO(selectedTool?.name || '')}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.78rem', color: '#97A0AF', mt: 0.25 }}>
                                        Review details before confirming
                                    </Typography>
                                </Box>
                            </Box>
                        </DialogTitle>

                        <DialogContent sx={{ pt: 2.5, px: 3, pb: 1 }}>
                            <Typography sx={{ fontSize: '0.85rem', color: '#172B4D', lineHeight: 1.75 }}>
                                {CONFIRM.PUBLISH(issue?.key || '', selectedTool?.name || '')}
                            </Typography>
                            <Box sx={{ mt: 2, p: 2, bgcolor: '#FAFBFC', border: '1px solid #EBECF0', borderRadius: '10px' }}>
                                <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#97A0AF', letterSpacing: '0.08em', textTransform: 'uppercase', mb: 0.5 }}>
                                    {HEADERS.FILE}
                                </Typography>
                                <Typography sx={{ fontSize: '0.82rem', color: '#172B4D', fontWeight: 600, wordBreak: 'break-all' }}>
                                    {issue?.test_case_filename}
                                </Typography>
                            </Box>
                        </DialogContent>

                        <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
                            <Button
                                onClick={handleCancelPublish} variant="outlined" disabled={isPublishing}
                                sx={{ textTransform: 'none', fontWeight: 600, borderColor: '#DFE1E6', color: '#6B778C', borderRadius: '9px', '&:hover': { borderColor: '#B3BAC5', bgcolor: '#F4F5F7' } }}
                            >
                                {BUTTONS.CANCEL}
                            </Button>
                            <Button
                                onClick={handleConfirmPublish} variant="contained" disabled={isPublishing}
                                startIcon={isPublishing ? <CircularProgress size={15} color="inherit" /> : null}
                                sx={{
                                    textTransform: 'none', fontWeight: 700, borderRadius: '9px',
                                    background: 'linear-gradient(135deg, #0D65D9 0%, #1877F2 55%, #3D90F5 100%)',
                                    boxShadow: '0 2px 8px rgba(24,119,242,0.3)',
                                    '&:hover': { background: 'linear-gradient(135deg, #0A52C4 0%, #1468D8 55%, #2F84F0 100%)' },
                                }}
                            >
                                {isPublishing ? LOADING.PUBLISHING : BUTTONS.CONFIRM_PUBLISH}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </Box>
    );
});

export default IssueDetailView;
