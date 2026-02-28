import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionStore } from '../app/store/sessionStore';

/** Total idle time before logout (ms). */
const IDLE_MS = 30 * 60 * 1000; // 30 minutes

/** How long before logout to show the warning dialog (ms). */
const WARN_MS = 60 * 1000; // 60 seconds

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'] as const;

interface IdleTimeoutState {
    showWarning: boolean;
    remainingSeconds: number;
    /** Call this from the "Stay Logged In" button to dismiss the warning and reset the timer. */
    stayLoggedIn: () => void;
}

export function useIdleTimeout(): IdleTimeoutState {
    const navigate = useNavigate();
    const [showWarning, setShowWarning] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState(WARN_MS / 1000);

    // Use a ref so event handlers always see the latest value without re-subscribing.
    const isWarningSho = useRef(false);
    const warnTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const logoutTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const countdownInterval = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
    const navigateRef = useRef(navigate);
    navigateRef.current = navigate;

    const clearAllTimers = useCallback(() => {
        clearTimeout(warnTimer.current);
        clearTimeout(logoutTimer.current);
        clearInterval(countdownInterval.current);
    }, []);

    const doLogout = useCallback(() => {
        clearAllTimers();
        isWarningSho.current = false;
        setShowWarning(false);
        sessionStore.signOut();
        navigateRef.current('/login', { replace: true });
    }, [clearAllTimers]);

    const reset = useCallback(() => {
        clearAllTimers();
        isWarningSho.current = false;
        setShowWarning(false);
        setRemainingSeconds(WARN_MS / 1000);

        // After (IDLE_MS - WARN_MS) of inactivity, show the warning.
        warnTimer.current = setTimeout(() => {
            isWarningSho.current = true;
            setShowWarning(true);

            let secs = WARN_MS / 1000;
            setRemainingSeconds(secs);

            countdownInterval.current = setInterval(() => {
                secs -= 1;
                setRemainingSeconds(secs);
                if (secs <= 0) clearInterval(countdownInterval.current);
            }, 1000);

            // After the full warning period, log out.
            logoutTimer.current = setTimeout(doLogout, WARN_MS);
        }, IDLE_MS - WARN_MS);
    }, [clearAllTimers, doLogout]);

    useEffect(() => {
        reset();

        // Only reset the idle timer when the warning is NOT yet visible.
        // Once the warning is shown the user must click "Stay Logged In".
        const handleActivity = () => {
            if (!isWarningSho.current) reset();
        };

        ACTIVITY_EVENTS.forEach(e =>
            window.addEventListener(e, handleActivity, { passive: true })
        );

        return () => {
            clearAllTimers();
            ACTIVITY_EVENTS.forEach(e =>
                window.removeEventListener(e, handleActivity)
            );
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentionally run once; reset is stable

    return { showWarning, remainingSeconds, stayLoggedIn: reset };
}
