'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Spin,
  Empty,
  Progress,
  Tag,
  Space,
  Popconfirm,
  Tabs,
  Descriptions,
  Statistic,
  Row,
  Col,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  RobotOutlined,
  BookOutlined,
  UserOutlined,
  ExperimentOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { projectsApi, charactersApi, chaptersApi, contextApi } from '@/lib/api';
import SimulationPanel from '@/components/simulation/SimulationPanel';
import { CharacterList, CharacterForm } from '@/components/characters';
import type { Project, Character, Chapter } from '@/types';

const { TextArea } = Input;

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [totalWords, setTotalWords] = useState(0);

  const [characterModalOpen, setCharacterModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [chapterForm] = Form.useForm();

  useEffect(() => {
    const controller = new AbortController();
    loadProjectData(controller.signal);
    return () => controller.abort();
  }, [projectId]);

  const loadProjectData = async (signal?: AbortSignal) => {
    try {
      setLoading(true);

      const [projectRes, chaptersRes, charactersRes] = await Promise.all([
        projectsApi.get(projectId).catch(() => null),
        chaptersApi.list(projectId).catch(() => ({ items: [], total: 0, total_words: 0 })),
        charactersApi.list(projectId).catch(() => ({ items: [], total: 0 })),
      ]);

      if (signal?.aborted) return;

      if (!projectRes) {
        message.error('项目不存在');
        router.push('/');
        return;
      }

      setProject(projectRes);
      setChapters(chaptersRes.items || []);
      setTotalWords(chaptersRes.total_words || 0);
      setCharacters(charactersRes.items || []);
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

  // Chapter handlers
  const handleCreateChapter = async (values: { title: string }) => {
    try {
      const nextChapter = chapters.length > 0
        ? Math.max(...chapters.map(c => c.chapter)) + 1
        : 1;
      await chaptersApi.create(projectId, {
        chapter: nextChapter,
        title: values.title,
        content: '',
        characters: [],
      });
      message.success('章节创建成功');
      setChapterModalOpen(false);
      chapterForm.resetFields();
      loadProjectData();
    } catch (err) {
      message.error('创建失败');
    }
  };

  const handleDeleteChapter = async (chapterNum: number) => {
    try {
      await chaptersApi.delete(projectId, chapterNum);
      message.success('章节已删除');
      loadProjectData();
    } catch (err) {
      message.error('删除失败');
    }
  };

  // Character handlers
  const handleCreateCharacter = () => {
    setEditingCharacter(null);
    setCharacterModalOpen(true);
  };

  const handleEditCharacter = (char: Character) => {
    setEditingCharacter(char);
    setCharacterModalOpen(true);
  };

  const handleSaveCharacter = async (values: Partial<Character>) => {
    try {
      if (!values.name) {
        message.error('角色名称不能为空');
        return;
      }
      if (editingCharacter) {
        await charactersApi.update(projectId, editingCharacter.name, values);
        message.success('角色已更新');
      } else {
        await charactersApi.create(projectId, values);
        message.success('角色创建成功');
      }
      setCharacterModalOpen(false);
      setEditingCharacter(null);
      loadProjectData();
    } catch (err) {
      message.error('保存失败');
      throw err; // Re-throw for form handling
    }
  };

  const handleDeleteCharacter = async (character: Character) => {
    try {
      if (!character.name) {
        message.error('角色名称无效');
        return;
      }
      await charactersApi.delete(projectId, character.name);
      message.success('角色已删除');
      loadProjectData();
    } catch (err) {
      message.error('删除失败');
    }
  };

  // Project handlers
  const handleUpdateProject = async (values: any) => {
    try {
      await projectsApi.update(projectId, values);
      message.success('项目已更新');
      loadProjectData();
    } catch (err) {
      message.error('更新失败');
    }
  };

  const handleDeleteProject = async () => {
    try {
      await projectsApi.delete(projectId);
      message.success('项目已删除');
      router.push('/');
    } catch (err) {
      message.error('删除失败');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Empty description="项目不存在" />
      </div>
    );
  }

  const characterList = characters.map(c => ({
    name: c.name,
    role: c.arc_type || '角色',
    description: c.background || c.appearance || '暂无描述',
  }));

  const tabItems = [
    {
      key: 'chapters',
      label: <span><BookOutlined /> 章节管理</span>,
      children: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant">共 {chapters.length} 章</span>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setChapterModalOpen(true)}>
              新建章节
            </Button>
          </div>
          {chapters.length === 0 ? (
            <Empty description="暂无章节" />
          ) : (
            <div className="grid gap-4">
              {chapters.map((ch) => (
                <Card
                  key={ch.chapter}
                  className="cursor-pointer hover:shadow-md transition-all"
                  onClick={() => router.push(`/projects/${projectId}/editor/${ch.chapter}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant font-bold">
                        {ch.chapter}
                      </div>
                      <div>
                        <h3 className="font-bold text-on-surface">第{ch.chapter}章：{ch.title}</h3>
                        <p className="text-sm text-on-surface-variant">
                          {ch.word_count?.toLocaleString() || 0} 字 · {ch.characters?.length || 0} 角色
                        </p>
                      </div>
                    </div>
                    <Space>
                      <Button icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); router.push(`/projects/${projectId}/editor/${ch.chapter}`); }} />
                      <Popconfirm
                        title="确定要删除此章节吗？"
                        onConfirm={(e) => { e?.stopPropagation(); handleDeleteChapter(ch.chapter); }}
                        onCancel={(e) => e?.stopPropagation()}
                      >
                        <Button danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
                      </Popconfirm>
                    </Space>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'characters',
      label: <span><UserOutlined /> 角色档案</span>,
      children: (
        <CharacterList
          projectId={projectId}
          characters={characters}
          onAddClick={handleCreateCharacter}
          onEditClick={handleEditCharacter}
          onDeleteClick={handleDeleteCharacter}
        />
      ),
    },
    {
      key: 'simulation',
      label: <span><ExperimentOutlined /> 角色模拟</span>,
      children: (
        <SimulationPanel
          projectId={projectId}
          characters={characterList}
          currentChapter={chapters.length}
        />
      ),
    },
    {
      key: 'settings',
      label: <span><SettingOutlined /> 项目设置</span>,
      children: (
        <div className="max-w-2xl space-y-6">
          <Card title="基本信息">
            <Form
              layout="vertical"
              initialValues={project}
              onFinish={handleUpdateProject}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="name" label="项目名称">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="genre" label="题材类型">
                    <Select>
                      <Select.Option value="玄幻">玄幻</Select.Option>
                      <Select.Option value="都市">都市</Select.Option>
                      <Select.Option value="仙侠">仙侠</Select.Option>
                      <Select.Option value="科幻">科幻</Select.Option>
                      <Select.Option value="言情">言情</Select.Option>
                      <Select.Option value="历史">历史</Select.Option>
                      <Select.Option value="悬疑">悬疑</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="description" label="项目描述">
                <TextArea rows={3} />
              </Form.Item>
              <Form.Item name="target_words" label="目标字数">
                <Input type="number" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">保存更改</Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title="统计信息">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="章节" value={chapters.length} />
              </Col>
              <Col span={8}>
                <Statistic title="角色" value={characters.length} />
              </Col>
              <Col span={8}>
                <Statistic title="总字数" value={totalWords} />
              </Col>
            </Row>
          </Card>

          <Card title="危险操作" className="border-red-200">
            <p className="text-on-surface-variant mb-4">删除项目将永久删除所有相关数据，此操作不可恢复。</p>
            <Popconfirm
              title="确定要删除此项目吗？"
              description="此操作不可恢复"
              onConfirm={handleDeleteProject}
              okText="删除"
              okType="danger"
            >
              <Button danger>删除项目</Button>
            </Popconfirm>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-[240px] h-screen bg-surface-container-low flex flex-col py-6 px-4 shrink-0 border-r border-outline-variant/10">
        <div className="mb-6">
          <Link href="/" className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors mb-4">
            <ArrowLeftOutlined />
            <span className="text-sm">返回首页</span>
          </Link>
          <h1 className="text-xl font-bold text-on-surface font-[family-name:var(--font-headline)]">
            {project.name}
          </h1>
          <Tag color="purple">{project.genre}</Tag>
        </div>

        {/* Chapter List */}
        <div className="flex-1 overflow-y-auto">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3 px-2">
            章节目录 ({chapters.length})
          </p>
          <nav className="space-y-1">
            {chapters.slice(0, 10).map((ch) => (
              <Link
                key={ch.chapter}
                href={`/projects/${projectId}/editor/${ch.chapter}`}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-surface-container transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-on-surface-variant text-xs">第{ch.chapter}章</span>
                  <span className="text-on-surface truncate max-w-[100px]">{ch.title}</span>
                </div>
                <EditOutlined className="text-on-surface-variant group-hover:text-primary transition-colors" />
              </Link>
            ))}
            {chapters.length > 10 && (
              <p className="text-xs text-on-surface-variant px-3 py-2">
                还有 {chapters.length - 10} 章...
              </p>
            )}
          </nav>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          block
          onClick={() => setChapterModalOpen(true)}
        >
          新建章节
        </Button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-on-surface font-[family-name:var(--font-headline)]">
                {project.name}
              </h2>
              <p className="text-sm text-on-surface-variant">{project.description || '暂无描述'}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-on-surface-variant">总字数</p>
                <p className="text-lg font-bold text-on-surface">
                  {totalWords.toLocaleString()} / {project.target_words.toLocaleString()}
                </p>
              </div>
              <Progress
                type="circle"
                percent={Math.min(100, (totalWords / project.target_words) * 100)}
                size={50}
                showInfo={false}
              />
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <main className="flex-1 overflow-y-auto bg-surface p-8">
          <Tabs defaultActiveKey="chapters" items={tabItems} />
        </main>
      </div>

      {/* AI Assistant Panel */}
      <aside className="w-[320px] h-screen glass-panel flex flex-col border-l border-outline-variant/10 shrink-0">
        <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RobotOutlined className="text-primary" />
            <span className="font-bold text-on-surface font-[family-name:var(--font-headline)]">
              Novella AI
            </span>
          </div>
          <Tag color="purple">PRO</Tag>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <Card className="text-sm" styles={{ body: { lineHeight: 1.6 } }}>
            你正在编辑「{project.name}」。我可以帮你：
            <ul className="mt-2 space-y-1 list-disc list-inside text-on-surface-variant text-xs">
              <li>生成下一章大纲</li>
              <li>检查角色一致性</li>
              <li>优化文笔风格</li>
              <li>推演角色行为</li>
            </ul>
          </Card>
        </div>
        <div className="p-6 border-t border-outline-variant/10">
          <Input.TextArea
            placeholder="Ask Novella AI to help..."
            autoSize={{ minRows: 2, maxRows: 4 }}
            className="mb-2"
          />
          <Button type="primary" block icon={<span className="material-symbols-outlined text-sm">send</span>}>
            发送
          </Button>
        </div>
      </aside>

      {/* Character Form Modal */}
      <CharacterForm
        open={characterModalOpen}
        character={editingCharacter}
        allCharacters={characters}
        onClose={() => {
          setCharacterModalOpen(false);
          setEditingCharacter(null);
        }}
        onSubmit={handleSaveCharacter}
      />

      {/* Chapter Modal */}
      <Modal
        title="创建章节"
        open={chapterModalOpen}
        onCancel={() => {
          setChapterModalOpen(false);
          chapterForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={chapterForm}
          layout="vertical"
          onFinish={handleCreateChapter}
        >
          <Form.Item
            name="title"
            label="章节标题"
            rules={[{ required: true, message: '请输入章节标题' }]}
          >
            <Input placeholder="输入章节标题" />
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => { setChapterModalOpen(false); chapterForm.resetFields(); }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                创建
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}