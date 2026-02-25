import React from 'react';
import { Box, Stack } from '@mui/material';
import DashboardKPICards from '../dashboard/components/DashboardKPICards';
import DashboardHero from '../dashboard/components/DashboardHero';
import TestPlanGenerationChart from '../dashboard/components/TestPlanGenerationChart';
import ExecutionResultsTable from '../dashboard/components/ExecutionResultsTable';
import QAReviewStatus from '../dashboard/components/QAReviewStatus';
import QuickActions from '../dashboard/components/QuickActions';
import RecentActivity from '../dashboard/components/RecentActivity';

const DashboardPage: React.FC = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 1 }}>
        <DashboardKPICards />
        <DashboardHero />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.6fr) minmax(280px, 0.8fr)' }, gap: 3, minHeight: 0 }}>
            <Stack spacing={3}>
                <TestPlanGenerationChart />
                <ExecutionResultsTable />
            </Stack>
            <Stack spacing={3}>
                <QAReviewStatus />
                <QuickActions />
                <RecentActivity />
            </Stack>
        </Box>
    </Box>
);

export default DashboardPage;
