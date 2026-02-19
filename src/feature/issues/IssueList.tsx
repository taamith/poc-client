import React from 'react';
import { observer } from 'mobx-react-lite';
import { Card, CardContent, Typography, List, ListItem, ListItemText, ListItemButton, CircularProgress, Box, Divider, Checkbox, Chip } from '@mui/material';
import { issueStore } from '../../app/store/issueStore';
import { HEADERS, PLACEHOLDERS } from '../../lib/constants/messages';

const IssueList: React.FC = observer(() => {
    if (issueStore.loading && issueStore.issues.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: 700,
                                color: '#172B4D',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                fontSize: '11px',
                            }}
                        >
                            {HEADERS.USER_STORIES(issueStore.issues.length)}
                        </Typography>
                    </Box>
                    {issueStore.issues.length > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Checkbox
                                size="small"
                                indeterminate={
                                    issueStore.selectedIssueKeys.size > 0 &&
                                    issueStore.selectedIssueKeys.size < issueStore.issues.length
                                }
                                checked={
                                    issueStore.issues.length > 0 &&
                                    issueStore.selectedIssueKeys.size === issueStore.issues.length
                                }
                                onChange={() => {
                                    if (issueStore.selectedIssueKeys.size === issueStore.issues.length) {
                                        issueStore.clearSelection();
                                    } else {
                                        issueStore.selectAllIssues();
                                    }
                                }}
                                sx={{ p: 0.5, color: '#6B778C', '&.Mui-checked': { color: '#5a1196' } }}
                                id="select-all-stories"
                            />
                            <Typography variant="caption" sx={{ color: '#6B778C', fontWeight: 600, fontSize: '11px' }}>
                                {HEADERS.SELECT_ALL}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
            <Divider sx={{ borderColor: '#DFE1E6' }} />
            <CardContent sx={{ p: 0, flex: 1, overflow: 'auto' }}>
                <List sx={{ p: 0 }}>
                    {issueStore.issues.map((issue) => (
                        <ListItem
                            key={issue.key}
                            disablePadding
                            sx={{
                                borderBottom: '1px solid #EBECF0',
                                '&:last-child': { borderBottom: 'none' },
                            }}
                        >
                            <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                                <Checkbox
                                    size="small"
                                    checked={issueStore.selectedIssueKeys.has(issue.key)}
                                    onChange={() => issueStore.toggleIssueSelection(issue.key)}
                                    sx={{ ml: 1.5, color: '#B3BAC5', '&.Mui-checked': { color: '#5a1196' } }}
                                    id={`checkbox-${issue.key}`}
                                />
                                <ListItemButton
                                    selected={issueStore.selectedIssueKeys.has(issue.key)}
                                    onClick={() => issueStore.toggleIssueSelection(issue.key)}
                                    sx={{
                                        py: 1.5,
                                        px: 1.5,
                                        flexGrow: 1,
                                        borderRadius: 0,
                                        '&.Mui-selected': {
                                            bgcolor: '#E8F0FE',
                                            borderLeft: '3px solid #5a1196',
                                            '&:hover': { bgcolor: '#E8F0FE' },
                                        },
                                        '&:hover': { bgcolor: '#F4F5F7' },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 0.5 }}>
                                        <ListItemText
                                            primary={issue.summary}
                                            secondary={issue.key}
                                            primaryTypographyProps={{
                                                variant: 'body2',
                                                fontWeight: 600,
                                                color: '#172B4D',
                                                noWrap: true,
                                                fontSize: '13px',
                                            }}
                                            secondaryTypographyProps={{
                                                variant: 'caption',
                                                fontWeight: 600,
                                                color: '#6B778C',
                                                fontSize: '11px',
                                            }}
                                        />
                                        {issue.test_cases_generated && (
                                            <Chip
                                                label={PLACEHOLDERS.TEST_PLAN_READY}
                                                size="small"
                                                sx={{
                                                    alignSelf: 'flex-start',
                                                    height: 20,
                                                    fontSize: '10px',
                                                    fontWeight: 700,
                                                    bgcolor: 'rgba(90, 17, 150, 0.08)',
                                                    color: '#5a1196',
                                                    border: '1px solid rgba(90, 17, 150, 0.25)',
                                                    '& .MuiChip-label': { px: 1 },
                                                }}
                                            />
                                        )}
                                    </Box>
                                </ListItemButton>
                            </Box>
                        </ListItem>
                    ))}
                    {issueStore.issues.length === 0 && !issueStore.loading && (
                        <Box sx={{ py: 6, textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ color: '#6B778C' }}>
                                {PLACEHOLDERS.NO_STORIES}
                            </Typography>
                        </Box>
                    )}
                </List>
            </CardContent>
        </Card>
    );
});

export default IssueList;
