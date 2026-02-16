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
import { issueStore } from '../../app/store/issueStore';
import TestPlanEditorModal from './TestPlanEditorModal';

const IssueDetailView: React.FC = observer(() => {

    const isLoading = issueStore.loading;
    const isProcessing = issueStore.isGeneratingPlan;
    const issue = issueStore.selectedIssue;
    const selectedCount = issueStore.selectedIssueKeys.size;
    const isBatch = selectedCount > 1;

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

                        {/* Generate / View button in top-right */}
                        {(() => {
                            const baseUrl = 'https://bscsolutionsinc-dev-ed.develop.lightning.force.com/lightning/page/home';

                            if (isBatch) {
                                const pendingKeys = Array.from(issueStore.selectedIssueKeys).filter((key) => {
                                    const cachedDetail = issueStore.issueDetailsCache.get(key);
                                    const listIssue = issueStore.issues.find(i => i.key === key);
                                    const issue = cachedDetail || listIssue;
                                    return !issue?.test_cases_generated;
                                });
                                const allGenerated = pendingKeys.length === 0;

                                if (!allGenerated) {
                                    return (
                                        <Button
                                            variant="contained"
                                            startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                                            onClick={() => issueStore.processBatch(baseUrl)}
                                            disabled={isProcessing}
                                            sx={{ bgcolor: '#3614b2', '&:hover': { bgcolor: '#4a12a4' }, textTransform: 'none', fontWeight: 600, flexShrink: 0 }}
                                        >
                                            {isProcessing ? 'Generating...' : `Generate Test Plans (${pendingKeys.length})`}
                                        </Button>
                                    );
                                }
                                return null;
                            }

                            const allHaveTestPlans = !!issueStore.selectedIssue?.test_cases_generated;

                            if (allHaveTestPlans && selectedCount > 0) {
                                return (
                                    <Button
                                        variant="contained"
                                        startIcon={<VisibilityIcon />}
                                        onClick={() => {
                                            const filename = issueStore.selectedIssue?.test_case_filename || '';
                                            const qaApproved = issueStore.selectedIssue?.is_qa_approved || false;
                                            handleOpenTestPlan(filename, qaApproved);
                                        }}
                                        sx={{ bgcolor: '#5a1196', '&:hover': { bgcolor: '#660f89' }, textTransform: 'none', fontWeight: 600, flexShrink: 0 }}
                                    >
                                        View Test Plan
                                    </Button>
                                );
                            }

                            return (
                                <Button
                                    variant="contained"
                                    startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                                    onClick={() => issueStore.generateTestPlan(baseUrl)}
                                    disabled={isProcessing}
                                    sx={{ bgcolor: '#3614b2', '&:hover': { bgcolor: '#4a12a4' }, textTransform: 'none', fontWeight: 600, flexShrink: 0 }}
                                >
                                    {isProcessing ? 'Generating...' : 'Generate Test Plan'}
                                </Button>
                            );
                        })()}
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
                            ✓ {issueStore.generationMessage}
                        </Typography>
                    )}

                    {issueStore.error && (
                        <Typography variant="body2" sx={{ color: '#FF5630', fontWeight: 600, mt: 2 }}>
                            ⚠ {issueStore.error}
                        </Typography>
                    )}
                </Stack>
            </CardContent>

            {/* Test Plan Editor Modal */}
            <TestPlanEditorModal
                open={modalOpen}
                onClose={handleCloseModal}
                filename={selectedFilename}
                isQaApproved={isQaApproved}
            />
        </Card >
    );
});

export default IssueDetailView;
