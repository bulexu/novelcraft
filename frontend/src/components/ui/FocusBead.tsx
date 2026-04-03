'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * FocusBead - 聚焦点指示器
 *
 * 特点:
 * - 小圆点标记当前分析段落
 * - 支持动画效果
 * - 可配置可见性
 *
 * 用途:
 * - 标记 AI 正在分析的段落
 * - 指示当前位置
 */

export interface FocusBeadProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 是否可见 */
  visible?: boolean;
  /** 是否闪烁 */
  pulse?: boolean;
  /** 颜色变体 */
  variant?: 'primary' | 'secondary' | 'tertiary';
  /** 大小 */
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  tertiary: 'bg-tertiary',
};

const sizeStyles = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-3 h-3',
};

export const FocusBead = React.forwardRef<HTMLSpanElement, FocusBeadProps>(
  (
    {
      className,
      visible = true,
      pulse = false,
      variant = 'primary',
      size = 'md',
      ...props
    },
    ref
  ) => {
    if (!visible) return null;

    return (
      <span
        ref={ref}
        className={cn(
          'rounded-full',
          variantStyles[variant],
          sizeStyles[size],
          pulse && 'animate-pulse',
          className
        )}
        {...props}
      />
    );
  }
);

FocusBead.displayName = 'FocusBead';

/**
 * 段落包装器 - 带 FocusBead 的段落
 */
export interface FocusParagraphProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  /** 是否聚焦 */
  focused?: boolean;
  /** 是否显示 hover 效果 */
  showHover?: boolean;
}

export const FocusParagraph = React.forwardRef<
  HTMLParagraphElement,
  FocusParagraphProps
>(({ className, children, focused = false, showHover = true, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('relative group', className)}
      {...props}
    >
      <FocusBead
        className={cn(
          'absolute -left-6 top-2',
          showHover ? 'opacity-0 group-hover:opacity-100' : '',
          focused && 'opacity-100'
        )}
        pulse={focused}
      />
      {children}
    </p>
  );
});

FocusParagraph.displayName = 'FocusParagraph';