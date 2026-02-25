import React from 'react';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { weeklyGeneration } from '../data/dashboardData';

const TestPlanGenerationChart: React.FC = () => {
    const maxValue = Math.max(...weeklyGeneration.map((d) => d.value), 1);
    const total = weeklyGeneration.reduce((sum, item) => sum + item.value, 0);

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: '16px',
                border: '1px solid #EBECF0',
                overflow: 'hidden',
            }}
        >
            <Box sx={{ px: { xs: 2, md: 2.5 }, py: 1.75, borderBottom: '1px solid #EBECF0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#172B4D', letterSpacing: '-0.02em' }}>
                    Test Plan Generation - Last 7 Days
                </Typography>
                <Chip
                    label="This Sprint"
                    size="small"
                    sx={{
                        height: 24,
                        bgcolor: '#EAF2FF',
                        color: '#1877F2',
                        border: '1px solid rgba(24,119,242,0.15)',
                        fontWeight: 700,
                    }}
                />
            </Box>

            <Box sx={{ px: { xs: 2, md: 2.5 }, py: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.1 }}>
                    {weeklyGeneration.map((item) => (
                        <Box key={item.day} sx={{ display: 'grid', gridTemplateColumns: '52px 1fr 34px', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontSize: '0.72rem', color: '#6B778C', fontWeight: 600 }}>
                                {item.day}
                            </Typography>
                            <Box sx={{ height: 10, borderRadius: '999px', bgcolor: '#EEF1F5', overflow: 'hidden', position: 'relative' }}>
                                <Box
                                    sx={{
                                        width: `${(item.value / maxValue) * 100}%`,
                                        height: '100%',
                                        bgcolor: item.color,
                                        borderRadius: '999px',
                                    }}
                                />
                            </Box>
                            <Typography sx={{ fontSize: '0.72rem', color: '#42526E', fontWeight: 700, textAlign: 'right' }}>
                                {item.value}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#1877F2' }} />
                            <Typography sx={{ fontSize: '0.8rem', color: '#5E6C84' }}>Generated</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#36B37E' }} />
                            <Typography sx={{ fontSize: '0.8rem', color: '#5E6C84' }}>Peak Day (Wed)</Typography>
                        </Box>
                    </Stack>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: '#091E42' }}>
                        Total: {total} plans
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );
};

export default TestPlanGenerationChart;
