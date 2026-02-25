import React from 'react';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { recentItems } from '../data/dashboardData';

const RecentActivity: React.FC = () => (
    <Paper
        elevation={0}
        sx={{
            p: 2.25,
            borderRadius: '16px',
            border: '1px solid #EBECF0',
            minHeight: 305,
            display: 'flex',
            flexDirection: 'column',
        }}
    >
        <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#172B4D', mb: 1.25 }}>
            Recent Activity
        </Typography>
        <Stack spacing={1.25} sx={{ flex: 1, justifyContent: 'center' }}>
            {recentItems.map((item) => (
                <Box
                    key={item.label}
                    sx={{
                        p: 1.25,
                        borderRadius: '10px',
                        border: '1px solid #F0F1F3',
                        bgcolor: '#FAFBFC',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#172B4D' }}>
                            {item.label}
                        </Typography>
                        <Chip
                            label={item.tag}
                            size="small"
                            sx={{
                                height: 20,
                                bgcolor: '#EAF2FF',
                                color: '#1877F2',
                                fontWeight: 700,
                                fontSize: '0.62rem',
                            }}
                        />
                    </Box>
                    <Typography sx={{ mt: 0.5, fontSize: '0.72rem', color: '#97A0AF' }}>
                        {item.time}
                    </Typography>
                </Box>
            ))}
        </Stack>
    </Paper>
);

export default RecentActivity;
