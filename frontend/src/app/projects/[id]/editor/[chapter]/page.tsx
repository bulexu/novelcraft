'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Input,
  message,
  Spin,
  Tag,
  Avatar,
  Card,
} from 'antd';
import {
  SaveOutlined,
  SendOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { chaptersApi, charactersApi, chatApi, styleApi, consistencyApi, inferenceApi } from '@/lib/api';
import {
  SideNavBar,
  AIPanel,
  AIPanelMode,
  AIInferenceCard,
  StatusBar,
  FloatingQuill,
  GlassCard,
  GradientButton,
  IconButton,
  FocusParagraph,
} from '@/components/ui';
import type { Chapter, Character } from '@/types';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const chapterNum = parseInt(params.chapter as string) || 1;

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // AI Panel state
  const [aiMode, setAiMode] = useState<AIPanelMode>('inference');
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string }[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [inferenceResult, setInferenceResult] = useState<{
    prediction: string;
    impact: string;
    confidence: number;
  } | null>(null);

  // Immersive mode
  const [immersive, setImmersive] = useState(false);

  // Load data
  useEffect(() => {
    loadData();
  }, [projectId, chapterNum]);

  useEffect(() => {
    const count = content.replace(/\s/g, '').length;
    setWordCount(count);
  }, [content]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [chapterRes, chaptersRes, charactersRes] = await Promise.all([
        chaptersApi.get(projectId, chapterNum).catch(() => null),
        chaptersApi.list(projectId).catch(() => ({ items: [] })),
        charactersApi.list(projectId).catch(() => ({ items: [] })),
      ]);

      setChapters(chaptersRes.items || []);
      setCharacters(charactersRes.items || []);

      if (chapterRes) {
        setChapter(chapterRes);
        setContent(chapterRes.content || '');
        setTitle(chapterRes.title || '');
        setWordCount(chapterRes.word_count || 0);
      } else {
        const newChapter = await chaptersApi.create(projectId, {
          chapter: chapterNum,
          title: `第${chapterNum}章`,
          content: '',
          characters: [],
        });
        setChapter(newChapter);
        setContent('');
        setTitle(newChapter.title || '');
      }
    } catch (err) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleSave = async () => {
    if (!chapter) return;
    try {
      setSaving(true);
      await chaptersApi.update(projectId, chapterNum, {
        title,
        content,
        word_count: wordCount,
      });
      setLastSaved(new Date());
      message.success('保存成功');
    } catch (err) {
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleAIContinue = async () => {
    if (!content.trim()) {
      message.warning('请先输入一些内容');
      return;
    }
    try {
      setAiLoading(true);
      setAiMode('continue');
      const result = await styleApi.continue(projectId, content, 500);
      setAiMessages(prev => [...prev, {
        role: 'assistant',
        content: result.continued_content,
      }]);
    } catch (err) {
      message.error('续写失败');
    } finally {
      setAiLoading(false);
    }
  };

  const handleConsistencyCheck = async () => {
    if (!content.trim()) {
      message.warning('请先输入一些内容');
      return;
    }
    try {
      setAiLoading(true);
      setAiMode('check');
      const result = await consistencyApi.check(projectId, content, 'all');
      setAiMessages(prev => [...prev, {
        role: 'assistant',
        content: result.result,
      }]);
    } catch (err) {
      message.error('检查失败');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCharacterInference = async (char: Character) => {
    setSelectedCharacter(char);
    setAiMode('inference');
    if (!content.trim()) return;

    try {
      setAiLoading(true);
      const result = await inferenceApi.characterBehavior(
        projectId,
        char.name,
        content.slice(-500)
      );
      setInferenceResult({
        prediction: result.inference_result,
        impact: '基于当前场景和角色性格特征分析',
        confidence: 85,
      });
    } catch (err) {
      message.error('推演失败');
    } finally {
      setAiLoading(false);
    }
  };

  const handleChatSend = async () => {
    if (!aiInput.trim()) return;
    const userMessage = aiInput;
    setAiInput('');
    setAiMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setAiLoading(true);

    try {
      const result = await chatApi.send(projectId, userMessage);
      setAiMessages(prev => [...prev, { role: 'assistant', content: result.response }]);
    } catch (err) {
      setAiMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，出现错误：' + (err instanceof Error ? err.message : '未知错误'),
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddChapter = async () => {
    try {
      const newNum = chapters.length > 0 ? Math.max(...chapters.map(c => c.chapter)) + 1 : 1;
      const newChapter = await chaptersApi.create(projectId, {
        chapter: newNum,
        title: `第${newNum}章`,
        content: '',
        characters: [],
      });
      router.push(`/projects/${projectId}/editor/${newNum}`);
    } catch (err) {
      message.error('创建章节失败');
    }
  };

  // Navigation items
  const navItems = [
    { key: 'manuscript', label: 'Manuscript', icon: 'book_2', active: true },
    { key: 'characters', label: 'Characters', icon: 'group' },
    { key: 'world', label: 'World', icon: 'public' },
    { key: 'timeline', label: 'Timeline', icon: 'timeline' },
  ];

  const chapterItems = chapters.map(ch => ({
    key: `chapter-${ch.chapter}`,
    label: ch.title || `第${ch.chapter}章`,
    icon: ch.chapter === chapterNum ? 'description' : 'folder',
    active: ch.chapter === chapterNum,
  }));

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden ${immersive ? 'immersive-dark' : 'bg-background'}`}>
      {/* Left Sidebar - Navigation */}
      {!immersive && (
        <SideNavBar
          projectName="NovelCraft"
          projectDescription="The Silent Sea"
          items={navItems}
          subItems={chapterItems}
          subItemsTitle="Chapters"
          onNavClick={(key) => {
            if (key.startsWith('chapter-')) {
              const num = key.replace('chapter-', '');
              router.push(`/projects/${projectId}/editor/${num}`);
            }
          }}
        />
      )}

      {/* Main Editor Area */}
      <main className={`flex-1 flex flex-col min-w-0 h-full overflow-hidden ${
        immersive ? 'ml-0' : 'ml-[240px]'
      } ${immersive ? 'mr-0' : 'mr-[320px]'}`}>
        {/* Toolbar */}
        {!immersive && (
          <header className="bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 px-8 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Link href={`/projects/${projectId}`} className="shrink-0">
                <IconButton icon="arrow_back" variant="subtle" />
              </Link>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-bold"
                variant="borderless"
                placeholder="章节标题"
                style={{ fontWeight: 'bold', fontSize: '18px' }}
              />
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Tag color="blue">{wordCount.toLocaleString()} 字</Tag>
              <IconButton
                icon={immersive ? 'fullscreen_exit' : 'fullscreen'}
                onClick={() => setImmersive(!immersive)}
              />
              <GradientButton
                icon={<span className="material-symbols-outlined text-lg">save</span>}
                onClick={handleSave}
                loading={saving}
              >
                保存
              </GradientButton>
            </div>
          </header>
        )}

        {/* Immersive Mode Header */}
        {immersive && (
          <header className="fixed top-0 w-full opacity-0 hover:opacity-100 transition-opacity duration-500 z-50 flex justify-between items-center px-8 py-4 bg-transparent">
            <div className="text-lg font-bold text-slate-100">The Zen Editorial</div>
            <div className="flex gap-4">
              <IconButton icon="fullscreen_exit" onClick={() => setImmersive(false)} />
              <GradientButton onClick={handleSave} loading={saving}>保存</GradientButton>
            </div>
          </header>
        )}

        {/* Manuscript Area */}
        <div className={`flex-1 overflow-y-auto ${immersive ? 'bg-[#1a1a2e]' : 'bg-surface'}`}>
          <div className={`max-w-[800px] mx-auto py-12 px-8 ${
            immersive ? 'pt-24' : ''
          }`}>
            {immersive ? (
              // Immersive mode manuscript
              <div className="font-serif text-[18px] text-slate-200 space-y-8">
                <h1 className="font-headline text-3xl font-extrabold mb-12 text-slate-100 tracking-tight">
                  {title}
                </h1>
                {content.split('\n\n').map((para, i) => (
                  <p key={i} className="chinese-paragraph">
                    {para}
                  </p>
                ))}
                <span className="inline-block w-[2px] h-6 bg-primary-container animate-pulse align-middle" />
              </div>
            ) : (
              // Normal editor
              <div className="bg-surface-container-lowest min-h-[800px] p-16 ambient-shadow rounded-sm">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-transparent border-none outline-none resize-none"
                  placeholder="开始写作..."
                  style={{
                    fontFamily: 'Georgia, "Noto Serif SC", serif',
                    fontSize: '18px',
                    lineHeight: '2',
                    color: 'var(--on-surface)',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Right AI Panel */}
      {!immersive && (
        <div className="fixed right-0 top-0 h-screen w-[320px] z-20">
          <AIPanel
            mode={aiMode}
            onModeChange={setAiMode}
            onClose={() => {}}
            width={320}
          >
            {/* Character Quick Actions */}
            <div className="space-y-3 mb-6">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                角色快速推演
              </p>
              <div className="flex flex-wrap gap-2">
                {characters.slice(0, 4).map((char) => (
                  <button
                    key={char.id}
                    onClick={() => handleCharacterInference(char)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all ${
                      selectedCharacter?.id === char.id
                        ? 'bg-primary text-white'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <Avatar size="small" className="bg-primary/20 text-primary">
                      {char.name[0]}
                    </Avatar>
                    {char.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Inference Result */}
            {aiMode === 'inference' && selectedCharacter && inferenceResult && (
              <AIInferenceCard
                character={selectedCharacter.name}
                confidence={inferenceResult.confidence}
                prediction={inferenceResult.prediction}
                impact={inferenceResult.impact}
              />
            )}

            {/* Continue Mode */}
            {aiMode === 'continue' && (
              <GlassCard className="mb-4">
                <p className="text-xs font-bold text-on-surface-variant mb-2">
                  AI 续写
                </p>
                <GradientButton
                  onClick={handleAIContinue}
                  loading={aiLoading}
                  icon={<ThunderboltOutlined />}
                  block
                >
                  生成续写
                </GradientButton>
              </GlassCard>
            )}

            {/* Check Mode */}
            {aiMode === 'check' && (
              <GlassCard className="mb-4">
                <p className="text-xs font-bold text-on-surface-variant mb-2">
                  一致性检查
                </p>
                <GradientButton
                  onClick={handleConsistencyCheck}
                  loading={aiLoading}
                  icon={<CheckCircleOutlined />}
                  block
                >
                  检查当前内容
                </GradientButton>
              </GlassCard>
            )}

            {/* Chat Messages */}
            {aiMessages.length > 0 && (
              <div className="space-y-3 mt-4">
                {aiMessages.map((msg, i) => (
                  <GlassCard
                    key={i}
                    variant={msg.role === 'user' ? 'elevated' : 'default'}
                    padding="sm"
                    className={msg.role === 'user' ? 'ml-4' : 'mr-4'}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </GlassCard>
                ))}
                {aiLoading && (
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <Spin size="small" />
                    思考中...
                  </div>
                )}
              </div>
            )}

            {/* AI Input */}
            <div className="mt-4 space-y-2">
              <Input.TextArea
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleChatSend();
                  }
                }}
                placeholder="向 AI 提问..."
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
              <GradientButton
                onClick={handleChatSend}
                loading={aiLoading}
                disabled={!aiInput.trim()}
                block
              >
                发送
              </GradientButton>
            </div>
          </AIPanel>
        </div>
      )}

      {/* Status Bar */}
      <StatusBar
        wordCount={wordCount}
        saved={!!lastSaved}
        savedAt={lastSaved?.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        dark={immersive}
      />

      {/* Floating Quill - Add Chapter */}
      <FloatingQuill onClick={handleAddChapter} />
    </div>
  );
}