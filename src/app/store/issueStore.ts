import { makeAutoObservable, runInAction } from 'mobx';
import { jiraApi } from '../../lib/api/jira';
import { toast } from 'sonner';

export interface JiraIssue {
    key: string;
    summary: string;
}

export interface IssueDetail extends JiraIssue {
    description: string;
}

class IssueStore {
    issues: JiraIssue[] = [];
    selectedIssueKeys: Set<string> = new Set();
    selectedIssue: IssueDetail | null = null;
    batchProcessingStatus: Map<string, 'pending' | 'processing' | 'completed' | 'failed'> = new Map();
    generatedPlans: Map<string, string> = new Map(); // key -> JSON string
    loading: boolean = false;
    error: string | null = null;
    isAuthenticated: boolean = false;
    isGeneratingPlan: boolean = false;
    generationMessage: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    async fetchIssues(silent: boolean = false) {
        if (!silent) {
            this.loading = true;
            this.error = null;
        }

        try {
            const response = await jiraApi.fetchIssues();
            // Handle the observed nested response structure: { issues: { issues: [...] } }
            const nestedIssues = response.data?.issues?.issues;
            const directIssues = response.data?.issues;

            runInAction(() => {
                if (Array.isArray(nestedIssues)) {
                    this.issues = nestedIssues.map((i: any) => ({
                        key: i.key,
                        summary: i.fields?.summary || i.summary || 'No Summary'
                    }));
                } else if (Array.isArray(directIssues)) {
                    this.issues = directIssues;
                } else if (response.data?.error) {
                    // If the backend returns an error with 200 (sometimes seen)
                    if (!silent) this.error = response.data.error;
                    this.issues = [];
                } else {
                    console.error('API did not return an array of issues:', response.data);
                    this.issues = [];
                    if (!silent) this.error = "Invalid response format from server";
                }

                if (!silent) this.loading = false;
                this.isAuthenticated = true;

                // Only clear error if we actually got issues or a truly successful response
                if (this.issues.length > 0) {
                    this.error = null;
                    // Auto-select the first issue if none is selected
                    if (!this.selectedIssue && this.issues.length > 0) {
                        const firstIssue = this.issues[0];
                        this.fetchIssueDetail(firstIssue.key);
                        // Also check it by default
                        this.selectedIssueKeys.add(firstIssue.key);
                        this.batchProcessingStatus.set(firstIssue.key, 'pending');
                    }
                }
            });
            return true;
        } catch (err: any) {
            if (!silent) {
                console.error('Fetch issues error:', err);
            }
            runInAction(() => {
                this.issues = [];
                if (!silent) {
                    this.loading = false;
                    this.isAuthenticated = false;
                    if (err.response?.status === 401) {
                        this.error = "Please log in to Jira";
                    } else {
                        // Suppress generic connection error if we are on the login page
                        // or if it's a silent check
                        this.error = "Connection Error. Ensure the backend is accessible.";
                    }
                }
            });
            return false;
        }
    }

    async fetchIssueDetail(issueKey: string) {
        this.loading = true;
        // Don't clear global error here, it might be showing important auth info
        // Only clear if we are starting a fresh fetch
        try {
            const response = await jiraApi.fetchIssueDetail(issueKey);

            runInAction(() => {
                const detail = response.data?.issue;
                if (detail) {
                    this.selectedIssue = {
                        key: issueKey,
                        summary: detail.summary || 'No Summary',
                        description: detail.description || 'No description available for this issue.'
                    };
                    this.error = null; // Clear error on success
                } else if (response.data?.error) {
                    this.error = response.data.error;
                    this.selectedIssue = null;
                } else {
                    // Fallback if structure is different but contains data
                    this.selectedIssue = {
                        key: response.data.key || issueKey,
                        summary: response.data.summary || 'No Summary',
                        description: response.data.description || 'No description'
                    };
                    this.error = null;
                }
                this.loading = false;
            });
        } catch (err: any) {
            console.error('Fetch issue detail error:', err);
            runInAction(() => {
                const apiError = err.response?.data?.error || err.message || 'Failed to fetch issue details';
                this.error = apiError;
                this.loading = false;
            });
        }
    }

