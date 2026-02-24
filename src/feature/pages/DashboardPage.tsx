import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Chip,
    Link,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';

const recentItems = [
    { label: 'Payment flow regression plan generated', time: '12 min ago', tag: 'Generated' },
    { label: 'Lead conversion smoke template updated', time: '1 hr ago', tag: 'Edited' },
    { label: '2 plans published to Confluence', time: 'Today', tag: 'Published' },
];

const executionResults: Array<{
    testPlan: string;
    status: string;
    time: string;
    videoLabel: string;
    videoUrl: string;
}> = [
    { testPlan: 'Checkout Regression Suite', status: 'Passed', time: '09:14 AM', videoLabel: 'Watch', videoUrl: 'https://example.com/videos/checkout-regression' },
    { testPlan: 'Lead Conversion Smoke', status: 'Passed', time: '08:52 AM', videoLabel: 'Watch', videoUrl: 'https://example.com/videos/lead-conversion-smoke' },
    { testPlan: 'Invoice API Validation', status: 'Failed', time: '08:31 AM', videoLabel: 'Watch', videoUrl: 'https://example.com/videos/invoice-api-validation' },
    { testPlan: 'User Provisioning UAT', status: 'Pending Review', time: 'Yesterday', videoLabel: 'Open', videoUrl: 'https://example.com/videos/user-provisioning-uat' },
    { testPlan: 'Returns Flow Regression', status: 'Passed', time: 'Yesterday', videoLabel: 'Watch', videoUrl: 'https://example.com/videos/returns-regression' },
    { testPlan: 'Campaign Setup Smoke', status: 'Failed', time: 'Yesterday', videoLabel: 'Watch', videoUrl: 'https://example.com/videos/campaign-smoke' },
    { testPlan: 'Pricing Rules Validation', status: 'Passed', time: 'Feb 22', videoLabel: 'Watch', videoUrl: 'https://example.com/videos/pricing-rules' },
    { testPlan: 'Partner Portal Access', status: 'Passed', time: 'Feb 22', videoLabel: 'Open', videoUrl: 'https://example.com/videos/partner-portal-access' },
    { testPlan: 'Profile Update Scenarios', status: 'Pending Review', time: 'Feb 21', videoLabel: 'Watch', videoUrl: 'https://example.com/videos/profile-update' },
    { testPlan: 'Refund Workflow E2E', status: 'Passed', time: 'Feb 21', videoLabel: 'Watch', videoUrl: 'https://example.com/videos/refund-workflow-e2e' },
];

const weeklyGeneration = [
    { day: 'Day 1', value: 10, color: '#C1BEEB' },
    { day: 'Day 2', value: 14, color: '#AAA6E4' },
    { day: 'Day 3', value: 12, color: '#847BEA' },
    { day: 'Day 4', value: 18, color: '#847BEA' },
    { day: 'Day 5', value: 24, color: '#58C983' },
    { day: 'Day 6', value: 16, color: '#847BEA' },
    { day: 'Today', value: 7, color: '#C1BEEB' },
];

const qaStatus = {
    approved: 68,
    pending: 23,
};

