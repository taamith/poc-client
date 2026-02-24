import React, { useState } from 'react';
import { Typography, Button, Box, Stack, TextField, InputAdornment, IconButton } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { sessionStore } from '../../app/store/sessionStore';
import { BRANDING } from '../../lib/constants/messages';
import USERS from '../../lib/constants/users.json';

const FEATURES = [
    { title: 'AI-Powered Test Plans', desc: 'Generate comprehensive test plans from user stories instantly.' },
    { title: 'Tool Integrations', desc: 'Seamlessly import issues directly from your project management tools.' },
    { title: 'Smart Collaboration', desc: 'Publish and share test artifacts across your team.' },
];

const LoginView: React.FC = observer(() => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

    const handleLogin = () => {
        const e: { username?: string; password?: string } = {};
        if (!username.trim()) e.username = 'Username is required';
        if (!password.trim()) e.password = 'Password is required';
        if (Object.keys(e).length > 0) { setErrors(e); return; }

        const match = USERS.find(u => u.username === username.trim() && u.password === password);
        if (!match) {
            setErrors({ password: 'Invalid username or password' });
            return;
        }

        sessionStore.setAuthenticated(true, {
            username: match.username,
            name: match.name,
            employeeId: match.employeeId,
            email: match.email,
            phone: match.phone,
        });
        navigate('/home', { replace: true });
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

            {/* ── Left brand panel ── */}
            <Box sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                justifyContent: 'space-between',
                width: '45%',
                flexShrink: 0,
                background: 'linear-gradient(160deg, #0A3D8F 0%, #1877F2 55%, #3D90F5 100%)',
                p: 5,
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Decorative circles */}
                <Box sx={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)', top: -100, right: -100 }} />
                <Box sx={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', top: -40, right: -40 }} />
                <Box sx={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', bottom: -80, left: -80 }} />

                {/* Logo */}
                <Box>
                    <Box component="img" src="/BSC_Logo.png" alt="BSC Logo"
                        sx={{ height: 28, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
                </Box>

                {/* Center content */}
                <Box>
                    <Box sx={{
                        width: 52, height: 52, borderRadius: '14px',
                        bgcolor: 'rgba(255,255,255,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3,
                    }}>
                        <RocketLaunchIcon sx={{ color: '#fff', fontSize: 26 }} />
                    </Box>
                    <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.03em', mb: 1.5 }}>
                        {BRANDING.APP_NAME}
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, mb: 4, maxWidth: 320 }}>
                        Accelerate your QA workflow with AI-driven test plan generation from your project management tools.
                    </Typography>

                    <Stack spacing={2.5}>
                        {FEATURES.map((f) => (
                            <Box key={f.title} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                <Box sx={{
                                    mt: 0.3, width: 20, height: 20, borderRadius: '50%',
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#fff' }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{f.title}</Typography>
                                    <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{f.desc}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Stack>
                </Box>

                {/* Bottom copyright */}
                <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
                    {BRANDING.COPYRIGHT}
                </Typography>
            </Box>

            {/* ── Right form panel ── */}
            <Box sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#FAFBFC',
                px: { xs: 3, sm: 6, md: 8 },
                py: 4,
                overflowY: 'auto',
            }}>
                <Box sx={{ width: '100%', maxWidth: 380 }}>

                    {/* Mobile logo */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4 }}>
                        <Box component="img" src="/BSC_Logo.png" alt="BSC Logo" sx={{ height: 24, objectFit: 'contain' }} />
                        <Typography sx={{ fontWeight: 800, fontSize: '1rem', background: 'linear-gradient(135deg, #0D65D9, #3D90F5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {BRANDING.APP_NAME}
                        </Typography>
                    </Box>

                    <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color: '#172B4D', letterSpacing: '-0.03em', mb: 0.5 }}>
                        Welcome back
                    </Typography>
                    <Typography sx={{ fontSize: '0.88rem', color: '#6B778C', mb: 4 }}>
                        Sign in to continue to {BRANDING.APP_NAME}
                    </Typography>

                    <Stack spacing={2}>
                        <TextField
                            fullWidth size="small" label="Username"
                            value={username}
                            onChange={(e) => { setUsername(e.target.value); setErrors(p => ({ ...p, username: undefined })); }}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            error={!!errors.username} helperText={errors.username}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonOutlineIcon sx={{ color: '#A5ADBA', fontSize: 19 }} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px', bgcolor: '#fff',
                                    '&:hover fieldset': { borderColor: '#1877F2' },
                                    '&.Mui-focused fieldset': { borderColor: '#1877F2' },
                                },
                                '& label.Mui-focused': { color: '#1877F2' },
                            }}
                        />
                        <TextField
                            fullWidth size="small" label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            error={!!errors.password} helperText={errors.password}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlinedIcon sx={{ color: '#A5ADBA', fontSize: 19 }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setShowPassword(v => !v)} edge="end">
                                                {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px', bgcolor: '#fff',
                                    '&:hover fieldset': { borderColor: '#1877F2' },
                                    '&.Mui-focused fieldset': { borderColor: '#1877F2' },
                                },
                                '& label.Mui-focused': { color: '#1877F2' },
                            }}
                        />
                    </Stack>

                    <Button
                        fullWidth variant="contained" size="large"
                        onClick={handleLogin}
                        sx={{
                            mt: 3, py: 1.4, borderRadius: '10px',
                            background: 'linear-gradient(135deg, #0D65D9 0%, #1877F2 55%, #3D90F5 100%)',
                            fontWeight: 700, fontSize: '0.92rem', textTransform: 'none',
                            boxShadow: '0 4px 16px rgba(24,119,242,0.35)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #0A52C4 0%, #1468D8 55%, #2F84F0 100%)',
                                boxShadow: '0 6px 22px rgba(24,119,242,0.45)',
                            },
                        }}
                    >
                        Sign In
                    </Button>

                </Box>
            </Box>
        </Box>
    );
});

export default LoginView;
