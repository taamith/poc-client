import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Box, Typography, Button } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';

import { integrationStore } from './store/integrationStore';
import AuthenticatedLayout from './layout/AuthenticatedLayout';

import LoginView from '../feature/auth/LoginView';
import SignupView from '../feature/auth/SignupView';
import DashboardPage from '../feature/pages/DashboardPage';
import UploadDocumentsPage from '../feature/pages/UploadDocumentsPage';
import IntegrationsPage from '../feature/pages/IntegrationsPage';
import PlaceholderPage from '../feature/pages/PlaceholderPage';
import ExecutionPage from '../feature/execution/ExecutionPage';
import TestRunPage from '../feature/execution/TestRunPage';
import TestResultsPage from '../feature/execution/TestResultsPage';
import IssueList from '../feature/issues/IssueList';
import IssueDetailView from '../feature/issues/IssueDetailView';
import SpacesFilterBar from '../feature/issues/SpacesFilterBar';

// ─── Page wrappers ────────────────────────────────────────────────────────────

const HomePage = () => <DashboardPage />;

const RepositoryPage = () => <UploadDocumentsPage />;

const TestPlansPage = observer(() => {
    const navigate = useNavigate();

    if (!integrationStore.jiraConnected) {
        return (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center', maxWidth: 420, px: 3 }}>
                    <Box sx={{
                        width: 72, height: 72, borderRadius: '16px', bgcolor: '#E7F0FD',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5,
                    }}>
                        <ExtensionOutlinedIcon sx={{ fontSize: 36, color: '#1877F2' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#172B4D', mb: 1 }}>
                        No board connected
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B778C', mb: 3, lineHeight: 1.7 }}>
                        Connect your project management tool from the Integrations page to start importing user stories and generating test plans.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/settings/integrations')}
                        sx={{
                            textTransform: 'none', fontWeight: 600, borderRadius: '8px',
                            background: 'linear-gradient(135deg, #0D65D9 0%, #1877F2 55%, #3D90F5 100%)',
                            boxShadow: 'none',
                            '&:hover': { background: 'linear-gradient(135deg, #0A52C4 0%, #1468D8 55%, #2F84F0 100%)' },
                        }}
                    >
                        Go to Integrations
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minHeight: 0 }}>
            <SpacesFilterBar />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '400px 1fr' }, gap: 3, flex: 1, minHeight: 0 }}>
                <IssueList />
                <IssueDetailView mode="testplans" />
            </Box>
        </Box>
    );
});

// ─── App routes ───────────────────────────────────────────────────────────────

const AppRoutes = () => (
    <Routes>
        {/* Public */}
        <Route path="/login"  element={<LoginView />} />
        <Route path="/signup" element={<SignupView />} />

        {/* Authenticated */}
        <Route element={<AuthenticatedLayout />}>
            <Route path="/home"                   element={<HomePage />} />
            <Route path="/test-plans"             element={<TestPlansPage />} />
            <Route path="/repository"             element={<RepositoryPage />} />
            <Route path="/execution"              element={<ExecutionPage />} />
            <Route path="/execution/run"          element={<TestRunPage />} />
            <Route path="/execution/results"      element={<TestResultsPage />} />
            <Route path="/reports"                element={<PlaceholderPage title="Reports" subtitle="Analytics and insights on test coverage, generation metrics, and team productivity. Coming soon." Icon={BarChartIcon} />} />
            <Route path="/settings"               element={<Navigate to="/settings/general" replace />} />
            <Route path="/settings/general"       element={<PlaceholderPage title="General Settings" subtitle="Workspace preferences, notification settings, and team configuration. Coming soon." Icon={HelpOutlineIcon} />} />
            <Route path="/settings/integrations"  element={<IntegrationsPage />} />
            <Route path="/integrations"           element={<Navigate to="/settings/integrations" replace />} />
            <Route path="/help"                   element={<PlaceholderPage title="Help & Support" subtitle="Documentation, FAQs, and support resources to help you get the most out of AutoSprint AI." Icon={HelpOutlineIcon} />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
);

export default AppRoutes;
