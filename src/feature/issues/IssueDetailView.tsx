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
    Backdrop
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { issueStore } from '../../app/store/issueStore';
import TestPlanEditorModal from './TestPlanEditorModal';
import FileUploadModal from './FileUploadModal';

const BASE_URL = 'https://bscsolutionsinc-dev-ed.develop.lightning.force.com/lightning/page/home';

const IssueDetailView: React.FC = observer(() => {

    const isLoading = issueStore.loading;
    const isProcessing = issueStore.isGeneratingPlan;
    const issue = issueStore.selectedIssue;
    const selectedCount = issueStore.selectedIssueKeys.size;
    const isBatch = selectedCount > 1;

    // Navigation for multi-select
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

    // Test Plan Editor Modal state
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

    // File Upload Modal state
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
        // Proceed with generation after upload completes or user skips
        if (pendingGenerateMode === 'batch') {
            issueStore.processBatch(BASE_URL);
        } else {
            issueStore.generateTestPlan(BASE_URL);
        }
    };

    const handleUploadCancel = () => {
        setUploadModalOpen(false);
    };

    if (selectedCount === 0 && !isLoading) {
        return (
            <Card sx={{ height: '100%', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, borderRadius: '3px' }}>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                    Select one or more issues to view details or generate plans
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

    let storyLabel = `${selectedCount} ${selectedCount === 1 ? 'Story' : 'Stories'} Selected`;
    if (isBatch) {
        const parts: string[] = [];
        if (pendingCount > 0) parts.push(`${pendingCount} to generate`);
        if (readyCount > 0) parts.push(`${readyCount} ready to view`);
        storyLabel += ` (${parts.join(', ')})`;
    }

    return (
        <Card sx={{ height: '100%', borderRadius: '3px', position: 'relative' }}>
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

            <CardContent sx={{ p: 4 }}>
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

                        {/* Action buttons in top-right */}
                        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                            {/* Current issue action: View/Edit or Generate */}
                            {issue?.test_cases_generated ? (
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={issue.is_qa_approved ? <VisibilityIcon /> : <EditIcon />}
                                    onClick={() => {
                                        handleOpenTestPlan(issue.test_case_filename || '', issue.is_qa_approved || false);
                                    }}
                                    sx={{ bgcolor: '#5a1196', '&:hover': { bgcolor: '#660f89' }, textTransform: 'none', fontWeight: 600 }}
                                >
                                    {issue.is_qa_approved ? 'View' : 'Edit'}
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
                                    {isProcessing ? 'Generating...' : 'Generate'}
                                </Button>
                            )}

                            {/* Batch generate for all pending (multi-select only) */}
                            {isBatch && pendingCount > 0 && (
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={isProcessing ? <CircularProgress size={18} color="inherit" /> : <PlayArrowIcon />}
                                    onClick={handleGenerateAllClick}
                                    disabled={isProcessing}
                                    sx={{ bgcolor: '#172B4D', '&:hover': { bgcolor: '#253858' }, textTransform: 'none', fontWeight: 600 }}
                                >
                                    {isProcessing ? 'Generating...' : `Generate All (${pendingCount})`}
                                </Button>
                            )}
                        </Box>
                    </Box>

                    <Divider />

                    {issue && (
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#5E6C84', mb: 1.5, textTransform: 'uppercase' }}>
                                Description
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#172B4D', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                {issue.description || 'No description available.'}
                            </Typography>
                        </Box>
                    )}



                    {issueStore.generationMessage && !isBatch && (
                        <Typography variant="body2" sx={{ color: '#5a1196', fontWeight: 600, mt: 2 }}>
                            {issueStore.generationMessage}
                        </Typography>
                    )}

                    {issueStore.error && (
                        <Typography variant="body2" sx={{ color: '#FF5630', fontWeight: 600, mt: 2 }}>
                            {issueStore.error}
                        </Typography>
                    )}
                </Stack>
            </CardContent>

            {/* Prev / Next navigation for multi-select */}
            {isBatch && (
                <Box sx={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', alignItems: 'center', gap: 1 }}>
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

            {/* Test Plan Editor Modal */}
            <TestPlanEditorModal
                open={modalOpen}
                onClose={handleCloseModal}
                filename={selectedFilename}
                isQaApproved={isQaApproved}
            />

            {/* File Upload Modal — shown before generating */}
            <FileUploadModal
                open={uploadModalOpen}
                onClose={handleUploadCancel}
                onProceed={handleUploadComplete}
            />
        </Card >
    );
});

export default IssueDetailView;