const kpiCards = [
    {
        title: 'Test Plans Generated',
        value: '142',
        note: '↑ 18% vs last sprint',
        valueColor: '#6554F4',
        noteColor: '#0B875B',
        topBorder: '#6554F4',
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
        valueColor: '#3B82F6',
        noteColor: '#5E6C84',
        topBorder: '#3B82F6',
        icon: <UploadFileOutlinedIcon sx={{ fontSize: 20 }} />,
    },
];

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const maxGenerationValue = Math.max(...weeklyGeneration.map((d) => d.value), 1);
    const qaTotal = qaStatus.approved + qaStatus.pending;
    const approvedPct = qaTotal > 0 ? (qaStatus.approved / qaTotal) * 100 : 0;
    const donutRadius = 46;
    const donutStroke = 12;
    const donutCircumference = 2 * Math.PI * donutRadius;
    const approvedArc = (approvedPct / 100) * donutCircumference;
    const pendingArc = donutCircumference - approvedArc;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 1 }}>
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
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: 3,
                                bgcolor: card.topBorder,
                            }}
                        />
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

            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2.5, md: 3 },
                    borderRadius: '18px',
                    border: '1px solid #E6EAF0',
                    background: 'linear-gradient(135deg, #F7FBFF 0%, #EEF4FF 45%, #FFFFFF 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ position: 'absolute', top: -48, right: -48, width: 180, height: 180, borderRadius: '50%', bgcolor: 'rgba(24,119,242,0.08)' }} />
                <Box sx={{ position: 'absolute', bottom: -36, right: 60, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(54,179,126,0.08)' }} />

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ position: 'relative', zIndex: 1, alignItems: { md: 'center' }, justifyContent: 'space-between' }}>
                    <Box sx={{ maxWidth: 680 }}>
                        <Typography sx={{ fontSize: '0.76rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1877F2', mb: 1 }}>
                            Dashboard
                        </Typography>
                        <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.45rem' }, fontWeight: 800, color: '#172B4D', letterSpacing: '-0.03em', lineHeight: 1.2, mb: 1 }}>
                            Monitor recent executions and QA activity
                        </Typography>
                        <Typography sx={{ color: '#5E6C84', fontSize: '0.88rem', lineHeight: 1.7 }}>
                            Track the latest execution results, pending reviews, and uploads from one place.
                        </Typography>
                    </Box>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                        <Button
                            variant="contained"
                            startIcon={<AddRoundedIcon />}
                            onClick={() => navigate('/test-plans')}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                borderRadius: '10px',
                                px: 1.8,
                                background: 'linear-gradient(135deg, #0D65D9 0%, #1877F2 55%, #3D90F5 100%)',
                                '&:hover': { background: 'linear-gradient(135deg, #0A52C4 0%, #1468D8 55%, #2F84F0 100%)' },
                            }}
                        >
                            Start New Run
                        </Button>
                        <Button
                            variant="outlined"
                            sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                borderRadius: '10px',
                                borderColor: '#DCE3EC',
                                color: '#172B4D',
                                '&:hover': { borderColor: '#1877F2', color: '#1877F2', bgcolor: 'rgba(24,119,242,0.03)' },
                            }}
                        >
                            View History
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.6fr) minmax(280px, 0.8fr)' }, gap: 3, minHeight: 0 }}>
                <Stack spacing={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: '16px',
                            border: '1px solid #EBECF0',
                            overflow: 'hidden',
                        }}
                    >
                        <Box sx={{ px: { xs: 2, md: 2.5 }, py: 1.75, borderBottom: '1px solid #EBECF0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                            <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#172B4D', letterSpacing: '-0.02em' }}>
                                Test Plan Generation - Last 7 Days
                            </Typography>
                            <Chip
                                label="This Sprint"
                                size="small"
                                sx={{
                                    height: 24,
                                    bgcolor: '#ECEBFF',
                                    color: '#6554F4',
                                    border: '1px solid rgba(101,84,244,0.12)',
                                    fontWeight: 700,
                                }}
                            />
                        </Box>

                        <Box sx={{ px: { xs: 2, md: 2.5 }, py: 2 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.1 }}>
                                {weeklyGeneration.map((item) => (
                                    <Box key={item.day} sx={{ display: 'grid', gridTemplateColumns: '52px 1fr 34px', alignItems: 'center', gap: 1 }}>
                                        <Typography sx={{ fontSize: '0.72rem', color: '#6B778C', fontWeight: 600 }}>
                                            {item.day}
                                        </Typography>
                                        <Box
                                            sx={{
                                                height: 10,
                                                borderRadius: '999px',
                                                bgcolor: '#EEF1F5',
                                                overflow: 'hidden',
                                                position: 'relative',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: `${(item.value / maxGenerationValue) * 100}%`,
                                                    height: '100%',
                                                    bgcolor: item.color,
                                                    borderRadius: '999px',
                                                }}
                                            />
                                        </Box>
                                        <Typography sx={{ fontSize: '0.72rem', color: '#42526E', fontWeight: 700, textAlign: 'right' }}>
                                            {item.value}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
                                <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#847BEA' }} />
                                        <Typography sx={{ fontSize: '0.8rem', color: '#5E6C84' }}>Generated</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#58C983' }} />
                                        <Typography sx={{ fontSize: '0.8rem', color: '#5E6C84' }}>Peak Day (Wed)</Typography>
                                    </Box>
                                </Stack>
                                <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: '#091E42' }}>
                                    Total: {weeklyGeneration.reduce((sum, item) => sum + item.value, 0)} plans
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>

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

                        <Box
                            sx={{
                                overflowX: 'auto',
                                border: '1px solid #DDE3EA',
                                borderRadius: '12px',
                                overflowY: 'hidden',
                                bgcolor: '#fff',
                            }}
                        >
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
                                        sx={{
                                            fontSize: '0.68rem',
                                            fontWeight: 800,
                                            color: '#6B778C',
                                            letterSpacing: '0.06em',
                                            textTransform: 'uppercase',
                                        }}
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
                </Stack>

                <Stack spacing={3}>
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
                                                stroke="#F08C00"
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

                                <Box sx={{ p: 1.1, borderRadius: '10px', border: '1px solid #FFE2BD', bgcolor: '#FFF8EE' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                                            <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: '#F08C00' }} />
                                            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#172B4D' }}>
                                                Pending
                                            </Typography>
                                        </Box>
                                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#C25100' }}>
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
                            {[
                                'Generate test plan from selected stories',
                                'Upload reference documents',
                                'Publish latest approved plan',
                            ].map((action) => (
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
                </Stack>
            </Box>
        </Box>
    );
};

export default DashboardPage;
