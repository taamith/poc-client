import { makeAutoObservable } from 'mobx';

const JIRA_STORAGE_KEY = 'autosprint.jira.connected';

class IntegrationStore {
    jiraConnected = false;

    constructor() {
        makeAutoObservable(this);
        this.hydrate();
    }

    private hydrate() {
        try {
            this.jiraConnected = localStorage.getItem(JIRA_STORAGE_KEY) === 'true';
        } catch {
            this.jiraConnected = false;
        }
    }

    setJiraConnected(value: boolean) {
        this.jiraConnected = value;
        try {
            localStorage.setItem(JIRA_STORAGE_KEY, value ? 'true' : 'false');
        } catch {
            // Ignore storage failures and keep in-memory state.
        }
    }

    clearConnection() {
        this.setJiraConnected(false);
    }
}

export const integrationStore = new IntegrationStore();
export default integrationStore;
