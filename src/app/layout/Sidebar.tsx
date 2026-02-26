import { useState } from 'react';
import { Box, Typography, Tooltip, Collapse } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

interface NavChild { label: string; path: string; }
interface NavItem {
    label: string;
    path: string;
    icon: React.ElementType;
    badge?: string;
    children?: NavChild[];
}

const NAV_MAIN: NavItem[] = [
    { label: 'Home',       path: '/home',       icon: HomeRoundedIcon },
    { label: 'Test Plans', path: '/test-plans',  icon: AssignmentRoundedIcon },
    { label: 'Repository', path: '/repository',  icon: FolderRoundedIcon },
    { label: 'Execution',  path: '/execution',   icon: PlayCircleRoundedIcon },
    { label: 'Reports',    path: '/reports',     icon: BarChartRoundedIcon },
];

const NAV_BOTTOM: NavItem[] = [
    {
        label: 'Settings', path: '/settings', icon: SettingsRoundedIcon,
        children: [
            { label: 'General',      path: '/settings/general' },
            { label: 'Integrations', path: '/settings/integrations' },
        ],
    },
    { label: 'Help', path: '/help', icon: HelpOutlineRoundedIcon },
];

const COLLAPSED = 60;
const EXPANDED  = 224;

const Sidebar = () => {
    const navigate  = useNavigate();
    const location  = useLocation();
    const [open, setOpen]       = useState(false);
    const [expanded, setExpanded] = useState<Set<string>>(new Set(['Settings']));

    const isActive = (item: NavItem) =>
        location.pathname === item.path ||
        item.children?.some(c => location.pathname === c.path) ||
        location.pathname.startsWith(item.path + '/');

    const toggle = (label: string) =>
        setExpanded(prev => {
            const next = new Set(prev);
            next.has(label) ? next.delete(label) : next.add(label);
            return next;
        });

    const handleClick = (item: NavItem) => {
        if (item.children) {
            if (open) toggle(item.label);
            else navigate(item.children[0].path);
        } else {
            navigate(item.path);
        }
    };

    const NavRow = ({ item }: { item: NavItem }) => {
        const active   = isActive(item);
        const isOpen   = expanded.has(item.label);
        const Icon     = item.icon;

        return (
            <Box sx={{ mb: 0.5 }}>
                <Tooltip title={!open ? item.label : ''} placement="right" arrow>
                    <Box
                        onClick={() => handleClick(item)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            px: open ? 1.5 : 0,
                            height: 42,
                            borderRadius: '10px',
                            cursor: 'pointer',
                            justifyContent: open ? 'flex-start' : 'center',
                            position: 'relative',
                            bgcolor: active ? 'rgba(24,119,242,0.09)' : 'transparent',
                            transition: 'background 0.15s',
                            '&:hover': {
                                bgcolor: active ? 'rgba(24,119,242,0.13)' : 'rgba(0,0,0,0.04)',
                            },
                            // active left bar
                            '&::before': active ? {
                                content: '""',
                                position: 'absolute',
                                left: -8,
                                top: '20%', height: '60%',
                                width: 3,
                                borderRadius: '0 3px 3px 0',
                                bgcolor: '#1877F2',
                            } : {},
                        }}
                    >
                        {/* Icon container */}
                        <Box sx={{
                            width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            bgcolor: active
                                ? 'linear-gradient(135deg,#0D65D9,#1877F2)'
                                : 'transparent',
                            background: active
                                ? 'linear-gradient(135deg, #0D65D9 0%, #1877F2 60%, #3D90F5 100%)'
                                : 'transparent',
                            boxShadow: active ? '0 2px 8px rgba(24,119,242,0.28)' : 'none',
                            transition: 'all 0.15s',
                        }}>
                            <Icon sx={{ fontSize: 19, color: active ? '#fff' : '#6B778C' }} />
                        </Box>

                        {open && (
                            <>
                                <Typography sx={{
                                    fontSize: '0.83rem',
                                    fontWeight: active ? 700 : 500,
                                    color: active ? '#1877F2' : '#172B4D',
                                    whiteSpace: 'nowrap',
                                    flex: 1,
                                    letterSpacing: '-0.01em',
                                }}>
                                    {item.label}
                                </Typography>

                                {item.badge && (
                                    <Box sx={{
                                        px: 0.8, py: 0.1, borderRadius: '6px',
                                        bgcolor: '#1877F2', color: '#fff',
                                        fontSize: '0.62rem', fontWeight: 700,
                                    }}>
                                        {item.badge}
                                    </Box>
                                )}

                                {item.children && (
                                    isOpen
                                        ? <ExpandLessIcon sx={{ fontSize: 15, color: '#97A0AF' }} />
                                        : <ExpandMoreIcon sx={{ fontSize: 15, color: '#97A0AF' }} />
                                )}
                            </>
                        )}
                    </Box>
                </Tooltip>

                {/* Children */}
                {item.children && open && (
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <Box sx={{ ml: 2.5, mt: 0.5, pl: 1.5, borderLeft: '1px solid #EBECF0' }}>
                            {item.children.map((child) => {
                                const childActive = location.pathname === child.path;
                                return (
                                    <Box
                                        key={child.path}
                                        onClick={() => navigate(child.path)}
                                        sx={{
                                            display: 'flex', alignItems: 'center', gap: 1,
                                            px: 1, height: 34, borderRadius: '8px',
                                            cursor: 'pointer', mb: 0.25,
                                            bgcolor: childActive ? 'rgba(24,119,242,0.08)' : 'transparent',
                                            '&:hover': { bgcolor: childActive ? 'rgba(24,119,242,0.12)' : 'rgba(0,0,0,0.04)' },
                                        }}
                                    >
                                        <Box sx={{
                                            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                                            bgcolor: childActive ? '#1877F2' : '#C1C7D0',
                                        }} />
                                        <Typography sx={{
                                            fontSize: '0.78rem',
                                            fontWeight: childActive ? 700 : 500,
                                            color: childActive ? '#1877F2' : '#42526E',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {child.label}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Collapse>
                )}
            </Box>
        );
    };

    return (
        <Box sx={{ width: COLLAPSED, flexShrink: 0, position: 'relative' }}>
            <Box
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                sx={{
                    position: 'absolute', top: 0, left: 0,
                    height: '100%',
                    width: open ? EXPANDED : COLLAPSED,
                    bgcolor: '#FAFBFC',
                    borderRight: '1px solid #EBECF0',
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden',
                    transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), box-shadow 0.22s',
                    zIndex: open ? 200 : 1,
                    boxShadow: open ? '4px 0 24px rgba(0,0,0,0.08)' : 'none',
                }}
            >
                {/* ── Logo row — same 60px height as Header ── */}
                <Box sx={{
                    height: 60, flexShrink: 0,
                    display: 'flex', alignItems: 'center',
                    justifyContent: open ? 'flex-start' : 'center',
                    px: open ? 2 : 0,
                    borderBottom: '1px solid #EBECF0',
                    gap: 1.2,
                    cursor: 'pointer',
                    userSelect: 'none',
                }} onClick={() => window.location.reload()}>
                    <Box sx={{
                        width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                        background: 'linear-gradient(135deg, #0D65D9 0%, #1877F2 55%, #3D90F5 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(24,119,242,0.35)',
                    }}>
                        <RocketLaunchIcon sx={{ color: '#fff', fontSize: 17 }} />
                    </Box>
                    {open && (
                        <Box>
                            <Typography sx={{
                                fontWeight: 800, fontSize: '0.95rem', lineHeight: 1,
                                letterSpacing: '-0.02em',
                                background: 'linear-gradient(135deg, #0D65D9 0%, #1877F2 60%, #3D90F5 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                whiteSpace: 'nowrap',
                            }}>
                                AutoSprint AI
                            </Typography>
                            <Typography sx={{ fontSize: '0.62rem', color: '#97A0AF', lineHeight: 1.4, letterSpacing: '0.02em' }}>
                                AI Test Automation
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* ── Nav items ── */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', pt: 1.5, pb: '52px', px: open ? 1 : 0.75, overflow: 'hidden' }}>
                {/* Main nav */}
                <Box sx={{ flex: 1 }}>
                    {open && (
                        <Typography sx={{
                            fontSize: '0.62rem', fontWeight: 700, color: '#97A0AF',
                            letterSpacing: '0.08em', textTransform: 'uppercase',
                            px: 1.5, mb: 1,
                        }}>
                            Menu
                        </Typography>
                    )}
                    {NAV_MAIN.map(item => <NavRow key={item.path} item={item} />)}
                </Box>

                {/* Divider */}
                <Box sx={{ mx: 1, my: 1.5, borderTop: '1px solid #EBECF0' }} />

                {/* Bottom nav */}
                <Box>
                    {open && (
                        <Typography sx={{
                            fontSize: '0.62rem', fontWeight: 700, color: '#97A0AF',
                            letterSpacing: '0.08em', textTransform: 'uppercase',
                            px: 1.5, mb: 1,
                        }}>
                            Support
                        </Typography>
                    )}
                    {NAV_BOTTOM.map(item => <NavRow key={item.path} item={item} />)}
                </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Sidebar;
