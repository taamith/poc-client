import React from 'react';
import { Box, Chip, Link, Paper, Typography } from '@mui/material';
import { executionResults } from '../data/dashboardData';

const ExecutionResultsTable: React.FC = () => (
    <Paper
        elevation={0}
        sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: '16px',
            border: '1px solid #EBECF0',
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
                <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#172B4D', letterSpacing: '-0.02em' }}>
                    Execution Results
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#97A0AF', mt: 0.25 }}>
                    Latest 10 execution results
                </Typography>
            </Box>
            <Chip
                label={`${executionResults.length}`}
                size="small"
                sx={{
                    height: 24,
                    bgcolor: '#F4F5F7',
                    color: '#42526E',
                    border: '1px solid #EBECF0',
                    fontWeight: 700,
                }}
            />
        </Box>

        <Box sx={{ overflowX: 'auto', border: '1px solid #DDE3EA', borderRadius: '12px', overflowY: 'hidden', bgcolor: '#fff' }}>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(180px, 2fr) minmax(110px, 1fr) minmax(110px, 1fr) minmax(110px, 1fr)',
                    columnGap: 1,
                    px: 1.25,
                    py: 1,
                    bgcolor: '#F4F5F7',
                    borderBottom: '1px solid #DDE3EA',
                }}
            >
                {['Test Plan', 'Status', 'Time', 'Video'].map((col) => (
                    <Typography
                        key={col}
                        sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#6B778C', letterSpacing: '0.06em', textTransform: 'uppercase' }}
                    >
                        {col}
                    </Typography>
                ))}
            </Box>

            {executionResults.length === 0 ? (
                <Box sx={{ px: 1.25, py: 1.2 }}>
                    <Typography sx={{ fontSize: '0.78rem', color: '#172B4D', fontWeight: 500 }}>
                        No executions yet.
                    </Typography>
                </Box>
            ) : (
                executionResults.slice(0, 10).map((row, index) => (
                    <Box
                        key={`${row.testPlan}-${index}`}
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(180px, 2fr) minmax(110px, 1fr) minmax(110px, 1fr) minmax(110px, 1fr)',
                            columnGap: 1,
                            px: 1.25,
                            py: 1,
                            borderBottom: index < Math.min(executionResults.length, 10) - 1 ? '1px solid #F0F1F3' : 'none',
                        }}
                    >
                        <Typography sx={{ fontSize: '0.78rem', color: '#172B4D' }}>{row.testPlan}</Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: '#172B4D' }}>{row.status}</Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: '#172B4D' }}>{row.time}</Typography>
                        <Link
                            href={row.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                            sx={{ fontSize: '0.78rem', color: '#1877F2', fontWeight: 600, alignSelf: 'center' }}
                        >
                            {row.videoLabel}
                        </Link>
                    </Box>
                ))
            )}
        </Box>
    </Paper>
);

export default ExecutionResultsTable;
