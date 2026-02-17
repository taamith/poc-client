import React, { useState, useRef, useEffect } from 'react';
import {
    Typography, Button, Box, Stack, Backdrop, CircularProgress,
    Paper, TextField, InputAdornment, ClickAwayListener, Divider
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import LockIcon from '@mui/icons-material/Lock';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { jiraApi } from '../../lib/api/jira';
import { issueStore } from '../../app/store/issueStore';
import { BRANDING, LOADING, BUTTONS, PLACEHOLDERS } from '../../lib/constants/messages';

interface Provider {
    id: string;
    name: string;
    description: string;
    icon: string;
}

const providers: Provider[] = [
    { id: 'jira', name: 'Jira', description: 'Project Management', icon: '📋' },
    { id: 'azure-devops', name: 'Azure DevOps', description: 'DevOps & CI/CD', icon: '🔷' },
    { id: 'servicenow', name: 'ServiceNow', description: 'IT Service Management', icon: '🟢' },
];

const LoginView: React.FC = observer(() => {
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<Provider>(providers[0]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (issueStore.isAuthenticated) {
            navigate('/issues', { replace: true });
        }
    }, [issueStore.isAuthenticated, navigate]);

    useEffect(() => {
        if (dropdownOpen && searchRef.current) {
            searchRef.current.focus();
        }
    }, [dropdownOpen]);

    const filteredProviders = providers.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleLogin = () => {
        const authUrl = 'https://9xd63zeaqb.execute-api.us-east-1.amazonaws.com/dev/auth/jira';
        const popup = jiraApi.authJira(authUrl);
        setIsAuthenticating(true);

        if (popup) {
            const timer = setInterval(async () => {
                if (popup.closed) {
                    clearInterval(timer);
                    setIsAuthenticating(false);
                    const success = await issueStore.fetchIssues();
                    if (success) {
                        navigate('/issues', { replace: true });
                    }
                    return;
                }

                const success = await issueStore.fetchIssues(true);
                if (success) {
                    clearInterval(timer);
                    setIsAuthenticating(false);
                    try { popup.close(); } catch (_) { /* cross-origin */ }
                    navigate('/issues', { replace: true });
                }
            }, 2000);
        }
    };

    const handleSelectProvider = (provider: Provider) => {
        setSelectedProvider(provider);
        setDropdownOpen(false);
        setSearchQuery('');
    };

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #3614b2 0%, #5a1196 50%, #6d0c69 100%)',
            }}
        >
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
                open={isAuthenticating}
            >
                <CircularProgress color="inherit" />
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    {LOADING.WAITING_AUTH}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {LOADING.COMPLETE_LOGIN}
                </Typography>
            </Backdrop>

            <Paper
                elevation={8}
                sx={{
                    maxWidth: 480,
                    width: '100%',
                    borderRadius: '16px',
                    p: { xs: 3, sm: 5 },
                    mx: 2,
                }}
            >
                <Stack spacing={3} alignItems="center" textAlign="center">

                    <Box>
                        <Typography
                            variant="h4"
                            sx={{
                                fontFamily: '"Fraunces", serif',
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #3614b2 0%, #5a1196 50%, #6d0c69 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 0.5,
                            }}
                        >
                            {BRANDING.APP_NAME}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#172B4D', mb: 0.5 }}>
                            {BRANDING.WELCOME}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B778C' }}>
                            {BRANDING.AUTH_SUBTITLE}
                            <Box component="span" sx={{ color: '#5a1196', ml: 0.5 }}>.</Box>
                        </Typography>
                    </Box>

                    <Box sx={{ width: '100%', textAlign: 'left' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#42526E', mb: 1 }}>
                            {BRANDING.AUTH_PROVIDER_LABEL}
                        </Typography>

                        <ClickAwayListener onClickAway={() => { setDropdownOpen(false); setSearchQuery(''); }}>
                            <Box sx={{ position: 'relative' }}>
                                <Box
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        border: dropdownOpen ? '2px solid #4a12a4' : '1.5px solid #DFE1E6',
                                        borderRadius: '10px',
                                        p: 1.5,
                                        cursor: 'pointer',
                                        transition: 'border-color 0.2s',
                                        '&:hover': {
                                            borderColor: dropdownOpen ? '#4a12a4' : '#B3BAC5',
                                        },
                                    }}
                                >
                                    {selectedProvider ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box
                                                sx={{
                                                    width: 36, height: 36, borderRadius: '8px',
                                                    bgcolor: '#E8F0FE', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '1.2rem',
                                                }}
                                            >
                                                {selectedProvider.icon}
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#172B4D', lineHeight: 1.3 }}>
                                                    {selectedProvider.name}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#6B778C' }}>
                                                    {selectedProvider.description}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" sx={{ color: '#A5ADBA' }}>
                                            {PLACEHOLDERS.CHOOSE_PROVIDER}
                                        </Typography>
                                    )}
                                    {dropdownOpen
                                        ? <KeyboardArrowUpIcon sx={{ color: '#6B778C' }} />
                                        : <KeyboardArrowDownIcon sx={{ color: '#6B778C' }} />
                                    }
                                </Box>

                                {dropdownOpen && (
                                    <Paper
                                        elevation={4}
                                        sx={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            mt: 0.5,
                                            borderRadius: '10px',
                                            border: '1px solid #DFE1E6',
                                            zIndex: 10,
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Box sx={{ p: 1.5 }}>
                                            <TextField
                                                inputRef={searchRef}
                                                size="small"
                                                fullWidth
                                                placeholder={PLACEHOLDERS.SEARCH_PROVIDERS}
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <SearchIcon sx={{ color: '#A5ADBA', fontSize: 20 }} />
                                                            </InputAdornment>
                                                        ),
                                                    },
                                                }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '8px',
                                                        fontSize: '0.875rem',
                                                    },
                                                }}
                                            />
                                        </Box>

                                        {filteredProviders.map((provider) => (
                                            <Box
                                                key={provider.id}
                                                onClick={() => handleSelectProvider(provider)}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    px: 1.5,
                                                    py: 1.2,
                                                    cursor: 'pointer',
                                                    transition: 'background-color 0.15s',
                                                    bgcolor: selectedProvider?.id === provider.id ? '#F4F5F7' : 'transparent',
                                                    '&:hover': { bgcolor: '#F4F5F7' },
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Box
                                                        sx={{
                                                            width: 36, height: 36, borderRadius: '8px',
                                                            bgcolor: '#E8F0FE', display: 'flex',
                                                            alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '1.2rem',
                                                        }}
                                                    >
                                                        {provider.icon}
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#172B4D', lineHeight: 1.3 }}>
                                                            {provider.name}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: '#6B778C' }}>
                                                            {provider.description}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        ))}

                                        {filteredProviders.length === 0 && (
                                            <Box sx={{ px: 1.5, py: 2, textAlign: 'center' }}>
                                                <Typography variant="body2" sx={{ color: '#6B778C' }}>
                                                    {PLACEHOLDERS.NO_PROVIDERS}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Paper>
                                )}
                            </Box>
                        </ClickAwayListener>
                    </Box>

                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleLogin}
                        disabled={isAuthenticating || !selectedProvider}
                        startIcon={<LockIcon sx={{ fontSize: 18 }} />}
                        sx={{
                            py: 1.5,
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #3614b2 0%, #5a1196 50%, #6d0c69 100%)',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            textTransform: 'none',
                            boxShadow: '0 4px 14px rgba(54, 20, 178, 0.4)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #4a12a4 0%, #660f89 50%, #6d0e7b 100%)',
                                boxShadow: '0 6px 20px rgba(54, 20, 178, 0.5)',
                            },
                            '&.Mui-disabled': {
                                background: '#DFE1E6',
                            },
                        }}
                    >
                        {BUTTONS.LAUNCH(selectedProvider?.name || 'Provider')}
                    </Button>

                    <Typography variant="caption" sx={{ color: '#6B778C', lineHeight: 1.6 }}>
                        By signing in, you agree to our{' '}
                        <Box component="span" sx={{ color: '#4a12a4', cursor: 'pointer', textDecoration: 'underline' }}>
                            {BRANDING.TERMS}
                        </Box>
                        {' '}and{' '}
                        <Box component="span" sx={{ color: '#4a12a4', cursor: 'pointer', textDecoration: 'underline' }}>
                            {BRANDING.PRIVACY}
                        </Box>
                    </Typography>

                    <Divider sx={{ width: '100%' }} />
                    <Typography variant="caption" sx={{ color: '#A5ADBA' }}>
                        {BRANDING.COPYRIGHT}
                    </Typography>
                </Stack>
            </Paper>
        </Box>
    );
});

export default LoginView;
