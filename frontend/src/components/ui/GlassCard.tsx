'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * GlassCard - 玻璃态卡片组件
 *
 * 特点:
 * - 背景模糊效果 (24px blur)
 * - 半透明背景
 * - 无边框设计
 * - 环境阴影
 *
 * 用途:
 * - AI 建议气泡
 * - 浮动面板
 * - 弹出卡片
 */

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 子元素 */
  children: React.ReactNode;
  /** 是否显示环境阴影 */
  shadow?: boolean;
  /** 卡片变体 */
  variant?: 'default' | 'elevated' | 'subtle';
  /** 内边距大小 */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles = {
  default: 'bg-surface-container-low/80 backdrop-blur-xl',
  elevated: 'bg-surface-container-lowest/90 backdrop-blur-2xl',
  subtle: 'bg-surface-container/60 backdrop-blur-lg',
};

const paddingStyles = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      children,
      shadow = true,
      variant = 'default',
      padding = 'md',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'rounded-xl border-none',
          // Variant
          variantStyles[variant],
          // Padding
          paddingStyles[padding],
          // Shadow
          shadow && 'shadow-[0_12px_40px_rgba(27,27,35,0.06)]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';