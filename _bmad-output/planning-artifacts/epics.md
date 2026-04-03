---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - docs/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - docs/ui_design.md
status: complete
---

# NovelCraft - Epic Breakdown

## Overview

本文档提供 NovelCraft 项目的完整史诗和故事分解，将 PRD、UX Design 和 Architecture 的需求转化为可实施的故事。

## Requirements Inventory

### Functional Requirements

```
FR1: 创建和管理角色档案（姓名、别名、性别、年龄、外貌、背景故事）
FR2: 记录角色性格特质（核心性格标签权重40%、内逻辑、习惯用语、小动作）
FR3: 记录角色动机系统（目标、执念、恐惧、渴望，权重25%）
FR4: 管理角色关系网络（与其他角色的关系类型、关系演变历史）
FR5: 记录角色弧线（弧线类型：成长/堕落/救赎等，预设成长轨迹）
FR6: 角色行为一致性推演（基于性格、状态、动机、外部压力多因素加权）
FR7: 输出推演结果（推荐行为序列前3选择、概率和置信度、动机分析）
FR8: 实时一致性检查（写作时进行：角色行为、语言风格、世界观规则）
FR9: 定期一致性检查（每章节后：角色演变、时间线、伏笔处理）
FR10: 深度一致性检查（每卷后：角色弧线、主题、世界观矛盾）
FR11: 构建知识图谱（LightRAG实体提取、关系构建、混合查询）
FR12: AI文本检测（内容模式、语言模式、风格模式、交流模式检测）
FR13: AI文本评分（85-100优秀、70-84良好、50-69一般、0-49较差）
FR14: 风格迁移支持（金庸、张爱玲、Priest、猫腻四种风格）
FR15: 内容导入（txt/md/docx/平台导出格式）
FR16: 笔风学习分析（句式、词汇、描写、叙事、视角、情感表达六维度）
FR17: 人物自动分析（基础信息、性格画像、语言指纹、关系网络、行为模式、角色弧线）
FR18: 剧情脉络分析（主线轨迹、支线梳理、时间线重建、世界观提取、伏笔追踪）
FR19: 续写辅助模式（笔风匹配续写、角色行为延续、情节连贯续写、伏笔提示、一致性守卫）
FR20: 项目管理（创建、列出、详情、更新、删除项目）
FR21: 知识图谱可视化（获取可视化数据、实体列表、关系列表）
FR22: 类型写作模式（悬疑/推理、言情、奇幻、科幻类型支持）
FR23: 四阶段创作流程支持（构思规划、世界构建、场景创作、审稿修订）
```

### NonFunctional Requirements

```
NFR1: 文件优先 - 所有核心数据存储为Markdown/YAML，人类可直接编辑
NFR2: Git友好 - 天然支持版本控制和协作
NFR3: AI原生 - AI直接读写文件，无需ORM转换
NFR4: 语义增强 - LightRAG提供知识图谱能力
NFR5: 向量检索 - 笔风匹配和语义搜索
NFR6: 离线可用 - 无外部数据库依赖
NFR7: 本地部署 - 单用户本地/私有服务器部署，无认证需求
```

### Additional Requirements

```
AR1: 移除Docsify，采用react-markdown预览组件（ADR-002）
AR2: 添加Zustand状态管理
AR3: 移除Neo4j/Qdrant依赖，仅使用LightRAG本地存储
AR4: 修复编辑器滚动条问题
AR5: 使用OASIS多智能体社交模拟引擎（借鉴MiroFish）
AR6: GraphBuilderService流程（create_graph → set_ontology → add_text_batches → wait_for_episodes）
AR7: ProfileGenerator角色人设自动生成（从实体到Agent Profile）
AR8: SimulationManager状态机（created → preparing → ready → running → done）
AR9: 支持多LLM提供商（OpenAI、阿里百炼、智谱AI、DeepSeek）
```

### UX Design Requirements

```
UX-DR1: 三栏布局设计（章节导航 + Markdown编辑器 + 实时预览）
UX-DR2: 沉浸写作模式（Cmd+Shift+I触发，隐藏UI，居中显示）
UX-DR3: AI辅助面板触发（Cmd+Shift+A全局呼出，>>续写触发，@角色名查看档案）
UX-DR4: 角色卡片弹窗（Cmd+K触发，显示基础信息、语言指纹、当前关系、弧线进度）
UX-DR5: 续写建议卡片（显示笔风匹配度，Tab接受/Esc拒绝）
UX-DR6: 一致性警告提示（实时显示一致性检测结果）
UX-DR7: 快捷键系统（Cmd+S保存、Cmd+N新章节、Cmd+↑/↓切换章节等）
UX-DR8: 状态感知（检测flow/stuck/revising状态，智能响应）
UX-DR9: 自动保存策略（30秒间隔、切换章节时、离开页面时）
UX-DR10: 版本历史管理（最多50版本，每5分钟版本点）
UX-DR11: 响应式设计（大屏三栏、中屏双栏、小屏单栏、移动端纯编辑）
UX-DR12: 深色/浅色主题切换（写作默认深色、阅读默认浅色）
UX-DR13: 中文阅读字体优化（Noto Serif SC、18px字号、1.8行高、首行缩进）
UX-DR14: NovelPreview自定义组件（Paragraph缩进、Dialogue高亮、SceneBreak分隔）
UX-DR15: 编辑器自动补全（@角色名、#设定、[伏笔]触发）
UX-DR16: 底部状态栏（字数、章节、保存状态、笔风匹配度）
```

### FR Coverage Map

