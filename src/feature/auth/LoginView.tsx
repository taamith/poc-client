import React, { useState } from 'react';
import { Card, CardContent, Typography, Button, Box, Stack, CircularProgress, Backdrop } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { jiraApi } from '../../lib/api/jira';
import { issueStore } from '../../app/store/issueStore';

const LoginView: React.FC = observer(() => {
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const handleLogin = () => {
        const authUrl = 'https://9xd63zeaqb.execute-api.us-east-1.amazonaws.com/dev/auth/jira';
        const popup = jiraApi.authJira(authUrl);
        setIsAuthenticating(true);

        if (popup) {
            const timer = setInterval(async () => {
                if (popup.closed) {
                    clearInterval(timer);
                    setIsAuthenticating(false);
                    await issueStore.fetchIssues();
                    return;
                }

                // Silent fetch doesn't trigger the global Loading state
                const success = await issueStore.fetchIssues(true);
                if (success) {
                    clearInterval(timer);
                    setIsAuthenticating(false);
                    try {
                        popup.close();
                    } catch (e) {
                        // Cross-origin check
                    }
                }
            }, 2000);
        }
    };

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `radial-gradient(1000px 700px at 10% 20%, rgba(14, 107, 107, 0.05), transparent 60%),
                     radial-gradient(800px 800px at 90% 10%, rgba(184, 135, 72, 0.08), transparent 55%),
                     #F4F5F7`
            }}
        >
            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    bgcolor: 'rgba(9, 30, 66, 0.54)', // Stronger Atlassian-style overlay color
                    backdropFilter: 'blur(4px)' // Blurs the background content to prevent text overlap
                }}
                open={isAuthenticating}
            >
                <CircularProgress color="inherit" />
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    Waiting for Jira Authentication...
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Please complete the login in the popup window.
                </Typography>
            </Backdrop>

            <Card sx={{ maxWidth: 400, width: '100%', borderRadius: '3px', p: 4 }}>
                <CardContent>
                    <Stack spacing={4} alignItems="center" textAlign="center">
                        <Box
                            sx={{
                                width: 60, height: 60, borderRadius: '4px',
                                bgcolor: '#0052CC',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontWeight: 'bold', fontSize: '1.5rem',
                                boxShadow: '0 4px 12px rgba(0, 82, 204, 0.3)'
                            }}
                        >
                            QA
                        </Box>

                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 600, color: '#172B4D', mb: 1 }}>
                                POC JIRA CLIENT
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Connect your Jira account to start managing user stories and generating test plans.
                            </Typography>
                        </Box>

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={handleLogin}
                            disabled={isAuthenticating}
                            sx={{
                                py: 1.5,
                                bgcolor: '#0052CC',
                                '&:hover': { bgcolor: '#0747A6' }
                            }}
                        >
                            Log in Jira
                        </Button>

                        {issueStore.error && !isAuthenticating && (
                            <Typography color="error" variant="caption">
                                {issueStore.error}
                            </Typography>
                        )}
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
});

export default LoginView;
