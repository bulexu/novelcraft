'use client';

import { useRef, useEffect, useCallback } from 'react';

interface NovelEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
}

export function NovelEditor({ content, onChange, onSave }: NovelEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl + S to save
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      onSave();
    }
  }, [onSave]);

  // Auto-focus on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div className="h-full flex flex-col bg-surface">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="开始写作..."
        className="flex-1 w-full p-6 resize-none outline-none bg-transparent text-on-surface font-[family-name:var(--font-body)] text-base leading-relaxed"
        style={{
          fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif",
          fontSize: '16px',
          lineHeight: '1.8',
        }}
        spellCheck={false}
      />
    </div>
  );
}
