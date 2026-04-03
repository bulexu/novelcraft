'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * TabNav - Tab 导航组件
 *
 * 特点:
 * - Pill 风格选中状态
 * - 支持图标 + 文字
 * - 水平滚动
 *
 * 用途:
 * - AI Panel 模式切换
 * - 设置页面标签
 */

export interface TabItem {
  key: string;
  label: string;
  icon?: string;
}

export interface TabNavProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Tab 项列表 */
  items: TabItem[];
  /** 当前激活的 Tab */
  activeKey: string;
  /** Tab 切换回调 */
  onTabChange: (key: string) => void;
  /** 尺寸 */
  size?: 'sm' | 'md';
}

export interface TabItemProps extends React.HTMLAttributes<HTMLDivElement> {
  item: TabItem;
  active: boolean;
  size?: 'sm' | 'md';
  onClick: () => void;
}

const TabItemComponent: React.FC<TabItemProps> = ({
  item,
  active,
  size = 'md',
  onClick,
  className,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1 text-[0.7rem]',
    md: 'px-4 py-1.5 text-xs',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 cursor-pointer transition-all duration-200 shrink-0',
        'rounded-full',
        sizeStyles[size],
        active
          ? 'bg-primary text-white shadow-inner'
          : 'text-on-surface-variant hover:bg-surface-container-low',
        className
      )}
      {...props}
    >
      {item.icon && (
        <span
          className="material-symbols-outlined text-[18px]"
          style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
        >
          {item.icon}
        </span>
      )}
      <span className="font-medium">{item.label}</span>
    </div>
  );
};

export const TabNav = React.forwardRef<HTMLDivElement, TabNavProps>(
  ({ className, items, activeKey, onTabChange, size = 'md', ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn(
          'flex items-center gap-1 overflow-x-auto no-scrollbar',
          className
        )}
        {...props}
      >
        {items.map((item) => (
          <TabItemComponent
            key={item.key}
            item={item}
            active={activeKey === item.key}
            size={size}
            onClick={() => onTabChange(item.key)}
          />
        ))}
      </nav>
    );
  }
);

TabNav.displayName = 'TabNav';

// Export the item component for custom use
export { TabItemComponent as TabItem };