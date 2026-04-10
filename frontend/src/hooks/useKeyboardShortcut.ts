'use client';

import { useEffect, useCallback } from 'react';

type KeyboardShortcut = {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
};

/**
 * Hook for handling global keyboard shortcuts
 * @param shortcut - The keyboard shortcut configuration
 * @param callback - The callback to execute when the shortcut is triggered
 * @param enabled - Whether the shortcut is enabled (default: true)
 */
export function useKeyboardShortcut(
  shortcut: KeyboardShortcut,
  callback: () => void,
  enabled: boolean = true
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Check if the key matches (case-insensitive)
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();

      // Check modifier keys
      // On Mac, metaKey is Cmd; on Windows, ctrlKey is Ctrl
      // For Cmd+K (Mac) or Ctrl+K (Windows), we need flexible matching
      const isCmdOrCtrlK = shortcut.key.toLowerCase() === 'k' &&
        (shortcut.metaKey || shortcut.ctrlKey) &&
        !shortcut.shiftKey &&
        !shortcut.altKey;

      if (isCmdOrCtrlK) {
        // Special handling for Cmd+K / Ctrl+K: match either metaKey or ctrlKey
        if ((event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey) {
          event.preventDefault();
          callback();
        }
        return;
      }

      // Standard modifier matching for other shortcuts
      const metaKeyMatches = shortcut.metaKey !== undefined
        ? event.metaKey === shortcut.metaKey
        : true;
      const ctrlKeyMatches = shortcut.ctrlKey !== undefined
        ? event.ctrlKey === shortcut.ctrlKey
        : true;
      const shiftKeyMatches = shortcut.shiftKey !== undefined
        ? event.shiftKey === shortcut.shiftKey
        : true;
      const altKeyMatches = shortcut.altKey !== undefined
        ? event.altKey === shortcut.altKey
        : true;

      if (keyMatches && metaKeyMatches && ctrlKeyMatches && shiftKeyMatches && altKeyMatches) {
        event.preventDefault();
        callback();
      }
    },
    [shortcut, callback, enabled]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);
}

/**
 * Hook specifically for Cmd+K / Ctrl+K shortcut
 * @param callback - The callback to execute when Cmd+K is pressed
 * @param enabled - Whether the shortcut is enabled (default: true)
 */
export function useCmdK(callback: () => void, enabled: boolean = true) {
  useKeyboardShortcut(
    { key: 'k', metaKey: true },
    callback,
    enabled
  );
}

export default useKeyboardShortcut;