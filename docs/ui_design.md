# NovelCraft UI 设计文档

## 1. Vibe Writing 设计理念

### 1.1 核心原则

Vibe Writing 继承 Vibe Coding 的核心理念，适配小说创作场景：

| Vibe Coding | Vibe Writing |
|-------------|--------------|
| 自然语言描述意图 → AI 生成代码 | 自然语言描述场景 → AI 推演角色行为 |
| 代码实时预览 | 小说实时渲染（Docsify） |
| 沉浸式开发体验 | 沉浸式写作体验 |
| AI 是协作者 | AI 是角色观察者/推演者 |

### 1.2 设计哲学

- **沉浸优先**：写作时无干扰，全屏沉浸模式
- **直觉交互**：操作符合作家直觉，无需学习复杂 UI
- **实时反馈**：修改即时渲染，所见即所得
- **智能隐形**：AI 辅助在需要时出现，不抢占注意力
- **状态感知**：系统感知写作状态，适时提供帮助

### 1.3 用户旅程

```
启动 → 选择项目 → 进入写作空间
         │
         ▼
    ┌─────────────────────────────────────┐
    │         写作主界面                   │
    │  ┌─────────┬───────────┬─────────┐  │
    │  │ 章节导航│  编辑区   │ 预览区  │  │
    │  │ (Docsify│  (Markdown│ (实时   │  │
    │  │  侧栏)  │   编辑器) │ 渲染)   │  │
    │  └─────────┴───────────┴─────────┘  │
    │         ↓ 快捷键呼出                 │
    │  ┌─────────────────────────────────┐│
    │  │      AI 辅助面板 (浮动)         ││
    │  │  - 角色推演                     ││
    │  │  - 一致性检查                   ││
    │  │  - 笔风匹配续写                 ││
    │  │  - AI 痕迹检测                  ││
    │  └─────────────────────────────────┘│
    └─────────────────────────────────────┘
```

---

## 2. 整体架构

### 2.1 三层结构

```
┌─────────────────────────────────────────────────────────────┐
│                     Vibe Writing App                         │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────  │
│  │                    Docsify Layer                        │
│  │  - 小说预览与阅读                                       │
│  │  - 章节导航与目录                                       │
│  │  - 搜索与定位                                           │
│  │  - 主题与样式                                           │
│  └───────────────────────────────────────────────────────  │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────  │
│  │                   Editor Layer                          │
│  │  - Markdown 编辑器 (Monaco/CodeMirror)                  │
│  │  - 实时同步预览                                         │
│  │  - 快捷键系统                                           │
│  │  - 自动保存                                             │
│  └───────────────────────────────────────────────────────  │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────  │
│  │                   AI Assistant Layer                    │
│  │  - 角色推演面板                                         │
│  │  - 一致性检查器                                         │
│  │  - 笔风续写助手                                         │
│  │  - AI 痕迹检测器                                        │
│  │  - 知识图谱浏览器                                       │
│  └───────────────────────────────────────────────────────  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (FastAPI)                     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 文件组织结构

```
novelcraft/
├── data/
│   └── projects/
│       └── {project-id}/
│           ├── novel/                    # Docsify 小说目录
│           │   ├── README.md             # 项目介绍
│           │   ├── _sidebar.md           # 章节导航
│           │   ├── _navbar.md            # 顶部导航（可选）
│           │   ├── index.html            # Docsify 入口
│           │   ├── chapters/             # 章节文件
│           │   │   ├── 001.md
│           │   │   ├── 002.md
│           │   │   └── ...
│           │   ├── assets/               # 图片等资源
│           │   └── styles/               # 自定义样式
│           │       └── theme.css
│           ├── characters/               # 角色档案
│           │   ├── 张三.md
│           │   ├── 李四.md
│           │   └── ...
│           ├── settings/                 # 世界设定
│           │   ├── 世界观.md
│           │   ├── 时间线.md
│           │   └── ...
│           └── analysis/                 # 分析数据
│               ├── style-fingerprint.json
│               ├── plot-analysis.json
│               └── ...
│
├── web/
│   ├── admin/                            # 管理后台
│   │   └── src/
│   │       ├── app.tsx                   # 主应用
│   │       ├── pages/
│   │       │   ├── projects.tsx          # 项目列表
│   │       │   ├── writing.tsx           # 写作界面
│   │       │   ├── characters.tsx        # 角色管理
│   │       │   ├── analysis.tsx          # 分析面板
│   │       │   └── settings.tsx          # 项目设置
│   │       ├── components/
│   │       │   ├── Editor/               # 编辑器组件
│   │       │   ├── Preview/              # 预览组件
│   │       │   ├── AIPanel/              # AI 辅助面板
│   │       │   ├── CharacterCard/        # 角色卡片
│   │       │   └── Timeline/             # 时间线组件
│   │       └── styles/
│   │           ├── writing.css           # 写作界面样式
│   │           ├── immersive.css         # 沉浸模式样式
│   │           └── ai-panel.css          # AI 面板样式
│   │
│   └── packages/
│       ├── ui/                           # UI 组件库
│       │   ├── Button/
│       │   ├── Modal/
│       │   ├── Toast/
│       │   └── ...
│       └── icons/                        # 图标库
│
└── docs/                                 # 文档
    └── ...
