import React from 'react';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { qaStatus } from '../data/dashboardData';

const QAReviewStatus: React.FC = () => {
    const qaTotal = qaStatus.approved + qaStatus.pending;
    const approvedPct = qaTotal > 0 ? (qaStatus.approved / qaTotal) * 100 : 0;
    const donutRadius = 46;
    const donutStroke = 12;
    const donutCircumference = 2 * Math.PI * donutRadius;
    const approvedArc = (approvedPct / 100) * donutCircumference;
    const pendingArc = donutCircumference - approvedArc;

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2, md: 2.25 },
                borderRadius: '16px',
                border: '1px solid #EBECF0',
                minHeight: 260,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#172B4D', letterSpacing: '-0.02em' }}>
                    QA Review Status
                </Typography>
                <Chip
                    size="small"
                    label={`${qaTotal} total`}
                    sx={{
                        height: 22,
                        bgcolor: '#F4F5F7',
                        border: '1px solid #EBECF0',
                        color: '#42526E',
                        fontWeight: 700,
                        fontSize: '0.66rem',
                    }}
                />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 1.5, alignItems: 'center', minHeight: 190 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ position: 'relative', width: 120, height: 120 }}>
                        <svg width="120" height="120" viewBox="0 0 120 120" role="img" aria-label="QA approved and pending pie chart">
                            <g transform="translate(60 60) rotate(-90)">
                                <circle r={donutRadius} cx="0" cy="0" fill="none" stroke="#EEF1F5" strokeWidth={donutStroke} />
                                <circle
                                    r={donutRadius}
                                    cx="0"
                                    cy="0"
                                    fill="none"
                                    stroke="#36B37E"
                                    strokeWidth={donutStroke}
                                    strokeLinecap="round"
                                    strokeDasharray={`${approvedArc} ${pendingArc}`}
                                />
                                <circle
                                    r={donutRadius}
                                    cx="0"
                                    cy="0"
                                    fill="none"
                                    stroke="#1877F2"
                                    strokeWidth={donutStroke}
                                    strokeLinecap="butt"
                                    strokeDasharray={`${pendingArc} ${approvedArc}`}
                                    strokeDashoffset={-approvedArc}
                                />
                            </g>
                        </svg>
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                            }}
                        >
                            <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#172B4D', lineHeight: 1 }}>
                                {qaTotal}
                            </Typography>
                            <Typography sx={{ fontSize: '0.65rem', color: '#97A0AF', mt: 0.35, fontWeight: 600 }}>
                                Reviews
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Stack spacing={1.1}>
                    <Box sx={{ p: 1.1, borderRadius: '10px', border: '1px solid #E3FCEF', bgcolor: '#F3FFF8' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                                <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: '#36B37E' }} />
                                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#172B4D' }}>
                                    QA Approved
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#006644' }}>
                                {qaStatus.approved}
                            </Typography>
                        </Box>
                        <Typography sx={{ mt: 0.4, fontSize: '0.7rem', color: '#5E6C84' }}>
                            {Math.round((qaStatus.approved / Math.max(qaTotal, 1)) * 100)}% of reviewed plans
                        </Typography>
                    </Box>

                    <Box sx={{ p: 1.1, borderRadius: '10px', border: '1px solid #BDDAFF', bgcolor: '#EAF2FF' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                                <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: '#1877F2' }} />
                                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#172B4D' }}>
                                    Pending
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0D52C4' }}>
                                {qaStatus.pending}
                            </Typography>
                        </Box>
                        <Typography sx={{ mt: 0.4, fontSize: '0.7rem', color: '#5E6C84' }}>
                            {Math.round((qaStatus.pending / Math.max(qaTotal, 1)) * 100)}% awaiting QA review
                        </Typography>
                    </Box>
                </Stack>
            </Box>
        </Paper>
    );
};

export default QAReviewStatus;
