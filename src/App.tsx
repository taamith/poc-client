import { useEffect } from 'react';
import { ThemeProvider, CssBaseline, Container, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { observer } from 'mobx-react-lite';
import { Toaster } from 'sonner';

import { theme } from './app/theme/theme';
import { issueStore } from './app/store/issueStore';

import Header from './app/layout/Header.tsx';
import LoginView from './feature/auth/LoginView.tsx';
import IssueList from './feature/issues/IssueList.tsx';
import IssueDetailView from './feature/issues/IssueDetailView.tsx';

const queryClient = new QueryClient();

const App = observer(() => {
  useEffect(() => {
    // Check initial auth status silently to avoid generic connection errors on login page
    issueStore.fetchIssues(true);

    // Listener for Auth Success Message (from popup handled in LoginView)
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'jira-auth-success') {
        issueStore.setAuthenticated(true);
        issueStore.fetchIssues();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster position="top-right" richColors />
        {!issueStore.isAuthenticated ? (
          <LoginView />
        ) : (
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
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
});

export default App;
