'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { Dropdown } from 'antd';
import type { Character } from '@/types';

interface NovelEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  characters?: Character[];
  onCharacterSelect?: (character: Character) => void;
}

export function NovelEditor({ content, onChange, onSave, characters = [], onCharacterSelect }: NovelEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);

  // Filter characters by mention query
  const filteredCharacters = mentionQuery !== null
    ? characters.filter(char => {
        const query = mentionQuery.toLowerCase();
        return (
          char.name.toLowerCase().includes(query) ||
          char.aliases?.some(alias => alias.toLowerCase().includes(query))
        );
      })
    : [];

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl + S to save
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      onSave();
    }
    // Escape to close mention dropdown
    if (e.key === 'Escape' && mentionQuery !== null) {
      setMentionQuery(null);
    }
  }, [onSave, mentionQuery]);

  // Handle text changes and detect @ mentions
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Detect @ mention
    if (!onCharacterSelect || characters.length === 0) return;

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPos);

    // Find the last @ before cursor
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      // Check if there's a space between @ and cursor (which would end the mention)
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);

      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        // Valid mention in progress
        setMentionQuery(textAfterAt);
        return;
      }
    }

    // No valid mention
    setMentionQuery(null);
  }, [onChange, onCharacterSelect, characters.length]);

  // Handle character selection from mention dropdown
  const handleMentionSelect = useCallback((character: Character) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPos);
    const textAfterCursor = content.substring(cursorPos);

    // Find the @ position
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    // Replace the @query with @characterName
    const newContent =
      textBeforeCursor.substring(0, lastAtIndex) +
      `@${character.name} ` +
      textAfterCursor;

    onChange(newContent);
    setMentionQuery(null);

    // Move cursor after the inserted name (use requestAnimationFrame for safer timing)
    requestAnimationFrame(() => {
      if (textareaRef.current && document.body.contains(textareaRef.current)) {
        const newCursorPos = lastAtIndex + character.name.length + 2;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    });

    // Trigger character select callback
    onCharacterSelect?.(character);
  }, [content, onChange, onCharacterSelect]);

  // Auto-focus on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Dropdown menu items
  const mentionMenuItems = filteredCharacters.slice(0, 5).map(char => ({
    key: char.id,
    label: (
      <div className="flex items-center gap-2">
        <span className="font-medium">{char.name}</span>
        {char.aliases && char.aliases.length > 0 && (
          <span className="text-xs text-on-surface-variant">
            ({char.aliases.slice(0, 2).join(', ')})
          </span>
        )}
      </div>
    ),
    onClick: () => handleMentionSelect(char),
  }));

  return (
    <div className="h-full flex flex-col bg-surface">
      <Dropdown
        open={mentionQuery !== null && filteredCharacters.length > 0}
        menu={{ items: mentionMenuItems }}
        placement="bottomLeft"
        getPopupContainer={() => document.body}
      >
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="开始写作... (输入 @ 提及角色)"
          className="flex-1 w-full p-6 resize-none outline-none bg-transparent text-on-surface font-[family-name:var(--font-body)] text-base leading-relaxed"
          style={{
            fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif",
            fontSize: '16px',
            lineHeight: '1.8',
          }}
          spellCheck={false}
        />
      </Dropdown>
    </div>
  );
}