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
    Popover
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

    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const [popoverContent, setPopoverContent] = React.useState<{ key: string, summary: string } | null>(null);

    // Test Plan Editor Modal state
    const [modalOpen, setModalOpen] = React.useState<boolean>(false);
    const [selectedFilename, setSelectedFilename] = React.useState<string | null>(null);
    const [isQaApproved, setIsQaApproved] = React.useState<boolean>(false);

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>, key: string, summary: string) => {
        setAnchorEl(event.currentTarget);
        setPopoverContent({ key, summary });
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
        setPopoverContent(null);
    };

    const openPopover = Boolean(anchorEl);

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

    const storyLabel = selectedCount === 1 ? '1 Story Selected' : `${selectedCount} Stories Selected`;

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
                                {isBatch ? 'Batch Test Plan Generation' : issue?.summary}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider />

                    {isBatch ? (
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#5E6C84', mb: 2, textTransform: 'uppercase' }}>
                                Selected Stories Status
                            </Typography>
                            <Stack spacing={1}>
                                {Array.from(issueStore.selectedIssueKeys).map((key) => {
                                    // Try to get from cache first, fall back to issues array
                                    const cachedDetail = issueStore.issueDetailsCache.get(key);
                                    const listIssue = issueStore.issues.find(i => i.key === key);
                                    const issue = cachedDetail || listIssue;

                                    const summary = issue?.summary || key;
                                    const hasTestPlan = !!issue?.test_cases_generated;
                                    const batchStatus = issueStore.batchProcessingStatus.get(key);
                                    const isItemProcessing = batchStatus === 'processing';

                                    return (
                                        <Box
                                            key={key}
                                            onMouseEnter={(e: React.MouseEvent<HTMLElement>) => handlePopoverOpen(e, key, summary)}
                                            onMouseLeave={handlePopoverClose}
                                            sx={{
                                                p: 1.5,
                                                bgcolor: '#F4F5F7',
                                                borderRadius: '3px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                '&:hover': { bgcolor: '#EBECF0' }
                                            }}
                                        >
                                            <Box sx={{ flexGrow: 1, mr: 2 }}>
                                                <Typography variant="caption" sx={{ color: '#6B778C', fontWeight: 700, display: 'block' }}>
                                                    {key}
                                                </Typography>
                                                <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: '#172B4D' }}>
                                                    {summary}
                                                </Typography>
                                            </Box>

                                            {/* Individual action button */}
                                            {hasTestPlan ? (
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="success"
                                                    startIcon={<VisibilityIcon sx={{ fontSize: '14px !important' }} />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const filename = issue?.test_case_filename || '';
                                                        const qaApproved = issue?.is_qa_approved || false;
                                                        handleOpenTestPlan(filename, qaApproved);
                                                    }}
                                                    sx={{
                                                        bgcolor: '#5a1196',
                                                        '&:hover': { bgcolor: '#660f89' },
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        fontSize: '11px',
                                                        minWidth: 'auto',
                                                        px: 1.5,
                                                        py: 0.5
                                                    }}
                                                >
                                                    View
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="primary"
                                                    startIcon={isItemProcessing ? <CircularProgress size={14} color="inherit" /> : <PlayArrowIcon sx={{ fontSize: '14px !important' }} />}
                                                    disabled={isItemProcessing || isProcessing}
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        const baseUrl = 'https://bscsolutionsinc-dev-ed.develop.lightning.force.com/lightning/page/home';
                                                        const cachedDetail = issueStore.issueDetailsCache.get(key);
                                                        const description = cachedDetail?.description || summary;
                                                        issueStore.batchProcessingStatus.set(key, 'processing');
                                                        try {
                                                            const { jiraApi } = await import('../../lib/api/jira');
                                                            if (!cachedDetail) {
                                                                const detailRes = await jiraApi.fetchIssueDetail(key);
                                                                const desc = detailRes.data?.issue?.description || '';
                                                                await jiraApi.generateTestPlan({ summary, user_story: desc || summary, base_url: baseUrl });
                                                            } else {
                                                                await jiraApi.generateTestPlan({ summary, user_story: description, base_url: baseUrl });
                                                            }
                                                            issueStore.batchProcessingStatus.set(key, 'completed');
                                                            // Optimistic update
                                                            const idx = issueStore.issues.findIndex(i => i.key === key);
                                                            if (idx !== -1) {
                                                                issueStore.issues[idx] = { ...issueStore.issues[idx], test_cases_generated: true };
                                                            }
                                                            if (cachedDetail) {
                                                                issueStore.issueDetailsCache.set(key, { ...cachedDetail, test_cases_generated: true });
                                                            }
                                                        } catch {
                                                            issueStore.batchProcessingStatus.set(key, 'failed');
                                                        }
                                                    }}
                                                    sx={{
                                                        bgcolor: '#3614b2',
                                                        '&:hover': { bgcolor: '#4a12a4' },
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        fontSize: '11px',
                                                        minWidth: 'auto',
                                                        px: 1.5,
                                                        py: 0.5
                                                    }}
                                                >
                                                    {isItemProcessing ? 'Generating...' : 'Generate'}
                                                </Button>
                                            )}
                                        </Box>
                                    );
                                })}
                            </Stack>
                        </Box>
                    ) : (
                        issue && (
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#5E6C84', mb: 1.5, textTransform: 'uppercase' }}>
                                    Description
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#172B4D', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                    {issue.description || 'No description available.'}
                                </Typography>
                            </Box>
                        )
                    )}

                    {/* Common Generate button for batch mode */}
                    {isBatch && (() => {
                        const baseUrl = 'https://bscsolutionsinc-dev-ed.develop.lightning.force.com/lightning/page/home';
                        const pendingKeys = Array.from(issueStore.selectedIssueKeys).filter((key) => {
                            const cachedDetail = issueStore.issueDetailsCache.get(key);
                            const listIssue = issueStore.issues.find(i => i.key === key);
                            const issue = cachedDetail || listIssue;
                            return !issue?.test_cases_generated;
                        });
                        const allGenerated = pendingKeys.length === 0;

                        if (!allGenerated) {
                            return (
                                <Box sx={{ pt: 2, display: 'flex', gap: 2 }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                                        onClick={() => issueStore.processBatch(baseUrl)}
                                        disabled={isProcessing}
                                        sx={{ bgcolor: '#3614b2', '&:hover': { bgcolor: '#4a12a4' }, textTransform: 'none', fontWeight: 600 }}
                                    >
                                        {isProcessing ? 'Generating...' : `Generate Test Plans (${pendingKeys.length})`}
                                    </Button>
                                </Box>
                            );
                        }
                        return null;
                    })()}

                    {/* Button section for single issue mode */}
                    {!isBatch && (
                        <Box sx={{ pt: 2, display: 'flex', gap: 2 }}>
                            {(() => {
                                const baseUrl = 'https://bscsolutionsinc-dev-ed.develop.lightning.force.com/lightning/page/home';

                                // For single issue: check the selectedIssue (detail) object
                                const allHaveTestPlans = !!issueStore.selectedIssue?.test_cases_generated;

                                // Show loading state while fetching issue details
                                if (issueStore.loading) {
                                    return (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            disabled
                                            startIcon={<CircularProgress size={20} color="inherit" />}
                                            sx={{ bgcolor: '#0052CC', textTransform: 'none', fontWeight: 600 }}
                                        >
                                            Loading...
                                        </Button>
                                    );
                                }

                                if (allHaveTestPlans && selectedCount > 0) {
                                    return (
                                        <Button
                                            variant="contained"
                                            color="success"
                                            startIcon={<VisibilityIcon />}
                                            onClick={() => {
                                                const filename = issueStore.selectedIssue?.test_case_filename || '';
                                                const qaApproved = issueStore.selectedIssue?.is_qa_approved || false;
                                                handleOpenTestPlan(filename, qaApproved);
                                            }}
                                            sx={{ bgcolor: '#5a1196', '&:hover': { bgcolor: '#660f89' }, textTransform: 'none', fontWeight: 600 }}
                                        >
                                            View Test Plan
                                        </Button>
                                    );
                                }

                                return (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                                        onClick={() => {
                                            issueStore.generateTestPlan(baseUrl);
                                        }}
                                        disabled={isProcessing}
                                        sx={{ bgcolor: '#3614b2', '&:hover': { bgcolor: '#4a12a4' }, textTransform: 'none', fontWeight: 600 }}
                                    >
                                        {isProcessing ? 'Generating...' : 'Generate Test Plan'}
                                    </Button>
                                );
                            })()}
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

            <Popover
                id="mouse-over-popover"
                sx={{
                    pointerEvents: 'none',
                }}
                open={openPopover}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                onClose={handlePopoverClose}
                disableRestoreFocus
            >
                <Box sx={{ p: 2, maxWidth: 350, bgcolor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: '4px', border: '1px solid #EBECF0' }}>
                    <Typography variant="caption" sx={{ color: '#6B778C', fontWeight: 700, display: 'block', mb: 0.5 }}>
                        {popoverContent?.key}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#172B4D' }}>
                        {popoverContent?.summary}
                    </Typography>
                </Box>
            </Popover>

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
