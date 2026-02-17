import { makeAutoObservable, runInAction } from 'mobx';
import { jiraApi } from '../../lib/api/jira';
import { toast } from 'sonner';

export interface JiraIssue {
    key: string;
    summary: string;
    test_case_filename?: string;
    test_cases_generated?: boolean;
    is_qa_approved?: boolean;
}

export interface IssueDetail extends JiraIssue {
    description: string;
}

class IssueStore {
    issues: JiraIssue[] = [];
    selectedIssueKeys: Set<string> = new Set();
    selectedIssue: IssueDetail | null = null;
    issueDetailsCache: Map<string, IssueDetail> = new Map(); // Cache for issue details
    batchProcessingStatus: Map<string, 'pending' | 'processing' | 'completed' | 'failed'> = new Map();
    generatedPlans: Map<string, string> = new Map(); // key -> JSON string
    loading: boolean = false;
    error: string | null = null;
    isAuthenticated: boolean = false;
    authChecked: boolean = false;
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
            console.log('fetchIssues raw response:', JSON.stringify(response.data, null, 2));

            // Handle the observed nested response structure: { issues: { issues: [...] } }
            const nestedIssues = response.data?.issues?.issues;
            const directIssues = response.data?.issues;

            const mapIssue = (i: any): JiraIssue => ({
                key: i.key,
                summary: i.fields?.summary || i.summary || i.name || 'No Summary',
                test_case_filename: i.test_case_filename || i.fields?.test_case_filename,
                test_cases_generated: i.test_cases_generated ?? i.fields?.test_cases_generated ?? false,
                is_qa_approved: false
            });