```

---

## 3. Docsify 集成设计

### 3.1 Docsify 配置

每个项目的小说目录都有独立的 Docsify 实例：

```html
<!-- data/projects/{project-id}/novel/index.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>{小说标题} - NovelCraft</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- 主题 -->
  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/vue.css">
  <link rel="stylesheet" href="./styles/theme.css">
  
  <!-- 暗色模式支持 -->
  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify-darklight-theme@latest/dist/style.min.css">
</head>
<body>
  <div id="app">加载中...</div>
  
  <script>
    window.$docsify = {
      name: '{小说标题}',
      repo: '',
      loadSidebar: '_sidebar.md',
      loadNavbar: false,
      
      // 章节自动编排
      auto2top: true,
      maxLevel: 3,
      subMaxLevel: 2,
      
      // 搜索
      search: {
        maxAge: 86400000,
        paths: 'auto',
        placeholder: '搜索',
        noData: '无结果',
      },
      
      // 字数统计
      count: {
        countable: true,
        fontsize: '0.9em',
        color: 'rgb(90,90,90)',
        language: 'chinese',
      },
      
      // 分页导航
      pagination: {
        previousText: '上一章节',
        nextText: '下一章节',
        crossChapter: true,
        crossChapterText: true,
      },
      
      // 外部链接
      externalLinkTarget: '_blank',
      
      // 插件
      plugins: [
        // 章节编号插件
        function(hook, vm) {
          hook.beforeEach(function(content) {
            // 自动添加章节编号
            const file = vm.route.file;
            const chapterNum = file.match(/chapters\/(\d+)/)?.[1];
            if (chapterNum) {
              return `## 第${parseInt(chapterNum)}章\n\n${content}`;
            }
            return content;
          });
        },
        
        // 写作统计插件
        function(hook, vm) {
          hook.doneEach(function() {
            // 更新字数统计到父窗口
            const words = document.querySelector('#main').innerText.length;
            if (window.parent !== window) {
              window.parent.postMessage({
                type: 'wordCount',
                count: words
              }, '*');
            }
          });
        },
      ],
    };
  </script>
  
  <!-- Docsify 核心 -->
  <script src="//cdn.jsdelivr.net/npm/docsify@4/lib/docsify.min.js"></script>
  
  <!-- 插件 -->
  <script src="//cdn.jsdelivr.net/npm/docsify/lib/plugins/search.min.js"></script>
  <script src="//cdn.jsdelivr.net/npm/docsify-count@latest/dist/count.min.js"></script>
  <script src="//cdn.jsdelivr.net/npm/docsify-pagination@latest/dist/docsify-pagination.min.js"></script>
  <script src="//cdn.jsdelivr.net/npm/docsify-darklight-theme@latest/dist/index.min.js"></script>
  
  <!-- 外部嵌入模式 -->
  <script>
    // 监听来自父窗口的消息
    window.addEventListener('message', function(e) {
      if (e.data.type === 'navigate') {
        window.location.hash = e.data.path;
      }
    });
  </script>
