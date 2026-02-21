import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Typography, Button, Chip, CircularProgress } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import AddLinkIcon from '@mui/icons-material/AddLink';
import { jiraApi } from '../../lib/api/jira';
import { issueStore } from '../../app/store/issueStore';
import { integrationStore } from '../../app/store/integrationStore';

const AUTH_URL = 'https://9xd63zeaqb.execute-api.us-east-1.amazonaws.com/dev/auth/jira';

interface Tool {
    icon: string;
    name: string;
    category: string;
    accentColor: string;
    iconBg: string;
    comingSoon?: boolean;
}

const TOOLS: Tool[] = [
    { icon: '📋', name: 'Jira', category: 'Project Management', accentColor: '#0052CC', iconBg: '#DEEBFF' },
    { icon: '🔷', name: 'Azure DevOps', category: 'Project Management', accentColor: '#0078D4', iconBg: '#D6EAFF', comingSoon: true },
    { icon: '🟢', name: 'ServiceNow', category: 'IT Service Management', accentColor: '#00875A', iconBg: '#D6F5E3', comingSoon: true },
];

interface CardProps extends Tool {
    connected: boolean;
    connecting?: boolean;
    disconnecting?: boolean;
    onConnect: () => void;
    onDisconnect: () => void;
}

const IntegrationCard: React.FC<CardProps> = ({
    icon, name, category, accentColor, iconBg,
    comingSoon, connected, connecting, disconnecting,
    onConnect, onDisconnect,
}) => (
    <Box sx={{
        borderRadius: '16px',
        border: '1.5px solid',
        borderColor: connected ? accentColor + '55' : '#E4E6EA',
        bgcolor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s, transform 0.2s',
        '&:hover': {
            boxShadow: `0 8px 28px ${accentColor}22`,
            transform: 'translateY(-2px)',
        },
    }}>
        {/* Accent top bar */}
        <Box sx={{ height: 4, bgcolor: comingSoon ? '#DFE1E6' : accentColor, borderRadius: '16px 16px 0 0' }} />

        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            {/* Icon + badge row */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{
                    width: 52, height: 52, borderRadius: '12px',
                    bgcolor: iconBg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '1.5rem',
                    boxShadow: `0 2px 8px ${accentColor}20`,
                }}>
                    {icon}
                </Box>

                {comingSoon ? (
                    <Chip label="Coming soon" size="small"
                        sx={{ bgcolor: '#FFF7E6', color: '#E07B00', fontWeight: 700, fontSize: 10, border: '1px solid #FFD591', height: 20, borderRadius: '6px' }} />
                ) : connected ? (
                    <Chip
                        icon={<CheckCircleOutlineIcon sx={{ fontSize: '13px !important', color: '#00875A !important' }} />}
                        label="Connected" size="small"
                        sx={{ bgcolor: '#E3FCEF', color: '#00875A', fontWeight: 700, fontSize: 10, border: '1px solid #ABF5D1', height: 20, borderRadius: '6px' }} />
                ) : (
                    <Chip
                        icon={<RadioButtonUncheckedIcon sx={{ fontSize: '13px !important', color: '#6B778C !important' }} />}
                        label="Not connected" size="small"
                        sx={{ bgcolor: '#F4F5F7', color: '#6B778C', fontWeight: 600, fontSize: 10, border: '1px solid #DFE1E6', height: 20, borderRadius: '6px' }} />
                )}
            </Box>

            {/* Name & category */}
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#172B4D', mb: 0.3, letterSpacing: '-0.01em' }}>
                {name}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#6B778C', mb: 2.5, fontWeight: 500 }}>
                {category}
            </Typography>

            {/* Divider */}
            <Box sx={{ borderTop: '1px solid #F1F2F4', mb: 2 }} />

            {/* Action button */}
            {comingSoon ? (
                <Button variant="outlined" size="small" disabled fullWidth
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: 12, borderColor: '#DFE1E6', color: '#A5ADBA' }}>
                    Coming Soon
                </Button>
            ) : connected ? (
                <Button variant="outlined" size="small" fullWidth
                    onClick={onDisconnect} disabled={disconnecting}
                    startIcon={disconnecting
                        ? <CircularProgress size={12} color="inherit" />
                        : <LinkOffIcon sx={{ fontSize: '15px !important' }} />}
                    sx={{
                        textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: 12,
                        color: '#DE350B', borderColor: '#FFBDAD',
                        '&:hover': { bgcolor: '#FFF4F0', borderColor: '#DE350B' },
                    }}>
                    {disconnecting ? 'Disconnecting…' : 'Disconnect'}
                </Button>
            ) : (
                <Button variant="contained" size="small" fullWidth
                    onClick={onConnect} disabled={connecting}
                    startIcon={connecting
                        ? <CircularProgress size={12} color="inherit" />
                        : <AddLinkIcon sx={{ fontSize: '15px !important' }} />}
                    sx={{
                        textTransform: 'none', fontWeight: 700, borderRadius: '8px', fontSize: 12,
                        bgcolor: accentColor, boxShadow: 'none',
                        '&:hover': { bgcolor: accentColor, filter: 'brightness(0.9)', boxShadow: 'none' },
                        '&.Mui-disabled': { bgcolor: '#DFE1E6', color: '#A5ADBA' },
                    }}>
                    {connecting ? 'Connecting…' : 'Connect'}
                </Button>
            )}
        </Box>
    </Box>
);

const IntegrationsPage: React.FC = observer(() => {
    const [connecting, setConnecting] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const jiraConnected = integrationStore.jiraConnected;

    const handleJiraConnect = () => {
        const popup = jiraApi.authJira(AUTH_URL);
        if (!popup) return;
        setConnecting(true);
        const timer = setInterval(async () => {
            if (popup.closed) { clearInterval(timer); setConnecting(false); return; }
            const success = await issueStore.fetchIssues(true);
            if (success) {
                clearInterval(timer); setConnecting(false);
                integrationStore.setJiraConnected(true);
                try { popup.close(); } catch (_) { /* cross-origin */ }
            }
        }, 2000);
    };

    const handleJiraDisconnect = async () => {
        setDisconnecting(true);
        try { await jiraApi.disconnect(); } catch (_) { /* ignore */ }
        issueStore.clearSelectedIssue();
        integrationStore.clearConnection();
        setDisconnecting(false);
    };

    return (
        <Box>
            {/* Page header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#172B4D', letterSpacing: '-0.02em' }}>
                    Integrations
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B778C', mt: 0.5 }}>
                    Connect your tools to start importing work items.
                </Typography>
            </Box>

            {/* Tiles grid */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 240px))',
                gap: 2.5,
                alignItems: 'start',
            }}>
                {TOOLS.map((tool) => {
                    const isJira = tool.name === 'Jira';
                    return (
                        <IntegrationCard
                            key={tool.name}
                            {...tool}
                            connected={isJira ? jiraConnected : false}
                            connecting={isJira ? connecting : false}
                            disconnecting={isJira ? disconnecting : false}
                            onConnect={isJira ? handleJiraConnect : () => {}}
                            onDisconnect={isJira ? handleJiraDisconnect : () => {}}
                        />
                    );
                })}
            </Box>
        </Box>
    );
});

export default IntegrationsPage;
