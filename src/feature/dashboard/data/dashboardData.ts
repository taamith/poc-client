export const recentItems = [
    { label: 'Payment flow regression plan generated', time: '12 min ago', tag: 'Generated' },
    { label: 'Lead conversion smoke template updated', time: '1 hr ago', tag: 'Edited' },
    { label: '2 plans published to Confluence', time: 'Today', tag: 'Published' },
];

export interface ExecutionResult {
    testPlan: string;
    status: string;
    time: string;
    videoLabel: string;
    videoUrl: string;
}

export const executionResults: ExecutionResult[] = [
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

export const weeklyGeneration = [
    { day: 'Day 1', value: 10, color: '#BDDAFF' },
    { day: 'Day 2', value: 14, color: '#90C2F9' },
    { day: 'Day 3', value: 12, color: '#1877F2' },
    { day: 'Day 4', value: 18, color: '#1877F2' },
    { day: 'Day 5', value: 24, color: '#36B37E' },
    { day: 'Day 6', value: 16, color: '#1877F2' },
    { day: 'Today', value: 7, color: '#BDDAFF' },
];

export const qaStatus = {
    approved: 68,
    pending: 23,
};