</body>
</html>
```

### 3.2 自动章节编排

系统自动生成 `_sidebar.md`：

```markdown
<!-- _sidebar.md - 自动生成 -->

- **作品信息**
  - [简介](README.md)
  - [角色档案](characters/)
  - [世界设定](settings/)

- **正文**
  - [第一章](chapters/001.md)
  - [第二章](chapters/002.md)
  - [第三章](chapters/003.md)
  - ...

- **草稿箱**
  - [待发布章节](drafts/)
```

章节编排规则：
1. 章节文件命名：`{编号}.md`（如 `001.md`, `002.md`）
2. 编号自动排序，支持三位数（最多 999 章）
3. 草稿目录单独管理，发布后移入正文
4. 支持卷/篇分组（如 `第一卷/001.md`）

### 3.3 自定义主题

```css
/* styles/theme.css - 小说阅读主题 */

:root {
  --font-family: 'Noto Serif SC', 'Source Han Serif CN', serif;
  --reading-font-size: 18px;
  --line-height: 1.8;
  --content-max-width: 800px;
  --reading-bg: #faf9f7;
  --reading-text: #333;
}

/* 阅读模式 */
.reading-mode {
  .content {
    font-family: var(--font-family);
    font-size: var(--reading-font-size);
    line-height: var(--line-height);
    max-width: var(--content-max-width);
    background: var(--reading-bg);
    color: var(--reading-text);
    
    /* 段落间距 */
    p {
      margin: 1.5em 0;
      text-indent: 2em; /* 中文段落首行缩进 */
    }
    
    /* 对话格式 */
    .dialogue {
      text-indent: 0;
      padding-left: 1em;
    }
  }
}

/* 暗色阅读模式 */
.dark .reading-mode {
  --reading-bg: #1a1a1a;
  --reading-text: #e0e0e0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  :root {
    --reading-font-size: 16px;
    --content-max-width: 100%;
  }
}

/* 沉浸模式 - 隐藏侧边栏 */
.immersive-mode {
  .sidebar {
    display: none;
  }
  .content {
    max-width: 600px;
    margin: 0 auto;
  }
}
```

---

## 4. 写作主界面设计

### 4.1 三栏布局

```
┌────────────────────────────────────────────────────────────────────┐
│  ┌─ 项目工具栏 ──────────────────────────────────────────────────┐ │
│  │ [项目名] [保存] [导出] [设置] | [沉浸模式] [AI面板] [帮助]    │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌── 章节导航 ──┐  ┌─── Markdown 编辑器 ───┐  ┌── Docsify 预览 ──┐ │
│  │              │  │                       │  │                   │ │
│  │ ▼ 第一卷     │  │ # 第一章              │  │                   │ │
│  │   第1章      │  │                       │  │  第 一 章         │ │
│  │   第2章 ●    │  │ 天色渐暗，...         │  │                   │ │
│  │   第3章      │  │                       │  │  天色渐暗，...    │ │
│  │              │  │ [角色] 张三           │  │                   │ │
│  │ ▼ 第二卷     │  │                       │  │                   │ │
│  │   第4章      │  │                       │  │                   │ │
│  │   ...        │  │                       │  │                   │ │
│  │              │  │                       │  │                   │ │
│  │ ────────────│  │                       │  │                   │ │
│  │ [+ 新章节]   │  │                       │  │                   │ │
│  │              │  │                       │  │                   │ │
│  └──────────────┘  └───────────────────────┘  └───────────────────┘ │
│                                                                     │
│  ┌─ 底部状态栏 ───────────────────────────────────────────────────┐ │
│  │ 字数: 2,847 | 章节: 第2章 | 状态: 已保存 | 笔风匹配度: 92%     │ │
│  └────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

### 4.2 沉浸写作模式

