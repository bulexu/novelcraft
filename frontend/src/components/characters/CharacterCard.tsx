'use client';

import React, { useState } from 'react';
import { Card, Tag, Tooltip, Popconfirm, Collapse } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Character } from '@/types';

interface CharacterCardProps {
  character: Character;
  onEdit: (character: Character) => void;
  onDelete: (character: Character) => void;
}

export default function CharacterCard({ character, onEdit, onDelete }: CharacterCardProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(character);
    } finally {
      setDeleting(false);
    }
  };

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

  const hasPersonality = mainTraits.length > 0 || innerLogic.length > 0 || catchphrases.length > 0 || gestures.length > 0;

  // 性格特质详情面板
  const personalityDetails = hasPersonality ? (
    <div className="text-left text-sm">
      {mainTraits.length > 0 && (
        <div className="mb-2">
          <span className="text-on-surface-variant mr-1">核心标签：</span>
          {mainTraits.map((trait, i) => (
            <Tag key={i} color="blue" className="mb-1">{trait}</Tag>
          ))}
        </div>
      )}
      {innerLogic.length > 0 && (
        <div className="mb-2">
          <span className="text-on-surface-variant">内逻辑：</span>
          <span className="text-on-surface">{innerLogic.join('；')}</span>
        </div>
      )}
      {catchphrases.length > 0 && (
        <div className="mb-2">
          <span className="text-on-surface-variant">口头禅：</span>
          <span className="text-on-surface">{catchphrases.map(p => `"${p}"`).join('、')}</span>
        </div>
      )}
      {gestures.length > 0 && (
        <div>
          <span className="text-on-surface-variant">小动作：</span>
          <span className="text-on-surface">{gestures.join('、')}</span>
        </div>
      )}
    </div>
  ) : null;

  // 解析动机系统
  const motivation = character.motivation;
  const goals = motivation?.goals || [];
  const obsessions = motivation?.obsessions || [];
  const fears = motivation?.fears || [];
  const desires = motivation?.desires || [];

  const hasMotivation = goals.length > 0 || obsessions.length > 0 || fears.length > 0 || desires.length > 0;

  // 动机系统详情面板
  const motivationDetails = hasMotivation ? (
    <div className="text-left text-sm">
      {goals.length > 0 && (
        <div className="mb-2">
          <span className="text-on-surface-variant">目标：</span>
          <span className="text-on-surface">{goals.join('；')}</span>
        </div>
      )}
      {obsessions.length > 0 && (
        <div className="mb-2">
          <span className="text-on-surface-variant">执念：</span>
          <span className="text-on-surface">{obsessions.join('；')}</span>
        </div>
      )}
      {fears.length > 0 && (
        <div className="mb-2">
          <span className="text-on-surface-variant">恐惧：</span>
          <span className="text-on-surface">{fears.join('；')}</span>
        </div>
      )}
      {desires.length > 0 && (
        <div>
          <span className="text-on-surface-variant">渴望：</span>
          <span className="text-on-surface">{desires.join('；')}</span>
        </div>
      )}
    </div>
  ) : null;

  // 解析关系网络
  const relationships = character.relationships || [];
  const hasRelationships = relationships.length > 0;

  // 关系温度颜色映射
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

  // 关系网络详情面板
  const relationshipDetails = hasRelationships ? (
    <div className="text-left text-sm">
      {relationships.map((rel, i) => (
        <div key={i} className="mb-2">
          <div className="flex items-center gap-1 flex-wrap">
            <Tag color="blue">{rel.target_name}</Tag>
            <span className="text-on-surface-variant">{rel.relation_type}</span>
            <Tag color={temperatureColors[rel.temperature] || 'default'}>{rel.temperature}</Tag>
          </div>
          {rel.evolution && rel.evolution.length > 0 && (
            <div className="text-xs text-on-surface-variant mt-1 ml-2">
              演变：{rel.evolution.join(' → ')}
            </div>
          )}
        </div>
      ))}
    </div>
  ) : null;

  // 构建折叠面板项
  const collapseItems: { key: string; label: React.ReactNode; children: React.ReactNode }[] = [];
  if (personalityDetails) {
    collapseItems.push({
      key: 'personality',
      label: <span className="text-xs text-on-surface-variant">性格详情</span>,
      children: personalityDetails,
    });
  }
  if (motivationDetails) {
    collapseItems.push({
      key: 'motivation',
      label: <span className="text-xs text-on-surface-variant">动机详情</span>,
      children: motivationDetails,
    });
  }
  if (relationshipDetails) {
    collapseItems.push({
      key: 'relationships',
      label: <span className="text-xs text-on-surface-variant">关系网络</span>,
      children: relationshipDetails,
    });
  }

  return (
    <Card
      className="h-full"
      actions={[
        <Tooltip title="编辑" key="edit">
          <EditOutlined onClick={() => onEdit(character)} />
        </Tooltip>,
        <Popconfirm
          key="delete"
          title="确定要删除此角色吗？"
          description="删除后无法恢复"
          onConfirm={handleDelete}
          okText="删除"
          cancelText="取消"
          okButtonProps={{ loading: deleting }}
        >
          <DeleteOutlined className="text-red-500" />
        </Popconfirm>,
      ]}
    >
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
          <UserOutlined className="text-2xl text-primary" />
        </div>
        <h3 className="font-bold text-on-surface text-lg">{character.name}</h3>
        {character.aliases && character.aliases.length > 0 && (
          <p className="text-xs text-on-surface-variant mb-2">
            别名：{character.aliases.join('、')}
          </p>
        )}
        <div className="mb-2">
          <Tag color="blue">{character.arc_type || '角色'}</Tag>
          {character.gender && (
            <Tag color="cyan">{character.gender}</Tag>
          )}
          {character.age && (
            <Tag color="purple">{character.age}岁</Tag>
          )}
        </div>

        {/* 核心性格标签展示 */}
        {mainTraits.length > 0 && (
          <div className="mb-2">
            {mainTraits.slice(0, 3).map((trait, i) => (
              <Tag key={i} color="geekblue" className="mb-1">{trait}</Tag>
            ))}
            {mainTraits.length > 3 && (
              <span className="text-xs text-on-surface-variant">+{mainTraits.length - 3}</span>
            )}
          </div>
        )}

        <p className="text-sm text-on-surface-variant mt-2 line-clamp-3 text-left">
          {character.background || character.appearance || '暂无描述'}
        </p>

        {/* 性格特质展开详情 */}
        {collapseItems.length > 0 && (
          <Collapse
            items={collapseItems}
            bordered={false}
            size="small"
            className="mt-2 text-left bg-transparent"
          />
        )}
      </div>
    </Card>
  );
}
