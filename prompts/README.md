# NovelCraft 提示词索引

本目录包含 NovelCraft 系统的所有提示词文件。

---

## 目录结构

```
prompts/
├── system/              # 系统提示词
│   ├── novelcraft-system.md       # 主系统提示词
│   ├── character-inference.md     # 角色推演提示词
│   ├── consistency-checker.md     # 一致性检查提示词
│   └── style-continuation.md      # 笔风匹配续写提示词
│
├── patches/             # 补丁提示词
│   ├── anti-template.md           # 反模板补丁
│   └── liveness-patch.md          # 活人感补丁
│
└── templates/           # 模板集合
    ├── character-templates.md     # 角色构建模板
    ├── chapter-templates.md       # 章节创作模板
    ├── longform-templates.md      # 长篇管理模板
    └── outline-templates.md       # 大纲模板
```

---

## 系统提示词

### novelcraft-system.md

主系统提示词，定义了 NovelCraft 的核心原则：

- 角色自主性原则
- 浸泡优先原则
- 写作四铁律
- 角色构建流程
- 多角色场景管理
- 长篇状态管理
- 审稿清单

**使用场景：** 作为 AI 助手的基础系统提示词。

### character-inference.md

角色行为推演提示词：

- 多因素加权模型（性格 40% + 当前状态 20% + 内在动机 25% + 外部压力 15%）
- 推演流程
- 输出格式
- 处理"叛逆"时刻

**使用场景：** 推演角色在特定场景下的行为。

### consistency-checker.md

一致性检查提示词：

- 角色一致性检查
- 世界观一致性检查
- 叙事一致性检查
- 检查流程
- 常见问题模式

**使用场景：** 检测小说内容中的一致性问题。

### style-continuation.md

笔风匹配续写提示词：

- 笔风匹配维度（句式 25% + 词汇 25% + 描写 20% + 节奏 15% + 视角 15%）
- 续写流程
- 风格检测规则

**使用场景：** 生成匹配作者笔风的续写内容。

---

## 补丁提示词

### anti-template.md

反模板补丁，防止 AI 高频复用相同的互动模板：

- 最容易高频复用的互动模板
- 最危险的语言模板
- 最容易重复的收尾模板
- 发现快写成模板时的修复方向

**使用场景：** 在审稿时检查是否有模板化倾向。

### liveness-patch.md

活人感补丁，防止人物只剩剧情功能：

- 让人物更像活人的原则
- 功能件 → 活人的修正方向
- 角色写崩的常见信号

**使用场景：** 让角色更有"人味"。

---

## 模板集合

### character-templates.md

角色构建相关模板：

1. 角色调色盘模板
2. 多面性模板
3. 行为禁区模板
4. 角色构建检查清单
5. 角色外貌/气质锚点模板

### chapter-templates.md

章节创作相关模板：

1. 章节输入包模板
2. 场景卡模板
3. 章节卡模板
4. 多角色场景卡模板
5. 重场景检查卡
6. 桥梁章模板
7. 章尾检查清单

### longform-templates.md

长篇管理相关模板：

1. 长篇状态层模板
2. 批次笔记模板
3. 跨窗口接力模板
4. 会话快照模板
5. 复盘清单模板

### outline-templates.md

大纲相关模板：

1. 全书总纲模板
2. 弧级细化模板
3. 阶段拆分模板
4. 世界观总档模板
5. 大纲自检清单

---

## 使用指南

### API 调用

```python
from app.services.prompt_service import get_system_prompt, get_template

# 获取系统提示词
system_prompt = get_system_prompt("novelcraft-system")

# 获取模板
character_template = get_template("character-templates", "character-palette")
```

### 前端集成

```typescript
import { getPrompt } from '@/lib/prompts';

// 获取提示词
const systemPrompt = await getPrompt('system/novelcraft-system');
const antiTemplate = await getPrompt('patches/anti-template');
```

### 工作流集成

1. **创作前：** 使用 `novelcraft-system.md` 作为基础提示词
2. **角色推演：** 使用 `character-inference.md` 推演角色行为
3. **审稿时：** 使用 `anti-template.md` 和 `liveness-patch.md` 检查
4. **续写时：** 使用 `style-continuation.md` 匹配笔风
5. **一致性检查：** 使用 `consistency-checker.md` 检测问题

---

## 更新日志

- 2024-04-01: 初始版本，整合 novel-craft 框架核心内容