| FR | Epic | 说明 |
|-----|------|------|
| FR1 | Epic 2 | 角色档案创建 |
| FR2 | Epic 2 | 性格特质记录 |
| FR3 | Epic 2 | 动机系统 |
| FR4 | Epic 2 | 关系网络管理 |
| FR5 | Epic 2 | 角色弧线记录 |
| FR6 | Epic 3 | 行为一致性推演 |
| FR7 | Epic 3 | 推演结果输出 |
| FR8 | Epic 4 | 实时一致性检查 |
| FR9 | Epic 4 | 定期一致性检查 |
| FR10 | Epic 4 | 深度一致性检查 |
| FR11 | Epic 4 | 知识图谱构建 |
| FR12 | Epic 6 | AI 文本检测 |
| FR13 | Epic 6 | AI 文本评分 |
| FR14 | Epic 6 | 风格迁移支持 |
| FR15 | Epic 5 | 内容导入 |
| FR16 | Epic 5 | 笔风学习分析 |
| FR17 | Epic 5 | 人物自动分析 |
| FR18 | Epic 5 | 剧情脉络分析 |
| FR19 | Epic 5 | 续写辅助模式 |
| FR20 | Epic 1 | 项目管理 |
| FR21 | Epic 4 | 知识图谱可视化 |
| FR22 | Epic 7 | 类型写作模式 |
| FR23 | Epic 7 | 四阶段创作流程 |

**覆盖率：23/23 = 100%**

## Epic List

### Epic 1: 项目与写作基础
用户可以创建项目、管理章节、使用三栏界面进行小说写作，实时预览作品。

**FRs covered:** FR20

**NFRs covered:** NFR1, NFR2, NFR3, NFR6, NFR7

**ARs covered:** AR1, AR3, AR4

**UX-DRs covered:** UX-DR1, UX-DR2, UX-DR7, UX-DR9, UX-DR11, UX-DR12, UX-DR13, UX-DR14, UX-DR15, UX-DR16

### Epic 2: 角色档案管理
用户可以创建完整的角色档案，包括性格、动机、关系网络和角色弧线，在写作时快速查看角色信息。

**FRs covered:** FR1, FR2, FR3, FR4, FR5

**UX-DRs covered:** UX-DR4, UX-DR15

### Epic 3: AI 辅助面板与推演系统
用户可以通过 AI 面板获取角色行为推演建议，了解角色在特定场景下会如何行动及其动机。

**FRs covered:** FR6, FR7

**ARs covered:** AR5, AR7, AR8

**UX-DRs covered:** UX-DR3, UX-DR5, UX-DR8

### Epic 4: 知识图谱与一致性检查
用户可以自动构建小说知识图谱，获得实时的角色、情节、世界观一致性检查和警告。

**FRs covered:** FR8, FR9, FR10, FR11, FR21

**ARs covered:** AR6

**UX-DRs covered:** UX-DR6

### Epic 5: 笔风分析与续写辅助
用户可以导入已有作品，系统自动学习笔风，提供风格匹配的续写建议和伏笔提示。

**FRs covered:** FR15, FR16, FR17, FR18, FR19

**ARs covered:** AR2, AR9

### Epic 6: AI 文本检测与风格迁移
用户可以检测文本中的 AI 痕迹并获得评分，选择特定作家风格进行文本风格迁移。

**FRs covered:** FR12, FR13, FR14

### Epic 7: 类型写作与创作流程
用户可以选择不同类型写作模式（悬疑、言情、奇幻、科幻），按四阶段创作流程完成作品。

**FRs covered:** FR22, FR23

**UX-DRs covered:** UX-DR10

---

## Epic 1: 项目与写作基础

**Epic 目标**：用户可以创建项目、管理章节、使用三栏界面进行小说写作，实时预览作品。

### Story 1.1: 依赖清理与项目结构优化

As a **开发者**,
I want 清理不需要的依赖（Neo4j、Qdrant）并优化项目结构,
So that 项目可以独立运行，无外部数据库依赖。

**Acceptance Criteria:**

**Given** 项目当前依赖包含 neo4j 和 qdrant-client
**When** 执行依赖清理
**Then** requirements.txt 中移除 neo4j 和 qdrant-client 依赖
**And** 后端代码中移除相关 import 语句
**And** 项目可以正常启动

### Story 1.2: 项目列表与创建功能

As a **作者**,
I want 创建新项目并在列表中查看所有项目,
So that 我可以管理多个小说创作项目。

**Acceptance Criteria:**

**Given** 用户访问首页
**When** 页面加载完成
**Then** 显示所有现有项目列表（卡片形式，显示项目名、创建时间、字数统计）

**Given** 用户点击"新建项目"按钮
**When** 填写项目名称并确认
**Then** 创建新项目目录结构（novel/、characters/、settings/、state/）
**And** 跳转到项目详情页

### Story 1.3: 章节导航与三栏布局

As a **作者**,
I want 使用三栏布局（章节导航 + 编辑器 + 预览）进行写作,
So that 我可以方便地在章节间切换并实时预览内容。

**Acceptance Criteria:**

**Given** 用户进入项目编辑器页面
**When** 页面加载完成
**Then** 显示三栏布局：左侧章节导航、中间编辑器、右侧预览区

**Given** 用户在章节导航中点击某章节
**When** 选择完成
**Then** 编辑器加载该章节内容
**And** 预览区同步显示渲染后的内容

**And** 实现响应式设计：大屏三栏、中屏双栏、小屏单栏

### Story 1.4: NovelPreview 组件实现

As a **作者**,
I want 小说预览区使用专门的中文阅读格式渲染,
So that 预览效果更接近实际阅读体验。

**Acceptance Criteria:**

**Given** 编辑器中有 Markdown 内容
**When** 内容更新
**Then** 预览区使用 react-markdown 渲染
**And** 段落首行缩进 2em
**And** 使用 Noto Serif SC 字体，18px 字号，1.8 行高
**And** 支持深色/浅色主题切换

### Story 1.5: 编辑器滚动条修复

As a **作者**,
I want 编辑器滚动条正常工作,
So that 我可以流畅地编辑长章节内容。

**Acceptance Criteria:**

**Given** 章节内容超过编辑器可视区域
**When** 用户滚动鼠标或使用滚动条
**Then** 编辑器内容正常滚动
**And** 滚动条位置与内容位置同步
**And** 预览区可选择性同步滚动

### Story 1.6: 沉浸写作模式

As a **作者**,
I want 按 Cmd+Shift+I 进入沉浸写作模式,
So that 我可以专注于写作，无干扰。

**Acceptance Criteria:**

**Given** 用户在编辑器页面
**When** 按下 Cmd+Shift+I
**Then** 隐藏章节导航和预览区
**And** 编辑区居中显示，宽度约 600px
**And** 背景变为深色
**And** 底部显示极简状态栏（字数、快捷键提示）

