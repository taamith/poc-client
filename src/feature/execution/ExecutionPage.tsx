import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    Box, Typography, TextField, Button,
    Stack, InputAdornment, IconButton, Paper,
    Alert, CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import LinkRoundedIcon        from '@mui/icons-material/LinkRounded';
import LinkIcon               from '@mui/icons-material/Link';
import PersonOutlineIcon      from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon       from '@mui/icons-material/LockOutlined';
import KeyRoundedIcon         from '@mui/icons-material/KeyRounded';
import Visibility             from '@mui/icons-material/Visibility';
import VisibilityOff          from '@mui/icons-material/VisibilityOff';

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE            = '/exec-api';
const STATUS_POLL_MS  = 2000; // 2 seconds

// ─── Status enum & labels ─────────────────────────────────────────────────────

type LoginStatus =
    | 'not_started'
    | 'starting'
    | 'credentials_filling'
    | 'otp_required'
    | 'otp_submitting'
    | 'authenticated'
    | 'error';

const STATUS_LABELS: Record<LoginStatus, string> = {
    not_started:         'Not Started',
    starting:            'Starting…',
    credentials_filling: 'Filling Credentials',
    otp_required:        'OTP Required',
    otp_submitting:      'Submitting OTP',
    authenticated:       'Authenticated',
    error:               'Authentication Failed',
};

type PagePhase = 'idle' | 'polling' | 'otp' | 'error';

interface LoginStatusResponse {
    status:        string;
    session_id?:   string;
    otp_required?: boolean;
    live_view_url?: string;
    error?:        string | null;
}

// ─── Shared field style ───────────────────────────────────────────────────────

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        bgcolor: '#fff',
        '&:hover fieldset': { borderColor: '#1877F2' },
        '&.Mui-focused fieldset': { borderColor: '#1877F2' },
    },
    '& label.Mui-focused': { color: '#1877F2' },
};

const btnSx = {
    py: 1.3, borderRadius: '10px',
    background: 'linear-gradient(135deg, #0D65D9 0%, #1877F2 55%, #3D90F5 100%)',
    fontWeight: 700, fontSize: '0.92rem', textTransform: 'none' as const,
    boxShadow: '0 4px 16px rgba(24,119,242,0.35)',
    '&:hover': {
        background: 'linear-gradient(135deg, #0A52C4 0%, #1468D8 55%, #2F84F0 100%)',
        boxShadow: '0 6px 22px rgba(24,119,242,0.45)',
    },
};

// ─── Component ────────────────────────────────────────────────────────────────

