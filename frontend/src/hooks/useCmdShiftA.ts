'use client';

import useKeyboardShortcut from './useKeyboardShortcut';

/**
 * Cmd+Shift+A / Ctrl+Shift+A 快捷键 hook
 * 用于切换 AI 辅助面板
 * 支持跨平台：Mac 使用 Cmd+Shift+A，Windows/Linux 使用 Ctrl+Shift+A
 */
export function useCmdShiftA(callback: () => void, enabled: boolean = true) {
  useKeyboardShortcut(
    { key: 'a', metaKey: true, shiftKey: true },
    callback,
    enabled
  );
  // Also support Ctrl+Shift+A for Windows/Linux
  useKeyboardShortcut(
    { key: 'a', ctrlKey: true, shiftKey: true },
    callback,
    enabled
  );
}

export default useCmdShiftA;