**Given** 用户处于沉浸模式
**When** 再次按下 Cmd+Shift+I
**Then** 退出沉浸模式，恢复三栏布局

### Story 1.7: 自动保存与快捷键系统

As a **作者**,
I want 编辑内容自动保存并支持常用快捷键,
So that 我不用担心内容丢失，操作更高效。

**Acceptance Criteria:**

**Given** 用户正在编辑章节
**When** 内容发生变化后 30 秒
**Then** 自动保存当前内容
**And** 状态栏显示"已保存"

**Given** 用户按下 Cmd+S
**When** 触发保存
**Then** 立即保存当前内容

**Given** 用户按下 Cmd+N
**When** 触发新建章节
**Then** 创建新章节并跳转

**Given** 用户按下 Cmd+↑/↓
**When** 触发章节切换
**Then** 切换到上一章/下一章

### Story 1.8: 底部状态栏

As a **作者**,
I want 查看当前写作状态（字数、章节、保存状态）,
So that 我了解当前进度。

**Acceptance Criteria:**

**Given** 用户在编辑器页面
**When** 页面加载或内容变化
**Then** 底部状态栏显示：字数统计、当前章节、保存状态
**And** 如果启用了笔风匹配，显示笔风匹配度

---

## Epic 2: 角色档案管理

**Epic 目标**：用户可以创建完整的角色档案，包括性格、动机、关系网络和角色弧线，在写作时快速查看角色信息。

### Story 2.1: 角色档案创建

As a **作者**,
I want 创建新的角色档案并填写基础信息,
So that 我可以为小说中的每个角色建立完整档案。

**Acceptance Criteria:**

**Given** 用户在项目详情页
**When** 点击"新建角色"按钮
**Then** 打开角色创建表单

**Given** 用户填写角色基础信息（姓名、别名、性别、年龄、外貌描述、背景故事）
**When** 点击保存
**Then** 在 `characters/` 目录下创建 `{角色名}.md` 文件
**And** 文件包含 YAML frontmatter 和 Markdown 内容
**And** 角色列表更新显示新角色

### Story 2.2: 性格特质记录

As a **作者**,
I want 记录角色的性格特质、内逻辑和语言习惯,
So that 系统可以基于性格推演角色行为。

**Acceptance Criteria:**

**Given** 用户编辑角色档案
**When** 填写性格特质部分
**Then** 可以输入：
  - 核心性格标签（如：沉稳、隐忍、责任感强）
  - 内逻辑/价值观（如：守护他人 > 个人得失）
  - 习惯用语和口头禅
  - 典型小动作

**Given** 角色档案已保存性格特质
**When** 查看角色详情
**Then** 性格特质以结构化方式显示
**And** 可用于后续行为推演

### Story 2.3: 动机系统记录

As a **作者**,
I want 记录角色的目标、执念、恐惧和渴望,
So that 系统可以理解角色行为背后的深层动机。

**Acceptance Criteria:**

**Given** 用户编辑角色档案
**When** 填写动机系统部分
**Then** 可以输入：
  - 目标（角色想要达成的）
  - 执念（角色无法放下的）
  - 恐惧（角色最害怕的）
  - 渴望（角色内心真正需要的）

**Given** 动机系统已填写
**When** 进行行为推演时
**Then** 动机因素权重为 25%，影响推演结果

### Story 2.4: 角色关系网络管理

As a **作者**,
I want 记录角色与其他角色的关系及演变历史,
So that 我可以追踪复杂的人物关系网。

**Acceptance Criteria:**

**Given** 用户编辑角色档案
**When** 添加角色关系
**Then** 可以选择其他角色并定义关系类型（朋友、敌人、师徒、恋人等）
**And** 可以设置关系"温度"（亲密、中性、疏远、敌对）

**Given** 关系已建立
**When** 记录关系演变
**Then** 可以添加演变事件（如：第15章从敌对变为合作）
**And** 形成关系演变时间线

### Story 2.5: 角色弧线记录

As a **作者**,
I want 设定角色的成长弧线类型和轨迹,
So that 我可以规划角色的成长路径。

**Acceptance Criteria:**

**Given** 用户编辑角色档案
**When** 设置角色弧线
**Then** 可以选择弧线类型：
  - 成长型（从弱到强）
  - 堕落型（从好到坏）
  - 救赎型（从迷失到觉醒）
  - 平面型（性格基本不变）

**Given** 弧线类型已设置
**When** 记录弧线进度
**Then** 可以标记当前所处阶段（如：成长型弧线中段，面临信念挑战）
**And** 可以预测可能的结局走向

### Story 2.6: 角色卡片弹窗

As a **作者**,
I want 在编辑器中按 Cmd+K 或输入 @角色名 快速查看角色信息,
So that 我不需要离开编辑界面就能了解角色详情。

**Acceptance Criteria:**

**Given** 用户在编辑器中写作
**When** 按下 Cmd+K
**Then** 弹出角色搜索框
**And** 输入角色名后显示角色卡片

**Given** 用户在编辑器中输入 @
**When** 继续输入角色名
**Then** 显示匹配角色的下拉列表
**And** 选择后显示角色卡片弹窗

**Given** 角色卡片显示
**Then** 包含：基础信息、性格摘要、语言指纹、当前关系、弧线进度
**And** 提供"查看完整档案"和"推演行为"按钮

### Story 2.7: 角色列表与搜索

As a **作者**,
I want 查看项目所有角色并进行搜索筛选,
So that 我可以快速找到需要的角色。

**Acceptance Criteria:**

**Given** 用户在项目详情页
**When** 查看角色标签页
**Then** 以卡片网格形式显示所有角色
**And** 每张卡片显示：头像占位、姓名、核心性格标签、当前状态

**Given** 用户输入搜索关键词
**When** 执行搜索
**Then** 实时过滤显示匹配的角色
**And** 支持按性格标签、关系类型筛选

---

## Epic 3: AI 辅助面板与推演系统

**Epic 目标**：用户可以通过 AI 面板获取角色行为推演建议，了解角色在特定场景下会如何行动及其动机。

### Story 3.1: AI 面板组件

