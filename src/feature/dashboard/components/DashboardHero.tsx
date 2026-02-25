import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

const DashboardHero: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: '18px',
                border: '1px solid #E6EAF0',
                background: 'linear-gradient(135deg, #F7FBFF 0%, #EEF4FF 45%, #FFFFFF 100%)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <Box sx={{ position: 'absolute', top: -48, right: -48, width: 180, height: 180, borderRadius: '50%', bgcolor: 'rgba(24,119,242,0.08)' }} />
            <Box sx={{ position: 'absolute', bottom: -36, right: 60, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(54,179,126,0.08)' }} />

            <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                sx={{ position: 'relative', zIndex: 1, alignItems: { md: 'center' }, justifyContent: 'space-between' }}
            >
                <Box sx={{ maxWidth: 680 }}>
                    <Typography sx={{ fontSize: '0.76rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1877F2', mb: 1 }}>
                        Dashboard
                    </Typography>
                    <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.45rem' }, fontWeight: 800, color: '#172B4D', letterSpacing: '-0.03em', lineHeight: 1.2, mb: 1 }}>
                        Monitor recent executions and QA activity
                    </Typography>
                    <Typography sx={{ color: '#5E6C84', fontSize: '0.88rem', lineHeight: 1.7 }}>
                        Track the latest execution results, pending reviews, and uploads from one place.
                    </Typography>
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                    <Button
                        variant="contained"
                        startIcon={<AddRoundedIcon />}
                        onClick={() => navigate('/test-plans')}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            borderRadius: '10px',
                            px: 1.8,
                            background: 'linear-gradient(135deg, #0D65D9 0%, #1877F2 55%, #3D90F5 100%)',
                            '&:hover': { background: 'linear-gradient(135deg, #0A52C4 0%, #1468D8 55%, #2F84F0 100%)' },
                        }}
                    >
                        Start New Run
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            borderRadius: '10px',
                            borderColor: '#DCE3EC',
                            color: '#172B4D',
                            '&:hover': { borderColor: '#1877F2', color: '#1877F2', bgcolor: 'rgba(24,119,242,0.03)' },
                        }}
                    >
                        View History
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
};

export default DashboardHero;
