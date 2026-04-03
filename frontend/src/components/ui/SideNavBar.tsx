'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * SideNavBar - 侧边导航栏组件
 *
 * 特点:
 * - 240px 宽度
 * - 层次分明的背景色
 * - 无边框分隔
 *
 * 用途:
 * - 编辑器左侧导航
 */

export interface NavItem {
  key: string;
  label: string;
  icon: string;
  active?: boolean;
  children?: NavItem[];
}

export interface SideNavBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 项目名称 */
  projectName?: string;
  /** 项目描述 */
  projectDescription?: string;
  /** 导航项列表 */
  items: NavItem[];
  /** 子项列表 (如章节) */
  subItems?: { key: string; label: string; icon?: string; active?: boolean }[];
  /** 子项标题 */
  subItemsTitle?: string;
  /** 导航点击回调 */
  onNavClick: (key: string) => void;
}

export const SideNavBar = React.forwardRef<HTMLDivElement, SideNavBarProps>(
  (
    {
      className,
      projectName = 'NovelCraft',
      projectDescription,
      items,
      subItems,
      subItemsTitle = 'Chapters',
      onNavClick,
      ...props
    },
    ref
  ) => {
    return (
      <aside
        ref={ref}
        className={cn(
          'fixed left-0 top-0 h-screen w-[240px]',
          'bg-surface-container-low flex flex-col py-6 px-4 gap-6',
          'overflow-y-auto',
          className
        )}
        {...props}
      >
        {/* Logo / Project Name */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_stories
            </span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-on-surface font-headline leading-tight">
              {projectName}
            </h1>
            {projectDescription && (
              <p className="text-[10px] text-on-surface-variant tracking-widest uppercase">
                {projectDescription}
              </p>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex flex-col gap-1">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavClick(item.key)}
              className={cn(
                'flex items-center gap-3 px-3 py-2',
                'transition-all duration-200',
                'font-headline text-xs tracking-wide uppercase rounded-lg',
                item.active
                  ? 'text-primary font-bold bg-surface-container-lowest'
                  : 'text-on-surface-variant hover:bg-surface-container'
              )}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: item.active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Sub Items (Chapters) */}
        {subItems && subItems.length > 0 && (
          <div className="mt-2">
            <p className="text-[10px] font-bold text-on-surface-variant px-3 mb-2 tracking-widest uppercase">
              {subItemsTitle}
            </p>
            <div className="space-y-1">
              {subItems.map((item) => (
                <div
                  key={item.key}
                  onClick={() => onNavClick(item.key)}
                  className={cn(
                    'px-3 py-1.5 text-sm cursor-pointer rounded-md transition-colors',
                    'flex items-center gap-2',
                    item.active
                      ? 'text-primary font-medium bg-surface-container-lowest border-l-2 border-primary'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  )}
                >
                  <span className="material-symbols-outlined text-xs">
                    {item.icon || 'description'}
                  </span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-outline-variant/10">
          <button
            className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-all font-headline text-xs tracking-wide uppercase"
          >
            <span className="material-symbols-outlined">archive</span>
            <span>Archive</span>
          </button>
          <button
            className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-all font-headline text-xs tracking-wide uppercase"
          >
            <span className="material-symbols-outlined">delete</span>
            <span>Trash</span>
          </button>
        </div>
      </aside>
    );
  }
);

SideNavBar.displayName = 'SideNavBar';