As a **作者**,
I want 按 Cmd+Shift+A 呼出 AI 辅助面板,
So that 我可以随时获取 AI 帮助而不离开写作界面。

**Acceptance Criteria:**

**Given** 用户在编辑器页面
**When** 按下 Cmd+Shift+A
**Then** 从右侧滑出 AI 辅助面板
**And** 面板显示模式切换标签：[推演] [续写] [检查] [分析]

**Given** AI 面板已打开
**When** 再次按下 Cmd+Shift+A 或点击关闭按钮
**Then** 面板收起

**And** 面板宽度适中（约 400px），不影响编辑区域

### Story 3.2: 角色行为推演输入

As a **作者**,
I want 输入场景描述并选择角色进行行为推演,
So that 系统可以告诉我这个角色会怎么做。

**Acceptance Criteria:**

**Given** 用户在 AI 面板选择"推演"模式
**When** 面板显示推演表单
**Then** 包含：
  - 角色选择下拉框（从项目角色列表获取）
  - 场景描述文本框
  - 当前状态输入（情绪、身体状况等，可选）
  - 外部压力输入（威胁、时间限制等，可选）

**Given** 用户填写推演请求
**When** 点击"开始推演"
**Then** 显示加载状态
**And** 调用后端推演 API

### Story 3.3: 多因素加权推演引擎

As a **作者**,
I want 系统基于多因素加权模型推演角色行为,
So that 推演结果符合角色设定逻辑。

**Acceptance Criteria:**

**Given** 后端接收推演请求
**When** 执行推演计算
**Then** 按权重计算：
  - 性格特质权重 40%
  - 当前状态权重 20%
  - 内在动机权重 25%
  - 外部压力权重 15%

**Given** 推演计算完成
**When** 返回结果
**Then** 调用 OASIS ProfileGenerator 加载角色 Profile
**And** 使用 SimulationManager 管理推演状态

### Story 3.4: 推演结果展示

As a **作者**,
I want 查看推演结果包含多个选择及概率,
So that 我可以了解角色可能的多种行为方向。

**Acceptance Criteria:**

**Given** 推演完成
**When** 显示推演结果
**Then** 按概率排序展示前 3 个行为选择：
  - 行为描述
  - 概率百分比
  - 置信度（高/中/低）

**Given** 用户展开某个选择的详情
**When** 查看动机分析
**Then** 显示：
  - 该行为背后的动机
  - 与性格特质的关联
  - 与当前状态的关系

### Story 3.5: 一致性检测与提醒

As a **作者**,
I want 推演时自动检测与已有设定的一致性,
So that 我可以避免角色 OOC（Out of Character）。

**Acceptance Criteria:**

**Given** 推演结果返回
**When** 系统检测到潜在一致性问题
**Then** 在结果下方显示警告提示
**And** 说明：
  - 哪个推演结果与已有设定冲突
  - 冲突的具体内容（如：第3章提到角色"从不生气"）
  - 建议的解决方案

### Story 3.6: 续写触发器

As a **作者**,
I want 在编辑器中输入 >> 触发续写建议,
So that 我可以快速获得 AI 续写帮助。

**Acceptance Criteria:**

**Given** 用户在编辑器中输入 >>
**When** 触发续写
**Then** 显示续写建议卡片
**And** 卡片内容包含：
  - 续写文本预览（约 100-200 字）
  - 笔风匹配度百分比
  - [Tab 接受] [Esc 拒绝] [↓ 下一条] 操作提示

**Given** 用户按 Tab
**When** 接受续写
**Then** 续写内容插入到光标位置

### Story 3.7: 写作状态感知

As a **作者**,
I want 系统感知我的写作状态并智能响应,
So that AI 建议在合适的时机出现。

**Acceptance Criteria:**

**Given** 用户正在流畅写作（打字速度 > 0，停顿 < 2秒）
**When** 处于 flow 状态
**Then** 不显示任何 AI 建议，保持安静

**Given** 用户停止输入超过 10 秒
**When** 处于 stuck 状态
**Then** 轻提示显示"需要续写建议吗？>>"

**Given** 用户大量删除内容（> 50 字）
**When** 处于 revising 状态
**Then** 暂停续写触发，避免干扰修订

### Story 3.8: 推演历史与应用

As a **作者**,
I want 查看推演历史并快速应用结果,
So that 我可以参考之前的推演决定。

**Acceptance Criteria:**

**Given** AI 面板显示推演结果
**When** 点击"应用推演"按钮
**Then** 将选中的行为描述插入编辑器光标位置

**Given** 用户点击"查看历史"
**When** 展开历史记录
**Then** 显示最近 10 条推演记录
**And** 每条显示：角色名、场景摘要、选中的行为、时间

---

## Epic 4: 知识图谱与一致性检查

**Epic 目标**：用户可以自动构建小说知识图谱，获得实时的角色、情节、世界观一致性检查和警告。

### Story 4.1: 章节内容图谱构建

As a **作者**,
I want 保存章节时自动构建知识图谱,
So that 系统可以理解小说中的人物、地点、事件关系。

**Acceptance Criteria:**

**Given** 用户保存章节内容
**When** 保存完成
**Then** 后端调用 LightRAG GraphBuilderService：
  - create_graph() 创建/获取项目图谱
  - set_ontology() 设置本体（角色/地点/事件/关系）
  - add_text_batches() 分批添加章节文本
  - wait_for_episodes() 等待处理完成

**Given** 图谱构建完成
**When** 查询图谱
**Then** 可获取实体列表和关系列表

### Story 4.2: 实体自动提取

As a **作者**,
I want 系统自动从章节中提取角色、地点、事件实体,
So that 我可以查看小说世界的完整实体网络。

**Acceptance Criteria:**

**Given** 图谱已构建
**When** 执行实体提取
**Then** 自动识别并提取：
  - 角色实体（人名、别名）
  - 地点实体（城市、建筑、区域）
  - 事件实体（重要情节节点）
  - 物品实体（关键道具）

**Given** 实体提取完成
**When** 查看 API 响应
**Then** 返回实体列表，每个实体包含：
  - 实体名称
  - 实体类型
  - 首次出现章节
  - 提及次数

### Story 4.3: 关系自动构建

