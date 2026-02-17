import React from 'react';
import { observer } from 'mobx-react-lite';
import {
    Card,
    CardContent,
    Typography,
    Box,
    CircularProgress,
    Divider,
    Stack,
    Button,
    Backdrop,
    Paper,
    ClickAwayListener,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { issueStore } from '../../app/store/issueStore';
import { testPlanApi } from '../../lib/api/testPlanApi';
import { toast } from 'sonner';
import TestPlanEditorModal from './TestPlanEditorModal';
import FileUploadModal from './FileUploadModal';
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
    { id: 'sharepoint', name: 'SharePoint', icon: '📄' },
    { id: 'notion', name: 'Notion', icon: '📝' },
    { id: 'google-docs', name: 'Google Docs', icon: '📑' },
];

const IssueDetailView: React.FC = observer(() => {

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

    const [uploadModalOpen, setUploadModalOpen] = React.useState(false);
    const [pendingGenerateMode, setPendingGenerateMode] = React.useState<'single' | 'batch'>('single');

    const handleGenerateClick = () => {
        setPendingGenerateMode('single');
        setUploadModalOpen(true);
    };

    const handleGenerateAllClick = () => {
        setPendingGenerateMode('batch');
        setUploadModalOpen(true);
    };

    const handleUploadComplete = () => {
        setUploadModalOpen(false);
        if (pendingGenerateMode === 'batch') {
            issueStore.processBatch(BASE_URL);
        } else {
            issueStore.generateTestPlan(BASE_URL);
        }
    };

    const handleUploadCancel = () => {
        setUploadModalOpen(false);
    };

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
            const errorMsg = err.response?.data?.message || err.message || ERRORS.PUBLISH_TO(selectedTool.name);
            toast.error(errorMsg);
        } finally {
            setIsPublishing(false);
        }
    };

    const handleCancelPublish = () => {
        setConfirmDialogOpen(false);
        setSelectedTool(null);
    };

    if (selectedCount === 0 && !isLoading) {
        return (
            <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, borderRadius: '3px', overflow: 'auto' }}>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
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
        <Card sx={{ height: '100%', borderRadius: '3px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {isLoading && !isBatch && (
                <Backdrop
                    sx={{
                        color: '#fff',
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                        position: 'absolute',
                        borderRadius: '3px',
                        bgcolor: 'rgba(255, 255, 255, 0.7)'
                    }}
                    open={isLoading}
                >
                    <CircularProgress color="primary" />
                </Backdrop>
            )}

            <CardContent sx={{ p: 4, flex: 1, overflow: 'auto' }}>
                <Stack spacing={3}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                            <Typography variant="caption" sx={{ color: '#5a1196', fontWeight: 700, mb: 0.5, display: 'block' }}>
                                {storyLabel}
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#172B4D', lineHeight: 1.2 }}>
                                {issue?.summary}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, alignItems: 'center' }}>
                            {hasTestPlan ? (
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={issue!.is_qa_approved ? <VisibilityIcon /> : <EditIcon />}
                                    onClick={() => {
                                        handleOpenTestPlan(issue!.test_case_filename || '', issue!.is_qa_approved || false);
                                    }}
                                    sx={{ bgcolor: '#5a1196', '&:hover': { bgcolor: '#660f89' }, textTransform: 'none', fontWeight: 600 }}
                                >
                                    {issue!.is_qa_approved ? BUTTONS.VIEW : BUTTONS.EDIT}
                                </Button>
                            ) : isBatch && pendingCount > 0 ? (
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={isProcessing ? <CircularProgress size={18} color="inherit" /> : <PlayArrowIcon />}
                                    onClick={handleGenerateAllClick}
                                    disabled={isProcessing}
                                    sx={{ bgcolor: '#172B4D', '&:hover': { bgcolor: '#253858' }, textTransform: 'none', fontWeight: 600 }}
                                >
                                    {isProcessing ? LOADING.GENERATING : BUTTONS.GENERATE_ALL(pendingCount)}
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={isProcessing ? <CircularProgress size={18} color="inherit" /> : <PlayArrowIcon />}
                                    onClick={handleGenerateClick}
                                    disabled={isProcessing}
                                    sx={{ bgcolor: '#3614b2', '&:hover': { bgcolor: '#4a12a4' }, textTransform: 'none', fontWeight: 600 }}
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
                                                borderColor: '#5a1196',
                                                color: '#5a1196',
                                                '&:hover': { borderColor: '#4a0e80', bgcolor: 'rgba(90,17,150,0.04)' },
                                            }}
                                        >
                                            {BUTTONS.PUBLISH_TO}
                                        </Button>

                                        {publishDropdownOpen && (
                                            <Paper
                                                elevation={4}
                                                sx={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    right: 0,
                                                    mt: 0.5,
                                                    borderRadius: '10px',
                                                    border: '1px solid #DFE1E6',
                                                    zIndex: 10,
                                                    overflow: 'hidden',
                                                    minWidth: 220,
                                                }}
                                            >
                                                {publishTools.map((tool) => (
                                                    <Box
                                                        key={tool.id}
                                                        onClick={() => handleToolSelect(tool)}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1.5,
                                                            px: 1.5,
                                                            py: 1.2,
                                                            cursor: 'pointer',
                                                            transition: 'background-color 0.15s',
                                                            '&:hover': { bgcolor: '#F4F5F7' },
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                width: 36,
                                                                height: 36,
                                                                borderRadius: '8px',
                                                                bgcolor: '#E8F0FE',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '1.2rem',
                                                            }}
                                                        >
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
                    </Box>

                    <Divider />

                    {issue && (
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#5E6C84', mb: 1.5, textTransform: 'uppercase' }}>
                                {HEADERS.DESCRIPTION}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#172B4D', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                {issue.description || DEFAULTS.NO_DESCRIPTION_DISPLAY}
                            </Typography>
                        </Box>
                    )}

                    {issueStore.generationMessage && !isBatch && (
                        <Typography variant="body2" sx={{ color: '#5a1196', fontWeight: 600, mt: 2 }}>
                            {issueStore.generationMessage}
                        </Typography>
                    )}

                </Stack>
            </CardContent>

            {isBatch && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, px: 3, py: 1.5, borderTop: '1px solid #DFE1E6', flexShrink: 0 }}>
                    <Typography variant="caption" sx={{ color: '#6B778C', fontWeight: 600, mr: 0.5 }}>
                        {currentIndex + 1} / {selectedKeysArray.length}
                    </Typography>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={handlePrev}
                        disabled={!hasPrev}
                        sx={{ minWidth: 36, px: 0, borderColor: '#DFE1E6', color: '#5a1196', '&:hover': { borderColor: '#5a1196' } }}
                    >
                        <ChevronLeftIcon />
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={handleNext}
                        disabled={!hasNext}
                        sx={{ minWidth: 36, px: 0, borderColor: '#DFE1E6', color: '#5a1196', '&:hover': { borderColor: '#5a1196' } }}
                    >
                        <ChevronRightIcon />
                    </Button>
                </Box>
            )}

            <TestPlanEditorModal
                open={modalOpen}
                onClose={handleCloseModal}
                filename={selectedFilename}
                isQaApproved={isQaApproved}
                issueTitle={issue?.summary}
            />

            <FileUploadModal
                open={uploadModalOpen}
                onClose={handleUploadCancel}
                onProceed={handleUploadComplete}
            />

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
                        <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 600 }}>
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
                            bgcolor: '#3614b2',
                            '&:hover': { bgcolor: '#4a12a4' },
                        }}
                    >
                        {isPublishing ? LOADING.PUBLISHING : BUTTONS.CONFIRM_PUBLISH}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card >
    );
});

export default IssueDetailView;