按下 `Cmd/Ctrl + Shift + I` 进入沉浸模式：

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                                                                     │
│                                                                     │
│                     ┌─────────────────────┐                         │
│                     │                     │                         │
│                     │   天色渐暗，        │                         │
│                     │   城西的巷子里      │                         │
│                     │   风声渐紧。        │                         │
│                     │                     │                         │
│                     │   张三站在门口，    │                         │
│                     │   手里的剑          │                         │
│                     │   已经握紧。        │                         │
│                     │                     │                         │
│                     │                     │                         │
│                     └─────────────────────┘                         │
│                                                                     │
│                                                                     │
│                                                                     │
│  ────────────────────────────────────────────────────────────────  │
│  字数: 2,847  │  Cmd+Shift+A 呼出AI  │  Cmd+Shift+I 退出沉浸        │
└────────────────────────────────────────────────────────────────────┘
```

沉浸模式特点：
- 隐藏所有 UI，只保留编辑区域
- 屏幕中央居中显示，宽度约 600px（适合阅读）
- 暗色背景，减少眼疲劳
- 底部极简状态栏
- 快捷键呼出 AI 辅助

### 4.3 编辑器组件设计

```typescript
// components/Editor/Editor.tsx

interface EditorProps {
  projectId: string;
  chapterId: string;
  content: string;
  styleFingerprint?: StyleFingerprint;
  onContentChange: (content: string) => void;
  onSave: () => void;
}

/**
 * Markdown 编辑器组件
 * - 实时同步到 Docsify 预览
 * - 角色标签自动补全
 * - 快捷键系统
 * - 自动保存
 */
export function Editor(props: EditorProps) {
  // 编辑器配置
  const editorConfig = {
    theme: 'immersive-dark',
    lineNumbers: false,
    minimap: false,
    fontSize: 16,
    lineHeight: 28,
    fontFamily: 'Noto Serif SC',
    
    // 中文写作优化
    wordWrap: 'on',
    scrollBeyondLastLine: false,
    
    // 自动补全
    autocomplete: {
      triggers: ['[', '@', '#'],
      providers: [
        CharacterProvider,    // @角色名 补全
        SettingProvider,      // #设定 补全
        ForeshadowProvider,   // [伏笔] 补全
      ],
    },
    
    // 快捷键
    shortcuts: {
      'Cmd+S': save,
      'Cmd+Shift+A': toggleAIPanel,
      'Cmd+Shift+I': toggleImmersive,
      'Cmd+Shift+K': showCharacterCard,
      'Cmd+/': togglePreview,
    },
  };
  
  return (
    <div className="editor-container">
      <MonacoEditor
        value={props.content}
        onChange={props.onContentChange}
        options={editorConfig}
      />
      
      {/* 浮动提示 */}
      <EditorTooltip />
      
      {/* 角色卡片弹窗 */}
      <CharacterPopup />
    </div>
  );
}
```

---

## 5. AI 辅助面板设计

### 5.1 面板触发方式

AI 面板设计为"隐形但随时可用"：

| 触发方式 | 行为 |
|---------|------|
| `Cmd/Ctrl + Shift + A` | 全局呼出 AI 面板 |
| `Cmd/Ctrl + K` | 查看当前角色卡片 |
| 选中文本 + 右键 | AI 分析选中文本 |
| 输入 `>>` 触发符 | 续写提示（类似 Copilot） |
| 输入 `@角色名` | 查看角色档案 |
| 输入 `?问题` | 向知识图谱提问 |

### 5.2 AI 面板组件

```
┌─────────────────────────────────────────┐
│  AI 辅助面板                        [×] │
├─────────────────────────────────────────┤
│  ┌─ 模式切换 ──────────────────────────┐│
│  │ [推演] [续写] [检查] [分析] [图谱]  ││
│  └──────────────────────────────────────┘│
│                                         │
│  ┌─ 角色推演 ──────────────────────────┐│
│  │                                      ││
│  │ 场景: 张三发现真相                   ││
│  │                                      ││
│  │ ┌─ 推演结果 ─────────────────────┐  ││
│  │ │                                │  ││
│  │ │ 优先级排序:                     │  ││
│  │ │ 1. 沉默离开 (65%)              │  ││
│  │ │ 2. 激怒质问 (25%)              │  ││
│  │ │ 3. 强作镇定 (10%)              │  ││
│  │ │                                │  ││
│  │ │ 动机分析:                       │  ││
│  │ │ - 张三的内逻辑：真相 > 和谐    │  ││
│  │ │ - 当前状态：信任被打破          │  ││
│  │ │                                │  ││
│  │ └────────────────────────────────┘  ││
│  │                                      ││
│  │ [应用推演] [调整参数] [查看档案]     ││
│  └──────────────────────────────────────┘│
│                                         │
│  ┌─ 一致性提醒 ────────────────────────┐│
│  │ ⚠ 第3章提到张三"从不生气"，       ││
│  │   当前推演可能需要铺垫             ││
│  └──────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### 5.3 续写触发器设计

