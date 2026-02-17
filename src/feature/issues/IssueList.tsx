import React from 'react';
import { observer } from 'mobx-react-lite';
import { Card, CardContent, Typography, List, ListItem, ListItemText, ListItemButton, CircularProgress, Box, Divider, Checkbox } from '@mui/material';
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
        <Card sx={{ borderRadius: '3px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <CardContent sx={{ p: 2, flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
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
                        {HEADERS.USER_STORIES(issueStore.issues.length)}
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
                                {HEADERS.SELECT_ALL}
                            </Typography>
                        </Box>
                    )}
                </Box>
                <Divider sx={{ mb: 1 }} />
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
                                            bgcolor: 'rgba(54, 20, 178, 0.08)',
                                            borderLeft: '3px solid #3614b2',
                                            '&:hover': { bgcolor: 'rgba(54, 20, 178, 0.12)' }
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
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
                                        {/* Status indicator */}
                                        {issue.test_cases_generated && (
                                            <Box
                                                sx={{
                                                    mt: 0.5,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    bgcolor: 'rgba(90, 17, 150, 0.1)',
                                                    color: '#5a1196',
                                                    px: 1,
                                                    py: 0.25,
                                                    borderRadius: '3px',
                                                    fontSize: '11px',
                                                    fontWeight: 700,
                                                    alignSelf: 'flex-start'
                                                }}
                                            >
                                                {PLACEHOLDERS.TEST_PLAN_READY}
                                            </Box>
                                        )}
                                    </Box>
                                </ListItemButton>
                            </Box>
                        </ListItem>
                    ))}
                    {issueStore.issues.length === 0 && !issueStore.loading && (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                            {PLACEHOLDERS.NO_STORIES}
                        </Typography>
                    )}
                </List>
            </CardContent>
        </Card>
    );
});

export default IssueList;