As a **作者**,
I want 系统自动识别实体间的关系,
So that 我可以了解角色之间、角色与地点之间的关联。

**Acceptance Criteria:**

**Given** 实体已提取
**When** 构建关系
**Then** 自动识别关系类型：
  - 角色间关系（师徒、朋友、敌人、恋人）
  - 角色与地点关系（居住、工作、出生地）
  - 事件与角色关系（参与者、受害者、发起者）

**Given** 关系构建完成
**When** 查询关系
**Then** 返回关系边列表，每条包含：
  - 起始实体
  - 关系类型
  - 目标实体
  - 来源章节

### Story 4.4: 实时角色一致性检查

As a **作者**,
I want 写作时自动检测角色行为与设定的一致性,
So that 我可以及时发现 OOC 问题。

**Acceptance Criteria:**

**Given** 用户在编辑器中写作
**When** 内容涉及角色行为或对话
**Then** 实时检测：
  - 性格特质一致性（行为是否符合性格）
  - 语言风格一致性（对话是否符合语言指纹）
  - 行为模式一致性（反应是否符合习惯）

**Given** 检测到不一致
**When** 问题确认
**Then** 在编辑器边栏显示黄色警告图标
**And** 悬停显示问题描述和建议

### Story 4.5: 章节级定期检查

As a **作者**,
I want 每章完成后进行综合一致性检查,
So that 我可以确保章节内的情节逻辑正确。

**Acceptance Criteria:**

**Given** 用户完成一章并保存
**When** 触发章节检查
**Then** 检查项目包括：
  - 角色演变合理性（性格变化是否有铺垫）
  - 时间线一致性（事件顺序是否合理）
  - 伏笔处理（是否有新伏笔、已埋伏笔状态）

**Given** 检查完成
**When** 显示检查报告
**Then** 按严重程度分类：
  - 🔴 严重问题（逻辑矛盾）
  - 🟡 警告（潜在问题）
  - 🟢 建议（优化建议）

### Story 4.6: 卷级深度检查

As a **作者**,
I want 完成一卷后进行深度一致性审查,
So that 我可以确保整卷的主题和弧线完整。

**Acceptance Criteria:**

**Given** 用户标记一卷完成
**When** 触发深度检查
**Then** 检查项目包括：
  - 角色弧线完整性（成长轨迹是否合理）
  - 主题一致性（是否有偏离主题的内容）
  - 世界观矛盾（设定是否有冲突）
  - 伏笔回收率（已埋伏笔的回收情况）

**Given** 深度检查完成
**When** 生成报告
**Then** 提供：
  - 问题列表及位置
  - 修复建议
  - 弧线和伏笔的状态图

### Story 4.7: 知识图谱可视化

As a **作者**,
I want 可视化查看小说的知识图谱,
So that 我可以直观了解人物关系和事件网络。

**Acceptance Criteria:**

**Given** 用户在项目详情页
**When** 点击"知识图谱"标签
**Then** 显示交互式图谱视图

**Given** 图谱视图加载
**When** 渲染完成
**Then** 显示：
  - 节点（角色、地点、事件用不同颜色/形状）
  - 边（关系类型用不同线型）
  - 节点可拖拽重排

**Given** 用户点击某节点
**When** 选中实体
**Then** 高亮显示该实体的所有关联
**And** 显示实体详情卡片

### Story 4.8: 一致性警告面板

As a **作者**,
I want 查看所有一致性警告的汇总,
So that 我可以系统地处理所有问题。

**Acceptance Criteria:**

**Given** 用户打开一致性面板
**When** 面板加载
**Then** 显示所有未解决的警告列表
**And** 按严重程度和章节排序

**Given** 用户点击某条警告
**When** 展开详情
**Then** 显示：
  - 问题位置（章节、段落）
  - 问题描述
  - 涉及的角色/设定
  - 建议的修复方案

**Given** 用户处理完警告
**When** 标记为"已解决"
**Then** 从警告列表移除
**And** 记录解决时间

---

## Epic 5: 笔风分析与续写辅助

**Epic 目标**：用户可以导入已有作品，系统自动学习笔风，提供风格匹配的续写建议和伏笔提示。

### Story 5.1: 内容导入上传

As a **作者**,
I want 上传已有的小说文件（txt/md/docx）,
So that 系统可以分析我之前的作品。

**Acceptance Criteria:**

**Given** 用户在项目设置页
**When** 点击"导入已有内容"
**Then** 显示文件上传区域
**And** 支持拖拽上传
**And** 支持的格式：.txt, .md, .docx

**Given** 用户上传文件
**When** 文件验证通过
**Then** 创建导入任务
**And** 显示导入进度条
**And** 后端保存文件到临时目录

### Story 5.2: 内容解析与章节分割

As a **作者**,
I want 系统自动解析并分割章节,
So that 导入的内容可以结构化存储。

**Acceptance Criteria:**

**Given** 文件上传完成
**When** 开始解析
**Then** 根据格式自动识别章节分隔：
  - txt: 识别"第X章"、"Chapter X"等模式
  - md: 识别 # 一级标题
  - docx: 识别段落样式和分页符

**Given** 章节分割完成
**When** 显示预览
**Then** 显示识别到的章节列表
**And** 用户可手动调整分割

**Given** 用户确认分割
**When** 执行导入
**Then** 将章节写入 `novel/chapters/` 目录
**And** 更新 `_sidebar.md` 导航

### Story 5.3: 笔风六维度分析

As a **作者**,
I want 系统分析我作品的笔风特征,
So that 续写时可以保持风格一致。

**Acceptance Criteria:**

**Given** 章节导入完成
**When** 触发笔风分析
**Then** 分析六个维度：

| 维度 | 分析内容 |
|------|----------|
| 句式特征 | 平均句长、短/长句占比、标点偏好 |
| 词汇特征 | 高频词、避用词、口语化程度 |
| 描写风格 | 景物密度、心理描写方式、对话风格 |
| 叙事节奏 | 章节长度、推进速度、高潮周期 |
| 视角习惯 | 人称使用、视角切换频率、POV角色 |
| 情感表达 | 情感词密度、表达方式（直接/间接） |

