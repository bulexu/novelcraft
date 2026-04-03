'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * IconButton - 图标按钮组件
 *
 * 特点:
 * - 圆形或方形
 * - 透明背景 + hover 效果
 * - 支持 Material Symbols 图标
 *
 * 用途:
 * - 工具栏按钮
 * - 关闭按钮
 * - 设置按钮
 */

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Material Symbols 图标名称 */
  icon: string;
  /** 按钮大小 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否填充图标 */
  filled?: boolean;
  /** 按钮形状 */
  shape?: 'circle' | 'square';
  /** 按钮变体 */
  variant?: 'default' | 'primary' | 'subtle';
}

const sizeStyles = {
  sm: 'w-7 h-7 text-[18px]',
  md: 'w-9 h-9 text-[20px]',
  lg: 'w-11 h-11 text-[24px]',
};

const variantStyles = {
  default: 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low',
  primary: 'text-primary hover:bg-primary-fixed',
  subtle: 'text-on-surface-variant/60 hover:text-on-surface-variant hover:bg-transparent',
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      icon,
      size = 'md',
      filled = false,
      shape = 'circle',
      variant = 'default',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'transition-all duration-200',
          'active:scale-95',
          // Shape
          shape === 'circle' ? 'rounded-full' : 'rounded-lg',
          // Size
          sizeStyles[size],
          // Variant
          variantStyles[variant],
          className
        )}
        {...props}
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
          }}
        >
          {icon}
        </span>
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';