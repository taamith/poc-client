import { makeAutoObservable, runInAction } from 'mobx';
import { jiraApi } from '../../lib/api/jira';
import { toast } from 'sonner';
import { ERRORS, SUCCESS, LOADING, DEFAULTS } from '../../lib/constants/messages';
import { getApiErrorMessage, getApiStatusCode } from '../../lib/api/errors';

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
    issueDetailsCache: Map<string, IssueDetail> = new Map();
    batchProcessingStatus: Map<string, 'pending' | 'processing' | 'completed' | 'failed'> = new Map();
    generatedPlans: Map<string, string> = new Map();
    loading: boolean = false;
    error: string | null = null;
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

            const nestedIssues = response.data?.issues?.issues;
            const directIssues = response.data?.issues;

            const mapIssue = (i: any): JiraIssue => ({
                key: i.key,
                summary: i.fields?.summary || i.summary || i.name || DEFAULTS.NO_SUMMARY,
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
                    if (!silent) this.error = response.data.error;
                    this.issues = [];
                } else {
                    console.error('API did not return an array of issues:', response.data);
                    this.issues = [];
                    if (!silent) this.error = ERRORS.INVALID_RESPONSE;
                }

                if (!silent) this.loading = false;

                if (this.issues.length > 0) {
                    this.error = null;
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
                if (!silent) {
                    this.loading = false;
                    if (getApiStatusCode(err) === 401) {
                        this.error = ERRORS.LOGIN_REQUIRED;
                        toast.error(ERRORS.LOGIN_REQUIRED);
                    } else {
                        this.error = ERRORS.CONNECTION_ERROR;
                        toast.error(ERRORS.CONNECTION_ERROR);
                    }
                }
            });
            return false;
        }
    }

    async fetchIssueDetail(issueKey: string) {
        this.loading = true;

        const cached = this.issueDetailsCache.get(issueKey);
        if (cached) {
            this.selectedIssue = cached;
        } else {
            const listIssue = this.issues.find(i => i.key === issueKey);
            if (listIssue) {
                this.selectedIssue = {
                    ...listIssue,
                    description: LOADING.DEFAULT,
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
                        summary: detail.summary || DEFAULTS.NO_SUMMARY,
                        description: detail.description || DEFAULTS.NO_DESCRIPTION,
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
                        summary: response.data.summary || DEFAULTS.NO_SUMMARY,
                        description: response.data.description || DEFAULTS.NO_DESCRIPTION_SHORT,
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
                const apiError = getApiErrorMessage(err, ERRORS.FETCH_ISSUE_DETAILS);
                this.error = apiError;
                this.loading = false;
                toast.error(apiError);
            });
        }
    }

    async prefetchTestPlanStatus() {
        const prefetchPromises = this.issues.map(async (issue) => {
            try {
                const response = await jiraApi.fetchIssueDetail(issue.key);

                runInAction(() => {
                    const issueIndex = this.issues.findIndex(i => i.key === issue.key);
                    if (issueIndex !== -1) {
                        const existing = this.issues[issueIndex];
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

                    const detail = response.data?.issue;
                    if (detail) {
                        const hasDetailFlag = response.data.test_cases_generated !== undefined;
                        this.issueDetailsCache.set(issue.key, {
                            key: issue.key,
                            summary: detail.summary || DEFAULTS.NO_SUMMARY,
                            description: detail.description || DEFAULTS.NO_DESCRIPTION_SHORT,
                            test_case_filename: response.data.test_case_filename ?? issue.test_case_filename,
                            test_cases_generated: hasDetailFlag
                                ? !!response.data.test_cases_generated
                                : issue.test_cases_generated,
                            is_qa_approved: false
                        });
                    }
                });
            } catch (err) {
                // Silently fail for prefetch
            }
        });

        await Promise.all(prefetchPromises);
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
                this.generationMessage = response.data?.message || SUCCESS.TEST_PLAN_GENERATED;
                toast.success(this.generationMessage);

                if (this.selectedIssue && this.selectedIssue.key === issueKey) {
                    this.selectedIssue = {
                        ...this.selectedIssue,
                        test_cases_generated: true,
                        test_case_filename: response.data?.test_case_filename ?? this.selectedIssue.test_case_filename,
                    };
                }

                const issueIndex = this.issues.findIndex(i => i.key === issueKey);
                if (issueIndex !== -1) {
                    this.issues[issueIndex] = {
                        ...this.issues[issueIndex],
                        test_cases_generated: true,
                        test_case_filename: response.data?.test_case_filename ?? this.issues[issueIndex].test_case_filename,
                    };
                }

                const cached = this.issueDetailsCache.get(issueKey);
                if (cached) {
                    this.issueDetailsCache.set(issueKey, {
                        ...cached,
                        test_cases_generated: true,
                        test_case_filename: response.data?.test_case_filename ?? cached.test_case_filename,
                    });
                }
            });

            await this.fetchIssues(true);
            await this.fetchIssueDetail(issueKey);

            return response.data;
        } catch (err: any) {
            console.error('Generate test plan error:', err);
            runInAction(() => {
                this.isGeneratingPlan = false;
                const apiError = getApiErrorMessage(err, ERRORS.GENERATE_TEST_PLAN);
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
            if (this.selectedIssueKeys.size === 0) {
                this.selectedIssue = null;
            } else if (this.selectedIssue?.key === issueKey) {
                const nextKey = Array.from(this.selectedIssueKeys)[0];
                this.fetchIssueDetail(nextKey);
            }
        } else {
            this.selectedIssueKeys.add(issueKey);
            const issue = this.issues.find(i => i.key === issueKey);
            const initialStatus = issue?.test_cases_generated ? 'completed' : 'pending';
            this.batchProcessingStatus.set(issueKey, initialStatus);
            this.fetchIssueDetail(issueKey);
        }
    }

    selectAllIssues() {
        this.issues.forEach(issue => {
            this.selectedIssueKeys.add(issue.key);
            const initialStatus = issue.test_cases_generated ? 'completed' : 'pending';
            this.batchProcessingStatus.set(issue.key, initialStatus);
        });
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

        runInAction(() => {
            keysToProcess.forEach(key => {
                this.batchProcessingStatus.set(key, 'processing');
            });
        });

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

                const summary = this.issues.find(i => i.key === key)?.summary || DEFAULTS.NO_SUMMARY;

                const genResponse = await jiraApi.generateTestPlan({
                    summary: summary,
                    user_story: description || summary,
                    base_url: baseUrl
                });

                runInAction(() => {
                    this.batchProcessingStatus.set(key, 'completed');
                    this.generatedPlans.set(key, JSON.stringify(genResponse.data, null, 2));
                    toast.success(SUCCESS.TEST_PLAN_GENERATED_FOR(key));

                    const issueIndex = this.issues.findIndex(i => i.key === key);
                    if (issueIndex !== -1) {
                        this.issues[issueIndex] = {
                            ...this.issues[issueIndex],
                            test_cases_generated: true,
                            test_case_filename: genResponse.data?.test_case_filename ?? this.issues[issueIndex].test_case_filename,
                        };
                    }

                    const cachedDetail = this.issueDetailsCache.get(key);
                    if (cachedDetail) {
                        this.issueDetailsCache.set(key, {
                            ...cachedDetail,
                            test_cases_generated: true,
                            test_case_filename: genResponse.data?.test_case_filename ?? cachedDetail.test_case_filename,
                        });
                    }

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
                    toast.error(ERRORS.GENERATE_TEST_PLAN_FOR(key));
                });
            }
        });

        await Promise.all(promises);
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
