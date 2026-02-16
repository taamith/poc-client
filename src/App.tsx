import { useEffect } from 'react';
import { ThemeProvider, CssBaseline, Container, Box, CircularProgress } from '@mui/material';
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
          mt: { xs: 2, md: 4 },
          mb: 4,
          px: { xs: 2, md: 4 }
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '400px 1fr' },
            gap: 3,
            alignItems: 'start'
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
      </ThemeProvider>
    </QueryClientProvider>
  );
});

export default App;
