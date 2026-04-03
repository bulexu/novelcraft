/**
 * NovelCraft 设计系统展示页面
 * 展示所有基础组件的使用方式
 */

'use client';

import React, { useState } from 'react';
import {
  GlassCard,
  GradientButton,
  IconButton,
  FocusBead,
  FocusParagraph,
  TabNav,
  AIPanel,
  AIPanelMode,
  AIInferenceCard,
  SideNavBar,
  StatusBar,
  FloatingQuill,
} from '@/components/ui';

export default function DesignSystemPage() {
  const [aiMode, setAiMode] = useState<AIPanelMode>('inference');
  const [activeNav, setActiveNav] = useState('manuscript');
  const [activeChapter, setActiveChapter] = useState('chapter-2');

  const navItems = [
    { key: 'manuscript', label: 'Manuscript', icon: 'book_2', active: activeNav === 'manuscript' },
    { key: 'characters', label: 'Characters', icon: 'group' },
    { key: 'world', label: 'World-Building', icon: 'auto_awesome_motion' },
    { key: 'timeline', label: 'Timeline', icon: 'timeline' },
  ];

  const chapters = [
    { key: 'chapter-1', label: 'Chapter 1: The Encounter', icon: 'folder', active: activeChapter === 'chapter-1' },
    { key: 'chapter-2', label: 'Chapter 2: The Whispering Wind', icon: 'description', active: activeChapter === 'chapter-2' },
    { key: 'chapter-3', label: 'Chapter 3: After Neon Rain', icon: 'folder', active: activeChapter === 'chapter-3' },
  ];

  const tabItems = [
    { key: 'tab1', label: 'Overview', icon: 'dashboard' },
    { key: 'tab2', label: 'Details', icon: 'list' },
    { key: 'tab3', label: 'Settings', icon: 'settings' },
  ];

  const [activeTab, setActiveTab] = useState('tab1');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-outline-variant/10 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-headline font-bold text-on-surface">
            NovelCraft Design System
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            The Zen Editorial - 组件展示
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        {/* Section 1: Buttons */}
        <section>
          <h2 className="text-xl font-headline font-bold mb-6">Buttons</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <GradientButton icon={<span className="material-symbols-outlined text-lg">auto_fix_high</span>}>
              生成内容
            </GradientButton>
            <GradientButton size="sm">Small</GradientButton>
            <GradientButton size="lg" icon={<span className="material-symbols-outlined">add</span>}>
              Large
            </GradientButton>
            <GradientButton shape="circle" icon={<span className="material-symbols-outlined">add</span>} />
            <IconButton icon="settings" />
            <IconButton icon="close" variant="primary" />
            <IconButton icon="delete" size="lg" />
          </div>
        </section>

        {/* Section 2: Glass Cards */}
        <section>
          <h2 className="text-xl font-headline font-bold mb-6">Glass Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard variant="default">
              <h3 className="font-bold mb-2">Default Glass</h3>
              <p className="text-sm text-on-surface-variant">
                标准玻璃态卡片，用于浮动面板。
              </p>
            </GlassCard>
            <GlassCard variant="elevated">
              <h3 className="font-bold mb-2">Elevated Glass</h3>
              <p className="text-sm text-on-surface-variant">
                更高的不透明度和模糊度。
              </p>
            </GlassCard>
            <GlassCard variant="subtle" padding="lg">
              <h3 className="font-bold mb-2">Subtle Glass</h3>
              <p className="text-sm text-on-surface-variant">
                更微妙的玻璃效果。
              </p>
            </GlassCard>
          </div>
        </section>

        {/* Section 3: Focus Bead */}
        <section>
          <h2 className="text-xl font-headline font-bold mb-6">Focus Bead</h2>
          <div className="bg-surface-container-lowest p-8 rounded-lg ambient-shadow max-w-2xl">
            <div className="space-y-4">
              <FocusParagraph>
                普通段落，hover 时显示 Focus Bead。
              </FocusParagraph>
              <FocusParagraph focused>
                聚焦段落，始终显示 Focus Bead 并带脉冲动画。
              </FocusParagraph>
              <FocusParagraph>
                另一个普通段落。Focus Bead 用于标记 AI 正在分析的内容。
              </FocusParagraph>
            </div>
          </div>
        </section>

        {/* Section 4: Tab Navigation */}
        <section>
          <h2 className="text-xl font-headline font-bold mb-6">Tab Navigation</h2>
          <TabNav
            items={tabItems}
            activeKey={activeTab}
            onTabChange={setActiveTab}
          />
          <div className="mt-4 p-4 bg-surface-container-low rounded-lg">
            <p className="text-sm text-on-surface-variant">
              当前选中: <span className="font-bold text-primary">{activeTab}</span>
            </p>
          </div>
        </section>

        {/* Section 5: AI Inference Card */}
        <section>
          <h2 className="text-xl font-headline font-bold mb-6">AI Inference Card</h2>
          <AIInferenceCard
            character="林黛玉 (Lin Daiyu)"
            confidence={89}
            prediction="情绪波动显著，对周围环境表现出高度敏感与多思状态。"
            impact="Likely to trigger a defensive dialogue sequence with characters expressing authority."
          />
        </section>

        {/* Section 6: Status Bar Preview */}
        <section>
          <h2 className="text-xl font-headline font-bold mb-6">Status Bar (Fixed at bottom)</h2>
          <p className="text-sm text-on-surface-variant mb-4">
            查看页面底部固定的状态栏。
          </p>
        </section>

        {/* Section 7: Floating Quill */}
        <section>
          <h2 className="text-xl font-headline font-bold mb-6">Floating Quill (FAB)</h2>
          <p className="text-sm text-on-surface-variant mb-4">
            查看页面右下角的浮动创作按钮。
          </p>
        </section>
      </main>

      {/* Fixed Status Bar */}
      <StatusBar wordCount={1240} saved />

      {/* Floating Quill */}
      <FloatingQuill onClick={() => alert('新建章节')} />
    </div>
  );
}