            runInAction(() => {
                if (Array.isArray(nestedIssues)) {
                    this.issues = nestedIssues.map(mapIssue);
                } else if (Array.isArray(directIssues)) {
                    this.issues = directIssues.map(mapIssue);
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
                this.authChecked = true;

                // Only clear error if we actually got issues or a truly successful response
                if (this.issues.length > 0) {
                    this.error = null;
                    // Prefetch test plan status for all issues to eliminate button lag
                    this.prefetchTestPlanStatus();
                }
            });
            return true;
        } catch (err: any) {
            if (!silent) {
                console.error('Fetch issues error:', err);
            }
            runInAction(() => {
                this.issues = [];
                this.authChecked = true;
                if (!silent) {
                    this.loading = false;
                    this.isAuthenticated = false;
                    if (err.response?.status === 401) {
                        this.error = "Please log in to Jira";
                        toast.error("Please log in to Jira");
                    } else {
                        this.error = "Connection Error. Ensure the backend is accessible.";
                        toast.error("Connection Error. Ensure the backend is accessible.");
                    }
                }
            });
            return false;
        }
    }

    async fetchIssueDetail(issueKey: string) {
        this.loading = true;

        // Immediately set selectedIssue from cache or list so the UI reflects the correct issue
        const cached = this.issueDetailsCache.get(issueKey);
        if (cached) {
            this.selectedIssue = cached;
        } else {
            const listIssue = this.issues.find(i => i.key === issueKey);
            if (listIssue) {
                this.selectedIssue = {
                    ...listIssue,
                    description: 'Loading...',
                };
            }
        }

        try {
            const response = await jiraApi.fetchIssueDetail(issueKey);

            runInAction(() => {
                const detail = response.data?.issue;
                const existing = this.issues.find(i => i.key === issueKey);
                const hasDetailFlag = response.data.test_cases_generated !== undefined;

                if (detail) {
                    const issueDetail: IssueDetail = {
                        key: issueKey,
                        summary: detail.summary || 'No Summary',
                        description: detail.description || 'No description available for this issue.',
                        test_case_filename: response.data.test_case_filename ?? existing?.test_case_filename,
                        test_cases_generated: hasDetailFlag
                            ? !!response.data.test_cases_generated
                            : (existing?.test_cases_generated ?? false),
                        is_qa_approved: false
                    };

                    this.issueDetailsCache.set(issueKey, issueDetail);
                    this.selectedIssue = issueDetail;

                    const issueIndex = this.issues.findIndex(i => i.key === issueKey);
                    if (issueIndex !== -1) {
                        this.issues[issueIndex] = {
                            ...this.issues[issueIndex],
                            test_case_filename: issueDetail.test_case_filename,
                            test_cases_generated: issueDetail.test_cases_generated,
                            is_qa_approved: issueDetail.is_qa_approved
                        };
                    }

                    this.error = null;
                } else if (response.data?.error) {
                    this.error = response.data.error;
                    this.selectedIssue = null;
                } else {
                    const issueDetail: IssueDetail = {
                        key: response.data.key || issueKey,
                        summary: response.data.summary || 'No Summary',
                        description: response.data.description || 'No description',
                        test_case_filename: response.data.test_case_filename ?? existing?.test_case_filename,
                        test_cases_generated: hasDetailFlag
                            ? !!response.data.test_cases_generated
                            : (existing?.test_cases_generated ?? false),
                        is_qa_approved: false
                    };

                    this.issueDetailsCache.set(issueKey, issueDetail);
                    this.selectedIssue = issueDetail;

                    const issueIndex = this.issues.findIndex(i => i.key === issueKey);
                    if (issueIndex !== -1) {
                        this.issues[issueIndex] = {
                            ...this.issues[issueIndex],
                            test_case_filename: issueDetail.test_case_filename,
                            test_cases_generated: issueDetail.test_cases_generated,
                            is_qa_approved: issueDetail.is_qa_approved
                        };
                    }

                    this.error = null;
                }
                this.loading = false;
            });
        } catch (err: any) {
            runInAction(() => {
                const apiError = err.response?.data?.error || err.message || 'Failed to fetch issue details';
                this.error = apiError;
                this.loading = false;
                toast.error(apiError);
            });
        }
    }

    // Prefetch test plan status for all issues in the background
    async prefetchTestPlanStatus() {
        // Fetch details for all issues in parallel to get test plan status
        const prefetchPromises = this.issues.map(async (issue) => {
            try {
                const response = await jiraApi.fetchIssueDetail(issue.key);

                runInAction(() => {
                    const issueIndex = this.issues.findIndex(i => i.key === issue.key);
                    if (issueIndex !== -1) {
                        const existing = this.issues[issueIndex];
                        // Only overwrite test_cases_generated if the detail API explicitly provides it
                        const hasDetailFlag = response.data.test_cases_generated !== undefined;
                        this.issues[issueIndex] = {
                            ...existing,
                            test_case_filename: response.data.test_case_filename ?? existing.test_case_filename,
                            test_cases_generated: hasDetailFlag
                                ? !!response.data.test_cases_generated
                                : existing.test_cases_generated,
                            is_qa_approved: false
                        };
                    }

                    // Also update cache
                    const detail = response.data?.issue;
                    if (detail) {
                        const hasDetailFlag = response.data.test_cases_generated !== undefined;
                        this.issueDetailsCache.set(issue.key, {
                            key: issue.key,
                            summary: detail.summary || 'No Summary',
                            description: detail.description || 'No description',
                            test_case_filename: response.data.test_case_filename ?? issue.test_case_filename,
                            test_cases_generated: hasDetailFlag
                                ? !!response.data.test_cases_generated
                                : issue.test_cases_generated,
                            is_qa_approved: false
                        });
                    }
                });
            } catch (err) {
                // Silently fail for prefetch - don't disrupt the user experience
            }
        });

        // Wait for all prefetches to complete
        await Promise.all(prefetchPromises);
    }

    setAuthenticated(value: boolean) {
        this.isAuthenticated = value;
    }

    async generateTestPlan(baseUrl: string) {
        if (!this.selectedIssue) return;

        const issueKey = this.selectedIssue.key;
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

                // Optimistically mark test plan as generated on selectedIssue
                if (this.selectedIssue && this.selectedIssue.key === issueKey) {
                    this.selectedIssue = {
                        ...this.selectedIssue,
                        test_cases_generated: true,
                        test_case_filename: response.data?.test_case_filename ?? this.selectedIssue.test_case_filename,
                    };
                }

                // Also update the issues list so the left pane tag shows immediately
                const issueIndex = this.issues.findIndex(i => i.key === issueKey);
                if (issueIndex !== -1) {
                    this.issues[issueIndex] = {
                        ...this.issues[issueIndex],
                        test_cases_generated: true,
                        test_case_filename: response.data?.test_case_filename ?? this.issues[issueIndex].test_case_filename,
                    };
                }

                // Update cache as well
                const cached = this.issueDetailsCache.get(issueKey);
                if (cached) {
                    this.issueDetailsCache.set(issueKey, {
                        ...cached,
                        test_cases_generated: true,
                        test_case_filename: response.data?.test_case_filename ?? cached.test_case_filename,
                    });
                }
            });

            // Re-fetch issues list and issue detail so Edit picks up the correct filename
            await this.fetchIssues(true);
            await this.fetchIssueDetail(issueKey);

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
            const issue = this.issues.find(i => i.key === issueKey);
            const initialStatus = issue?.test_cases_generated ? 'completed' : 'pending';
            this.batchProcessingStatus.set(issueKey, initialStatus);
            // Auto fetch detail for the latest checked issue to show in detail view
            this.fetchIssueDetail(issueKey);
        }
    }

    selectAllIssues() {
        this.issues.forEach(issue => {
            this.selectedIssueKeys.add(issue.key);
            const initialStatus = issue.test_cases_generated ? 'completed' : 'pending';
            this.batchProcessingStatus.set(issue.key, initialStatus);
        });
        // Auto-show the first issue's details in the right pane
        if (this.issues.length > 0) {
            this.fetchIssueDetail(this.issues[0].key);
        }
    }

    clearSelection() {
        this.selectedIssueKeys.clear();
        this.batchProcessingStatus.clear();
        this.selectedIssue = null;
    }

    async processBatch(baseUrl: string) {
        this.isGeneratingPlan = true;
        this.error = null;

        const keysToProcess = Array.from(this.selectedIssueKeys).filter(key => {
            const status = this.batchProcessingStatus.get(key);
            return status !== 'completed';
        });

        // Mark all as processing immediately
        runInAction(() => {
            keysToProcess.forEach(key => {
                this.batchProcessingStatus.set(key, 'processing');
            });
        });

        // Run all generations in parallel
        const promises = keysToProcess.map(async (key) => {
            try {
                let description = '';
                const cached = this.issueDetailsCache.get(key);
                if (cached) {
                    description = cached.description;
                } else {
                    const detailResponse = await jiraApi.fetchIssueDetail(key);
                    description = detailResponse.data?.issue?.description || '';
                }

                const summary = this.issues.find(i => i.key === key)?.summary || 'No Summary';

                const genResponse = await jiraApi.generateTestPlan({
                    summary: summary,
                    user_story: description || summary,
                    base_url: baseUrl
                });

                runInAction(() => {
                    this.batchProcessingStatus.set(key, 'completed');
                    this.generatedPlans.set(key, JSON.stringify(genResponse.data, null, 2));
                    toast.success(`Test plan generated for ${key}`);

                    // Optimistic update on issues list
                    const issueIndex = this.issues.findIndex(i => i.key === key);
                    if (issueIndex !== -1) {
                        this.issues[issueIndex] = {
                            ...this.issues[issueIndex],
                            test_cases_generated: true,
                            test_case_filename: genResponse.data?.test_case_filename ?? this.issues[issueIndex].test_case_filename,
                        };
                    }

                    // Update cache
                    const cachedDetail = this.issueDetailsCache.get(key);
                    if (cachedDetail) {
                        this.issueDetailsCache.set(key, {
                            ...cachedDetail,
                            test_cases_generated: true,
                            test_case_filename: genResponse.data?.test_case_filename ?? cachedDetail.test_case_filename,
                        });
                    }

                    // Update selectedIssue if it matches
                    if (this.selectedIssue && this.selectedIssue.key === key) {
                        this.selectedIssue = {
                            ...this.selectedIssue,
                            test_cases_generated: true,
                            test_case_filename: genResponse.data?.test_case_filename ?? this.selectedIssue.test_case_filename,
                        };
                    }
                });
            } catch (err: any) {
                console.error(`Batch processing error for ${key}:`, err);
                runInAction(() => {
                    this.batchProcessingStatus.set(key, 'failed');
                    toast.error(`Failed to generate test plan for ${key}`);
                });
            }
        });

        await Promise.all(promises);

        // Re-fetch issues list so Edit picks up correct filenames
        await this.fetchIssues(true);

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
        this.selectedIssueKeys.clear();
        this.batchProcessingStatus.clear();
        this.generatedPlans.clear();
        this.issueDetailsCache.clear();
        this.issues = [];
        this.error = null;
    }
}

export const issueStore = new IssueStore();
export default issueStore;
