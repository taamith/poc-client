import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api-proxy',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

export const jiraApi = {
    authJira: (authUrl: string) => {
        return window.open(authUrl, 'jira-oauth', 'width=600,height=700');
    },
    disconnect: () => api.post('/disconnect'),
    // Updated to match the working endpoints found via curl
    fetchIssues: () => api.post('/issues'),
    fetchIssueDetail: (issueKey: string) => api.post('/issue', { issue_key: issueKey }),
    generateTestPlan: (data: { summary: string; user_story: string; base_url: string }) => api.post('/test-plan', data),
};

export default api;
