import React from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

const actions = [
    'Generate test plan from selected stories',
    'Upload reference documents',
    'Publish latest approved plan',
];

const QuickActions: React.FC = () => (
    <Paper
        elevation={0}
        sx={{
            p: 2.25,
            borderRadius: '16px',
            border: '1px solid #EBECF0',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FBFCFE 100%)',
            minHeight: 235,
            display: 'flex',
            flexDirection: 'column',
        }}
    >
        <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#172B4D', mb: 1.25 }}>
            Quick Actions
        </Typography>
        <Stack spacing={1} sx={{ flex: 1, justifyContent: 'center' }}>
            {actions.map((action) => (
                <Button
                    key={action}
                    variant="outlined"
                    fullWidth
                    sx={{
                        justifyContent: 'space-between',
                        textTransform: 'none',
                        borderRadius: '10px',
                        borderColor: '#EBECF0',
                        color: '#172B4D',
                        fontWeight: 600,
                        py: 1,
                        '&:hover': { borderColor: '#1877F2', bgcolor: 'rgba(24,119,242,0.03)' },
                    }}
                    endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
                >
                    {action}
                </Button>
            ))}
        </Stack>
    </Paper>
);

export default QuickActions;
