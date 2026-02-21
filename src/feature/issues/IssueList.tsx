import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Typography, CircularProgress, Box, Checkbox, Button, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { issueStore } from '../../app/store/issueStore';
import { PLACEHOLDERS } from '../../lib/constants/messages';

const IssueList: React.FC = observer(() => {
    const [search, setSearch] = useState('');

    const filtered = issueStore.issues.filter(i =>
        i.summary.toLowerCase().includes(search.toLowerCase()) ||
        i.key.toLowerCase().includes(search.toLowerCase())
    );

    if (issueStore.loading && issueStore.issues.length === 0) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 2 }}>
                <CircularProgress size={28} sx={{ color: '#1877F2' }} />
                <Typography sx={{ fontSize: '0.82rem', color: '#97A0AF', fontWeight: 500 }}>Loading stories…</Typography>
            </Box>
        );
    }

    const allSelected = issueStore.issues.length > 0 && issueStore.selectedIssueKeys.size === issueStore.issues.length;
    const someSelected = issueStore.selectedIssueKeys.size > 0 && !allSelected;

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fff', borderRadius: '14px', border: '1px solid #EBECF0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

            {/* ── Header ── */}
            <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#172B4D', letterSpacing: '-0.02em' }}>
                            User Stories
                        </Typography>
                        {issueStore.issues.length > 0 && (
                            <Box sx={{ px: 1, py: 0.15, borderRadius: '20px', bgcolor: '#E8F0FE', color: '#1877F2', fontSize: '0.68rem', fontWeight: 700, lineHeight: 1.6 }}>
                                {issueStore.issues.length}
                            </Box>
                        )}
                    </Box>

                    {issueStore.issues.length > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Typography sx={{ fontSize: '0.7rem', color: '#97A0AF', fontWeight: 600 }}>All</Typography>
                            <Checkbox
                                size="small"
                                indeterminate={someSelected}
                                checked={allSelected}
                                onChange={() => {
                                    if (allSelected) issueStore.clearSelection();
                                    else issueStore.selectAllIssues();
                                }}
                                sx={{ p: 0.4, color: '#C1C7D0', '&.Mui-checked': { color: '#1877F2' }, '&.MuiCheckbox-indeterminate': { color: '#1877F2' } }}
                            />
                        </Box>
                    )}
                </Box>

                {/* ── Search ── */}
                <TextField
                    fullWidth size="small" placeholder="Search stories…"
                    value={search} onChange={e => setSearch(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 16, color: '#A5ADBA' }} />
                                </InputAdornment>
                            ),
                        },
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '9px', bgcolor: '#F4F5F7', fontSize: '0.82rem',
                            '& fieldset': { borderColor: 'transparent' },
                            '&:hover fieldset': { borderColor: '#DFE1E6' },
                            '&.Mui-focused': { bgcolor: '#fff' },
                            '&.Mui-focused fieldset': { borderColor: '#1877F2' },
                        },
                    }}
                />
            </Box>

            {/* ── Divider ── */}
            <Box sx={{ height: '1px', bgcolor: '#F4F5F7', flexShrink: 0 }} />

            {/* ── List ── */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
                {filtered.length === 0 && !issueStore.loading && (
                    <Box sx={{ py: 8, textAlign: 'center', px: 3 }}>
                        <AssignmentOutlinedIcon sx={{ fontSize: 40, color: '#DFE1E6', mb: 1.5 }} />
                        <Typography sx={{ fontSize: '0.82rem', color: '#97A0AF', fontWeight: 600 }}>
                            {search ? 'No stories match your search' : PLACEHOLDERS.NO_STORIES}
                        </Typography>
                        {search && (
                            <Button size="small" onClick={() => setSearch('')} sx={{ mt: 1, textTransform: 'none', fontSize: '0.78rem', color: '#1877F2', fontWeight: 600 }}>
                                Clear search
                            </Button>
                        )}
                    </Box>
                )}

                {filtered.map((issue) => {
                    const isSelected = issueStore.selectedIssueKeys.has(issue.key);
                    const hasTestPlan = issue.test_cases_generated;

                    return (
                        <Box
                            key={issue.key}
                            onClick={() => issueStore.toggleIssueSelection(issue.key)}
                            sx={{
                                display: 'flex', alignItems: 'flex-start',
                                borderBottom: '1px solid #F4F5F7',
                                cursor: 'pointer',
                                bgcolor: isSelected ? 'rgba(24,119,242,0.05)' : '#fff',
                                borderLeft: isSelected ? '3px solid #1877F2' : '3px solid transparent',
                                transition: 'all 0.12s',
                                '&:hover': { bgcolor: isSelected ? 'rgba(24,119,242,0.07)' : '#FAFBFC' },
                            }}
                        >
                            {/* Checkbox */}
                            <Box sx={{ pt: 1.75, pl: 1.5, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                                <Checkbox
                                    size="small"
                                    checked={isSelected}
                                    onChange={() => issueStore.toggleIssueSelection(issue.key)}
                                    sx={{ p: 0.4, color: '#C1C7D0', '&.Mui-checked': { color: '#1877F2' } }}
                                />
                            </Box>

                            {/* Content */}
                            <Box sx={{ flex: 1, py: 1.75, pr: 2, pl: 1, minWidth: 0 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.6 }}>
                                    <Typography sx={{
                                        fontSize: '0.65rem', fontWeight: 700, color: '#1877F2',
                                        bgcolor: 'rgba(24,119,242,0.09)', px: 0.7, py: 0.1,
                                        borderRadius: '4px', letterSpacing: '0.03em', flexShrink: 0,
                                    }}>
                                        {issue.key}
                                    </Typography>
                                    {hasTestPlan && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, flexShrink: 0 }}>
                                            <CheckCircleOutlineIcon sx={{ fontSize: 11, color: '#36B37E' }} />
                                            <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#36B37E' }}>Ready</Typography>
                                        </Box>
                                    )}
                                </Box>
                                <Typography sx={{
                                    fontSize: '0.8rem', fontWeight: isSelected ? 700 : 500,
                                    color: isSelected ? '#172B4D' : '#253858',
                                    lineHeight: 1.45,
                                    display: '-webkit-box', WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                }}>
                                    {issue.summary}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}
            </Box>

            {/* ── Selection footer ── */}
            {issueStore.selectedIssueKeys.size > 0 && (
                <Box sx={{
                    px: 2.5, py: 1.25, borderTop: '1px solid #EBECF0',
                    bgcolor: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
                }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#1877F2', fontWeight: 700 }}>
                        {issueStore.selectedIssueKeys.size} selected
                    </Typography>
                    <Button size="small" onClick={() => issueStore.clearSelection()}
                        sx={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'none', color: '#97A0AF', py: 0, px: 0.5, minWidth: 0, '&:hover': { color: '#DE350B', bgcolor: 'transparent' } }}>
                        Clear all
                    </Button>
                </Box>
            )}
        </Box>
    );
});

export default IssueList;
