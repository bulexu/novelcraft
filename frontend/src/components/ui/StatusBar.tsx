'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * StatusBar - 底部状态栏组件
 *
 * 特点:
 * - 毛玻璃背景
 * - 显示字数、AI 快捷键、保存状态
 *
 * 用途:
 * - 编辑器底部状态栏
 */

export interface StatusBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 字数 */
  wordCount?: number;
  /** AI 快捷键提示 */
  aiShortcut?: string;
  /** 保存状态 */
  saved?: boolean;
  /** 保存时间 */
  savedAt?: string;
  /** 是否暗色模式 */
  dark?: boolean;
}

export const StatusBar = React.forwardRef<HTMLDivElement, StatusBarProps>(
  (
    {
      className,
      wordCount = 0,
      aiShortcut = 'Cmd+Shift+A',
      saved = true,
      savedAt,
      dark = false,
      ...props
    },
    ref
  ) => {
    return (
      <footer
        ref={ref}
        className={cn(
          'fixed bottom-0 left-0 w-full z-50',
          'flex justify-around items-center px-6 py-3',
          dark
            ? 'bg-slate-900/80 text-slate-300 border-t border-slate-200/10'
            : 'bg-surface-container/80 backdrop-blur-xl border-t border-outline-variant/10',
          className
        )}
        {...props}
      >
        {/* Word Count */}
        <div
          className={cn(
            'flex flex-col items-center justify-center cursor-pointer',
            'transition-colors duration-200 scale-95',
            dark ? 'text-indigo-400' : 'text-primary'
          )}
        >
          <span className="material-symbols-outlined mb-1 text-[20px]">edit_note</span>
          <span className="font-headline text-[10px] uppercase tracking-widest font-medium">
            {wordCount.toLocaleString()} words
          </span>
        </div>

        {/* AI Shortcut */}
        <div
          className={cn(
            'flex flex-col items-center justify-center cursor-pointer',
            'transition-colors duration-200 scale-95',
            dark ? 'text-slate-400' : 'text-on-surface-variant'
          )}
        >
          <span className="material-symbols-outlined mb-1 text-[20px]">keyboard_command_key</span>
          <span className="font-headline text-[10px] uppercase tracking-widest font-medium">
            {aiShortcut} 呼出AI
          </span>
        </div>

        {/* Save Status */}
        <div
          className={cn(
            'flex flex-col items-center justify-center cursor-pointer',
            'transition-colors duration-200 scale-95',
            dark ? 'text-slate-400' : 'text-on-surface-variant'
          )}
        >
          <span className="material-symbols-outlined mb-1 text-[20px]">
            {saved ? 'cloud_done' : 'cloud_upload'}
          </span>
          <span className="font-headline text-[10px] uppercase tracking-widest font-medium">
            {saved ? (savedAt || 'Auto-saved') : 'Saving...'}
          </span>
        </div>
      </footer>
    );
  }
);

StatusBar.displayName = 'StatusBar';