import React, { useState } from 'react';
import { Typography, Button, Box, Stack, TextField, InputAdornment, IconButton } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { BRANDING } from '../../lib/constants/messages';

const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState { name: string; username: string; password: string; employeeId: string; email: string; phone: string; }
interface FormErrors { name?: string; username?: string; password?: string; employeeId?: string; email?: string; phone?: string; }

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px', bgcolor: '#fff',
        '&:hover fieldset': { borderColor: '#1877F2' },
        '&.Mui-focused fieldset': { borderColor: '#1877F2' },
    },
    '& label.Mui-focused': { color: '#1877F2' },
};

const SignupView: React.FC = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState<FormState>({ name: '', username: '', password: '', employeeId: '', email: '', phone: '' });
    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);

    const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(p => ({ ...p, [field]: e.target.value }));
        setErrors(p => ({ ...p, [field]: undefined }));
    };

    const validate = () => {
        const e: FormErrors = {};
        if (!form.name.trim()) e.name = 'Name is required';
        if (!form.username.trim()) e.username = 'Username is required';
        if (!form.password) { e.password = 'Password is required'; }
        else if (!passwordRegex.test(form.password)) { e.password = 'Min 8 chars with uppercase, lowercase, number & special character'; }
        if (!form.employeeId.trim()) e.employeeId = 'Employee ID is required';
        if (!form.email.trim()) { e.email = 'Email is required'; }
        else if (!emailRegex.test(form.email)) { e.email = 'Enter a valid email address'; }
        if (form.phone && !/^\+?[\d\s\-().]{7,15}$/.test(form.phone)) { e.phone = 'Enter a valid phone number'; }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSignup = () => {
        if (!validate()) return;
        navigate('/login', { replace: true });
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>

            {/* ── Left brand panel ── */}
            <Box sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                justifyContent: 'space-between',
                width: '40%',
                flexShrink: 0,
                background: 'linear-gradient(160deg, #0A3D8F 0%, #1877F2 55%, #3D90F5 100%)',
                p: 5,
                position: 'relative',
                overflow: 'hidden',
            }}>
                <Box sx={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)', top: -100, right: -100 }} />
                <Box sx={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', top: -40, right: -40 }} />
                <Box sx={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', bottom: -80, left: -80 }} />

                <Box component="img" src="/BSC_Logo.png" alt="BSC Logo"
                    sx={{ height: 28, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.9, alignSelf: 'flex-start' }} />

                <Box>
                    <Box sx={{
                        width: 52, height: 52, borderRadius: '14px',
                        bgcolor: 'rgba(255,255,255,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3,
                    }}>
                        <RocketLaunchIcon sx={{ color: '#fff', fontSize: 26 }} />
                    </Box>
                    <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.03em', mb: 1.5 }}>
                        Join {BRANDING.APP_NAME}
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 280 }}>
                        Set up your account and start generating intelligent test plans from your project board in minutes.
                    </Typography>
                </Box>

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
                py: 5,
                overflowY: 'auto',
            }}>
                <Box sx={{ width: '100%', maxWidth: 400 }}>

                    {/* Mobile logo */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4 }}>
                        <Box component="img" src="/BSC_Logo.png" alt="BSC Logo" sx={{ height: 24, objectFit: 'contain' }} />
                        <Typography sx={{ fontWeight: 800, fontSize: '1rem', background: 'linear-gradient(135deg, #0D65D9, #3D90F5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {BRANDING.APP_NAME}
                        </Typography>
                    </Box>

                    <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#172B4D', letterSpacing: '-0.03em', mb: 0.5 }}>
                        Create your account
                    </Typography>
                    <Typography sx={{ fontSize: '0.88rem', color: '#6B778C', mb: 3.5 }}>
                        Fill in your details to get started
                    </Typography>

                    <Stack spacing={1.8}>
                        {/* Row: Name + Username */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                            <TextField fullWidth size="small" label="Full Name"
                                value={form.name} onChange={set('name')}
                                error={!!errors.name} helperText={errors.name}
                                slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonOutlineIcon sx={{ color: '#A5ADBA', fontSize: 18 }} /></InputAdornment> } }}
                                sx={fieldSx} />
                            <TextField fullWidth size="small" label="Username"
                                value={form.username} onChange={set('username')}
                                error={!!errors.username} helperText={errors.username}
                                slotProps={{ input: { startAdornment: <InputAdornment position="start"><AccountCircleOutlinedIcon sx={{ color: '#A5ADBA', fontSize: 18 }} /></InputAdornment> } }}
                                sx={fieldSx} />
                        </Box>

                        <TextField fullWidth size="small" label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={form.password} onChange={set('password')}
                            error={!!errors.password} helperText={errors.password}
                            slotProps={{
                                input: {
                                    startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: '#A5ADBA', fontSize: 18 }} /></InputAdornment>,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setShowPassword(v => !v)} edge="end">
                                                {showPassword ? <VisibilityOff sx={{ fontSize: 17 }} /> : <Visibility sx={{ fontSize: 17 }} />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={fieldSx} />

                        <TextField fullWidth size="small" label="Employee ID"
                            value={form.employeeId} onChange={set('employeeId')}
                            error={!!errors.employeeId} helperText={errors.employeeId}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><BadgeOutlinedIcon sx={{ color: '#A5ADBA', fontSize: 18 }} /></InputAdornment> } }}
                            sx={fieldSx} />

                        <TextField fullWidth size="small" label="Email Address" type="email"
                            value={form.email} onChange={set('email')}
                            error={!!errors.email} helperText={errors.email}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ color: '#A5ADBA', fontSize: 18 }} /></InputAdornment> } }}
                            sx={fieldSx} />

                        <TextField fullWidth size="small" label="Phone Number (optional)" type="tel"
                            value={form.phone} onChange={set('phone')}
                            error={!!errors.phone} helperText={errors.phone}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneOutlinedIcon sx={{ color: '#A5ADBA', fontSize: 18 }} /></InputAdornment> } }}
                            sx={fieldSx} />
                    </Stack>

                    <Button fullWidth variant="contained" size="large" onClick={handleSignup}
                        sx={{
                            mt: 3, py: 1.4, borderRadius: '10px',
                            background: 'linear-gradient(135deg, #0D65D9 0%, #1877F2 55%, #3D90F5 100%)',
                            fontWeight: 700, fontSize: '0.92rem', textTransform: 'none',
                            boxShadow: '0 4px 16px rgba(24,119,242,0.35)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #0A52C4 0%, #1468D8 55%, #2F84F0 100%)',
                                boxShadow: '0 6px 22px rgba(24,119,242,0.45)',
                            },
                        }}>
                        Create Account
                    </Button>

                    <Typography sx={{ mt: 3, fontSize: '0.85rem', color: '#6B778C', textAlign: 'center' }}>
                        Already have an account?{' '}
                        <Box component={Link} to="/login"
                            sx={{ color: '#1877F2', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                            Sign In
                        </Box>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default SignupView;
