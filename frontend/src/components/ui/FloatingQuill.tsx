'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * FloatingQuill - 浮动创作按钮 (FAB)
 *
 * 特点:
 * - 玻璃态背景
 * - 渐变效果
 * - 脉冲动画
 *
 * 用途:
 * - 新建章节
 * - 快速创作入口
 */

export interface FloatingQuillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 图标 */
  icon?: string;
  /** 点击回调 */
  onClick?: () => void;
  /** 位置 */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
}

const positionStyles = {
  'bottom-right': 'bottom-24 right-10',
  'bottom-left': 'bottom-24 left-10',
  'top-right': 'top-24 right-10',
  'top-left': 'top-24 left-10',
};

const sizeStyles = {
  sm: 'w-12 h-12',
  md: 'w-14 h-14',
  lg: 'w-16 h-16',
};

export const FloatingQuill = React.forwardRef<HTMLButtonElement, FloatingQuillProps>(
  (
    {
      className,
      icon = 'edit',
      onClick,
      position = 'bottom-right',
      size = 'md',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={cn(
          'fixed z-50',
          'rounded-full flex items-center justify-center',
          'bg-gradient-to-br from-primary-container to-primary',
          'text-on-primary',
          'shadow-[0_12px_40px_rgba(70,72,212,0.3)]',
          'transition-transform hover:scale-110 active:scale-95',
          'duration-200',
          positionStyles[position],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </button>
    );
  }
);

FloatingQuill.displayName = 'FloatingQuill';