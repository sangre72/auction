'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  SessionTimeoutConfig,
  SessionTimeoutState,
  UseSessionTimeoutOptions,
  UseSessionTimeoutReturn,
} from '../types/session';

const DEFAULT_INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15분
const DEFAULT_WARNING_TIMEOUT = 3 * 60 * 1000; // 3분
const DEFAULT_ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'click',
  'keydown',
  'scroll',
  'touchstart',
];

export function useSessionTimeout({
  config: userConfig,
  onExtend,
  onLogout,
  isAuthenticated,
}: UseSessionTimeoutOptions): UseSessionTimeoutReturn {
  const inactivityTimeout = userConfig?.inactivityTimeout ?? DEFAULT_INACTIVITY_TIMEOUT;
  const warningTimeout = userConfig?.warningTimeout ?? DEFAULT_WARNING_TIMEOUT;
  const activityEvents = userConfig?.activityEvents ?? DEFAULT_ACTIVITY_EVENTS;

  const [state, setState] = useState<SessionTimeoutState>({
    isWarningVisible: false,
    remainingSeconds: Math.floor(warningTimeout / 1000),
    isLogoutCompleteVisible: false,
  });

  // Refs for timers
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mouseMoveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs for callbacks (to avoid stale closures)
  const onLogoutRef = useRef(onLogout);
  const onExtendRef = useRef(onExtend);

  useEffect(() => {
    onLogoutRef.current = onLogout;
  }, [onLogout]);

  useEffect(() => {
    onExtendRef.current = onExtend;
  }, [onExtend]);

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (mouseMoveTimeoutRef.current) {
      clearTimeout(mouseMoveTimeoutRef.current);
      mouseMoveTimeoutRef.current = null;
    }
  }, []);

  // Auto logout handler
  const handleAutoLogout = useCallback(async () => {
    clearAllTimers();
    await onLogoutRef.current();
    setState({
      isWarningVisible: false,
      remainingSeconds: Math.floor(warningTimeout / 1000),
      isLogoutCompleteVisible: true,
    });
  }, [clearAllTimers, warningTimeout]);

  // Show warning and start countdown
  const showWarning = useCallback(() => {
    setState((prev) => ({ ...prev, isWarningVisible: true }));

    let remaining = Math.floor(warningTimeout / 1000);

    countdownTimerRef.current = setInterval(() => {
      remaining -= 1;
      setState((prev) => ({ ...prev, remainingSeconds: remaining }));

      if (remaining <= 0) {
        handleAutoLogout();
      }
    }, 1000);
  }, [warningTimeout, handleAutoLogout]);

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    clearAllTimers();

    setState((prev) => ({
      ...prev,
      isWarningVisible: false,
      remainingSeconds: Math.floor(warningTimeout / 1000),
    }));

    inactivityTimerRef.current = setTimeout(() => {
      showWarning();
    }, inactivityTimeout);
  }, [clearAllTimers, inactivityTimeout, warningTimeout, showWarning]);

  // Extend session
  const extendSession = useCallback(() => {
    resetInactivityTimer();
    onExtendRef.current?.();
  }, [resetInactivityTimer]);

  // Immediate logout
  const logout = useCallback(async () => {
    clearAllTimers();
    await onLogoutRef.current();
    setState({
      isWarningVisible: false,
      remainingSeconds: Math.floor(warningTimeout / 1000),
      isLogoutCompleteVisible: false,
    });
  }, [clearAllTimers, warningTimeout]);

  // Dismiss logout complete modal
  const dismissLogoutComplete = useCallback(() => {
    setState((prev) => ({ ...prev, isLogoutCompleteVisible: false }));
  }, []);

  // Activity event handlers
  useEffect(() => {
    if (!isAuthenticated) {
      clearAllTimers();
      setState({
        isWarningVisible: false,
        remainingSeconds: Math.floor(warningTimeout / 1000),
        isLogoutCompleteVisible: false,
      });
      return;
    }

    let isWarningVisible = false;

    // Update warning visibility tracker
    const updateWarningState = () => {
      setState((prev) => {
        isWarningVisible = prev.isWarningVisible;
        return prev;
      });
    };

    // Activity handler
    const handleActivity = () => {
      updateWarningState();
      // Ignore activity when warning is visible
      if (isWarningVisible) return;

      // Reset timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }

      setState((prev) => ({
        ...prev,
        isWarningVisible: false,
        remainingSeconds: Math.floor(warningTimeout / 1000),
      }));

      inactivityTimerRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, isWarningVisible: true }));

        let remaining = Math.floor(warningTimeout / 1000);

        countdownTimerRef.current = setInterval(() => {
          remaining -= 1;
          setState((prev) => ({ ...prev, remainingSeconds: remaining }));

          if (remaining <= 0) {
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
            if (mouseMoveTimeoutRef.current) clearTimeout(mouseMoveTimeoutRef.current);

            onLogoutRef.current().then(() => {
              setState({
                isWarningVisible: false,
                remainingSeconds: Math.floor(warningTimeout / 1000),
                isLogoutCompleteVisible: true,
              });
            });
          }
        }, 1000);
      }, inactivityTimeout);
    };

    // Throttled mousemove handler
    const handleMouseMove = () => {
      if (mouseMoveTimeoutRef.current) return;
      mouseMoveTimeoutRef.current = setTimeout(() => {
        handleActivity();
        mouseMoveTimeoutRef.current = null;
      }, 1000);
    };

    // Add event listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });
    window.addEventListener('mousemove', handleMouseMove);

    // Start initial timer
    handleActivity();

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      window.removeEventListener('mousemove', handleMouseMove);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (mouseMoveTimeoutRef.current) clearTimeout(mouseMoveTimeoutRef.current);
    };
  }, [isAuthenticated, inactivityTimeout, warningTimeout]); // activityEvents removed - use default

  return {
    ...state,
    extendSession,
    logout,
    dismissLogoutComplete,
  };
}
