import React from 'react';
import { observer } from 'mobx-react-lite';
import { Card, CardContent, Typography, List, ListItem, ListItemText, ListItemButton, CircularProgress, Box, Divider, Checkbox } from '@mui/material';
import { issueStore } from '../../app/store/issueStore';

const IssueList: React.FC = observer(() => {
    if (issueStore.loading && issueStore.issues.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress size={24} />
            </Box>
        );
    }


    return (
        <Card sx={{ borderRadius: '3px', position: 'sticky', top: 24 }}>
            <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            fontWeight: 700,
                            color: '#5E6C84',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}
                    >
                        User Stories ({issueStore.issues.length})
                    </Typography>
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
                                sx={{ p: 0.5, color: '#5E6C84' }}
                                id="select-all-stories"
                            />
                            <Typography variant="caption" sx={{ color: '#5E6C84', fontWeight: 600 }}>
                                ALL
                            </Typography>
                        </Box>
                    )}
                </Box>
                <Divider sx={{ mb: 1 }} />
                {issueStore.error && (
                    <Typography color="error" variant="caption" sx={{ px: 1, mb: 1, display: 'block' }}>
                        {issueStore.error}
                    </Typography>
                )}
                <List sx={{ p: 0 }}>
                    {issueStore.issues.map((issue) => (
                        <ListItem
                            key={issue.key}
                            disablePadding
                            sx={{
                                borderBottom: '1px solid #EBECF0',
                                '&:last-child': { borderBottom: 'none' }
                            }}
                        >
                            <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', pr: 1 }}>
                                <Checkbox
                                    size="small"
                                    checked={issueStore.selectedIssueKeys.has(issue.key)}
                                    onChange={() => issueStore.toggleIssueSelection(issue.key)}
                                    sx={{ ml: 1, color: '#6B778C' }}
                                    id={`checkbox-${issue.key}`}
                                />
                                <ListItemButton
                                    selected={issueStore.selectedIssueKeys.has(issue.key)}
                                    onClick={() => issueStore.toggleIssueSelection(issue.key)}
                                    sx={{
                                        py: 1.5,
                                        flexGrow: 1,
                                        '&.Mui-selected': {
                                            bgcolor: 'rgba(0, 82, 204, 0.08)',
                                            borderLeft: '3px solid #0052CC',
                                            '&:hover': { bgcolor: 'rgba(0, 82, 204, 0.12)' }
                                        }
                                    }}
                                >
                                    <ListItemText
                                        primary={issue.summary}
                                        secondary={issue.key}
                                        primaryTypographyProps={{
                                            variant: 'body2',
                                            fontWeight: 600,
                                            color: '#172B4D',
                                            noWrap: true
                                        }}
                                        secondaryTypographyProps={{
                                            variant: 'caption',
                                            fontWeight: 700,
                                            color: '#6B778C'
                                        }}
                                    />
                                </ListItemButton>
                            </Box>
                        </ListItem>
                    ))}
                    {issueStore.issues.length === 0 && !issueStore.loading && (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                            No stories found.
                        </Typography>
                    )}
                </List>
            </CardContent>
        </Card>
    );
});

export default IssueList;
