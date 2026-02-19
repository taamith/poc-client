import { useEffect, useState } from 'react';
import { ThemeProvider, CssBaseline, Box, CircularProgress, Typography, Tabs, Tab } from '@mui/material';
import { BRANDING } from './lib/constants/messages';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Toaster } from 'sonner';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FolderIcon from '@mui/icons-material/Folder';

import { theme } from './app/theme/theme';
import { issueStore } from './app/store/issueStore';

import Header from './app/layout/Header.tsx';
import Sidebar from './app/layout/Sidebar.tsx';
import AppBreadcrumbs from './app/layout/AppBreadcrumbs.tsx';
import LoginView from './feature/auth/LoginView.tsx';
import IssueList from './feature/issues/IssueList.tsx';
import IssueDetailView from './feature/issues/IssueDetailView.tsx';
import PlaceholderPage from './feature/pages/PlaceholderPage.tsx';
import UploadDocumentsPage from './feature/pages/UploadDocumentsPage.tsx';

const queryClient = new QueryClient();

const AuthenticatedLayout = observer(() => {
  const navigate = useNavigate();
  useEffect(() => {
    if (issueStore.authChecked && !issueStore.isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [issueStore.authChecked, issueStore.isAuthenticated, navigate]);

  if (!issueStore.authChecked) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!issueStore.isAuthenticated) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
      <Header />
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <AppBreadcrumbs />
          <Box sx={{ flex: 1, overflow: 'auto', px: { xs: 2, md: 4 }, pt: 1.5, pb: 8, display: 'flex', flexDirection: 'column' }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

const DashboardPage = () => (
  <PlaceholderPage title="Dashboard" subtitle="Your command center for test automation — insights, progress, and activity all in one place. Coming soon." Icon={DashboardIcon} />
);

const TestPlansPage = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          flexShrink: 0,
          borderBottom: '1px solid #DFE1E6',
          mb: 2,
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 13, color: '#6B778C', minHeight: 44 },
          '& .Mui-selected': { color: '#5a1196' },
          '& .MuiTabs-indicator': { bgcolor: '#5a1196' },
        }}
      >
        <Tab label="Upload Documents" />
        <Tab label="Create Test Plan" />
      </Tabs>

      {tab === 0 && <UploadDocumentsPage />}
      {tab === 1 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '400px 1fr' }, gap: 3, flex: 1, minHeight: 0 }}>
          <IssueList />
          <IssueDetailView mode="testplans" />
        </Box>
      )}
    </Box>
  );
};

const App = observer(() => {
  useEffect(() => {
    issueStore.fetchIssues(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route element={<AuthenticatedLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/test-plans" element={<TestPlansPage />} />
            <Route path="/repository" element={<PlaceholderPage title="Repository" subtitle="Manage and browse your document repository, uploaded files, and reference materials. Coming soon." Icon={FolderIcon} />} />
            <Route path="/reports" element={<PlaceholderPage title="Reports" subtitle="Analytics and insights on test coverage, generation metrics, and team productivity. Coming soon." Icon={BarChartIcon} />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" subtitle="Configure your workspace, integrations, notification preferences, and team settings. Coming soon." Icon={SettingsIcon} />} />
            <Route path="/help" element={<PlaceholderPage title="Help & Support" subtitle="Documentation, FAQs, and support resources to help you get the most out of AutoSprint AI." Icon={HelpOutlineIcon} />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Box
          component="footer"
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            py: 1.5,
            textAlign: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            borderTop: '1px solid #DFE1E6',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
          }}
        >
          <Typography variant="caption" sx={{ color: '#6B778C' }}>
            {BRANDING.COPYRIGHT}
          </Typography>
        </Box>
      </ThemeProvider>
    </QueryClientProvider>
  );
});

export default App;
