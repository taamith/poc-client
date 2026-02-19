import { useState } from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FolderIcon from '@mui/icons-material/Folder';

const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
    { label: 'Test Plans', path: '/test-plans', icon: AssignmentIcon },
    { label: 'Repository', path: '/repository', icon: FolderIcon },
    { label: 'Reports', path: '/reports', icon: BarChartIcon },
    { label: 'Settings', path: '/settings', icon: SettingsIcon },
    { label: 'Help', path: '/help', icon: HelpOutlineIcon },
];

const SIDEBAR_WIDTH = 220;
const SIDEBAR_COLLAPSED_WIDTH = 60;

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [hovered, setHovered] = useState(false);

    return (
        // Wrapper: always reserves icon-only width in the layout
        <Box sx={{ width: SIDEBAR_COLLAPSED_WIDTH, flexShrink: 0, position: 'relative' }}>
            {/* Panel: expands over content on hover */}
            <Box
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: hovered ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
                    borderRight: '1px solid #DFE1E6',
                    bgcolor: '#FFFFFF',
                    transition: 'width 0.2s ease, box-shadow 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    zIndex: hovered ? 200 : 1,
                    boxShadow: hovered ? '4px 0 16px rgba(0,0,0,0.1)' : 'none',
                }}
            >
                <List sx={{ pt: 1.5, flex: 1, px: 0.5 }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Tooltip key={item.path} title={!hovered ? item.label : ''} placement="right" arrow>
                                <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
                                    <ListItemButton
                                        onClick={() => navigate(item.path)}
                                        sx={{
                                            minHeight: 44,
                                            justifyContent: hovered ? 'initial' : 'center',
                                            px: hovered ? 1.5 : 1,
                                            borderRadius: '8px',
                                            bgcolor: isActive ? 'rgba(90, 17, 150, 0.08)' : 'transparent',
                                            '&:hover': {
                                                bgcolor: isActive ? 'rgba(90, 17, 150, 0.12)' : '#EBECF0',
                                            },
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                minWidth: 0,
                                                mr: hovered ? 1.5 : 0,
                                                justifyContent: 'center',
                                                color: isActive ? '#5a1196' : '#6B778C',
                                                transition: 'margin 0.2s ease',
                                            }}
                                        >
                                            <Icon sx={{ fontSize: 20 }} />
                                        </ListItemIcon>
                                        {hovered && (
                                            <ListItemText
                                                primary={item.label}
                                                primaryTypographyProps={{
                                                    fontSize: 13,
                                                    fontWeight: isActive ? 700 : 500,
                                                    color: isActive ? '#5a1196' : '#172B4D',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            />
                                        )}
                                    </ListItemButton>
                                </ListItem>
                            </Tooltip>
                        );
                    })}
                </List>
            </Box>
        </Box>
    );
};

export default Sidebar;
