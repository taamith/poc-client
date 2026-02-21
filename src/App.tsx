import { useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, CircularProgress, Typography, Button } from '@mui/material';
import { BRANDING } from './lib/constants/messages';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Toaster } from 'sonner';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';

import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';


import { theme } from './app/theme/theme';
import { sessionStore } from './app/store/sessionStore';
import { integrationStore } from './app/store/integrationStore';

import Header from './app/layout/Header.tsx';
import Sidebar from './app/layout/Sidebar.tsx';
import AppBreadcrumbs from './app/layout/AppBreadcrumbs.tsx';
import LoginView from './feature/auth/LoginView.tsx';
import SignupView from './feature/auth/SignupView.tsx';
import IssueList from './feature/issues/IssueList.tsx';
import IssueDetailView from './feature/issues/IssueDetailView.tsx';
import PlaceholderPage from './feature/pages/PlaceholderPage.tsx';
import UploadDocumentsPage from './feature/pages/UploadDocumentsPage.tsx';
import IntegrationsPage from './feature/pages/IntegrationsPage.tsx';

const queryClient = new QueryClient();

const AuthenticatedLayout = observer(() => {
  const navigate = useNavigate();
  useEffect(() => {
    if (sessionStore.authChecked && !sessionStore.isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [sessionStore.authChecked, sessionStore.isAuthenticated, navigate]);

  if (!sessionStore.authChecked) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!sessionStore.isAuthenticated) return null;

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar — full height, logo at top aligned with header */}
      <Sidebar />
      {/* Right column — header + content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Header />
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

const HomePage = () => (
  <PlaceholderPage title="Home" subtitle="Your command center for test automation — insights, progress, and activity all in one place. Coming soon." Icon={DashboardIcon} />
);

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
            Connect your Jira board from the Integrations page to start importing user stories and generating test plans.
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
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '400px 1fr' }, gap: 3, flex: 1, minHeight: 0 }}>
      <IssueList />
      <IssueDetailView mode="testplans" />
    </Box>
  );
});

const App = observer(() => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route path="/signup" element={<SignupView />} />
          <Route element={<AuthenticatedLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/test-plans" element={<TestPlansPage />} />
            <Route path="/repository" element={<RepositoryPage />} />
            <Route path="/reports" element={<PlaceholderPage title="Reports" subtitle="Analytics and insights on test coverage, generation metrics, and team productivity. Coming soon." Icon={BarChartIcon} />} />
            <Route path="/settings" element={<Navigate to="/settings/general" replace />} />
            <Route path="/settings/general" element={<PlaceholderPage title="General Settings" subtitle="Workspace preferences, notification settings, and team configuration. Coming soon." Icon={HelpOutlineIcon} />} />
            <Route path="/settings/integrations" element={<IntegrationsPage />} />
            <Route path="/integrations" element={<Navigate to="/settings/integrations" replace />} />
            <Route path="/help" element={<PlaceholderPage title="Help & Support" subtitle="Documentation, FAQs, and support resources to help you get the most out of AutoSprint AI." Icon={HelpOutlineIcon} />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Box
          component="footer"
          sx={{
            position: 'fixed',
            bottom: 0, left: 0, right: 0,
            height: 44,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'rgba(255,255,255,0.97)',
            borderTop: '1px solid #EBECF0',
            backdropFilter: 'blur(10px)',
            zIndex: 1200,
            gap: 2,
          }}
        >
          {/* Left — BSC logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Box component="img" src="/BSC_Logo.png" alt="BSC Logo"
              sx={{ height: 22, objectFit: 'contain' }} />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Center — quick links */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            {[
              { label: BRANDING.PRIVACY, href: '#' },
              { label: BRANDING.TERMS, href: '#' },
              { label: 'Help', href: '#' },
            ].map((link, i, arr) => (
              <Box key={link.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography
                  component="a" href={link.href}
                  sx={{
                    fontSize: '0.72rem', color: '#6B778C', textDecoration: 'none',
                    fontWeight: 500, px: 0.8,
                    '&:hover': { color: '#1877F2', textDecoration: 'underline' },
                  }}
                >
                  {link.label}
                </Typography>
                {i < arr.length - 1 && (
                  <Box sx={{ width: '3px', height: '3px', borderRadius: '50%', bgcolor: '#C1C7D0' }} />
                )}
              </Box>
            ))}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Right — copyright */}
          <Typography sx={{ fontSize: '0.7rem', color: '#97A0AF', flexShrink: 0 }}>
            {BRANDING.COPYRIGHT}
          </Typography>
        </Box>
      </ThemeProvider>
    </QueryClientProvider>
  );
});

export default App;