**Given** 分析完成
**When** 保存笔风指纹
**Then** 写入 `analysis/style-fingerprint.yaml`
**And** 计算置信度分数

### Story 5.4: 笔风指纹可视化

As a **作者**,
I want 查看我的笔风指纹分析结果,
So that 我可以了解自己的写作风格特征。

**Acceptance Criteria:**

**Given** 笔风分析完成
**When** 用户查看笔风指纹页
**Then** 以可视化方式展示：
  - 句式雷达图
  - 高频词云图
  - 叙事节奏折线图
  - 关键指标卡片

**Given** 用户想调整
**When** 编辑笔风指纹
**Then** 可手动调整各维度参数
**And** 调整后影响续写匹配

### Story 5.5: 人物自动分析

As a **作者**,
I want 系统从导入内容中自动提取角色信息,
So that 我可以快速建立角色档案。

**Acceptance Criteria:**

**Given** 章节导入完成
**When** 触发人物分析
**Then** 使用 LLM 分析章节内容
**And** 提取角色信息：
  - 基础信息（姓名、性别、年龄推断）
  - 性格画像（从行为推断特质）
  - 语言指纹（台词风格、口头禅）
  - 关系网络（互动历史）
  - 行为模式（典型反应）

**Given** 分析完成
**When** 显示分析结果
**Then** 以卡片形式列出所有识别到的角色
**And** 用户可确认或修正分析结果
**And** 确认后创建正式角色档案

### Story 5.6: 剧情脉络分析

As a **作者**,
I want 系统分析导入内容的剧情结构,
So that 我可以了解已有的情节发展。

**Acceptance Criteria:**

**Given** 章节导入完成
**When** 触发剧情分析
**Then** 提取：
  - 主线轨迹（核心冲突发展脉络、关键转折点）
  - 支线列表（次要情节线及状态）
  - 时间线（事件顺序、时间跨度）
  - 世界观设定（背景规则、地理信息）
  - 伏笔追踪（已埋/已回收/待回收）

**Given** 分析完成
**When** 保存剧情图谱
**Then** 写入 `analysis/plot-analysis.yaml`
**And** 可在时间线视图查看

### Story 5.7: 笔风匹配续写

As a **作者**,
I want AI 续写内容匹配我的笔风,
So that 续写部分与原文风格一致。

**Acceptance Criteria:**

**Given** 笔风指纹已生成
**When** 用户请求续写
**Then** 续写 API 携带笔风参数：
  - 笔风强度（0-1，默认 0.85）
  - 创新允许度（0-1，默认 0.3）

**Given** LLM 生成续写
**When** 返回结果
**Then** 计算笔风匹配度
**And** 显示匹配百分比

**Given** 用户调整笔风强度
**When** 重新生成
**Then** 匹配度根据参数变化

### Story 5.8: 续写建议与伏笔提示

As a **作者**,
I want 获得续写建议和伏笔处理提示,
So that 我可以更好地推进情节。

**Acceptance Criteria:**

**Given** 用户在编辑器请求续写建议
**When** 系统分析当前上下文
**Then** 提供：
  - 3-5 条续写方向建议
  - 每条建议的笔风匹配度
  - 相关的待回收伏笔提醒

**Given** 存在待回收伏笔
**When** 当前场景适合回收
**Then** 显示伏笔提示卡片：
  - 伏笔内容
  - 埋设位置
  - 建议回收方式

### Story 5.9: 多 LLM 提供商配置

As a **作者**,
I want 配置不同的 LLM 提供商,
So that 我可以选择最适合的 AI 模型。

**Acceptance Criteria:**

**Given** 用户在设置页面
**When** 配置 LLM 提供商
**Then** 支持选择：
  - OpenAI (gpt-4, gpt-4-turbo)
  - 阿里百炼 (qwen-turbo, qwen-plus)
  - 智谱 AI (glm-4)
  - DeepSeek (deepseek-chat)

**Given** 选择提供商
**When** 输入 API Key 和配置
**Then** 保存到环境变量或配置文件
**And** 显示连接测试状态

**Given** 多个提供商配置
**When** 切换提供商
**Then** 后续 AI 调用使用新配置

### Story 5.10: Zustand 状态管理集成

As a **开发者**,
I want 使用 Zustand 管理前端全局状态,
So that 组件间状态共享更简洁。

**Acceptance Criteria:**

**Given** 前端项目结构
**When** 集成 Zustand
**Then** 创建 `lib/store.ts` 管理状态：
  - currentProjectId
  - settings（用户设置）
  - aiPanel（面板状态：visible, mode）
  - styleFingerprint（笔风数据）

**Given** 组件需要访问状态
**When** 使用 useAppStore hook
**Then** 可获取和更新状态
**And** 状态变更触发相关组件重渲染

---

## Epic 6: AI 文本检测与风格迁移

**Epic 目标**：用户可以检测文本中的 AI 痕迹并获得评分，选择特定作家风格进行文本风格迁移。

### Story 6.1: AI 文本检测面板

As a **作者**,
I want 检测选定文本中的 AI 痕迹,
So that 我可以识别哪些内容像 AI 生成的。

**Acceptance Criteria:**

**Given** 用户在编辑器中选中文本
**When** 右键选择"AI 检测"或在 AI 面板选择"检测"模式
**Then** 显示 AI 检测面板

**Given** 检测面板打开
**When** 点击"开始检测"
**Then** 发送选中文本到后端检测 API
**And** 显示加载状态

### Story 6.2: 内容模式检测

As a **作者**,
I want 系统检测文本中的 AI 内容模式,
So that 我可以了解哪些内容特征暴露了 AI 身份。

**Acceptance Criteria:**

**Given** 后端执行内容模式检测
**When** 分析完成
**Then** 检测以下模式：
  - 夸大的象征意义（过度解读普通事物）
  - 过度强调知名度和媒体报道
  - 以 -ing 结尾的肤浅分析
  - 宣传和广告式语言
  - 模糊归因和含糊措辞

**Given** 检测到内容模式
**When** 返回结果
**Then** 列出每个检测到的模式
**And** 标注具体位置和示例

### Story 6.3: 语言模式检测

As a **作者**,
I want 系统检测文本中的 AI 语言模式,
So that 我可以了解哪些用词习惯暴露了 AI 身份。

