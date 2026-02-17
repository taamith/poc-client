import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, CircularProgress, Backdrop } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { jiraApi } from '../../lib/api/jira';
import { issueStore } from '../store/issueStore';

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
                backdropFilter: 'blur(4px)',
            }}
            open={isDisconnecting}
        >
            <CircularProgress color="inherit" />
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Disconnecting...
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Please wait while we log you out.
            </Typography>
        </Backdrop>
        <AppBar
            position="static"
            sx={{
                bgcolor: '#FFFFFF',
                borderBottom: '1px solid #DFE1E6',
                boxShadow: 'none',
                color: '#172B4D',
            }}
        >
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ minHeight: 56 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 1.5 }}>
                        <Typography
                            variant="h6"
                            onClick={() => window.location.reload()}
                            sx={{ fontWeight: 600, fontSize: '1rem', color: '#172B4D', cursor: 'pointer', userSelect: 'none' }}
                        >
                            AutoSprint AI
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            onClick={handleDisconnect}
                            disabled={isDisconnecting}
                            startIcon={isDisconnecting ? <CircularProgress size={16} color="inherit" /> : null}
                            sx={{
                                borderColor: '#5a1196',
                                color: '#5a1196',
                                '&:hover': {
                                    borderColor: '#4a12a4',
                                    bgcolor: 'rgba(90, 17, 150, 0.06)'
                                }
                            }}
                        >
                            {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                        </Button>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
        </>
    );
});

export default Header;
