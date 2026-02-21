import { makeAutoObservable } from 'mobx';

const AUTH_STORAGE_KEY = 'autosprint.authenticated';

class SessionStore {
    isAuthenticated = false;
    authChecked = false;

    constructor() {
        makeAutoObservable(this);
        this.hydrate();
    }

    private hydrate() {
        try {
            this.isAuthenticated = localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
        } catch {
            this.isAuthenticated = false;
        } finally {
            this.authChecked = true;
        }
    }

    setAuthenticated(value: boolean) {
        this.isAuthenticated = value;
        this.authChecked = true;
        try {
            localStorage.setItem(AUTH_STORAGE_KEY, value ? 'true' : 'false');
        } catch {
            // Ignore storage failures and keep in-memory state.
        }
    }

    signOut() {
        this.setAuthenticated(false);
    }
}

export const sessionStore = new SessionStore();
export default sessionStore;
