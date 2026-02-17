import { useEffect } from 'react';
import { ThemeProvider, CssBaseline, Container, Box, CircularProgress, Typography } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Toaster } from 'sonner';

import { theme } from './app/theme/theme';
import { issueStore } from './app/store/issueStore';

import Header from './app/layout/Header.tsx';
import LoginView from './feature/auth/LoginView.tsx';
import IssueList from './feature/issues/IssueList.tsx';
import IssueDetailView from './feature/issues/IssueDetailView.tsx';

const queryClient = new QueryClient();

const IssuesPage = observer(() => {
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect after auth check has completed
    if (issueStore.authChecked && !issueStore.isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [issueStore.authChecked, issueStore.isAuthenticated, navigate]);

  // Show loading while auth check is in progress
  if (!issueStore.authChecked) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!issueStore.isAuthenticated) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}
    >
      <Header />
      <Container
        maxWidth="xl"
        sx={{
          mt: { xs: 2, md: 3 },
          px: { xs: 2, md: 4 },
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '400px 1fr' },
            gap: 3,
            height: 'calc(100vh - 140px)',
          }}
        >
          <IssueList />
          <IssueDetailView />
        </Box>
      </Container>
    </Box>
  );
});

const App = observer(() => {
  useEffect(() => {
    // On initial load, check if already authenticated (e.g. session still valid)
    issueStore.fetchIssues(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route path="/issues" element={<IssuesPage />} />
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
            © AutoSprint AI, BSC Solutions India Pvt Ltd © 2026
          </Typography>
        </Box>
      </ThemeProvider>
    </QueryClientProvider>
  );
});

export default App;
