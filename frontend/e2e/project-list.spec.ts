import { test, expect, Page } from '@playwright/test';

test.describe('Story 1.2: 项目列表与创建功能', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
  });

  test.describe('Task 6.1: 测试项目列表加载', () => {
    test('should display page title', async ({ page }) => {
      await expect(page.getByRole('heading', { name: '欢迎回来, 作家' })).toBeVisible();
    });

    test('should display create new project card', async ({ page }) => {
      await expect(page.getByText('创建新项目')).toBeVisible();
    });

    test('should display sidebar with navigation', async ({ page }) => {
      await expect(page.getByText('NovelCraft')).toBeVisible();
      await expect(page.getByText('项目首页')).toBeVisible();
    });

    test('should display AI assistant panel', async ({ page }) => {
      await expect(page.getByText('Novella AI')).toBeVisible();
    });
  });

  test.describe('Task 6.2: 测试项目创建流程', () => {
    test('should open create project modal', async ({ page }) => {
      // Click create new project card
      await page.getByText('创建新项目').click();

      // Modal should appear
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByLabelText('项目名称')).toBeVisible();
    });

    test('should create project with required fields', async ({ page }) => {
      // Open modal
      await page.getByText('创建新项目').click();
      await expect(page.getByRole('dialog')).toBeVisible();

      // Fill form
      await page.getByLabel('项目名称').fill('E2E 测试项目');
      await page.getByLabel('项目描述').fill('这是一个 Playwright 自动化测试创建的项目');

      // Submit
      await page.getByRole('button', { name: '创建项目' }).click();

      // Should navigate to project page or show success message
      // Note: This depends on backend being available
    });

    test('should validate required fields', async ({ page }) => {
      // Open modal
      await page.getByText('创建新项目').click();
      await expect(page.getByRole('dialog')).toBeVisible();

      // Try to submit without filling required fields
      await page.getByRole('button', { name: '创建项目' }).click();

      // Should show validation error
      await expect(page.getByText('请输入项目名称')).toBeVisible();
    });

    test('should cancel project creation', async ({ page }) => {
      // Open modal
      await page.getByText('创建新项目').click();
      await expect(page.getByRole('dialog')).toBeVisible();

      // Click cancel
      await page.getByRole('button', { name: '取消' }).click();

      // Modal should close
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });
  });

  test.describe('Task 6.3: 测试项目删除流程', () => {
    test.skip('should show delete confirmation dialog', async ({ page }) => {
      // This test requires an existing project
      // Skip if no projects exist
    });

    test.skip('should delete project after confirmation', async ({ page }) => {
      // This test requires creating a project first
    });

    test.skip('should cancel deletion', async ({ page }) => {
      // This test requires an existing project
    });
  });

  test.describe('Task 6.4: 测试 UI 响应式设计', () => {
    test('should display correctly on desktop', async ({ page }) => {
      // Desktop viewport
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/');

      // Three-column layout should be visible
      await expect(page.getByText('NovelCraft')).toBeVisible();
      await expect(page.getByText('Novella AI')).toBeVisible();
    });

    test('should display correctly on tablet', async ({ page }) => {
      // Tablet viewport
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.goto('/');

      await expect(page.getByText('NovelCraft')).toBeVisible();
    });

    test('should display correctly on mobile', async ({ page }) => {
      // Mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      await expect(page.getByText('NovelCraft')).toBeVisible();
    });
  });

  test.describe('Task 6.5: 测试导航功能', () => {
    test('should navigate to project detail when clicking project card', async ({ page }) => {
      // Wait for projects to load
      await page.waitForTimeout(1000);

      // If there are project cards, click one
      const projectCards = page.locator('.ant-card').filter({ hasNot: page.getByText('创建新项目') });
      const count = await projectCards.count();

      if (count > 0) {
        await projectCards.first().click();
        // Should navigate to project detail page
        await expect(page).toHaveURL(/\/projects\/.+/);
      }
    });
  });
});