**Acceptance Criteria:**

**Given** 后端执行语言模式检测
**When** 分析完成
**Then** 检测以下模式：
  - 过度使用的"AI 词汇"（极其、堪称、此外等）
  - 避免使用"是"（系动词回避）
  - 否定式排比
  - 三段式法则过度使用
  - 刻意换词（同义词循环）

**Given** 检测到语言模式
**When** 返回结果
**Then** 高亮显示具体的 AI 词汇
**And** 提供替换建议

### Story 6.4: 中文特有问题检测

As a **作者**,
I want 系统检测中文特有的 AI 写作问题,
So that 我可以修复中文语境下的问题。

**Acceptance Criteria:**

**Given** 后端执行中文特有检测
**When** 分析完成
**Then** 检测以下问题：
  - 定语堆叠症（长修饰语前置）
  - "的"字结构限制（过度使用或刻意回避）
  - 通感误用（不当的感官交叉描写）
  - 视角一致性（叙述视角混乱）

**Given** 检测到中文问题
**When** 返回结果
**Then** 标注问题位置
**And** 提供修改建议

### Story 6.5: AI 痕迹综合评分

As a **作者**,
I want 获得文本的综合 AI 痕迹评分,
So that 我可以快速了解整体情况。

**Acceptance Criteria:**

**Given** 所有模式检测完成
**When** 计算综合评分
**Then** 按权重计算总分：
  - 内容模式权重 25%
  - 语言模式权重 35%
  - 风格模式权重 20%
  - 交流模式权重 10%
  - 中文特有问题权重 10%

**Given** 评分为 85-100
**Then** 等级为"优秀"，显示"几乎无 AI 痕迹"

**Given** 评分为 70-84
**Then** 等级为"良好"，显示"轻微 AI 痕迹"

**Given** 评分为 50-69
**Then** 等级为"一般"，显示"明显 AI 痕迹"

**Given** 评分为 0-49
**Then** 等级为"较差"，显示"严重 AI 痕迹"

### Story 6.6: 检测报告与建议

As a **作者**,
I want 查看详细的检测报告和修复建议,
So that 我可以有针对性地改进文本。

**Acceptance Criteria:**

**Given** AI 检测完成
**When** 查看报告
**Then** 显示：
  - 综合评分和等级
  - 各维度得分雷达图
  - 问题列表（按严重程度排序）
  - 每个问题的具体位置和示例

**Given** 某个问题有修复建议
**When** 点击"查看建议"
**Then** 显示具体的修改方案
**And** 可一键应用修改

### Story 6.7: 风格迁移选择

As a **作者**,
I want 选择特定作家风格进行文本迁移,
So that 我可以让文本具有特定作家的风格特征。

**Acceptance Criteria:**

**Given** 用户在 AI 面板选择"风格迁移"模式
**When** 显示风格选项
**Then** 提供 4 种风格选择：
  - 金庸风格（武侠豪情、家国大义）
  - 张爱玲风格（细腻敏感、城市男女）
  - Priest 风格（耽美、复杂情感）
  - 猫腻风格（网文、文青与爽点结合）

**Given** 选择某风格
**When** 查看风格说明
**Then** 显示该风格的特征描述
**And** 显示示例片段

### Story 6.8: 风格迁移执行

As a **作者**,
I want 将选中文本迁移到指定风格,
So that 我可以改变文本的风格特征。

**Acceptance Criteria:**

**Given** 用户选中文本并选择目标风格
**When** 点击"开始迁移"
**Then** 调用风格迁移 API
**And** 加载对应的风格 Prompt 模板（从 `prompts/styles/` 目录）

**Given** 风格迁移完成
**When** 显示结果
**Then** 显示迁移后的文本
**And** 显示风格匹配度百分比

**Given** 用户满意结果
**When** 点击"应用"
**Then** 用迁移后文本替换原文

### Story 6.9: 风格迁移对比

As a **作者**,
I want 对比原文和迁移后的文本,
So that 我可以决定是否接受修改。

**Acceptance Criteria:**

**Given** 风格迁移完成
**When** 显示对比视图
**Then** 左右并排显示：
  - 左侧：原文
  - 右侧：迁移后文本
  - 差异高亮标记

**Given** 用户不满意
**When** 点击"重新生成"
**Then** 使用更高随机性重新生成

**Given** 用户想调整强度
**When** 拖动风格强度滑块
**Then** 重新生成迁移结果

---

## Epic 7: 类型写作与创作流程

**Epic 目标**：用户可以选择不同类型写作模式（悬疑、言情、奇幻、科幻），按四阶段创作流程完成作品。

### Story 7.1: 类型模板选择

As a **作者**,
I want 在创建项目时选择小说类型,
So that 系统可以提供类型特定的写作指导。

**Acceptance Criteria:**

**Given** 用户创建新项目
**When** 显示项目设置表单
**Then** 提供类型选择：
  - 悬疑/推理
  - 言情
  - 奇幻
  - 科幻
  - 武侠
  - 通用（不限定类型）

**Given** 选择某类型
**When** 确认创建
**Then** 项目元数据记录类型
**And** 加载对应的类型模板

### Story 7.2: 悬疑推理模式

As a **悬疑小说作者**,
I want 系统提供悬疑类型的写作辅助,
So that 我可以更好地布局线索和营造紧张感。

**Acceptance Criteria:**

**Given** 项目类型为悬疑/推理
**When** 进入写作模式
**Then** 提供类型特定功能：
  - 线索管理面板（埋设/回收状态追踪）
  - 紧张感曲线图（显示章节紧张度）
  - 逻辑链检查（推理过程完整性验证）

**Given** 用户添加线索
**When** 记录线索信息
**Then** 可设置：线索名称、发现章节、揭示章节、重要性

### Story 7.3: 言情模式

As a **言情小说作者**,
I want 系统提供言情类型的写作辅助,
So that 我可以更好地描绘情感发展和角色化学反应。

**Acceptance Criteria:**

**Given** 项目类型为言情
**When** 进入写作模式
**Then** 提供类型特定功能：
  - 情感发展曲线（主角情感变化追踪）
  - 角色化学反应图（两人关系互动热度）
  - 内心戏层次提示（情感描写的层次建议）

