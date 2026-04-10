'use client';

import { useMemo } from 'react';
import { Drawer, Tabs } from 'antd';
import type { Character } from '@/types';
import InferenceTab from './InferenceTab';
import ContinuationTab from './ContinuationTab';
import CheckTab from './CheckTab';
import AnalysisTab from './AnalysisTab';

interface AIPanelProps {
  visible: boolean;
  onClose: () => void;
  projectId: string;
  characters: Character[];
}

export default function AIPanel({ visible, onClose, projectId, characters }: AIPanelProps) {
  const items = useMemo(() => [
    {
      key: 'inference',
      label: '推演',
      children: <InferenceTab projectId={projectId} characters={characters} />,
    },
    {
      key: 'continuation',
      label: '续写',
      children: <ContinuationTab />,
    },
    {
      key: 'check',
      label: '检查',
      children: <CheckTab />,
    },
    {
      key: 'analysis',
      label: '分析',
      children: <AnalysisTab />,
    },
  ], [projectId, characters]);

  return (
    <Drawer
      title="AI 辅助"
      placement="right"
      width={400}
      open={visible}
      onClose={onClose}
      maskClosable={false}
      styles={{
        body: { padding: 0 },
      }}
    >
      <Tabs
        defaultActiveKey="inference"
        items={items}
        style={{ padding: '0 16px' }}
      />
    </Drawer>
  );
}