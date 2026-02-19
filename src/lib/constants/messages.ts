/**
 * Centralized user-facing messages for the application.
 * All error messages, toast messages, success messages, loading text,
 * validation messages, and placeholder text should be defined here.
 */

// ─── Error Messages ──────────────────────────────────────────────────
export const ERRORS = {
    LOGIN_REQUIRED: 'Please log in to Jira',
    CONNECTION_ERROR: 'Connection Error. Ensure the backend is accessible.',
    INVALID_RESPONSE: 'Invalid response format from server',
    FETCH_ISSUE_DETAILS: 'Failed to fetch issue details',
    GENERATE_TEST_PLAN: 'Failed to generate test plan',
    GENERATE_TEST_PLAN_FOR: (key: string) => `Failed to generate test plan for ${key}`,
    UPLOAD_FILES: 'Failed to upload files',
    LOAD_TEST_PLAN: 'Failed to load test plan',
    SAVE_TEST_PLAN: 'Failed to save test plan',
    PUBLISH_TO: (tool: string) => `Failed to publish to ${tool}`,
    DISCONNECT: 'Failed to disconnect',
    PDF_ONLY: 'Only PDF files are allowed',
    MAX_FILES: (max: number) => `You can upload a maximum of ${max} files`,
};

// ─── Success Messages ────────────────────────────────────────────────
export const SUCCESS = {
    TEST_PLAN_GENERATED: 'Test plan generated successfully!',
    TEST_PLAN_GENERATED_FOR: (key: string) => `Test plan generated for ${key}`,
    TEST_PLAN_SAVED: 'Test plan saved successfully',
    FILES_UPLOADED: (count: number) => `${count} file${count > 1 ? 's' : ''} uploaded successfully`,
    PUBLISHED_TO: (tool: string) => `Test plan published to ${tool} successfully`,
};

// ─── Loading & Processing States ─────────────────────────────────────
export const LOADING = {
    DEFAULT: 'Loading...',
    TEST_PLAN_CONTENT: 'Loading test plan content...',
    WAITING_AUTH: 'Waiting for Jira Authentication...',
    COMPLETE_LOGIN: 'Please complete the login in the popup window.',
    DISCONNECTING: 'Disconnecting...',
    PLEASE_WAIT_LOGOUT: 'Please wait while we log you out.',
    GENERATING: 'Generating...',
    UPLOADING: (percent: number) => `Uploading... ${percent}%`,
    UPLOADING_SHORT: 'Uploading...',
    SAVING: 'Saving...',
    PUBLISHING: 'Publishing...',
};

// ─── Fallback / Default Text ─────────────────────────────────────────
export const DEFAULTS = {
    NO_SUMMARY: 'No Summary',
    NO_DESCRIPTION: 'No description available for this issue.',
    NO_DESCRIPTION_SHORT: 'No description',
    NO_DESCRIPTION_DISPLAY: 'No description available.',
    NOT_APPLICABLE: 'N/A',
};

// ─── Button Labels ───────────────────────────────────────────────────
export const BUTTONS = {
    CANCEL: 'Cancel',
    CLOSE: 'Close',
    SAVE: 'Save',
    VIEW: 'View',
    EDIT: 'Edit',
    GENERATE: 'Generate',
    GENERATE_ALL: (count: number) => `Generate All (${count})`,
    SKIP_GENERATE: 'Skip & Generate',
    UPLOAD_GENERATE: 'Upload & Generate',
    PUBLISH_TO: 'Publish To',
    CONFIRM_PUBLISH: 'Confirm & Publish',
    DISCONNECT: 'Disconnect',
    LAUNCH: (name: string) => `Launch ${name}`,
};

// ─── Dialog & Section Headers ────────────────────────────────────────
export const HEADERS = {
    TEST_CASES: (title?: string) => title ? `Test Cases - ${title}` : 'Test Cases',
    UPLOAD_DOCUMENTS: 'Upload Reference Documents',
    UPLOAD_SUBTITLE: 'Optionally upload PDF files to enhance test plan generation',
    PUBLISH_TO: (tool: string) => `Publish to ${tool}`,
    QA_APPROVED: 'QA APPROVED',
    USER_STORIES: (count: number) => `User Stories (${count})`,
    DESCRIPTION: 'Description',
    FILE: 'File',
    SELECT_ALL: 'ALL',
};

// ─── Placeholder & Info Text ─────────────────────────────────────────
export const PLACEHOLDERS = {
    SELECT_ISSUES: 'Select one or more issues to view details or generate plans',
    DRAG_DROP: 'Drag & drop PDF files here',
    OR_BROWSE: 'or click to browse',
    SEARCH_PROVIDERS: 'Search providers...',
    CHOOSE_PROVIDER: 'Choose a provider...',
    NO_PROVIDERS: 'No providers found',
    NO_STORIES: 'No stories found.',
    TEST_PLAN_READY: '✓ Test Plan Ready',
    FILES_SELECTED: (count: number) => `${count} file${count > 1 ? 's' : ''} selected`,
};

// ─── Confirmation Messages ───────────────────────────────────────────
export const CONFIRM = {
    PUBLISH: (issueKey: string, tool: string) =>
        `Are you sure you want to publish the test plan for ${issueKey} to ${tool}?`,
};

// ─── Auth & Branding ─────────────────────────────────────────────────
export const BRANDING = {
    APP_NAME: 'AutoSprint AI',
    WELCOME: 'Welcome Back',
    AUTH_PROVIDER_LABEL: 'Authentication Provider',
    AUTH_SUBTITLE: 'Select your authentication provider',
    TERMS: 'Terms of Service',
    PRIVACY: 'Privacy Policy',
    COPYRIGHT: '© AutoSprint AI, BSC Solutions India Pvt Ltd © 2026',
};

// ─── Story Label Helpers ─────────────────────────────────────────────
export const LABELS = {
    STORIES_SELECTED: (count: number) => `${count} ${count === 1 ? 'Story' : 'Stories'} Selected`,
    TO_GENERATE: (count: number) => `${count} to generate`,
    READY_TO_VIEW: (count: number) => `${count} ready to view`,
};