类似 GitHub Copilot 的触发方式：

```typescript
// 续写触发器
const ContinueTrigger = {
  trigger: '>>',  // 输入 >> 触发
  
  // 触发后显示建议
  showSuggestions: async (context) => {
    const suggestions = await api.continue.generate({
      projectId,
      chapterId,
      context: getRecentContent(500),  // 取最近500字
      styleFingerprint,  // 笔风指纹
    });
    
    return suggestions.map(s => ({
      text: s.content,
      confidence: s.confidence,
      styleMatch: s.styleMatch,  // 笔风匹配度
    }));
  },
  
  // 建议卡片样式
  suggestionCard: `
    ┌─────────────────────────────────────┐
    │ 续写建议 #1                    92%笔风匹配 │
    │─────────────────────────────────────│
    │ 天色完全暗了下来。巷子尽头传来     │
    │ 脚步声，不急不缓，像是早已熟悉     │
    │ 这条路的人。                       │
    │─────────────────────────────────────│
    │ [Tab 接受] [Esc 拒绝] [↓ 下一条]   │
    └─────────────────────────────────────┘
  `,
};
```

### 5.4 角色卡片弹窗

输入 `@角色名` 或 `Cmd+K` 触发：

```
┌─────────────────────────────────────────┐
│  @张三                              [×] │
├─────────────────────────────────────────┤
│                                         │
│  ┌─ 基础信息 ──────────────────────────┐│
│  │ 姓名: 张三                           ││
│  │ 状态: 第15章 · 信任动摇期            ││
│  │ 性格: 沉稳、隐忍、责任感强            ││
│  └──────────────────────────────────────┘│
│                                         │
│  ┌─ 语言指纹 ──────────────────────────┐│
│  │ "再说吧。"                           ││
│  │ "到时候看。"                         ││
│  │ 简短有力，少废话                      ││
│  └──────────────────────────────────────┘│
│                                         │
│  ┌─ 当前关系 ──────────────────────────┐│
│  │ 李四: 亦敌亦友 · 合作中              ││
│  │ 王五: 师徒 · 信任下降                ││
│  └──────────────────────────────────────┘│
│                                         │
│  ┌─ 弧线进度 ──────────────────────────┐│
│  │ ████████░░ 80% 成长型                ││
│  │ 当前: 面临信念挑战                   ││
│  └──────────────────────────────────────┘│
│                                         │
│  [完整档案] [推演行为] [插入台词]        │
└─────────────────────────────────────────┘
```

---

## 6. 交互设计细节

### 6.1 快捷键系统

| 快捷键 | 功能 | 上下文 |
|--------|------|--------|
| `Cmd/Ctrl + S` | 保存 | 全局 |
| `Cmd/Ctrl + Shift + I` | 沉浸模式 | 写作界面 |
| `Cmd/Ctrl + Shift + A` | AI 面板 | 写作界面 |
| `Cmd/Ctrl + K` | 角色卡片 | 编辑器内 |
| `Cmd/Ctrl + /` | 预览开关 | 写作界面 |
| `Cmd/Ctrl + N` | 新章节 | 写作界面 |
| `Cmd/Ctrl + ↑/↓` | 切换章节 | 写作界面 |
| `>>` | 续写触发 | 编辑器内 |
| `@角色名` | 角色档案 | 编辑器内 |
| `#设定名` | 世界设定 | 编辑器内 |
| `?问题` | 知识图谱问答 | 编辑器内 |

### 6.2 状态感知

系统感知写作状态，智能调整：

