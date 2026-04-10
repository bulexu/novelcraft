'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Modal, Input, List, Avatar, Tag, Empty } from 'antd';
import { UserOutlined, SearchOutlined } from '@ant-design/icons';
import type { Character } from '@/types';

interface CharacterSearchModalProps {
  open: boolean;
  characters: Character[];
  onClose: () => void;
  onSelect: (character: Character) => void;
}

export default function CharacterSearchModal({
  open,
  characters,
  onClose,
  onSelect,
}: CharacterSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 过滤角色列表
  const filteredCharacters = useMemo(() => {
    if (!searchQuery.trim()) {
      return characters;
    }
    const query = searchQuery.toLowerCase();
    return characters.filter(char => {
      // 搜索名称
      if (char.name.toLowerCase().includes(query)) return true;
      // 搜索别名
      if (char.aliases?.some(alias => alias.toLowerCase().includes(query))) return true;
      // 搜索性格标签
      const traits = char.personality_palette?.main_tone?.split(/[、,，]/) || [];
      if (traits.some(t => t.toLowerCase().includes(query))) return true;
      return false;
    });
  }, [characters, searchQuery]);

  // 重置状态
  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // 重置 selectedIndex 当筛选列表变化时
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCharacters.length]);

  // 键盘导航
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!open) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCharacters.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCharacters[selectedIndex]) {
          onSelect(filteredCharacters[selectedIndex]);
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [open, filteredCharacters, selectedIndex, onSelect, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 点击选择
  const handleClick = (character: Character) => {
    onSelect(character);
    onClose();
  };

  // 获取性格标签
  const getTraits = (character: Character): string[] => {
    if (!character.personality_palette?.main_tone) return [];
    return character.personality_palette.main_tone.split(/[、,，]/).slice(0, 3);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
      centered
      title={null}
      closable={false}
      className="character-search-modal"
      styles={{ body: { padding: 0 } }}
    >
      {/* 搜索输入 */}
      <div className="p-3 border-b border-outline-variant">
        <Input
          prefix={<SearchOutlined className="text-on-surface-variant" />}
          placeholder="搜索角色名称、别名或性格标签..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedIndex(0);
          }}
          autoFocus
          bordered={false}
          className="text-base"
        />
      </div>

      {/* 结果列表 */}
      <div className="max-h-80 overflow-y-auto">
        {filteredCharacters.length > 0 ? (
          <List
            dataSource={filteredCharacters}
            renderItem={(character, index) => (
              <List.Item
                onClick={() => handleClick(character)}
                className={`px-4 py-3 cursor-pointer hover:bg-surface-container transition-colors ${
                  index === selectedIndex ? 'bg-surface-container' : ''
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  <Avatar
                    icon={<UserOutlined />}
                    className="bg-primary/20 text-primary flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-on-surface">{character.name}</span>
                      {character.gender && (
                        <Tag color="cyan" className="text-xs">{character.gender}</Tag>
                      )}
                      {character.age && (
                        <Tag color="purple" className="text-xs">{character.age}岁</Tag>
                      )}
                    </div>
                    {character.aliases && character.aliases.length > 0 && (
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        别名：{character.aliases.slice(0, 3).join('、')}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {getTraits(character).map((trait, i) => (
                        <Tag key={i} color="blue" className="text-xs">{trait}</Tag>
                      ))}
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty
            description={searchQuery ? '未找到匹配的角色' : '暂无角色'}
            className="py-8"
          />
        )}
      </div>

      {/* 快捷键提示 */}
      <div className="px-4 py-2 border-t border-outline-variant bg-surface-container">
        <p className="text-xs text-on-surface-variant">
          <kbd className="px-1.5 py-0.5 bg-surface rounded text-xs">↑↓</kbd> 导航
          <span className="mx-2">·</span>
          <kbd className="px-1.5 py-0.5 bg-surface rounded text-xs">Enter</kbd> 选择
          <span className="mx-2">·</span>
          <kbd className="px-1.5 py-0.5 bg-surface rounded text-xs">Esc</kbd> 关闭
        </p>
      </div>
    </Modal>
  );
}