'use client';

import React from 'react';
import { Modal, Tag, Progress, Button, Space, Divider } from 'antd';
import { UserOutlined, EditOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { Character } from '@/types';

interface CharacterQuickViewProps {
  open: boolean;
  character: Character | null;
  onClose: () => void;
  onViewFullProfile?: (character: Character) => void;
  onInferBehavior?: (character: Character) => void;
}

// 弧线阶段映射
const arcStageOptions: Record<string, { value: string; label: string; percent: number }[]> = {
  '成长型': [
    { value: '起点', label: '起点', percent: 0 },
    { value: '觉醒', label: '觉醒', percent: 17 },
    { value: '考验', label: '考验', percent: 33 },
    { value: '低谷', label: '低谷', percent: 50 },
    { value: '突破', label: '突破', percent: 67 },
    { value: '巅峰', label: '巅峰', percent: 83 },
    { value: '结局', label: '结局', percent: 100 },
  ],
  '堕落型': [
    { value: '高点', label: '高点', percent: 0 },
    { value: '诱惑', label: '诱惑', percent: 20 },
    { value: '妥协', label: '妥协', percent: 40 },
    { value: '沉沦', label: '沉沦', percent: 60 },
    { value: '触底', label: '触底', percent: 80 },
    { value: '结局', label: '结局', percent: 100 },
  ],
  '救赎型': [
    { value: '迷失', label: '迷失', percent: 0 },
    { value: '挣扎', label: '挣扎', percent: 20 },
    { value: '救赎机会', label: '救赎机会', percent: 40 },
    { value: '考验', label: '考验', percent: 60 },
    { value: '觉醒', label: '觉醒', percent: 80 },
    { value: '结局', label: '结局', percent: 100 },
  ],
  '平面型': [
    { value: '稳定', label: '稳定', percent: 100 },
  ],
};

const arcTypeColors: Record<string, string> = {
  '成长型': 'green',
  '堕落型': 'red',
  '救赎型': 'blue',
  '平面型': 'gray',
};

const temperatureColors: Record<string, string> = {
  '热烈': 'red',
  '温热': 'orange',
  '温暖': 'gold',
  '温': 'lime',
  '中性': 'default',
  '冷淡': 'cyan',
  '冷': 'blue',
  '寒冷': 'purple',
  '敌对': 'magenta',
};

export default function CharacterQuickView({
  open,
  character,
  onClose,
  onViewFullProfile,
  onInferBehavior,
}: CharacterQuickViewProps) {
  if (!character) return null;

  // 解析性格特质
  const personality = character.personality_palette;
  const mainTraits = personality?.main_tone
    ? personality.main_tone.split(/[、,，]/).map(s => s.trim()).filter(Boolean)
    : [];

  const innerLogic = personality?.derivatives
    ?.filter(d => !d.description.startsWith('小动作:'))
    .map(d => d.description) || [];

  const gestures = personality?.derivatives
    ?.filter(d => d.description.startsWith('小动作:'))
    .map(d => d.description.replace('小动作:', '').trim()) || [];

  const catchphrases = personality?.language_fingerprint || [];

  // 解析关系网络
  const relationships = character.relationships || [];

  // 解析角色弧线
  const characterArc = character.character_arc;
  const hasArc = !!characterArc?.arc_type;

  const arcStages = characterArc?.arc_type && arcStageOptions[characterArc.arc_type]
    ? arcStageOptions[characterArc.arc_type]
    : [];
  const currentStageIndex = arcStages.findIndex(s => s.value === characterArc?.current_stage);
  const arcProgress = currentStageIndex >= 0 ? arcStages[currentStageIndex].percent : undefined;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      centered
      title={null}
      closable
      className="character-quick-view"
    >
      {/* 基础信息头部 */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <UserOutlined className="text-2xl text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-on-surface mb-1">{character.name}</h2>
          {character.aliases && character.aliases.length > 0 && (
            <p className="text-sm text-on-surface-variant mb-1">
              别名：{character.aliases.join('、')}
            </p>
          )}
          <div className="flex flex-wrap gap-1">
            {character.gender && (
              <Tag color="cyan">{character.gender}</Tag>
            )}
            {character.age && (
              <Tag color="purple">{character.age}岁</Tag>
            )}
            {character.arc_type && (
              <Tag color="blue">角色：{character.arc_type}</Tag>
            )}
          </div>
        </div>
      </div>

      {/* 性格摘要 */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-on-surface mb-2">性格摘要</h3>
        <div className="bg-surface-container rounded-lg p-3">
          {mainTraits.length > 0 ? (
            <div className="mb-2">
              <span className="text-xs text-on-surface-variant">核心标签：</span>
              <div className="mt-1">
                {mainTraits.slice(0, 5).map((trait, i) => (
                  <Tag key={i} color="blue" className="mb-1">{trait}</Tag>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">暂无性格标签</p>
          )}
          {innerLogic.length > 0 && (
            <div>
              <span className="text-xs text-on-surface-variant">内逻辑：</span>
              <p className="text-sm text-on-surface mt-1">{innerLogic.join('；')}</p>
            </div>
          )}
        </div>
      </div>

      {/* 语言指纹 */}
      {(catchphrases.length > 0 || gestures.length > 0) && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-on-surface mb-2">语言指纹</h3>
          <div className="bg-surface-container rounded-lg p-3">
            {catchphrases.length > 0 && (
              <div className="mb-2">
                <span className="text-xs text-on-surface-variant">口头禅：</span>
                <span className="text-sm text-on-surface ml-1">
                  {catchphrases.map(p => `"${p}"`).join('、')}
                </span>
              </div>
            )}
            {gestures.length > 0 && (
              <div>
                <span className="text-xs text-on-surface-variant">小动作：</span>
                <span className="text-sm text-on-surface ml-1">{gestures.join('、')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 当前关系 */}
      {relationships.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-on-surface mb-2">当前关系</h3>
          <div className="bg-surface-container rounded-lg p-3">
            {relationships.slice(0, 4).map((rel, i) => (
              <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
                <Tag color="blue">{rel.target_name}</Tag>
                <span className="text-xs text-on-surface-variant">{rel.relation_type}</span>
                <Tag color={temperatureColors[rel.temperature] || 'default'} className="text-xs">
                  {rel.temperature}
                </Tag>
              </div>
            ))}
            {relationships.length > 4 && (
              <p className="text-xs text-on-surface-variant mt-1">
                还有 {relationships.length - 4} 个关系...
              </p>
            )}
          </div>
        </div>
      )}

      {/* 角色弧线 */}
      {hasArc && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-on-surface mb-2">角色弧线</h3>
          <div className="bg-surface-container rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Tag color={arcTypeColors[characterArc?.arc_type || ''] || 'default'}>
                {characterArc?.arc_type}
              </Tag>
              {characterArc?.current_stage && (
                <span className="text-sm text-on-surface">当前阶段：{characterArc.current_stage}</span>
              )}
            </div>
            {arcProgress !== undefined && (
              <Progress
                percent={arcProgress}
                size="small"
                strokeColor={arcTypeColors[characterArc?.arc_type || ''] || 'blue'}
              />
            )}
          </div>
        </div>
      )}

      <Divider className="my-3" />

      {/* 操作按钮 */}
      <div className="flex justify-end gap-2">
        <Button
          icon={<EditOutlined />}
          onClick={() => onViewFullProfile?.(character)}
        >
          查看完整档案
        </Button>
        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          onClick={() => onInferBehavior?.(character)}
        >
          推演行为
        </Button>
      </div>
    </Modal>
  );
}