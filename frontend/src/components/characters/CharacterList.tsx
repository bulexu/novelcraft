'use client';

import { useState, useMemo } from 'react';
import { Row, Col, Card, Button, Empty, Spin, Input, Select } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import CharacterCard from './CharacterCard';
import type { Character } from '@/types';

interface CharacterListProps {
  projectId: string;
  characters: Character[];
  loading?: boolean;
  onAddClick: () => void;
  onEditClick: (character: Character) => void;
  onDeleteClick: (character: Character) => void;
}

export default function CharacterList({
  projectId,
  characters,
  loading = false,
  onAddClick,
  onEditClick,
  onDeleteClick,
}: CharacterListProps) {
  // 搜索状态
  const [searchText, setSearchText] = useState('');
  // 筛选状态
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [selectedRelations, setSelectedRelations] = useState<string[]>([]);

  // 提取所有性格标签选项
  const allTraits = useMemo(() => {
    const traits = new Set<string>();
    characters.forEach(c => {
      if (c.personality_palette?.main_tone) {
        c.personality_palette.main_tone.split(/[、,，]/).forEach(t => {
          const trimmed = t.trim();
          if (trimmed) traits.add(trimmed);
        });
      }
    });
    return Array.from(traits).sort();
  }, [characters]);

  // 提取所有关系类型选项
  const allRelations = useMemo(() => {
    const relations = new Set<string>();
    characters.forEach(c => {
      c.relationships?.forEach(r => {
        if (r.relation_type) relations.add(r.relation_type);
      });
    });
    return Array.from(relations).sort();
  }, [characters]);

  // 过滤逻辑
  const filteredCharacters = useMemo(() => {
    return characters.filter(c => {
      // 搜索匹配
      if (searchText) {
        const search = searchText.toLowerCase();
        const nameMatch = c.name?.toLowerCase().includes(search);
        const aliasMatch = c.aliases?.some(a => a?.toLowerCase().includes(search));
        const traitMatch = c.personality_palette?.main_tone?.toLowerCase().includes(search);
        if (!nameMatch && !aliasMatch && !traitMatch) return false;
      }

      // 性格标签筛选 (AND 逻辑)
      if (selectedTraits.length > 0) {
        const charTraits = c.personality_palette?.main_tone
          ?.split(/[、,，]/).map(t => t.trim()) || [];
        if (!selectedTraits.every(t => charTraits.includes(t))) return false;
      }

      // 关系类型筛选 (AND 逻辑)
      if (selectedRelations.length > 0) {
        const charRelations = c.relationships?.map(r => r.relation_type).filter(Boolean) || [];
        if (!selectedRelations.every(r => charRelations.includes(r))) return false;
      }

      return true;
    });
  }, [characters, searchText, selectedTraits, selectedRelations]);

  // 清空筛选
  const handleClearFilters = () => {
    setSearchText('');
    setSelectedTraits([]);
    setSelectedRelations([]);
  };

  // 是否有筛选条件
  const hasFilters = searchText || selectedTraits.length > 0 || selectedRelations.length > 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 搜索和筛选栏 */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          {/* 搜索输入框 */}
          <Input
            placeholder="搜索角色名称、别名..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
            style={{ width: 220 }}
          />

          {/* 性格标签筛选 */}
          {allTraits.length > 0 && (
            <Select
              mode="multiple"
              placeholder="性格标签"
              value={selectedTraits}
              onChange={setSelectedTraits}
              options={allTraits.map(t => ({ value: t, label: t }))}
              allowClear
              style={{ minWidth: 150 }}
              maxTagCount="responsive"
            />
          )}

          {/* 关系类型筛选 */}
          {allRelations.length > 0 && (
            <Select
              mode="multiple"
              placeholder="关系类型"
              value={selectedRelations}
              onChange={setSelectedRelations}
              options={allRelations.map(r => ({ value: r, label: r }))}
              allowClear
              style={{ minWidth: 150 }}
              maxTagCount="responsive"
            />
          )}

          {/* 清空筛选按钮 */}
          {hasFilters && (
            <Button onClick={handleClearFilters}>
              清空筛选
            </Button>
          )}
        </div>

        {/* 添加角色按钮 */}
        <Button type="primary" icon={<PlusOutlined />} onClick={onAddClick}>
          添加角色
        </Button>
      </div>

      {/* 结果统计 */}
      <div className="text-sm text-on-surface-variant">
        {hasFilters ? (
          <span>找到 {filteredCharacters.length} 个角色（共 {characters.length} 个）</span>
        ) : (
          <span>共 {characters.length} 个角色</span>
        )}
      </div>

      {/* 角色列表 */}
      {filteredCharacters.length === 0 ? (
        hasFilters ? (
          <Empty
            description="没有找到匹配的角色"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button onClick={handleClearFilters}>清空筛选条件</Button>
          </Empty>
        ) : (
          <Empty
            description="暂无角色"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={onAddClick}>
              创建第一个角色
            </Button>
          </Empty>
        )
      ) : (
        <Row gutter={[16, 16]}>
          {filteredCharacters.map((char) => (
            <Col key={char.id} xs={24} sm={12} md={8} lg={6}>
              <CharacterCard
                character={char}
                onEdit={onEditClick}
                onDelete={onDeleteClick}
              />
            </Col>
          ))}
          {/* 添加角色卡片 */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card
              className="h-full cursor-pointer border-dashed hover:border-primary transition-colors"
              styles={{ body: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 } }}
              onClick={onAddClick}
            >
              <div className="text-center text-on-surface-variant">
                <PlusOutlined className="text-3xl mb-2" />
                <p>添加角色</p>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}