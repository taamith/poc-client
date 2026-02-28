import { Box, Typography } from '@mui/material';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BRANDING } from './lib/constants/messages';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { observer } from 'mobx-react-lite';
import { Toaster } from 'sonner';

import { theme } from './app/theme/theme';
import AppRoutes from './app/routes';

const queryClient = new QueryClient();

const App = observer(() => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster position="top-right" richColors />

        <AppRoutes />

        {/* Footer */}
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
              { label: BRANDING.TERMS,   href: '#' },
              { label: 'Help',           href: '#' },
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
