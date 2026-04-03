'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * GradientButton - 渐变按钮组件
 *
 * 特点:
 * - 从 primary 到 primary-container 的渐变
 * - 135度角度
 * - 无边框
 * - 支持图标
 *
 * 用途:
 * - 主要操作按钮
 * - AI 生成按钮
 * - 提交按钮
 */

export interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮文本 */
  children?: React.ReactNode;
  /** 左侧图标 */
  icon?: React.ReactNode;
  /** 右侧图标 */
  iconRight?: React.ReactNode;
  /** 按钮大小 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否禁用 */
  disabled?: boolean;
  /** 加载状态 */
  loading?: boolean;
  /** 按钮形状 */
  shape?: 'default' | 'round' | 'circle';
  /** 是否占满宽度 */
  block?: boolean;
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const circleSizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

export const GradientButton = React.forwardRef<
  HTMLButtonElement,
  GradientButtonProps
>(
  (
    {
      className,
      children,
      icon,
      iconRight,
      size = 'md',
      disabled = false,
      loading = false,
      shape = 'default',
      block = false,
      ...props
    },
    ref
  ) => {
    const isCircle = shape === 'circle';
    const isRound = shape === 'round';

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2',
          'font-medium transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Gradient
          'bg-gradient-to-br from-primary to-primary-container',
          'hover:from-primary-container hover:to-primary',
          'text-on-primary',
          // Shadow
          'shadow-[0_4px_12px_rgba(70,72,212,0.3)]',
          'hover:shadow-[0_6px_20px_rgba(70,72,212,0.4)]',
          // Active state
          'active:scale-95',
          // Shape
          isCircle && 'rounded-full',
          isRound && 'rounded-full',
          !isCircle && !isRound && 'rounded-lg',
          // Size
          isCircle ? circleSizes[size] : sizeStyles[size],
          // Block
          block && 'w-full',
          className
        )}
        {...props}
      >
        {loading && (
          <span className="material-symbols-outlined animate-spin text-sm">
            progress_activity
          </span>
        )}
        {!loading && icon && <span className="flex-shrink-0">{icon}</span>}
        {!isCircle && children}
        {!loading && iconRight && <span className="flex-shrink-0">{iconRight}</span>}
      </button>
    );
  }
);

GradientButton.displayName = 'GradientButton';