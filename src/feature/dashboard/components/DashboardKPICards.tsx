import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';

const kpiCards = [
    {
        title: 'Test Plans Generated',
        value: '142',
        note: '↑ 18% vs last sprint',
        valueColor: '#1877F2',
        noteColor: '#0B875B',
        topBorder: '#1877F2',
        icon: <DescriptionOutlinedIcon sx={{ fontSize: 20 }} />,
    },
    {
        title: 'Issues Processed',
        value: '89',
        note: '↑ 12% vs last sprint',
        valueColor: '#22B55B',
        noteColor: '#0B875B',
        topBorder: '#22B55B',
        icon: <TaskAltOutlinedIcon sx={{ fontSize: 20 }} />,
    },
    {
        title: 'Pending Review',
        value: '23',
        note: '↑ 4 since yesterday',
        valueColor: '#F08C00',
        noteColor: '#DE350B',
        topBorder: '#F08C00',
        icon: <HourglassEmptyOutlinedIcon sx={{ fontSize: 20 }} />,
    },
    {
        title: 'Docs Uploaded',
        value: '17',
        note: 'Max 20 files · 3 remaining',
        valueColor: '#1877F2',
        noteColor: '#5E6C84',
        topBorder: '#1877F2',
        icon: <UploadFileOutlinedIcon sx={{ fontSize: 20 }} />,
    },
];

const DashboardKPICards: React.FC = () => (
    <Box
        sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', xl: 'repeat(4, 1fr)' },
            gap: 2,
        }}
    >
        {kpiCards.map((card) => (
            <Paper
                key={card.title}
                elevation={0}
                sx={{
                    p: 2.25,
                    borderRadius: '14px',
                    border: '1px solid #DDE3EA',
                    boxShadow: '0 1px 2px rgba(9,30,66,0.06), 0 6px 16px rgba(9,30,66,0.04)',
                    position: 'relative',
                    overflow: 'hidden',
                    bgcolor: '#fff',
                }}
            >
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, bgcolor: card.topBorder }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            sx={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                color: '#5E6C84',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                mb: 1.2,
                            }}
                        >
                            {card.title}
                        </Typography>
                        <Typography sx={{ fontSize: '2rem', lineHeight: 1, fontWeight: 800, color: card.valueColor, mb: 0.8 }}>
                            {card.value}
                        </Typography>
                        <Typography sx={{ fontSize: '0.76rem', color: card.noteColor, fontWeight: 500 }}>
                            {card.note}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            width: 34,
                            height: 34,
                            borderRadius: '10px',
                            bgcolor: '#F4F6F8',
                            color: '#C1C7D0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            opacity: 0.9,
                        }}
                    >
                        {card.icon}
                    </Box>
                </Box>
            </Paper>
        ))}
    </Box>
);

export default DashboardKPICards;