```typescript
// 写作状态感知
const WritingStateDetector = {
  // 检测状态
  detect: () => {
    const typingSpeed = getTypingSpeed();
    const pauseDuration = getPauseDuration();
    const recentDeletions = getRecentDeletions();
    
    if (typingSpeed > 0 && pauseDuration < 2s) {
      return 'flow';  // 流畅写作中
    }
    if (pauseDuration > 10s) {
      return 'stuck';  // 可能卡住了
    }
    if (recentDeletions > 50) {
      return 'revising';  // 正在修订
    }
    return 'idle';
  },
  
  // 根据状态响应
  respond: (state) => {
    switch (state) {
      case 'stuck':
        // 10秒无输入，轻提示续写建议
        showSubtleSuggestion('需要续写建议吗？>>');
        break;
      case 'revising':
        // 大量删除，暂停续写触发
        disableContinueTrigger();
        break;
      case 'flow':
        // 流畅写作，保持安静
        hideAllSuggestions();
        break;
    }
  },
};
```

### 6.3 自动保存策略

```typescript
// 自动保存策略
const AutoSaveStrategy = {
  // 触发条件
  triggers: {
    manual: 'Cmd+S',
    interval: 30s,  // 每30秒
    chapterSwitch: true,  // 切换章节时
    blur: true,  // 离开页面时
  },
  
  // 保存状态显示
  statusIndicator: {
    saving: '● 保存中...',
    saved: '✓ 已保存',
    error: '× 保存失败',
    unsaved: '○ 未保存',
  },
  
  // 版本历史
  history: {
    maxVersions: 50,
    interval: 5min,  // 每5分钟一个版本点
    label: (version) => `${version.timestamp} - ${version.wordCount}字`,
  },
};
```

---

## 7. 响应式设计

### 7.1 设备适配

| 设备 | 布局 |
|------|------|
| 大屏 (>1440px) | 三栏：导航 + 编辑 + 预览 |
| 中屏 (1024-1440px) | 双栏：编辑 + 预览，导航折叠 |
| 小屏 (<1024px) | 单栏编辑，预览/导航切换显示 |
| 移动端 | 纯编辑 + 底部工具栏 |

### 7.2 移动端设计

```
┌──────────────────────┐
│ [←] 第2章      [AI] │
├──────────────────────┤
│                      │
│  天色渐暗，          │
│  城西的巷子里        │
│  风声渐紧。          │
│                      │
│  张三站在门口，      │
│  ...                 │
│                      │
│                      │
├──────────────────────┤
│ [预览] [章节] [角色] │
└──────────────────────┘
```

---

## 8. 主题与视觉风格

### 8.1 色彩系统

```css
/* 色彩定义 */
:root {
  /* 深色主题（写作默认） */
  --bg-dark: #1a1a2e;
  --bg-dark-secondary: #16213e;
  --text-dark: #e8e8e8;
  --accent-dark: #0f4c75;
  --highlight-dark: #3282b8;
  
  /* 浅色主题（阅读默认） */
  --bg-light: #faf9f7;
  --bg-light-secondary: #f5f5f5;
  --text-light: #333333;
  --accent-light: #8b7355;
  --highlight-light: #c9a86c;
  
  /* AI 面板专用 */
  --ai-bg: #252542;
  --ai-border: #3a3a5c;
  --ai-accent: #6366f1;
  --ai-suggestion: #10b981;
  --ai-warning: #f59e0b;
}
```

### 8.2 字体策略

```css
/* 字体栈 */
:root {
  /* 阅读字体 - 中文衬线 */
  --font-reading: 'Noto Serif SC', 'Source Han Serif CN', 'STSong', serif;
  
  /* 编辑字体 - 适合长时间输入 */
  --font-editing: 'Noto Sans Mono CJK SC', 'Source Han Sans CN', monospace;
  
  /* UI 字体 */
  --font-ui: 'Noto Sans CJK SC', 'PingFang SC', sans-serif;
  
  /* 字号 */
  --size-reading: 18px;
  --size-editing: 16px;
  --size-ui: 14px;
}
```

---

## 9. 组件库设计

### 9.1 核心 UI 组件