**Given** 用户记录情感节点
**When** 标记重要情感事件
**Then** 自动更新情感发展曲线

### Story 7.4: 奇幻模式

As a **奇幻小说作者**,
I want 系统提供奇幻类型的写作辅助,
So that 我可以更好地构建世界观和魔法体系。

**Acceptance Criteria:**

**Given** 项目类型为奇幻
**When** 进入写作模式
**Then** 提供类型特定功能：
  - 世界观设定面板（地理、种族、势力）
  - 魔法体系管理（规则、限制、代价）
  - 环境沉浸感检查（场景描写深度）

**Given** 用户定义魔法规则
**When** 设置规则约束
**Then** 后续内容自动检查是否违反魔法设定

### Story 7.5: 科幻模式

As a **科幻小说作者**,
I want 系统提供科幻类型的写作辅助,
So that 我可以更好地设计科技设定和未来社会。

**Acceptance Criteria:**

**Given** 项目类型为科幻
**When** 进入写作模式
**Then** 提供类型特定功能：
  - 科技设定管理（技术原理、限制、影响）
  - 社会规则设计（未来社会结构）
  - 概念新颖性检查（避免陈词滥调）

**Given** 用户定义科技设定
**When** 记录科技细节
**Then** 后续内容检查与设定的一致性

### Story 7.6: 四阶段创作流程

As a **作者**,
I want 按四阶段创作流程完成作品,
So that 我可以有系统地完成小说创作。

**Acceptance Criteria:**

**Given** 用户进入项目
**When** 查看创作流程面板
**Then** 显示四阶段进度：
  - 阶段 1：构思与规划（主题、大纲）
  - 阶段 2：世界构建与角色塑造
  - 阶段 3：场景创作（正文写作）
  - 阶段 4：审稿与修订

**Given** 某阶段进行中
**When** 显示阶段详情
**Then** 显示该阶段的任务清单和完成状态

### Story 7.7: 阶段一 - 构思与规划

As a **作者**,
I want 在构思阶段定义创作核心和大纲,
So that 我可以明确创作方向。

**Acceptance Criteria:**

**Given** 用户进入阶段一
**When** 显示构思面板
**Then** 提供：
  - 主题定义（核心价值观、想表达什么）
  - 大纲编辑器（三幕结构或章节概要）
  - 灵感收集板（随手记录想法）

**Given** 用户完成构思
**When** 标记阶段一完成
**Then** 解锁阶段二的完整功能

### Story 7.8: 阶段二 - 世界构建与角色塑造

As a **作者**,
I want 在世界构建阶段完善设定和角色,
So that 我可以建立完整的创作基础。

**Acceptance Criteria:**

**Given** 用户进入阶段二
**When** 显示构建面板
**Then** 提供：
  - 世界观设定模板（根据类型）
  - 角色档案创建引导（逐步完善角色信息）
  - 关系网络图构建

**Given** 核心设定完成度 > 80%
**When** 检查通过
**Then** 提示可以进入阶段三

### Story 7.9: 阶段三 - 场景创作

As a **作者**,
I want 在创作阶段获得写作辅助,
So that 我可以高效地完成正文写作。

**Acceptance Criteria:**

**Given** 用户进入阶段三
**When** 显示创作面板
**Then** 提供：
  - 章节目标设定（每章要完成什么）
  - 场景推演工具（角色行为预测）
  - 实时一致性检查
  - 续写建议

**Given** 用户写作中
**When** 调用 AI 辅助
**Then** AI 基于前两阶段的设定提供建议

### Story 7.10: 阶段四 - 审稿与修订

As a **作者**,
I want 在审稿阶段获得全面的审查报告,
So that 我可以系统地改进作品。

**Acceptance Criteria:**

**Given** 用户进入阶段四
**When** 显示审稿面板
**Then** 提供：
  - 全文一致性检查报告
  - AI 痕迹检测汇总
  - 伏笔回收率统计
  - 角色弧线完成度分析

**Given** 用户选择某问题
**When** 查看详情
**Then** 定位到具体位置
**And** 提供修复建议

### Story 7.11: 版本历史管理

As a **作者**,
I want 查看和恢复历史版本,
So that 我可以追溯修改历史或回退到之前版本。

**Acceptance Criteria:**

**Given** 自动保存创建版本快照
**When** 每 5 分钟保存一个版本点
**Then** 最多保留 50 个版本

**Given** 用户查看版本历史
**When** 显示版本列表
**Then** 每条显示：时间戳、字数、章节摘要

**Given** 用户选择某历史版本
**When** 点击"预览"
**Then** 显示该版本内容

**Given** 用户想恢复
**When** 点击"恢复到此版本"
**Then** 当前内容替换为历史版本
**And** 创建恢复前备份

### Story 7.12: 导出功能

As a **作者**,
I want 导出完成的小说,
So that 我可以在其他平台发布或备份。

**Acceptance Criteria:**

**Given** 用户在项目设置页
**When** 点击"导出"
**Then** 提供格式选择：
  - Markdown（.md，保留格式）
  - 纯文本（.txt）
  - EPUB（电子书格式）

**Given** 选择导出格式
**When** 执行导出
**Then** 生成文件并下载
**And** 包含所有章节和元数据

---

## Summary

| Epic | 故事数 | 核心价值 |
|------|--------|----------|
| Epic 1 | 8 | 项目与写作基础 |
| Epic 2 | 7 | 角色档案管理 |
| Epic 3 | 8 | AI 辅助面板与推演 |
| Epic 4 | 8 | 知识图谱与一致性检查 |
| Epic 5 | 10 | 笔风分析与续写辅助 |
| Epic 6 | 9 | AI 检测与风格迁移 |
| Epic 7 | 12 | 类型写作与创作流程 |
| **总计** | **62** | |

### 需求覆盖验证

| 需求类型 | 总数 | 已覆盖 | 覆盖率 |
|---------|------|--------|--------|
| FR | 23 | 23 | 100% |
| NFR | 7 | 7 | 100% |
| AR | 9 | 9 | 100% |
| UX-DR | 16 | 16 | 100% |
| **总计** | **55** | **55** | **100%** |