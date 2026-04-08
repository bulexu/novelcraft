'use client';

import { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Empty, Spin, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
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
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-on-surface-variant">共 {characters.length} 个角色</span>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAddClick}>
          添加角色
        </Button>
      </div>

      {characters.length === 0 ? (
        <Empty
          description="暂无角色"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={onAddClick}>
            创建第一个角色
          </Button>
        </Empty>
      ) : (
        <Row gutter={[16, 16]}>
          {characters.map((char) => (
            <Col key={char.id} xs={24} sm={12} md={8} lg={6}>
              <CharacterCard
                character={char}
                onEdit={onEditClick}
                onDelete={onDeleteClick}
              />
            </Col>
          ))}
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