```typescript
// packages/ui/ 组件列表

// Button - 按钮组件
<Button variant="primary|secondary|ghost" size="sm|md|lg">
  操作
</Button>

// Modal - 模态框
<Modal title="角色档案" onClose={handleClose}>
  <CharacterProfile />
</Modal>

// Toast - 轻提示
<Toast type="success|error|warning|info" duration={3000}>
  已保存
</Toast>

// Tooltip - 悬浮提示
<Tooltip content="快捷键: Cmd+K">
  <Button>角色</Button>
</Tooltip>

// Panel - 可折叠面板
<Panel title="角色推演" collapsible>
  <InferenceResult />
</Panel>

// Card - 信息卡片
<Card>
  <CardHeader>张三</CardHeader>
  <CardBody>性格: 沉稳、隐忍</CardBody>
  <CardFooter>
    <Button>查看详情</Button>
  </CardFooter>
</Card>

// Dropdown - 下拉菜单
<Dropdown trigger={<Button>章节</Button>}>
  <DropdownItem>第一章</DropdownItem>
  <DropdownItem>第二章</DropdownItem>
</Dropdown>

// Tabs - 标签切换
<Tabs defaultTab="推演">
  <TabPanel id="推演">...</TabPanel>
  <TabPanel id="续写">...</TabPanel>
  <TabPanel id="检查">...</TabPanel>
</Tabs>

// Progress - 进度条
<Progress value={80} max={100} label="弧线进度" />
```

### 9.2 业务组件

```typescript
// components/ 业务组件列表

// Editor - 编辑器
<Editor 
  content={chapterContent}
  onChange={handleChange}
  onSave={handleSave}
/>

// Preview - Docsify 预览容器
<Preview 
  projectId={projectId}
  chapterPath={chapterPath}
/>

// ChapterNav - 章节导航
<ChapterNav 
  chapters={chapters}
  current={currentChapter}
  onSelect={handleSelect}
/>

// AIPanel - AI 辅助面板
<AIPanel 
  mode="inference|continue|check|analyze|graph"
  context={editorContext}
/>

// CharacterCard - 角色卡片
<CharacterCard 
  character={character}
  compact={true}
/>

// InferenceResult - 推演结果展示
<InferenceResult 
  options={inferenceOptions}
  onSelect={handleSelect}
/>

// ContinueSuggestion - 续写建议卡片
<ContinueSuggestion 
  suggestion={suggestion}
  styleMatch={92}
  onAccept={handleAccept}
/>

// ConsistencyWarning - 一致性警告
<ConsistencyWarning 
  issues={consistencyIssues}
  severity="high|medium|low"
/>

// StyleFingerprint - 笔风指纹展示
<StyleFingerprint 
  fingerprint={styleData}
  editable={true}
/>

// KnowledgeGraph - 知识图谱可视化
<KnowledgeGraph 
  data={graphData}
  interactive={true}
/>

// Timeline - 时间线组件
<Timeline 
  events={timelineEvents}
  characterFilter={selectedCharacter}
/>

// ForeshadowList - 伏笔列表
<ForeshadowList 
  foreshadows={foreshadows}
  status="pending|resolved"
/>

// WordCounter - 字数统计
<WordCounter 
  count={wordCount}
  dailyTarget={5000}
/>

// WritingStatusBar - 底部状态栏
<WritingStatusBar 
  wordCount={count}
  chapter={chapter}
  saveStatus={status}
  styleMatch={match}
/>
```

---

## 10. 实现优先级

### Phase 1 - MVP 前端

- [ ] Docsify 基础集成（预览 + 章节导航）
- [ ] Markdown 编辑器（Monaco Editor）
- [ ] 三栏布局基础结构
- [ ] 章节管理（新建/切换/删除）
- [ ] 自动保存
- [ ] 沉浸模式

### Phase 2 - AI 辅助界面

- [ ] AI 面板组件
- [ ] 角色推演界面
- [ ] 续写触发器（>>）
- [ ] 角色卡片弹窗（@角色名）
- [ ] 一致性警告提示

### Phase 3 - 高级功能

- [ ] 笔风指纹可视化
- [ ] 知识图谱交互界面
- [ ] 时间线可视化
- [ ] 伏笔追踪界面
- [ ] 内容导入流程 UI
- [ ] 移动端适配