'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Button,
  message,
  Spin,
  Empty,
  Modal,
  Input,
  Tooltip,
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SaveOutlined,
  RobotOutlined,
  EditOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { chaptersApi } from '@/lib/api';
import { ChapterNav } from '@/components/editor/ChapterNav';
import { NovelEditor } from '@/components/editor/NovelEditor';
import { NovelPreview } from '@/components/editor/NovelPreview';
import type { Chapter } from '@/types';

// View modes for small screens
type ViewMode = 'edit' | 'edit-preview' | 'preview';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const chapterNum = parseInt(params.chapter as string, 10);

  // State
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [content, setContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Responsive layout state
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [isLargeScreen, setIsLargeScreen] = useState(true);
  const [isMediumScreen, setIsMediumScreen] = useState(false);

  // View mode for small screens (edit / edit-preview / preview)
  const [viewMode, setViewMode] = useState<ViewMode>('edit-preview');

  // Immersive writing mode
  const [immersiveMode, setImmersiveMode] = useState(false);

  // AI Panel state (user-triggered only)
  const [aiPanelVisible, setAiPanelVisible] = useState(false);

  // New chapter modal
  const [newChapterModalOpen, setNewChapterModalOpen] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  // Ref for save function to avoid stale closure in auto-save effect
  const handleSaveRef = useRef<((isAutoSave: boolean) => Promise<boolean>) | null>(null);

  // Debounced resize handler
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;

    const checkScreenSize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const width = window.innerWidth;
        setIsLargeScreen(width > 1440);
        setIsMediumScreen(width >= 1024 && width <= 1440);

        if (width < 1024) {
          setNavCollapsed(true);
          // Keep current view mode for small screens
        } else if (width >= 1024 && width <= 1440) {
          setNavCollapsed(true);
          setPreviewVisible(true);
          setViewMode('edit-preview');
        } else {
          setNavCollapsed(false);
          setPreviewVisible(true);
          setViewMode('edit-preview');
        }
      }, 150); // 150ms debounce
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [projectId, chapterNum]);

  const loadData = async (signal?: AbortSignal) => {
    try {
      setLoading(true);

      const [chaptersRes] = await Promise.all([
        chaptersApi.list(projectId).catch(() => ({ items: [], total: 0, total_words: 0 })),
      ]);

      if (signal?.aborted) return;

      setChapters(chaptersRes.items || []);

      const chapter = await chaptersApi.get(projectId, chapterNum).catch(() => null);
      if (signal?.aborted) return;

      if (!chapter) {
        if (chaptersRes.items && chaptersRes.items.length > 0) {
          router.replace(`/projects/${projectId}/editor/${chaptersRes.items[0].chapter}`);
          return;
        }
        message.error('章节不存在');
        router.push(`/projects/${projectId}`);
        return;
      }

      setCurrentChapter(chapter);
      setContent(chapter.content || '');
      setIsDirty(false);
    } catch (err) {
      if (!signal?.aborted) {
        message.error('加载失败');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  // Auto-save effect with 30s debounce - uses ref to avoid stale closure
  useEffect(() => {
    if (!isDirty || !currentChapter) return;

    const timer = setTimeout(() => {
      if (handleSaveRef.current) {
        handleSaveRef.current(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [content, isDirty, currentChapter]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleSave = useCallback(async (isAutoSave = false): Promise<boolean> => {
    if (!currentChapter) return false;

    // Prevent duplicate save requests
    if (saving) return false;

    try {
      setSaving(true);
      await chaptersApi.update(projectId, chapterNum, {
        title: currentChapter.title,
        content,
      });

      if (!isAutoSave) {
        message.success('已保存');
      }
      setIsDirty(false);

      setCurrentChapter(prev => prev ? { ...prev, content } : null);

      const chaptersRes = await chaptersApi.list(projectId);
      setChapters(chaptersRes.items || []);
      return true;
    } catch (err) {
      // Show error for both auto and manual save
      message.error(isAutoSave ? '自动保存失败' : '保存失败');
      console.error('Save failed:', err);
      return false;
    } finally {
      setSaving(false);
    }
  }, [projectId, chapterNum, currentChapter, content, saving]);

  // Keep ref updated
  handleSaveRef.current = handleSave;

  // Immersive mode keyboard shortcut (Cmd/Ctrl+Shift+I, Esc)
  useEffect(() => {
    const handleImmersiveShortcut = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Shift + I to toggle immersive mode
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
        setImmersiveMode(prev => !prev);
      }
      // Esc to exit immersive mode
      if (e.key === 'Escape' && immersiveMode) {
        setImmersiveMode(false);
      }
    };

    window.addEventListener('keydown', handleImmersiveShortcut);
    return () => window.removeEventListener('keydown', handleImmersiveShortcut);
  }, [immersiveMode]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setIsDirty(true);
  }, []);

  const handleChapterSwitch = useCallback(async (targetChapter: number) => {
    if (targetChapter === chapterNum) return;

    if (isDirty) {
      const saved = await handleSave(true);
      if (!saved) {
        // Save failed - don't navigate, user can decide what to do
        return;
      }
    }

    router.push(`/projects/${projectId}/editor/${targetChapter}`);
  }, [chapterNum, isDirty, handleSave, projectId, router]);

  // Global shortcuts: Cmd+N (new chapter), Cmd+↑/↓ (chapter navigation)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // Skip shortcuts when typing in input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Skip if currently saving to prevent race conditions
      if (saving) return;

      // Cmd/Ctrl + N: New chapter dialog
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setNewChapterModalOpen(true);
      }

      // Cmd/Ctrl + ArrowUp/ArrowDown: Chapter navigation
      if ((e.metaKey || e.ctrlKey) && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        const currentIndex = chapters.findIndex(c => c.chapter === chapterNum);

        // Skip if current chapter not found in list
        if (currentIndex === -1) return;

        if (e.key === 'ArrowUp' && currentIndex > 0) {
          handleChapterSwitch(chapters[currentIndex - 1].chapter);
        } else if (e.key === 'ArrowDown' && currentIndex < chapters.length - 1) {
          handleChapterSwitch(chapters[currentIndex + 1].chapter);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [chapters, chapterNum, handleChapterSwitch, saving]);

  const handleCreateChapter = useCallback(async () => {
    if (!newChapterTitle.trim()) {
      message.error('请输入章节标题');
      return;
    }

    try {
      const nextChapter = chapters.length > 0
        ? Math.max(...chapters.map(c => c.chapter)) + 1
        : 1;

      const newChapter = await chaptersApi.create(projectId, {
        chapter: nextChapter,
        title: newChapterTitle.trim(),
        content: '',
        characters: [],
      });

      message.success('章节创建成功');
      setNewChapterModalOpen(false);
      setNewChapterTitle('');

      const chaptersRes = await chaptersApi.list(projectId);
      setChapters(chaptersRes.items || []);

      router.push(`/projects/${projectId}/editor/${newChapter.chapter}`);
    } catch (err) {
      message.error('创建失败');
    }
  }, [chapters, projectId, newChapterTitle, router]);

  // Compute dynamic class names
  const asideClassName = `h-screen bg-surface-container-low flex flex-col shrink-0 border-r border-outline-variant/10 transition-all duration-300 ${
    navCollapsed || immersiveMode ? 'w-0 overflow-hidden' : 'w-[240px]'
  }`;

  const editorClassName = `flex-1 min-w-0 ${previewVisible && !immersiveMode ? 'border-r border-outline-variant/10' : ''}`;

  const previewClassName = `w-[480px] shrink-0 overflow-hidden ${isMediumScreen ? 'w-[400px]' : ''}`;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spin size="large" />
      </div>
    );
  }

  if (!currentChapter) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Empty description="章节不存在" />
      </div>
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden transition-all duration-300 ${immersiveMode ? 'bg-surface-container-lowest' : 'bg-background'}`}>
      {/* Navigation sidebar - hidden in immersive mode */}
      {!immersiveMode && (
        <aside className={asideClassName}>
          <ChapterNav
            chapters={chapters}
            currentChapter={chapterNum}
            projectId={projectId}
            onChapterSelect={handleChapterSwitch}
            onCreateChapter={() => setNewChapterModalOpen(true)}
          />
        </aside>
      )}

      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${immersiveMode ? 'bg-surface-container-lowest items-center' : 'bg-surface'}`}>
        {/* Header - hidden in immersive mode */}
        {!immersiveMode && (
          <header className="flex items-center justify-between px-4 py-2 border-b border-outline-variant/20 bg-surface">
          <div className="flex items-center gap-2">
            <Tooltip title={navCollapsed ? '展开导航' : '折叠导航'}>
              <Button
                type="text"
                icon={navCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setNavCollapsed(!navCollapsed)}
              />
            </Tooltip>
            <span className="text-on-surface font-bold">
              第{chapterNum}章：{currentChapter.title}
            </span>
            {isDirty && (
              <span className="text-xs text-on-surface-variant bg-primary/10 px-2 py-0.5 rounded">
                未保存
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View mode toggle - visible on small/medium screens */}
            {!isLargeScreen && (
              <div className="flex items-center bg-surface-container rounded p-0.5">
                <Tooltip title="编辑模式">
                  <Button
                    type={viewMode === 'edit' ? 'primary' : 'text'}
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => setViewMode('edit')}
                  />
                </Tooltip>
                <Tooltip title="编辑+预览">
                  <Button
                    type={viewMode === 'edit-preview' ? 'primary' : 'text'}
                    size="small"
                    icon={<FileTextOutlined />}
                    onClick={() => setViewMode('edit-preview')}
                  />
                </Tooltip>
                <Tooltip title="预览模式">
                  <Button
                    type={viewMode === 'preview' ? 'primary' : 'text'}
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => setViewMode('preview')}
                  />
                </Tooltip>
              </div>
            )}
            {/* Preview toggle - only on large screens */}
            {isLargeScreen && (
              <Tooltip title={previewVisible ? '隐藏预览' : '显示预览'}>
                <Button
                  type="text"
                  icon={previewVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  onClick={() => setPreviewVisible(!previewVisible)}
                />
              </Tooltip>
            )}
            {/* AI Panel toggle */}
            <Tooltip title="AI 助手">
              <Button
                type="text"
                icon={<RobotOutlined />}
                onClick={() => setAiPanelVisible(!aiPanelVisible)}
                className={aiPanelVisible ? 'text-primary' : ''}
              />
            </Tooltip>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={() => handleSave(false)}
              disabled={!isDirty}
            >
              保存
            </Button>
          </div>
        </header>
        )}

        <div className={`flex-1 flex min-h-0 ${immersiveMode ? 'w-full max-w-[600px] justify-center' : ''}`}>
          {/* Editor - show based on view mode */}
          {(immersiveMode || isLargeScreen || viewMode === 'edit' || viewMode === 'edit-preview') && (
            <div className={immersiveMode ? 'w-full h-full' : editorClassName}>
              <NovelEditor
                content={content}
                onChange={handleContentChange}
                onSave={() => handleSave(false)}
              />
            </div>
          )}

          {/* Preview - hidden in immersive mode */}
          {!immersiveMode && (isLargeScreen ? previewVisible : viewMode === 'preview' || viewMode === 'edit-preview') && (
            <aside className={previewClassName}>
              <NovelPreview content={content} />
            </aside>
          )}
        </div>

        {/* Footer - hidden in immersive mode */}
        {!immersiveMode && (
          <footer className="flex items-center justify-between px-4 py-1.5 border-t border-outline-variant/20 bg-surface-container-low text-xs text-on-surface-variant">
            <div className="flex items-center gap-4">
              <span>字数：{content.length.toLocaleString()}</span>
              <span>章节：{chapterNum} / {chapters.length || 1}</span>
              {/* 笔风匹配度 - 笔风分析功能启用后显示 */}
              {/* {styleMatchScore !== undefined && (
                <span>笔风：{styleMatchScore}%</span>
              )} */}
            </div>
            <div className="flex items-center gap-2">
              {saving ? (
                <>
                  <LoadingOutlined spin />
                  <span className="text-primary">保存中...</span>
                </>
              ) : isDirty ? (
                <>
                  <ExclamationCircleOutlined className="text-amber-500" />
                  <span>未保存</span>
                </>
              ) : (
                <>
                  <CheckCircleOutlined className="text-green-600" />
                  <span className="text-green-600">已保存</span>
                </>
              )}
            </div>
          </footer>
        )}
      </main>

      {/* Immersive mode minimal status bar */}
      {immersiveMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/60 backdrop-blur-md rounded-full text-white/80 text-sm flex items-center gap-4">
          <span>字数：{content.length.toLocaleString()}</span>
          <span className="text-white/40">|</span>
          <span>章节 {chapterNum}/{chapters.length || 1}</span>
          <span className="text-white/40">|</span>
          {saving ? (
            <>
              <LoadingOutlined spin className="text-white/60" />
              <span className="text-white/60">保存中...</span>
            </>
          ) : isDirty ? (
            <>
              <ExclamationCircleOutlined className="text-amber-400" />
              <span className="text-amber-400">未保存</span>
            </>
          ) : (
            <>
              <CheckCircleOutlined className="text-green-400" />
              <span className="text-green-400">已保存</span>
            </>
          )}
          <span className="text-white/40">|</span>
          <span className="text-white/60">Esc 或 ⌘⇧I 退出</span>
        </div>
      )}

      {/* AI Panel - user-triggered floating panel, hidden in immersive mode */}
      {aiPanelVisible && !immersiveMode && (
        <aside className="w-[280px] h-screen glass-panel flex flex-col border-l border-outline-variant/10 shrink-0">
          <div className="p-4 border-b border-outline-variant/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RobotOutlined className="text-primary" />
              <span className="font-bold text-on-surface">Novella AI</span>
            </div>
            <Button
              type="text"
              size="small"
              onClick={() => setAiPanelVisible(false)}
            >
              ✕
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-sm text-on-surface-variant">
              AI 辅助功能将在后续版本提供...
            </p>
          </div>
        </aside>
      )}

      <Modal
        title="创建新章节"
        open={newChapterModalOpen}
        onOk={handleCreateChapter}
        onCancel={() => {
          setNewChapterModalOpen(false);
          setNewChapterTitle('');
        }}
        okText="创建"
        cancelText="取消"
      >
        <Input
          placeholder="输入章节标题"
          value={newChapterTitle}
          onChange={(e) => setNewChapterTitle(e.target.value)}
          onPressEnter={handleCreateChapter}
        />
      </Modal>
    </div>
  );
}