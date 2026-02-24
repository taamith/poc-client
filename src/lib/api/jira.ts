import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api-proxy',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false,
});

export const jiraApi = {
    authJira: (authUrl: string) => window.open(authUrl, 'jira-oauth', 'width=600,height=700'),
    disconnect: () => api.post('/disconnect'),
    fetchSpaces: () => api.get('/space'),
    fetchIssues: (spaces: string[], maxResults: number = 25) => api.post('/issues', {
        spaces,
        max_results: maxResults,
    }),
    fetchIssueDetail: (issueKey: string) => api.post('/issue', { issue_key: issueKey }),
    generateTestPlan: (data: { summary: string; user_story: string; base_url: string }) => api.post('/test-plan', data),
};

export default api;
