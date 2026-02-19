import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, CircularProgress, Backdrop, Chip } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import { jiraApi } from '../../lib/api/jira';
import { issueStore } from '../store/issueStore';
import { BRANDING, LOADING, BUTTONS } from '../../lib/constants/messages';

const Header = observer(() => {
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const navigate = useNavigate();

    const handleDisconnect = async () => {
        setIsDisconnecting(true);
        try {
            await jiraApi.disconnect();
        } catch (err) {
            console.error('Failed to disconnect', err);
        } finally {
            issueStore.setAuthenticated(false);
            issueStore.authChecked = false;
            issueStore.clearSelectedIssue();
            setIsDisconnecting(false);
            navigate('/login', { replace: true });
        }
    };

    return (
        <>
        <Backdrop
            sx={{
                color: '#fff',
                zIndex: (theme) => theme.zIndex.drawer + 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                bgcolor: 'rgba(9, 30, 66, 0.54)',
                backdropFilter: 'blur(8px)',
            }}
            open={isDisconnecting}
        >
            <CircularProgress color="inherit" />
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {LOADING.DISCONNECTING}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {LOADING.PLEASE_WAIT_LOGOUT}
            </Typography>
        </Backdrop>
        <AppBar
            position="static"
            elevation={0}
            sx={{
                bgcolor: '#FFFFFF',
                borderBottom: '1px solid #DFE1E6',
                color: '#172B4D',
            }}
        >
                <Toolbar sx={{ minHeight: 60, gap: 2, px: { xs: 2, md: 3 } }}>
                    <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => window.location.reload()}
                    >
                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #5a1196 0%, #6d0c69 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: '14px',
                                fontWeight: 800,
                            }}
                        >
                            AS
                        </Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                fontSize: '1.05rem',
                                color: '#172B4D',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            {BRANDING.APP_NAME}
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    <Chip
                        label="Jira Connected"
                        size="small"
                        sx={{
                            bgcolor: 'rgba(90, 17, 150, 0.08)',
                            color: '#5a1196',
                            fontWeight: 600,
                            fontSize: '12px',
                            border: '1px solid rgba(90, 17, 150, 0.25)',
                        }}
                    />

                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleDisconnect}
                        disabled={isDisconnecting}
                        startIcon={isDisconnecting ? <CircularProgress size={14} color="inherit" /> : <LogoutIcon sx={{ fontSize: 16 }} />}
                        sx={{
                            borderColor: '#DFE1E6',
                            color: '#5a1196',
                            fontSize: '13px',
                            '&:hover': {
                                borderColor: '#5a1196',
                                bgcolor: 'rgba(90, 17, 150, 0.06)',
                                color: '#4a12a4',
                            },
                        }}
                    >
                        {isDisconnecting ? LOADING.DISCONNECTING : BUTTONS.DISCONNECT}
                    </Button>
                </Toolbar>
        </AppBar>
        </>
    );
});

export default Header;