    setAuthenticated(value: boolean) {
        this.isAuthenticated = value;
    }

    async generateTestPlan(baseUrl: string) {
        if (!this.selectedIssue) return;

        this.isGeneratingPlan = true;
        this.generationMessage = null;
        this.error = null;

        try {
            const data = {
                summary: this.selectedIssue.summary,
                user_story: this.selectedIssue.description || this.selectedIssue.summary,
                base_url: baseUrl
            };
            const response = await jiraApi.generateTestPlan(data);

            runInAction(() => {
                this.isGeneratingPlan = false;
                this.generationMessage = response.data?.message || 'Test plan generated successfully!';
                toast.success(this.generationMessage);
            });
            return response.data;
        } catch (err: any) {
            console.error('Generate test plan error:', err);
            runInAction(() => {
                this.isGeneratingPlan = false;
                const apiError = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to generate test plan';
                this.error = apiError;
                toast.error(apiError);
            });
            throw err;
        }
    }

    toggleIssueSelection(issueKey: string) {
        if (this.selectedIssueKeys.has(issueKey)) {
            this.selectedIssueKeys.delete(issueKey);
            this.batchProcessingStatus.delete(issueKey);
            // If we have other selected stories, stay in multi-view
            // If this was the last one, clear detail view
            if (this.selectedIssueKeys.size === 0) {
                this.selectedIssue = null;
            } else if (this.selectedIssue?.key === issueKey) {
                // If we uncheck the one currently being viewed, show the next one's detail or just stay in summary
                const nextKey = Array.from(this.selectedIssueKeys)[0];
                this.fetchIssueDetail(nextKey);
            }
        } else {
            this.selectedIssueKeys.add(issueKey);
            this.batchProcessingStatus.set(issueKey, 'pending');
            // Auto fetch detail for the latest checked issue to show in detail view
            this.fetchIssueDetail(issueKey);
        }
    }

    selectAllIssues() {
        this.issues.forEach(issue => {
            this.selectedIssueKeys.add(issue.key);
            this.batchProcessingStatus.set(issue.key, 'pending');
        });
    }

    clearSelection() {
        this.selectedIssueKeys.clear();
        this.batchProcessingStatus.clear();
        this.selectedIssue = null;
    }

    async processBatch(baseUrl: string) {
        this.isGeneratingPlan = true;
        this.error = null;

        for (const key of Array.from(this.selectedIssueKeys)) {
            const status = this.batchProcessingStatus.get(key);
            if (status === 'completed') continue;

            runInAction(() => {
                this.batchProcessingStatus.set(key, 'processing');
            });

            try {
                let description = '';
                if (this.selectedIssue?.key === key) {
                    description = this.selectedIssue.description;
                } else {
                    const detailResponse = await jiraApi.fetchIssueDetail(key);
                    description = detailResponse.data?.issue?.description || '';
                }

                const summary = this.issues.find(i => i.key === key)?.summary || 'No Summary';

                const genResponse = await jiraApi.generateTestPlan({
                    summary: summary,
                    user_story: description,
                    base_url: baseUrl
                });

                runInAction(() => {
                    this.batchProcessingStatus.set(key, 'completed');
                    this.generatedPlans.set(key, JSON.stringify(genResponse.data, null, 2));
                    toast.success(`Test plan generated for ${key}`);
                });
            } catch (err: any) {
                console.error(`Batch processing error for ${key}:`, err);
                runInAction(() => {
                    this.batchProcessingStatus.set(key, 'failed');
                    toast.error(`Failed to generate test plan for ${key}`);
                });
            }
        }

        runInAction(() => {
            this.isGeneratingPlan = false;
        });
    }

    downloadPlan(_key: string) {
        console.warn('Download option is disabled.');
    }

    clearSelectedIssue() {
        this.selectedIssue = null;
        this.generationMessage = null;
    }
}

export const issueStore = new IssueStore();
export default issueStore;
