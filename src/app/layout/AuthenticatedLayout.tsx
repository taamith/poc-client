import { useEffect } from 'react';
import { Box, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { useNavigate, Outlet } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { sessionStore } from '../store/sessionStore';
import { useIdleTimeout } from '../../hooks/useIdleTimeout';
import Header from './Header';
import Sidebar from './Sidebar';
import AppBreadcrumbs from './AppBreadcrumbs';

const AuthenticatedLayout = observer(() => {
    const navigate = useNavigate();
    const { showWarning, remainingSeconds, stayLoggedIn } = useIdleTimeout();

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
            <Sidebar />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
                <Header />
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                    <AppBreadcrumbs />
                    <Box sx={{ flex: 1, overflow: 'auto', px: { xs: 2, md: 4 }, pt: 1.5, pb: 8, display: 'flex', flexDirection: 'column' }}>
                        <Outlet />
                    </Box>
                </Box>
            </Box>

            {/* ── Idle-timeout warning dialog ─────────────────────────────── */}
            <Dialog open={showWarning} maxWidth="xs" fullWidth disableEscapeKeyDown>
                <DialogTitle sx={{ fontWeight: 700, color: '#172B4D' }}>
                    Session About to Expire
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: '#6B778C', lineHeight: 1.7 }}>
                        You have been inactive for a while. You will be automatically logged out in{' '}
                        <Box component="span" sx={{ fontWeight: 700, color: '#D32F2F' }}>
                            {remainingSeconds}s
                        </Box>
                        .
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => { sessionStore.signOut(); navigate('/login', { replace: true }); }}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
                    >
                        Log Out Now
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={stayLoggedIn}
                        sx={{
                            textTransform: 'none', fontWeight: 600, borderRadius: '8px',
                            background: 'linear-gradient(135deg, #0D65D9 0%, #1877F2 55%, #3D90F5 100%)',
                            boxShadow: 'none',
                            '&:hover': { background: 'linear-gradient(135deg, #0A52C4 0%, #1468D8 55%, #2F84F0 100%)' },
                        }}
                    >
                        Stay Logged In
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
});

export default AuthenticatedLayout;
