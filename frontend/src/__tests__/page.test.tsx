import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/app/page';
import * as api from '@/lib/api';

// Mock the API module
jest.mock('@/lib/api', () => ({
  projectsApi: {
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    stats: jest.fn(),
  },
}));

const mockProjects = [
  {
    id: 'proj-1',
    name: '测试项目1',
    description: '这是一个测试项目',
    genre: '玄幻',
    target_style: '',
    target_words: 100000,
    status: 'ongoing',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-03-20T15:30:00Z',
  },
  {
    id: 'proj-2',
    name: '测试项目2',
    description: '另一个测试项目',
    genre: '都市',
    target_style: '',
    target_words: 200000,
    status: 'draft',
    created_at: '2024-02-01T08:00:00Z',
    updated_at: '2024-02-15T12:00:00Z',
  },
];

const mockStats = {
  project_id: 'proj-1',
  project_name: '测试项目1',
  total_chapters: 10,
  total_words: 50000,
  total_characters: 5,
  status: 'ongoing',
  genre: '玄幻',
};

describe('Home Page - Project List', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.projectsApi.list as jest.Mock).mockResolvedValue({
      items: mockProjects,
      total: mockProjects.length,
    });
    (api.projectsApi.stats as jest.Mock).mockResolvedValue(mockStats);
  });

  describe('Task 6.1: 测试项目列表加载', () => {
    it('should display loading state initially', () => {
      (api.projectsApi.list as jest.Mock).mockImplementation(() => new Promise(() => {}));
      render(<Home />);
      // Ant Design Spin component is present
      expect(document.querySelector('.ant-spin')).toBeInTheDocument();
    });

    it('should load and display projects', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(api.projectsApi.list).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('测试项目1')).toBeInTheDocument();
        expect(screen.getByText('测试项目2')).toBeInTheDocument();
      });
    });

    it('should display project stats for each project', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('50,000 字')).toBeInTheDocument();
      });
    });

    it('should handle API error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (api.projectsApi.list as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('加载项目失败')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Task 6.2: 测试项目创建流程', () => {
    it('should open create modal when clicking new project card', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('创建新项目')).toBeInTheDocument();
      });

      const newProjectCard = screen.getByText('创建新项目').closest('.ant-card');
      expect(newProjectCard).toBeInTheDocument();
    });

    it('should create project successfully', async () => {
      const user = userEvent.setup();
      (api.projectsApi.create as jest.Mock).mockResolvedValue({
        id: 'proj-new',
        name: '新项目',
        genre: '玄幻',
        target_words: 100000,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('创建新项目')).toBeInTheDocument();
      });

      // Click new project button
      await user.click(screen.getByText('创建新项目'));

      // Modal should open
      await waitFor(() => {
        expect(screen.getByText('创建新项目')).toBeInTheDocument();
        expect(screen.getByLabelText('项目名称')).toBeInTheDocument();
      });

      // Fill form
      await user.type(screen.getByLabelText('项目名称'), '我的新小说');
      await user.click(screen.getByText('创建项目'));

      await waitFor(() => {
        expect(api.projectsApi.create).toHaveBeenCalledWith(
          expect.objectContaining({
            name: '我的新小说',
            genre: '玄幻',
            target_words: 100000,
          })
        );
      });
    });

    it('should show validation error for empty project name', async () => {
      const user = userEvent.setup();
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('创建新项目')).toBeInTheDocument();
      });

      await user.click(screen.getByText('创建新项目'));

      await waitFor(() => {
        expect(screen.getByLabelText('项目名称')).toBeInTheDocument();
      });

      // Submit without entering name
      await user.click(screen.getByRole('button', { name: '创建项目' }));

      await waitFor(() => {
        expect(screen.getByText('请输入项目名称')).toBeInTheDocument();
      });
    });
  });

  describe('Task 6.3: 测试项目删除流程', () => {
    it('should show delete confirmation dialog', async () => {
      const user = userEvent.setup();
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('测试项目1')).toBeInTheDocument();
      });

      // Find delete button within the project card
      const projectCard = screen.getByText('测试项目1').closest('.ant-card');
      const deleteButton = within(projectCard!).getByRole('img', { name: 'delete' });

      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('确认删除')).toBeInTheDocument();
        expect(screen.getByText('确定要删除此项目吗？此操作不可恢复。')).toBeInTheDocument();
      });
    });

    it('should delete project after confirmation', async () => {
      const user = userEvent.setup();
      (api.projectsApi.delete as jest.Mock).mockResolvedValue({ message: 'success' });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('测试项目1')).toBeInTheDocument();
      });

      const projectCard = screen.getByText('测试项目1').closest('.ant-card');
      const deleteButton = within(projectCard!).getByRole('img', { name: 'delete' });

      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('确认删除')).toBeInTheDocument();
      });

      // Click confirm delete
      await user.click(screen.getByRole('button', { name: '删除' }));

      await waitFor(() => {
        expect(api.projectsApi.delete).toHaveBeenCalledWith('proj-1');
      });
    });

    it('should cancel deletion', async () => {
      const user = userEvent.setup();
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('测试项目1')).toBeInTheDocument();
      });

      const projectCard = screen.getByText('测试项目1').closest('.ant-card');
      const deleteButton = within(projectCard!).getByRole('img', { name: 'delete' });

      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('确认删除')).toBeInTheDocument();
      });

      // Click cancel
      await user.click(screen.getByRole('button', { name: '取消' }));

      await waitFor(() => {
        expect(screen.queryByText('确认删除')).not.toBeInTheDocument();
      });

      // Project should still be visible
      expect(screen.getByText('测试项目1')).toBeInTheDocument();
    });
  });

  describe('Task 6.4: 测试 API 错误处理', () => {
    it('should handle list API error', async () => {
      (api.projectsApi.list as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('加载项目失败')).toBeInTheDocument();
      });
    });

    it('should handle create API error', async () => {
      const user = userEvent.setup();
      (api.projectsApi.create as jest.Mock).mockRejectedValue(new Error('Create failed'));

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('创建新项目')).toBeInTheDocument();
      });

      await user.click(screen.getByText('创建新项目'));

      await waitFor(() => {
        expect(screen.getByLabelText('项目名称')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText('项目名称'), '新项目');
      await user.click(screen.getByRole('button', { name: '创建项目' }));

      await waitFor(() => {
        expect(screen.getByText(/创建失败/)).toBeInTheDocument();
      });
    });

    it('should handle delete API error', async () => {
      const user = userEvent.setup();
      (api.projectsApi.delete as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('测试项目1')).toBeInTheDocument();
      });

      const projectCard = screen.getByText('测试项目1').closest('.ant-card');
      const deleteButton = within(projectCard!).getByRole('img', { name: 'delete' });

      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('确认删除')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '删除' }));

      await waitFor(() => {
        expect(screen.getByText('删除失败')).toBeInTheDocument();
      });
    });

    it('should handle stats API error gracefully', async () => {
      (api.projectsApi.stats as jest.Mock).mockRejectedValue(new Error('Stats error'));

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('测试项目1')).toBeInTheDocument();
      });

      // Should still display projects even if stats fail
      expect(screen.getByText('测试项目2')).toBeInTheDocument();
    });
  });
});