'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Empty, Popconfirm, message } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { chaptersApi } from '@/lib/api';
import type { Chapter } from '@/types';

interface ChapterNavProps {
  chapters: Chapter[];
  currentChapter: number;
  projectId: string;
  onChapterSelect: (chapter: number) => void;
  onCreateChapter: () => void;
}

export function ChapterNav({
  chapters,
  currentChapter,
  projectId,
  onChapterSelect,
  onCreateChapter,
}: ChapterNavProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<number | null>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleDeleteChapter = async (chapterNum: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDeleting(chapterNum);
      await chaptersApi.delete(projectId, chapterNum);

      if (mountedRef.current) {
        message.success('章节已删除');
        // Use router.push for client-side navigation
        router.push(`/projects/${projectId}`);
      }
    } catch (error) {
      if (mountedRef.current) {
        message.error('删除失败，请重试');
        console.error('Delete chapter failed:', error);
      }
    } finally {
      if (mountedRef.current) {
        setDeleting(null);
      }
    }
  };

  if (chapters.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无章节"
          className="text-on-surface-variant"
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreateChapter}
          className="mt-4"
        >
          创建第一章
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-outline-variant/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOutlined className="text-primary" />
            <span className="font-bold text-on-surface">章节目录</span>
          </div>
          <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
            {chapters.length} 章
          </span>
        </div>
      </div>

      {/* Chapter List */}
      <nav className="flex-1 overflow-y-auto p-2">
        {chapters.map((ch) => {
          const isSelected = ch.chapter === currentChapter;
          const itemClassName = `group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all mb-1 ${
            isSelected
              ? 'bg-primary/10 text-primary'
              : 'hover:bg-surface-container text-on-surface-variant hover:text-on-surface'
          }`;

          return (
            <div
              key={ch.chapter}
              onClick={() => onChapterSelect(ch.chapter)}
              className={itemClassName}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-medium shrink-0">
                  {ch.chapter.toString().padStart(2, '0')}
                </span>
                <span className="truncate text-sm">{ch.title}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  href={`/projects/${projectId}/editor/${ch.chapter}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 hover:bg-surface-container rounded"
                >
                  <EditOutlined className="text-xs" />
                </Link>
                <Popconfirm
                  title="确定删除此章节？"
                  description="删除后无法恢复"
                  onConfirm={(e) => handleDeleteChapter(ch.chapter, e as unknown as React.MouseEvent)}
                  onCancel={(e) => e?.stopPropagation()}
                  okText="删除"
                  cancelText="取消"
                  okType="danger"
                >
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 hover:bg-red-50 rounded text-red-500"
                  >
                    <DeleteOutlined className="text-xs" />
                  </button>
                </Popconfirm>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-outline-variant/10">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          block
          onClick={onCreateChapter}
        >
          新建章节
        </Button>
      </div>
    </div>
  );
}