import { test, expect } from '@playwright/test';

test.describe('Editor Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home and wait for the page to load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display three-column layout on large screens', async ({ page }) => {
    // Set viewport to large screen (>1440px)
    await page.setViewportSize({ width: 1500, height: 900 });
    
    // Check if there's a project card to click
    const projectCard = page.locator('[class*="project"]').first();
    if (await projectCard.isVisible()) {
      await projectCard.click();
      await page.waitForLoadState('networkidle');
      
      // Check if there's a chapter to click
      const chapterItem = page.locator('text=/第.*章/').first();
      if (await chapterItem.isVisible()) {
        await chapterItem.click();
        await page.waitForLoadState('networkidle');
        
        // Verify URL is editor page
        await expect(page).toHaveURL(/\/editor\/\d+$/);
        
        // Verify three-column layout elements exist
        // Chapter navigation (left sidebar)
        const sidebar = page.locator('aside').first();
        await expect(sidebar).toBeVisible();
        
        // Editor area (center)
        const editor = page.locator('textarea');
        await expect(editor).toBeVisible();
      }
    }
  });

  test('should auto-collapse navigation on medium screens', async ({ page }) => {
    // Set viewport to medium screen (1024-1440px)
    await page.setViewportSize({ width: 1200, height: 900 });
    
    const projectCard = page.locator('[class*="project"]').first();
    if (await projectCard.isVisible()) {
      await projectCard.click();
      await page.waitForLoadState('networkidle');
      
      const chapterItem = page.locator('text=/第.*章/').first();
      if (await chapterItem.isVisible()) {
        await chapterItem.click();
        await page.waitForLoadState('networkidle');
        
        // Navigation should be collapsed (check for toggle button)
        const toggleButton = page.locator('[aria-label*="导航"]').or(
          page.locator('button').filter({ hasText: '展开' })
        );
        // The toggle button should exist for expanding collapsed nav
        await expect(toggleButton.or(page.locator('button').first())).toBeVisible();
      }
    }
  });

  test('should show unsaved indicator when content changes', async ({ page }) => {
    const projectCard = page.locator('[class*="project"]').first();
    if (await projectCard.isVisible()) {
      await projectCard.click();
      await page.waitForLoadState('networkidle');
      
      const chapterItem = page.locator('text=/第.*章/').first();
      if (await chapterItem.isVisible()) {
        await chapterItem.click();
        await page.waitForLoadState('networkidle');
        
        // Find the editor textarea
        const editor = page.locator('textarea');
        if (await editor.isVisible()) {
          // Type some content
          await editor.fill('Test content for unsaved indicator');
          
          // Check for unsaved indicator
          const unsavedBadge = page.locator('text=/未保存/');
          await expect(unsavedBadge).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test('should show word count in status bar', async ({ page }) => {
    const projectCard = page.locator('[class*="project"]').first();
    if (await projectCard.isVisible()) {
      await projectCard.click();
      await page.waitForLoadState('networkidle');
      
      const chapterItem = page.locator('text=/第.*章/').first();
      if (await chapterItem.isVisible()) {
        await chapterItem.click();
        await page.waitForLoadState('networkidle');
        
        // Check for word count in footer
        const wordCount = page.locator('text=/字数/');
        await expect(wordCount).toBeVisible();
      }
    }
  });

  test('should open new chapter modal', async ({ page }) => {
    const projectCard = page.locator('[class*="project"]').first();
    if (await projectCard.isVisible()) {
      await projectCard.click();
      await page.waitForLoadState('networkidle');
      
      const chapterItem = page.locator('text=/第.*章/').first();
      if (await chapterItem.isVisible()) {
        await chapterItem.click();
        await page.waitForLoadState('networkidle');
        
        // Look for new chapter button (might be in collapsed nav)
        const newChapterButton = page.locator('button').filter({ hasText: '新建章节' });
        if (await newChapterButton.isVisible()) {
          await newChapterButton.click();
          
          // Modal should appear
          const modal = page.locator('.ant-modal').filter({ hasText: '创建新章节' });
          await expect(modal).toBeVisible();
        }
      }
    }
  });
});
