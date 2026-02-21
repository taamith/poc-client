import { useState } from 'react';
import {
    AppBar, Toolbar, Typography, Box, Avatar, Menu, MenuItem,
    Divider, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Stack, InputAdornment, IconButton, Tooltip, Chip,
} from '@mui/material';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { issueStore } from '../store/issueStore';
import { sessionStore } from '../store/sessionStore';
import { integrationStore } from '../store/integrationStore';

interface Profile { name: string; employeeId: string; email: string; phone: string; }
interface PwdForm { current: string; next: string; confirm: string; }

const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        '&:hover fieldset': { borderColor: '#1877F2' },
        '&.Mui-focused fieldset': { borderColor: '#1877F2' },
    },
    '& label.Mui-focused': { color: '#1877F2' },
};

const Header = observer(() => {
    const navigate = useNavigate();

    const profile: Profile = {
        name: sessionStore.user?.name || 'User',
        employeeId: sessionStore.user?.employeeId || '',
        email: sessionStore.user?.email || '',
        phone: sessionStore.user?.phone || '',
    };
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

    const [editOpen, setEditOpen] = useState(false);
    const [editForm, setEditForm] = useState<Profile>(profile);
    const [editErrors, setEditErrors] = useState<Partial<Profile>>({});

    const [pwdOpen, setPwdOpen] = useState(false);
    const [pwdForm, setPwdForm] = useState<PwdForm>({ current: '', next: '', confirm: '' });
    const [pwdErrors, setPwdErrors] = useState<Partial<PwdForm>>({});
    const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false });

    const initials = profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    const handleOpenEdit = () => {
        setEditForm(profile);
        setEditErrors({});
        setEditOpen(true);
        setMenuAnchor(null);
    };

    const handleSaveProfile = () => {
        const e: Partial<Profile> = {};
        if (!editForm.name.trim()) e.name = 'Name is required';
        if (editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) e.email = 'Enter a valid email';
        if (Object.keys(e).length > 0) { setEditErrors(e); return; }
        sessionStore.updateUser({ name: editForm.name, email: editForm.email, phone: editForm.phone });
        setEditOpen(false);
    };

    const handleOpenPwd = () => {
        setPwdForm({ current: '', next: '', confirm: '' });
        setPwdErrors({});
        setPwdOpen(true);
        setMenuAnchor(null);
    };

    const handleSavePwd = () => {
        const e: Partial<PwdForm> = {};
        if (!pwdForm.current) e.current = 'Current password is required';
        if (!pwdForm.next) { e.next = 'New password is required'; }
        else if (!passwordRegex.test(pwdForm.next)) { e.next = 'Min 8 chars with uppercase, lowercase, number & special character'; }
        if (!pwdForm.confirm) { e.confirm = 'Please confirm your password'; }
        else if (pwdForm.next !== pwdForm.confirm) { e.confirm = 'Passwords do not match'; }
        if (Object.keys(e).length > 0) { setPwdErrors(e); return; }
        setPwdOpen(false);
    };

    const handleSignOut = () => {
        setMenuAnchor(null);
        sessionStore.signOut();
        integrationStore.clearConnection();
        issueStore.clearSelectedIssue();
        navigate('/login', { replace: true });
    };

    return (
        <>
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    bgcolor: '#FFFFFF',
                    borderBottom: '1px solid #EBECF0',
                    color: '#172B4D',
                    zIndex: 100,
                }}
            >
                <Toolbar sx={{ minHeight: 60, px: { xs: 2, md: 3 }, gap: 1 }}>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* ── Notification bell ── */}
                    <Tooltip title="Notifications" arrow>
                        <IconButton
                            size="small"
                            sx={{
                                color: '#6B778C', border: '1px solid #EBECF0',
                                borderRadius: '9px', p: '7px',
                                '&:hover': { bgcolor: '#F4F5F7', color: '#172B4D' },
                            }}
                        >
                            <NotificationsNoneIcon sx={{ fontSize: 19 }} />
                        </IconButton>
                    </Tooltip>

                    {/* ── Vertical divider ── */}
                    <Box sx={{ width: '1px', height: 24, bgcolor: '#EBECF0', mx: 0.5 }} />

                    {/* ── Profile button ── */}
                    <Box
                        onClick={(e) => setMenuAnchor(e.currentTarget)}
                        sx={{
                            display: 'flex', alignItems: 'center', gap: 1,
                            cursor: 'pointer', borderRadius: '10px',
                            px: 1.2, py: 0.6,
                            border: '1px solid transparent',
                            transition: 'all 0.15s',
                            '&:hover': { bgcolor: '#F4F5F7', borderColor: '#EBECF0' },
                        }}
                    >
                        <Avatar sx={{
                            width: 32, height: 32,
                            background: 'linear-gradient(135deg, #1877F2, #3D90F5)',
                            fontSize: 12, fontWeight: 800,
                            boxShadow: '0 1px 4px rgba(24,119,242,0.3)',
                        }}>
                            {initials}
                        </Avatar>
                        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                            <Typography sx={{ fontWeight: 700, color: '#172B4D', fontSize: '0.82rem', lineHeight: 1.2 }}>
                                {profile.name}
                            </Typography>
                            {profile.email
                                ? <Typography sx={{ color: '#97A0AF', fontSize: '0.68rem', lineHeight: 1 }}>{profile.email}</Typography>
                                : <Typography sx={{ color: '#97A0AF', fontSize: '0.68rem', lineHeight: 1 }}>View profile</Typography>
                            }
                        </Box>
                        <KeyboardArrowDownIcon sx={{ fontSize: 16, color: '#97A0AF' }} />
                    </Box>
                </Toolbar>
            </AppBar>

            {/* ── Profile dropdown ── */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: '14px', minWidth: 230, mt: 0.8,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                            border: '1px solid #EBECF0',
                            overflow: 'hidden',
                        },
                    },
                }}
            >
                {/* Profile card */}
                <Box sx={{
                    px: 2.5, py: 2,
                    background: 'linear-gradient(135deg, #f8f4ff 0%, #fdf0ff 100%)',
                    borderBottom: '1px solid #EBECF0',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Avatar sx={{
                            width: 40, height: 40,
                            background: 'linear-gradient(135deg, #0D65D9, #3D90F5)',
                            fontSize: 14, fontWeight: 800,
                            boxShadow: '0 2px 8px rgba(24,119,242,0.3)',
                        }}>
                            {initials}
                        </Avatar>
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#172B4D', lineHeight: 1.2 }}>
                                {profile.name}
                            </Typography>
                            {profile.email && (
                                <Typography sx={{ fontSize: '0.72rem', color: '#6B778C', lineHeight: 1.4 }}>
                                    {profile.email}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    {profile.employeeId && (
                        <Chip
                            label={`ID: ${profile.employeeId}`}
                            size="small"
                            sx={{ bgcolor: 'rgba(24,119,242,0.08)', color: '#1877F2', fontWeight: 600, fontSize: 10, height: 20, borderRadius: '6px' }}
                        />
                    )}
                </Box>

                {/* Menu items */}
                <Box sx={{ py: 0.75 }}>
                    <MenuItem onClick={handleOpenEdit}
                        sx={{ mx: 0.75, borderRadius: '8px', gap: 1.5, fontSize: 13, py: 1, color: '#172B4D', '&:hover': { bgcolor: '#F4F5F7' } }}>
                        <Box sx={{ width: 28, height: 28, borderRadius: '7px', bgcolor: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <PersonOutlineIcon sx={{ fontSize: 16, color: '#1877F2' }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: '0.83rem', fontWeight: 600 }}>Edit Profile</Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#97A0AF' }}>Update your details</Typography>
                        </Box>
                    </MenuItem>

                    <MenuItem onClick={handleOpenPwd}
                        sx={{ mx: 0.75, borderRadius: '8px', gap: 1.5, fontSize: 13, py: 1, color: '#172B4D', '&:hover': { bgcolor: '#F4F5F7' } }}>
                        <Box sx={{ width: 28, height: 28, borderRadius: '7px', bgcolor: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <LockOutlinedIcon sx={{ fontSize: 16, color: '#1877F2' }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: '0.83rem', fontWeight: 600 }}>Change Password</Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#97A0AF' }}>Update your credentials</Typography>
                        </Box>
                    </MenuItem>
                </Box>

                <Divider sx={{ mx: 1 }} />

                <Box sx={{ py: 0.75 }}>
                    <MenuItem onClick={handleSignOut}
                        sx={{ mx: 0.75, borderRadius: '8px', gap: 1.5, fontSize: 13, py: 1, '&:hover': { bgcolor: '#FFF4F0' } }}>
                        <Box sx={{ width: 28, height: 28, borderRadius: '7px', bgcolor: '#FFF4F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <LogoutIcon sx={{ fontSize: 16, color: '#DE350B' }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: '0.83rem', fontWeight: 600, color: '#DE350B' }}>Sign Out</Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#97A0AF' }}>End your session</Typography>
                        </Box>
                    </MenuItem>
                </Box>
            </Menu>

            {/* ── Edit Profile dialog ── */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth
                slotProps={{ paper: { sx: { borderRadius: '18px' } } }}>
                <DialogTitle sx={{ fontWeight: 800, color: '#172B4D', fontSize: '1.05rem', pb: 0.5 }}>
                    Edit Profile
                </DialogTitle>
                <Typography sx={{ px: 3, fontSize: '0.8rem', color: '#6B778C', mb: 1 }}>
                    Update your personal information
                </Typography>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 0.5 }}>
                        {([
                            { key: 'name', label: 'Full Name', icon: <PersonOutlineIcon sx={{ color: '#A5ADBA', fontSize: 18 }} /> },
                            { key: 'email', label: 'Email Address', type: 'email', icon: <EmailOutlinedIcon sx={{ color: '#A5ADBA', fontSize: 18 }} /> },
                            { key: 'phone', label: 'Phone Number', type: 'tel', icon: <PhoneOutlinedIcon sx={{ color: '#A5ADBA', fontSize: 18 }} /> },
                        ] as { key: keyof Profile; label: string; type?: string; icon: React.ReactNode }[]).map(({ key, label, type, icon }) => (
                            <TextField
                                key={key} fullWidth size="small" label={label} type={type || 'text'}
                                value={editForm[key]}
                                onChange={e => { setEditForm(p => ({ ...p, [key]: e.target.value })); setEditErrors(p => ({ ...p, [key]: undefined })); }}
                                error={!!editErrors[key]} helperText={editErrors[key]}
                                slotProps={{ input: { startAdornment: <InputAdornment position="start">{icon}</InputAdornment> } }}
                                sx={fieldSx}
                            />
                        ))}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                    <Button onClick={() => setEditOpen(false)}
                        sx={{ textTransform: 'none', color: '#6B778C', borderRadius: '8px', fontWeight: 600 }}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleSaveProfile}
                        sx={{
                            textTransform: 'none', borderRadius: '8px', fontWeight: 700,
                            background: 'linear-gradient(135deg, #0D65D9 0%, #1877F2 55%, #3D90F5 100%)',
                            boxShadow: '0 3px 10px rgba(24,119,242,0.3)',
                            '&:hover': { boxShadow: '0 4px 14px rgba(24,119,242,0.4)' },
                        }}>
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Change Password dialog ── */}
            <Dialog open={pwdOpen} onClose={() => setPwdOpen(false)} maxWidth="xs" fullWidth
                slotProps={{ paper: { sx: { borderRadius: '18px' } } }}>
                <DialogTitle sx={{ fontWeight: 800, color: '#172B4D', fontSize: '1.05rem', pb: 0.5 }}>
                    Change Password
                </DialogTitle>
                <Typography sx={{ px: 3, fontSize: '0.8rem', color: '#6B778C', mb: 1 }}>
                    Choose a strong password to keep your account secure
                </Typography>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 0.5 }}>
                        {([
                            { key: 'current', label: 'Current Password' },
                            { key: 'next', label: 'New Password' },
                            { key: 'confirm', label: 'Confirm New Password' },
                        ] as { key: keyof PwdForm; label: string }[]).map(({ key, label }) => (
                            <TextField
                                key={key} fullWidth size="small" label={label}
                                type={showPwd[key] ? 'text' : 'password'}
                                value={pwdForm[key]}
                                onChange={e => { setPwdForm(p => ({ ...p, [key]: e.target.value })); setPwdErrors(p => ({ ...p, [key]: undefined })); }}
                                error={!!pwdErrors[key]} helperText={pwdErrors[key]}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: '#A5ADBA', fontSize: 18 }} /></InputAdornment>,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton size="small" onClick={() => setShowPwd(p => ({ ...p, [key]: !p[key] }))} edge="end">
                                                    {showPwd[key] ? <VisibilityOff sx={{ fontSize: 17 }} /> : <Visibility sx={{ fontSize: 17 }} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                                sx={fieldSx}
                            />
                        ))}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                    <Button onClick={() => setPwdOpen(false)}
                        sx={{ textTransform: 'none', color: '#6B778C', borderRadius: '8px', fontWeight: 600 }}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleSavePwd}
                        sx={{
                            textTransform: 'none', borderRadius: '8px', fontWeight: 700,
                            background: 'linear-gradient(135deg, #0D65D9 0%, #1877F2 55%, #3D90F5 100%)',
                            boxShadow: '0 3px 10px rgba(24,119,242,0.3)',
                            '&:hover': { boxShadow: '0 4px 14px rgba(24,119,242,0.4)' },
                        }}>
                        Update Password
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
});

export default Header;
