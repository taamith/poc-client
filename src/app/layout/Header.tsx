import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, CircularProgress } from '@mui/material';
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
            issueStore.setAuthenticated(false);
            issueStore.clearSelectedIssue();
            navigate('/login', { replace: true });
        } catch (err) {
            console.error('Failed to disconnect', err);
        } finally {
            setIsDisconnecting(false);
        }
    };

    return (
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
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', color: '#172B4D' }}>
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
                                borderColor: '#DFE1E6',
                                color: '#42526E',
                                '&:hover': {
                                    borderColor: '#C1C7D0',
                                    bgcolor: '#F4F5F7'
                                }
                            }}
                        >
                            {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                        </Button>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
});

export default Header;
