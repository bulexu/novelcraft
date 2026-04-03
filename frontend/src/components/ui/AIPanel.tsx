'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { GlassCard } from './GlassCard';
import { TabNav, TabItem } from './TabNav';
import { IconButton } from './IconButton';
import { FocusBead } from './FocusBead';

/**
 * AIPanel - AI 面板组件
 *
 * 特点:
 * - 四种模式: 推理/续写/检查/分析
 * - 玻璃态背景
 * - 可折叠
 *
 * 用途:
 * - 右侧 AI 助手面板
 */

export type AIPanelMode = 'inference' | 'continue' | 'check' | 'analyze';

export interface AIPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 当前模式 */
  mode: AIPanelMode;
  /** 模式切换回调 */
  onModeChange: (mode: AIPanelMode) => void;
  /** 面板内容 */
  children: React.ReactNode;
  /** 面板标题 */
  title?: string;
  /** 是否显示关闭按钮 */
  showClose?: boolean;
  /** 关闭回调 */
  onClose?: () => void;
  /** 面板宽度 */
  width?: number | string;
}

const aiTabs: TabItem[] = [
  { key: 'inference', label: '推理', icon: 'psychology' },
  { key: 'continue', label: '续写', icon: 'edit_note' },
  { key: 'check', label: '检查', icon: 'spellcheck' },
  { key: 'analyze', label: '分析', icon: 'analytics' },
];

const modeTitles: Record<AIPanelMode, string> = {
  inference: 'Character Inference',
  continue: 'Continue Writing',
  check: 'Consistency Check',
  analyze: 'Content Analysis',
};

export const AIPanel = React.forwardRef<HTMLDivElement, AIPanelProps>(
  (
    {
      className,
      mode,
      onModeChange,
      children,
      title,
      showClose = true,
      onClose,
      width = '100%',
      style,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'h-full flex flex-col bg-surface-container-high rounded-xl overflow-hidden',
          'border-none shadow-lg',
          className
        )}
        style={{ width, ...style }}
        {...props}
      >
        {/* Header */}
        <header className="flex justify-between items-center px-4 py-2 bg-surface-container/80 backdrop-blur-3xl">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
            <span className="font-headline text-sm font-bold tracking-tight uppercase">
              Manuscript Assistant
            </span>
          </div>
          {showClose && (
            <IconButton icon="close" size="sm" variant="subtle" onClick={onClose} />
          )}
        </header>

        {/* Tab Navigation */}
        <div className="px-3 py-2 bg-surface-variant/80 backdrop-blur-3xl">
          <TabNav
            items={aiTabs}
            activeKey={mode}
            onTabChange={(key) => onModeChange(key as AIPanelMode)}
            size="sm"
          />
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold tracking-tight">
              {title || modeTitles[mode]}
            </h2>
            <p className="text-sm text-on-surface-variant">
              AI-powered assistance for your manuscript.
            </p>
          </div>
          {children}
        </main>

        {/* Status Indicator */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-surface-container-highest/80 backdrop-blur-md px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-[0.65rem] font-bold text-on-surface-variant tracking-wider uppercase">
            AI Core: Ready
          </span>
        </div>
      </div>
    );
  }
);

AIPanel.displayName = 'AIPanel';

/**
 * AIInferenceCard - 推理结果卡片
 */
export interface AIInferenceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  character: string;
  characterImage?: string;
  confidence: number;
  prediction: string;
  impact?: string;
}

export const AIInferenceCard: React.FC<AIInferenceCardProps> = ({
  className,
  character,
  characterImage,
  confidence,
  prediction,
  impact,
  ...props
}) => {
  return (
    <GlassCard variant="elevated" className={cn('space-y-4', className)} {...props}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-low">
            {characterImage ? (
              <img src={characterImage} alt={character} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-primary m-2">person</span>
            )}
          </div>
          <div>
            <div className="text-xs text-primary font-bold uppercase tracking-widest">
              Selected Entity
            </div>
            <div className="text-sm font-bold">{character}</div>
          </div>
        </div>
        <div className="bg-primary-container text-white px-2 py-1 rounded text-[0.65rem] font-black">
          {confidence}% MATCH
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-surface-container-low/60 p-3 rounded-lg relative">
          <FocusBead className="absolute left-0 top-1/2 -translate-y-1/2" />
          <div className="pl-2">
            <div className="text-xs font-bold text-on-surface-variant/70 mb-1">
              PREDICTED BEHAVIOR
            </div>
            <p className="text-sm leading-relaxed font-medium">{prediction}</p>
          </div>
        </div>

        {impact && (
          <div className="bg-surface-container-low/60 p-3 rounded-lg">
            <div className="text-xs font-bold text-on-surface-variant/70 mb-1">
              NARRATIVE IMPACT
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">{impact}</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
};