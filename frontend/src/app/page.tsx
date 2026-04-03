'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  Button,
  Input,
  Modal,
  Form,
  Select,
  message,
  Spin,
  Progress,
  Tag,
  Space,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  BellOutlined,
  SettingOutlined,
  EditOutlined,
  DeleteOutlined,
  RobotOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { projectsApi } from '@/lib/api';
import type { Project, ProjectStats } from '@/types';

const { Meta } = Card;

export default function Home() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectStats, setProjectStats] = useState<Record<string, ProjectStats>>({});
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();

  useEffect(() => {
    const controller = new AbortController();
    loadProjects(controller.signal);
    return () => controller.abort();
  }, []);

  const loadProjects = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const result = await projectsApi.list();

      // Defensive check for empty/undefined items
      const projectList = result.items || [];

      if (signal?.aborted) return;

      setProjects(projectList);

      // Parallelize stats requests to avoid N+1 problem
      const statsPromises = projectList.map(project =>
        projectsApi.stats(project.id)
          .catch(() => ({
            project_id: project.id,
            project_name: project.name,
            total_chapters: 0,
            total_words: 0,
            total_characters: 0,
            status: project.status,
            genre: project.genre,
          }))
      );

      const statsResults = await Promise.all(statsPromises);

      if (signal?.aborted) return;

      const statsMap: Record<string, ProjectStats> = {};
      statsResults.forEach(stats => {
        statsMap[stats.project_id] = stats;
      });
      setProjectStats(statsMap);
    } catch (err) {
      if (!signal?.aborted) {
        message.error('加载项目失败');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  const handleCreateProject = async (values: { name: string; genre: string; target_words: number; description: string }) => {
    try {
      await projectsApi.create({
        name: values.name,
        genre: values.genre,
        target_words: values.target_words || 100000,
        description: values.description,
      });
      message.success('项目创建成功');
      setCreateModalOpen(false);
      createForm.resetFields();
      loadProjects();
    } catch (err) {
      message.error('创建失败: ' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除此项目吗？此操作不可恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await projectsApi.delete(projectId);
          message.success('项目已删除');
          loadProjects();
        } catch (err) {
          message.error('删除失败');
        }
      },
    });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '未知';
    try {
      const date = new Date(dateStr);
      // Check for invalid date
      if (isNaN(date.getTime())) return '未知';

      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (hours < 1) return '刚刚';
      if (hours < 24) return `${hours}小时前`;
      if (days < 7) return `${days}天前`;
      return date.toLocaleDateString('zh-CN');
    } catch {
      return '未知';
    }
  };

  const getProgress = (project: Project) => {
    const stats = projectStats[project.id];
    if (!stats) return 0;
    return Math.min(100, Math.round((stats.total_words / project.target_words) * 100));
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      completed: { color: 'success', text: '已完成' },
      ongoing: { color: 'processing', text: '进行中' },
      draft: { color: 'default', text: '草稿' },
    };
    const s = statusMap[status] || statusMap.draft;
    return <Tag color={s.color}>{s.text}</Tag>;
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-[240px] h-screen bg-surface-container-low flex flex-col py-6 px-4 shrink-0 border-r border-outline-variant/10">
        <div className="mb-8">
          <h1 className="text-xl font-black font-[family-name:var(--font-headline)] text-on-surface tracking-tight">
            NovelCraft
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">Vibe Writing Studio</p>
        </div>

        <nav className="flex-1">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3 px-2">
            导航
          </p>
          <div className="space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-container text-primary font-bold"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                home
              </span>
              <span className="text-sm">项目首页</span>
            </Link>
          </div>
        </nav>

        <div className="pt-4 border-t border-outline-variant/10">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3 px-2">
            设置
          </p>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors w-full">
            <SettingOutlined />
            <span className="text-sm">偏好设置</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="w-full sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 flex justify-between items-center px-8 h-16 shrink-0">
          <div className="flex items-center gap-6 flex-1">
            <Input
              prefix={<SearchOutlined className="text-on-surface-variant opacity-40" />}
              placeholder="搜索项目、角色..."
              className="max-w-md"
              variant="borderless"
              style={{ backgroundColor: 'var(--surface-container-low)' }}
            />
          </div>
          <div className="flex items-center gap-4 ml-6">
            <Button type="text" icon={<BellOutlined />} />
            <Button type="text" icon={<ThunderboltOutlined />} />
            <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/20 ml-2 bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">person</span>
            </div>
          </div>
        </header>

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto bg-surface p-8">
          <div className="max-w-[1000px] mx-auto">
            {/* Welcome Header */}
            <header className="mb-12">
              <h2 className="text-3xl font-black font-[family-name:var(--font-headline)] text-on-surface tracking-tight mb-2">
                欢迎回来, 作家
              </h2>
              <p className="text-on-surface-variant">
                Continue your literary journey where you left off.
              </p>
            </header>

            {/* Projects Grid */}
            <Spin spinning={loading}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* New Project Card */}
                <Card
                  className="cursor-pointer border-dashed border-2 hover:border-primary/40 transition-all min-h-[200px]"
                  styles={{ body: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' } }}
                  onClick={() => setCreateModalOpen(true)}
                >
                  <PlusOutlined className="text-4xl text-on-surface-variant mb-3" />
                  <span className="text-sm font-bold text-on-surface-variant">创建新项目</span>
                </Card>

                {/* Project Cards */}
                {projects.map((project) => {
                  const stats = projectStats[project.id];
                  return (
                    <Card
                      key={project.id}
                      className="cursor-pointer hover:shadow-lg transition-all group"
                      onClick={() => router.push(`/projects/${project.id}`)}
                      actions={[
                        <EditOutlined key="edit" onClick={(e) => { e.stopPropagation(); router.push(`/projects/${project.id}`); }} />,
                        <DeleteOutlined key="delete" onClick={(e) => handleDeleteProject(project.id, e)} />,
                      ]}
                    >
                      <Meta
                        title={
                          <div className="flex items-center justify-between">
                            <span className="group-hover:text-primary transition-colors">{project.name}</span>
                            {getStatusTag(project.status)}
                          </div>
                        }
                        description={
                          <div className="space-y-2">
                            <p className="text-on-surface-variant text-xs">{project.genre}</p>
                            <p className="text-on-surface-variant line-clamp-2">{project.description || '暂无描述'}</p>
                            <div className="flex items-center justify-between text-xs text-on-surface-variant">
                              <span>{stats?.total_words?.toLocaleString() || 0} 字</span>
                              <span>{formatDate(project.updated_at)}</span>
                            </div>
                            <Progress percent={getProgress(project)} showInfo={false} size="small" />
                          </div>
                        }
                      />
                    </Card>
                  );
                })}
              </div>
            </Spin>

            {/* Recent Activity */}
            <section className="mt-16">
              <div className="flex justify-between items-end mb-6">
                <h4 className="font-bold font-[family-name:var(--font-headline)] text-on-surface">
                  近期协作建议
                </h4>
                <Button type="link" size="small">查看全部</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="hover:bg-surface-container transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shrink-0 shadow-sm">
                      <RobotOutlined />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-on-surface mb-1">AI 写作助手已就绪</h5>
                      <p className="text-xs text-on-surface-variant">
                        在编辑器中使用 AI 续写、角色推演等功能提升创作效率
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="hover:bg-surface-container transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-tertiary shrink-0 shadow-sm">
                      <span className="material-symbols-outlined">psychology</span>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-on-surface mb-1">角色社交模拟</h5>
                      <p className="text-xs text-on-surface-variant">
                        使用 Oasis 模拟角色在虚拟社交平台的互动，预测故事发展
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </section>
          </div>
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
            你好！我是 Novella AI，你的创作助手。我可以帮你：
            <ul className="mt-2 space-y-1 list-disc list-inside text-on-surface-variant text-xs">
              <li>生成故事大纲</li>
              <li>续写章节内容</li>
              <li>推演角色行为</li>
              <li>检查内容一致性</li>
              <li>模拟角色社交互动</li>
            </ul>
          </Card>
        </div>
        <div className="p-6 border-t border-outline-variant/10">
          <Input.TextArea
            placeholder="向 Novella AI 请求帮助..."
            autoSize={{ minRows: 2, maxRows: 4 }}
            className="mb-2"
          />
          <Button type="primary" block icon={<span className="material-symbols-outlined text-sm">send</span>}>
            发送
          </Button>
        </div>
      </aside>

      {/* Create Project Modal */}
      <Modal
        title="创建新项目"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateProject}
          initialValues={{ genre: '玄幻', target_words: 100000 }}
        >
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="输入项目名称" />
          </Form.Item>
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
          <Form.Item name="target_words" label="目标字数">
            <Input type="number" placeholder="目标字数" />
          </Form.Item>
          <Form.Item name="description" label="项目描述">
            <Input.TextArea rows={3} placeholder="简单描述你的故事..." />
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => { setCreateModalOpen(false); createForm.resetFields(); }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                创建项目
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}