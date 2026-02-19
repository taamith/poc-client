import { Breadcrumbs, Typography, Link, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';

const routeLabels: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/test-plans': 'Test Plans',
    '/reports': 'Reports',
    '/settings': 'Settings',
    '/help': 'Help & Support',
};

const AppBreadcrumbs = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentLabel = routeLabels[location.pathname];

    if (!currentLabel) return null;

    return (
        <Box
            sx={{
                px: { xs: 2, md: 4 },
                pt: 2,
                pb: 0.5,
            }}
        >
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" sx={{ color: '#C1C7D0' }} />}
                aria-label="breadcrumb"
            >
                <Link
                    underline="hover"
                    onClick={() => navigate('/dashboard')}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        cursor: 'pointer',
                        color: '#6B778C',
                        fontSize: 13,
                        fontWeight: 500,
                        '&:hover': { color: '#5a1196' },
                    }}
                >
                    <HomeIcon sx={{ fontSize: 15 }} />
                    Home
                </Link>
                <Typography
                    sx={{
                        color: '#172B4D',
                        fontSize: 13,
                        fontWeight: 600,
                    }}
                >
                    {currentLabel}
                </Typography>
            </Breadcrumbs>
        </Box>
    );
};

export default AppBreadcrumbs;