const ExecutionPage: React.FC = () => {
    const navigate = useNavigate();

    // Credentials
    const [url, setUrl]           = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors]   = useState<Record<string, string>>({});

    // OTP
    const [otp, setOtp]         = useState('');
    const [otpError, setOtpError] = useState('');

    // Phase / messaging
    const [phase, setPhase]       = useState<PagePhase>('idle');
    const [statusMsg, setStatusMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const pollRef         = useRef<ReturnType<typeof setInterval> | null>(null);
    const otpSubmittedRef = useRef(false);

    // Cleanup on unmount
    useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

    const stopPolling = useCallback(() => {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    }, []);

    // ── Status polling ────────────────────────────────────────────────────────

    const pollStatus = useCallback(async () => {
        try {
            const res = await fetch(`${BASE}/login/status`);
            if (!res.ok) return;
            const data: LoginStatusResponse = await res.json();

            const raw   = (data.status ?? '') as LoginStatus;
            const label = STATUS_LABELS[raw] ?? raw.replace(/_/g, ' ');
            setStatusMsg(label);

            // OTP required — but only if we haven't already submitted OTP
            if (data.otp_required && !otpSubmittedRef.current) {
                stopPolling();
                setPhase('otp');
                return;
            }

            if (raw === 'authenticated') {
                stopPolling();
                navigate('/execution/run');
                return;
            }

            if (raw === 'error') {
                stopPolling();
                setErrorMsg(data.error ?? 'Authentication failed. Please check your credentials.');
                setPhase('error');
            }
        } catch { /* transient — keep polling */ }
    }, [navigate, stopPolling]);

    // ── Connect ───────────────────────────────────────────────────────────────

    const handleConnect = async () => {
        // Validate
        const e: Record<string, string> = {};
        if (!url.trim())      e.url      = 'Application URL is required';
        if (!username.trim()) e.username = 'Username is required';
        if (!password.trim()) e.password = 'Password is required';
        if (Object.keys(e).length) { setFieldErrors(e); return; }

        setFieldErrors({});
        setErrorMsg('');
        setOtp('');
        setOtpError('');
        otpSubmittedRef.current = false;
        stopPolling();

        setPhase('polling');
        setStatusMsg(STATUS_LABELS.starting);

        try {
            const res = await fetch(`${BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url:      url.trim(),
                    username: username.trim(),
                    password,
                }),
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                throw new Error((d as { error?: string }).error ?? `Server returned ${res.status}`);
            }

            // Begin polling
            pollRef.current = setInterval(pollStatus, STATUS_POLL_MS);
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Connection failed. Please try again.');
            setPhase('error');
        }
    };

    // ── Submit OTP ────────────────────────────────────────────────────────────

    const handleSubmitOtp = async () => {
        if (!otp.trim()) { setOtpError('Please enter the OTP'); return; }
        setOtpError('');

        otpSubmittedRef.current = true;
        setPhase('polling');
        setStatusMsg(STATUS_LABELS.otp_submitting);

        try {
            const res = await fetch(`${BASE}/login/otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp_code: otp.trim() }),
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                throw new Error((d as { error?: string }).error ?? `Server returned ${res.status}`);
            }

            // Resume polling after OTP submission
            pollRef.current = setInterval(pollStatus, STATUS_POLL_MS);
        } catch (err) {
            otpSubmittedRef.current = false;
            setErrorMsg(err instanceof Error ? err.message : 'OTP submission failed.');
            setPhase('error');
        }
    };

    // ── Derived ───────────────────────────────────────────────────────────────

    const isPolling    = phase === 'polling';
    const isOtp        = phase === 'otp';
    const isError      = phase === 'error';
    const formDisabled = isPolling || isOtp;

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', pt: 6 }}>
            <Paper
                elevation={0}
                sx={{
                    width: '100%', maxWidth: 460,
                    border: '1px solid #EBECF0', borderRadius: '16px',
                    p: 4, bgcolor: '#fff',
                }}
            >
                {/* Header */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{
                        width: 48, height: 48, borderRadius: '12px',
                        background: 'linear-gradient(135deg, #0D65D9 0%, #1877F2 55%, #3D90F5 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2,
                        boxShadow: '0 4px 14px rgba(24,119,242,0.28)',
                    }}>
                        <PlayCircleRoundedIcon sx={{ color: '#fff', fontSize: 26 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#172B4D', letterSpacing: '-0.02em' }}>
                        Connect to Application
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: '#6B778C', mt: 0.5 }}>
                        Enter your application credentials to start test execution.
                    </Typography>
                </Box>

                <Stack spacing={2.5}>

                    {/* Application URL */}
                    <TextField
                        fullWidth size="small" label="Application URL"
                        value={url}
                        onChange={e => { setUrl(e.target.value); setFieldErrors(p => ({ ...p, url: '' })); }}
                        placeholder="https://your-app.example.com"
                        disabled={formDisabled}
                        error={!!fieldErrors.url} helperText={fieldErrors.url}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LinkIcon sx={{ color: '#A5ADBA', fontSize: 19 }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={fieldSx}
                    />

                    {/* Username */}
                    <TextField
                        fullWidth size="small" label="Username"
                        value={username}
                        onChange={e => { setUsername(e.target.value); setFieldErrors(p => ({ ...p, username: '' })); }}
                        disabled={formDisabled}
                        error={!!fieldErrors.username} helperText={fieldErrors.username}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonOutlineIcon sx={{ color: '#A5ADBA', fontSize: 19 }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={fieldSx}
                    />

                    {/* Password */}
                    <TextField
                        fullWidth size="small" label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); }}
                        disabled={formDisabled}
                        error={!!fieldErrors.password} helperText={fieldErrors.password}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOutlinedIcon sx={{ color: '#A5ADBA', fontSize: 19 }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small" edge="end" disabled={formDisabled}
                                            onClick={() => setShowPassword(v => !v)}
                                        >
                                            {showPassword
                                                ? <VisibilityOff sx={{ fontSize: 18 }} />
                                                : <Visibility sx={{ fontSize: 18 }} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={fieldSx}
                    />

                    {/* Status banner (polling / OTP phases) */}
                    {(isPolling || isOtp) && statusMsg && (
                        <Box sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            px: 2, py: 1.4, borderRadius: '10px',
                            bgcolor: '#EEF5FF', border: '1px solid rgba(24,119,242,0.18)',
                        }}>
                            <CircularProgress size={14} thickness={5} sx={{ color: '#1877F2', flexShrink: 0 }} />
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1877F2' }}>
                                {statusMsg}
                            </Typography>
                        </Box>
                    )}

                    {/* OTP field */}
                    {isOtp && (
                        <Stack spacing={1.5}>
                            <TextField
                                fullWidth size="small" label="One-Time Password (OTP)"
                                value={otp}
                                onChange={e => { setOtp(e.target.value); setOtpError(''); }}
                                onKeyDown={e => e.key === 'Enter' && handleSubmitOtp()}
                                error={!!otpError} helperText={otpError}
                                inputProps={{ maxLength: 8, inputMode: 'numeric' }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <KeyRoundedIcon sx={{ color: '#A5ADBA', fontSize: 19 }} />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                                sx={fieldSx}
                            />
                            <Button
                                fullWidth variant="contained" size="large"
                                onClick={handleSubmitOtp}
                                sx={btnSx}
                            >
                                Submit OTP
                            </Button>
                        </Stack>
                    )}

                    {/* Error message */}
                    {isError && errorMsg && (
                        <Alert severity="error" sx={{ borderRadius: '10px', fontSize: '0.83rem' }}>
                            {errorMsg}
                        </Alert>
                    )}

                    {/* Connect / Try Again button */}
                    {!isPolling && !isOtp && (
                        <Button
                            fullWidth variant="contained" size="large"
                            startIcon={<LinkRoundedIcon />}
                            onClick={handleConnect}
                            sx={btnSx}
                        >
                            {isError ? 'Try Again' : 'Connect'}
                        </Button>
                    )}


                </Stack>
            </Paper>
        </Box>
    );
};

export default ExecutionPage;
