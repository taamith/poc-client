import { makeAutoObservable } from 'mobx';

const AUTH_STORAGE_KEY = 'autosprint.authenticated';
const USER_STORAGE_KEY = 'autosprint.user';

export interface SessionUser {
    username: string;
    name: string;
    employeeId: string;
    email: string;
    phone: string;
}

class SessionStore {
    isAuthenticated = false;
    authChecked = false;
    user: SessionUser | null = null;

    constructor() {
        makeAutoObservable(this);
        this.hydrate();
    }

    private hydrate() {
        try {
            this.isAuthenticated = localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
            const stored = localStorage.getItem(USER_STORAGE_KEY);
            this.user = stored ? JSON.parse(stored) : null;
        } catch {
            this.isAuthenticated = false;
            this.user = null;
        } finally {
            this.authChecked = true;
        }
    }

    setAuthenticated(value: boolean, user?: SessionUser) {
        this.isAuthenticated = value;
        this.authChecked = true;
        this.user = user ?? null;
        try {
            localStorage.setItem(AUTH_STORAGE_KEY, value ? 'true' : 'false');
            if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
            else localStorage.removeItem(USER_STORAGE_KEY);
        } catch {
            // Ignore storage failures
        }
    }

    updateUser(updates: Partial<SessionUser>) {
        if (!this.user) return;
        this.user = { ...this.user, ...updates };
        try {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(this.user));
        } catch {
            // Ignore storage failures
        }
    }

    signOut() {
        this.setAuthenticated(false);
        try { localStorage.removeItem(USER_STORAGE_KEY); } catch { /* ignore */ }
    }
}

export const sessionStore = new SessionStore();
export default sessionStore;
