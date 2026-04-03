# NovelCraft 产品需求文档 (PRD)

## 1. 产品概述

### 1.1 产品定位

NovelCraft 是一个 AI 驱动的中文小说创作辅助系统，专注于**角色自主性行为推演、一致性追踪、世界观管理、笔风演化学习**和 **AI 文本检测**。

**核心特色**：
- 支持导入已有创作内容，自动学习作者笔风，实现风格无缝延续
- 从现有内容智能分析人物设定和剧情脉络，快速建立创作上下文
- 帮助作者在续写过程中保持角色、情节、风格的一致性
- 提供智能化的创作辅助，而非替代作者创作

### 1.2 目标用户
- 中文网络小说作者
- 长篇小说创作者
- 需要管理复杂角色关系的作者
- 追求高质量创作的写作者

### 1.3 核心价值

- **角色生命力**：角色丰满到一定程度会"叛逆"，做出符合自己逻辑的行为
- **一致性保障**：自动检测角色、情节、世界观的一致性问题
- **笔风无缝延续**：导入已有创作，学习作者独特笔风，实现风格一致的续写辅助
- **智能分析导入**：从现有内容自动提取人物设定、剧情脉络、伏笔线索
- **AI 痕迹消除**：检测并修复 AI 生成文本的特征，使其更接近人类写作风格
- **知识图谱**：构建小说世界的实体关系网络，辅助创作决策

---

## 2. 核心功能模块

### 2.1 角色档案管理

#### 功能描述
创建和管理角色档案，记录角色的外貌、性格、背景、动机、语言风格等。

#### 数据结构
```yaml
角色档案:
  基础信息:
    - 姓名、别名、性别、年龄
    - 外貌描述
    - 背景故事
  性格特质:
    - 核心性格标签 (权重 40%)
    - 内逻辑 (价值观和信念系统)
    - 习惯用语、小动作
  动机系统:
    - 目标、执念、恐惧、渴望 (权重 25%)
  关系网络:
    - 与其他角色的关系类型
    - 关系演变历史
  角色弧线:
    - 弧线类型 (成长/堕落/救赎等)
    - 预设的成长轨迹
```

#### API 端点
- `POST /api/v1/characters/` - 创建角色
- `GET /api/v1/characters/` - 列出角色
- `GET /api/v1/characters/{id}` - 获取角色详情
- `PUT /api/v1/characters/{id}` - 更新角色
- `DELETE /api/v1/characters/{id}` - 删除角色
- `POST /api/v1/characters/{id}/evolution` - 记录角色演变
- `GET /api/v1/characters/{id}/evolution` - 获取演变时间线

### 2.2 行为一致性推演

#### 功能描述
基于角色档案推演角色在特定场景下的行为，遵循"角色自主性"原则。

#### 推演优先级
1. **角色会怎么做？**（第一优先级）
   - 考虑性格、经历、当前状态、内在动机
2. **不是"情节需要角色怎么做？"**

#### 多因素加权模型
| 因素 | 权重 | 说明 |
|------|------|------|
| 性格特质 | 40% | 核心性格标签、内逻辑 |
| 当前状态 | 20% | 情绪、身体状态、环境压力 |
| 内在动机 | 25% | 目标、执念、恐惧、渴望 |
| 外部压力 | 15% | 威胁、时间限制、他人期望 |

#### 输出格式
- 推荐的行为序列（最可能的前 3 个选择）
- 每个行为的概率和置信度
- 背后的动机分析
- 多个合理选择时的差异说明

#### API 端点
- `POST /api/v1/characters/check` - 检查行为一致性

### 2.3 一致性检查系统

#### 检查维度

**角色一致性：**
- 性格特质一致性
- 行为模式一致性
- 语言风格一致性
- 内逻辑一致性

**世界观一致性：**
- 规则遵守
- 时间线一致性
- 物理逻辑一致性

**叙事一致性：**
- 伏笔回收
- 信息披露范围

#### 检查流程
- **实时检查**：写作时进行（角色行为、语言风格、世界观规则）
- **定期检查**：每章节后（角色演变、时间线、伏笔处理）
- **深度检查**：每卷后（角色弧线、主题、世界观矛盾）

### 2.4 知识图谱系统

#### 功能描述
使用 LightRAG 构建小说世界的知识图谱，支持实体提取、关系构建和混合查询。

#### 技术实现
- **LightRAG**：提供实体提取和关系构建
- **Neo4j**：图数据库存储和可视化
- **Qdrant**：向量检索支持语义搜索

#### API 端点
- `POST /api/v1/kg/build` - 构建知识图谱
- `POST /api/v1/kg/add` - 添加内容
- `POST /api/v1/kg/query` - 查询知识图谱
- `GET /api/v1/kg/visualize` - 获取可视化数据
- `GET /api/v1/kg/entities` - 获取实体列表
- `GET /api/v1/kg/relations` - 获取关系列表

### 2.5 AI 文本检测与人性化处理

#### 检测模式分类

**内容模式：**
- 夸大的象征意义
- 过度强调知名度和媒体报道
- 以 -ing 结尾的肤浅分析
- 宣传和广告式语言
- 模糊归因和含糊措辞

**语言模式：**
- 过度使用的"AI 词汇"
- 避免使用"是"（系动词回避）
- 否定式排比
- 三段式法则过度使用
- 刻意换词（同义词循环）

**风格模式：**
- 破折号过度使用
- 粗体过度使用
- 内联标题垂直列表

**交流模式：**
- 协作交流痕迹
- 知识截止日期免责声明
- 谄媚语气

**中文特有问题：**
- 定语堆叠症（长修饰语前置）
- "的"字结构限制
- 通感误用
- 视角一致性

#### 评分标准
| 评分范围 | 等级 | 说明 |
|---------|------|------|
| 85-100 | 优秀 | 几乎无 AI 痕迹 |
| 70-84 | 良好 | 轻微 AI 痕迹 |
| 50-69 | 一般 | 明显 AI 痕迹 |
| 0-49 | 较差 | 严重 AI 痕迹 |

### 2.6 风格迁移系统

#### 支持的风格
- **金庸风格**：武侠豪情、家国大义 (`style_jin_yong.md`)
- **张爱玲风格**：细腻敏感、城市男女 (`style_zhang_ailing.md`)
- **Priest 风格**：耽美、复杂情感 (`style_priest.md`)
- **猫腻风格**：网文、文青与爽点结合 (`style_mao_ni.md`)

### 2.7 笔风演化与内容导入分析

#### 功能描述

支持导入作者已有的创作内容，系统自动分析并学习作者的文笔风格、人物设定和剧情脉络，实现"无缝续写"辅助。

#### 核心能力

**1. 内容导入**

支持多种格式导入：
- 纯文本文件（.txt）
- Markdown 文件（.md）
- Word 文档（.docx）
- 网络小说平台导出格式

导入流程：
```
上传文件 → 格式解析 → 章节分割 → 内容清洗 → 结构化存储
```

**2. 笔风学习与分析**

系统从导入内容中提取作者独特的写作特征：

| 分析维度 | 提取内容 | 应用场景 |
|---------|---------|---------|
| 句式特征 | 句长分布、句式类型偏好、标点使用习惯 | 续写时保持句式一致性 |
| 词汇特征 | 高频词、专属词汇、口语化程度、方言/俚语使用 | 避免使用作者不常用的词汇 |
| 描写风格 | 景物描写密度、心理描写深度、对话占比 | 保持描写节奏一致 |
| 叙事节奏 | 章节长度、情节推进速度、高潮分布 | 续写时保持节奏感 |
| 视角习惯 | 第一人称/第三人称使用、视角切换频率 | 保持叙事视角一致 |
| 情感表达 | 情感词密度、情感表达方式（直接/间接） | 保持情感表达风格 |

笔风指纹存储：
```yaml
笔风指纹:
  句式:
    平均句长: 45.2 字
    短句占比: 35%
    长句占比: 20%
    标点偏好: {逗号高频, 破折号适中, 句号密集}
  词汇:
    高频词列表: [恍然, 竟是, 也就是, ...]
    避用词列表: [极其, 堪称, 此外, ...]  # AI 常用词
    口语化程度: 0.72
    方言词汇: [粤语词汇: 晒, 冇, ...]
  描写:
    景物描写密度: 15%  # 每 100 字中描写文字占比
    心理描写方式: 间接暗示为主
    对话风格: 短句对话, 少铺垫
  叙事:
    章节平均长度: 3000 字
    情节推进速度: 中快
    高潮周期: 每 3 章
  视角:
    主要视角: 第三人称有限视角
    视角切换频率: 每章 2-3 次
    POV 角色: [主角, 次主角]
```

**3. 人物自动分析**

从导入内容中自动提取和分析角色信息：

提取维度：
- **基础信息**：姓名、别名、性别、年龄（推断）、外貌描写汇总
- **性格画像**：从行为推断性格特质、核心价值观、决策模式
- **语言指纹**：专属台词、说话风格、口头禅、语气特点
- **关系网络**：与其他角色的互动历史、关系演变轨迹
- **行为模式**：典型反应模式、决策逻辑、习惯动作
- **角色弧线**：已完成的成长轨迹、当前状态、可能的未来走向

分析输出示例：
```yaml
角色: 张三
  基础信息:
    姓名: 张三
    别名: [老张, 张老师]
    性别: 男
    年龄推断: 35-40岁
    外貌: [身材高大, 眼神锐利, ...]
  性格画像:
    核心特质: [沉稳, 隐忍, 责任感强]
    内逻辑: 守护他人 > 个人得失 > 追求真相
    决策模式: 权衡利弊后行动, 不冲动
  语言指纹:
    说话风格: 简短有力, 少废话
    口头禅: ["再说", "到时候看"]
    语气: 平淡中带威严
  关系网络:
    - 与李四: 亦敌亦友, 从敌对到合作 (第 15 章)
    - 与王五: 师徒关系, 信任递减 (第 28 章)
  行为模式:
    面对威胁: 先观察后行动
    面对背叛: 冷处理, 不报复但不再信任
    习惯动作: [摸下巴, 叹气]
  角色弧线:
    当前阶段: 成长型弧线中段
    已完成: 从逃避者到承担者 (第 1-20 章)
    当前状态: 正在面临信念挑战
    可能走向: 牺牲型结局 / 救赎型转变
```

**4. 剧情脉络分析**

提取和梳理故事的情节结构：

分析内容：
- **主线轨迹**：核心冲突的发展脉络、关键转折点
- **支线梳理**：次要情节线、分支故事、伏笔列表
- **时间线重建**：事件发生顺序、时间跨度、重要时间节点
- **世界观提取**：背景设定、规则体系、地理/历史信息
- **伏笔追踪**：已埋伏笔、已回收伏笔、待回收伏笔
- **情节节点**：高潮、低谷、转折、悬念点标记

剧情图谱示例：
```yaml
主线:
  核心冲突: 张三寻找失踪的妹妹
  发展脉络:
    - 第 1-5 章: 发现失踪, 开始调查
    - 第 6-15 章: 线索追踪, 遇到阻碍
    - 第 16-25 章: 发现真相, 面临抉择
    - 第 26-35 章: 解决冲突, 结局
  关键转折:
    - 第 15 章: 发现真凶是信任的人
    - 第 28 章: 做出牺牲决定

支线:
  - 支线 A: 张三与李四的关系演变
    状态: 已完结
  - 支线 B: 组织内部的权力斗争
    状态: 进行中, 预计第 40 章完结

伏笔:
  已埋未收:
    - 第 3 章: 张三的旧伤疤 (暗示过去经历)
    - 第 12 章: 神秘人的电话 (身份未揭示)
  已回收:
    - 第 8 章: 照片中的线索 → 第 20 章: 照片指向真相
```

**5. 续写辅助模式**

基于分析结果，提供智能续写支持：

| 辅助模式 | 说明 |
|---------|------|
| 笔风匹配续写 | AI 生成内容自动匹配作者笔风，避免风格断裂 |
| 角色行为延续 | 根据角色已建立的行为模式推演后续行为 |
| 情节连贯续写 | 延续主线/支线轨迹，保持情节逻辑一致 |
| 伏笔提示 | 提醒待回收伏笔，建议回收时机和方式 |
| 一致性守卫 | 实时检测续写内容与原有内容的一致性 |

续写参数配置：
```yaml
续写配置:
  笔风强度: 0.85  # 0-1,越高越严格匹配原笔风
  创新允许度: 0.3  # 允许适度创新的程度
  角色严格度: 0.9  # 角色行为一致性严格程度
  情节连贯度: 0.8  # 情节逻辑连贯性要求
  伏笔提醒: true   # 是否提醒待回收伏笔
```

#### API 端点

**内容导入 API：**
- `POST /api/v1/import/upload` - 上传文件
- `POST /api/v1/import/parse` - 解析并结构化内容
- `GET /api/v1/import/status/{task_id}` - 查询导入进度
- `DELETE /api/v1/import/{project_id}` - 删除导入内容

**笔风分析 API：**
- `POST /api/v1/style/analyze` - 分析笔风
- `GET /api/v1/style/fingerprint/{project_id}` - 获取笔风指纹
- `PUT /api/v1/style/fingerprint/{project_id}` - 手动调整笔风指纹
- `POST /api/v1/style/compare` - 比较两段文本的笔风相似度

**人物分析 API：**
- `POST /api/v1/analyze/characters` - 自动分析角色
- `GET /api/v1/analyze/characters/{project_id}` - 获取分析结果
- `POST /api/v1/analyze/character/{character_id}/confirm` - 确认/修正分析结果

**剧情分析 API：**
- `POST /api/v1/analyze/plot` - 分析剧情脉络
- `GET /api/v1/analyze/plot/{project_id}` - 获取剧情图谱
- `GET /api/v1/analyze/timeline/{project_id}` - 获取时间线
- `GET /api/v1/analyze/foreshadowing/{project_id}` - 获取伏笔列表

**续写辅助 API：**
- `POST /api/v1/continue/generate` - 笔风匹配续写
- `POST /api/v1/continue/check` - 检查续写一致性
- `GET /api/v1/continue/suggestions/{project_id}` - 获取续写建议

#### 数据模型

```python
class ImportedContent:
    id: str
    project_id: str
    file_name: str
    file_type: str  # txt/md/docx
    total_chapters: int
    total_words: int
    import_status: str  # parsing/analyzing/ready/error
    chapters: list[ChapterContent]
    created_at: datetime

class StyleFingerprint:
    id: str
    project_id: str
    sentence_patterns: dict  # 句式特征
    vocabulary_profile: dict  # 词汇特征
    description_style: dict  # 描写风格
    narrative_rhythm: dict  # 叙事节奏
    perspective_habits: dict  # 视角习惯
    emotional_expression: dict  # 情感表达
    confidence_score: float  # 分析置信度
    created_at: datetime
    updated_at: datetime

class PlotAnalysis:
    id: str
    project_id: str
    main_plot: dict  # 主线轨迹
    sub_plots: list[dict]  # 支线列表
    timeline: list[dict]  # 时间线事件
    world_settings: dict  # 世界观提取
    foreshadowing: dict  # 伏笔追踪
    key_nodes: list[dict]  # 情节节点
    analysis_version: int
    created_at: datetime

class CharacterAnalysis:
    id: str
    project_id: str
    character_id: str  # 关联到正式角色档案
    source_chapters: list[int]  # 分析来源章节
    extracted_info: dict  # 提取的原始信息
    inferred_personality: dict  # 推断的性格
    language_fingerprint: dict  # 语言指纹
    relationship_analysis: list[dict]  # 关系分析
    behavior_patterns: list[dict]  # 行为模式
    arc_progress: dict  # 弧线进度
    confidence: float  # 分析置信度
    is_confirmed: bool  # 作者是否确认
    created_at: datetime
```

### 2.8 类型写作模式

#### 支持的类型
- **悬疑/推理**：线索布局、紧张感营造、逻辑链完整性
- **言情**：情感发展、角色化学反应、内心戏层次
- **奇幻**：世界观深度、魔法系统规则、环境沉浸感
- **科幻**：概念新颖性、科技细节、未来社会合理性

---

## 3. 技术架构

### 3.1 设计原则

**核心理念：文件优先，图谱增强**

- **人类可编辑**：所有核心数据存储为 Markdown/YAML，可直接用文本编辑器修改
- **Git 友好**：天然支持版本控制和协作
- **AI 原生**：AI 直接读写文件，无需 ORM 转换
- **语义增强**：LightRAG + Neo4j 提供知识图谱能力
- **向量检索**：Qdrant 提供语义搜索和笔风匹配

### 3.2 数据分层

```
┌─────────────────────────────────────────────────────────────────┐
│  📁 文件层 (human-editable)    │  📊 语义层 (AI-queried)         │
│                               │                                 │
│  Markdown/YAML 文件            │  Neo4j + Qdrant                 │
│  - 人类可直接编辑              │  - 知识图谱                     │
│  - Git 版本控制                │  - 语义搜索                     │
│  - 离线可用                    │  - 关系推理                     │
│                               │  - 笔风向量                     │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    Vibe Writing 客户端                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  💬 聊天界面  │  📝 编辑器  │  📖 Docsify 预览  │  🔮 知识图谱  ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                             │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐  │
│  │ VibeWriter   │ FileManager  │ KnowledgeGraph│ StyleService │  │
│  │   (聊天)     │  (MD/YAML)   │  (LightRAG)   │  (笔风分析)  │  │
│  └──────────────┴──────────────┴──────────────┴──────────────┘  │
│  ┌──────────────┬──────────────┬──────────────┐                 │
│  │ Inference    │ Consistency  │   AI         │                 │
│  │  (推演)      │  (检查)      │  Detector    │                 │
│  └──────────────┴──────────────┴──────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  File System  │    │    Neo4j      │    │   Qdrant      │
│  (MD/YAML)    │    │ (知识图谱)    │    │ (向量检索)    │
│               │    │               │    │               │
│ - 角色档案    │    │ - 实体节点    │    │ - 语义搜索    │
│ - 章节内容    │    │ - 关系边      │    │ - 笔风向量    │
│ - 世界设定    │    │ - 属性存储    │    │ - 相似度检索  │
│ - 状态快照    │    │               │    │               │
└───────────────┘    └───────────────┘    └───────────────┘
```

### 3.4 各存储职责

| 存储 | 内容 | 读写方式 | 用途 |
|-----|------|---------|------|
| **文件系统** | 角色.md、章节.md、设定.md、state.yaml | 人类可直接编辑 | 主数据源、版本控制、备份 |
| **Neo4j** | 实体、关系、事件节点 | 通过 LightRAG 自动构建 | 关系查询、图谱可视化、路径推理 |
| **Qdrant** | 文本向量、笔风向量 | 通过 Embedding API | 语义搜索、笔风匹配、相似内容检索 |

### 3.5 项目目录结构

```
data/projects/{project-id}/
├── project.md                    # 项目元信息
├── novel/                        # 小说正文 (Docsify)
│   ├── index.html               # Docsify 入口
│   ├── _sidebar.md              # 章节导航
│   ├── README.md                # 作品简介
│   └── chapters/
│       ├── 001.md               # 第一章
│       └── 002.md               # 第二章
├── characters/                   # 角色档案
│   ├── 张三.md
│   └── 李四.md
├── settings/                     # 世界设定
│   ├── 世界观.md
│   └── 时间线.md
├── analysis/                     # 分析数据
│   ├── style-fingerprint.yaml   # 笔风指纹
│   └── plot-analysis.yaml       # 剧情分析
└── state/                        # 运行状态
    ├── current-state.yaml       # 当前状态
    ├── emotional-debts.yaml     # 情感债
    └── foreshadowing.yaml       # 伏笔追踪
```

### 3.6 技术栈

#### 后端
- **语言**：Python 3.11+
- **框架**：FastAPI
- **知识图谱**：LightRAG + Neo4j 5.15
- **向量检索**：Qdrant
- **LLM**：OpenAI API 或兼容接口

#### 前端
- **框架**：Next.js
- **预览**：Docsify
- **编辑器**：Monaco Editor

### 3.7 数据模型

角色档案 (`characters/{name}.md`)：
```markdown
---
id: char_001
name: 张三
aliases: [老张]
gender: 男
status: alive
---

# 张三

## 性格调色盘
### 主色调
沉稳

### 底色
怕失去来之不易的位置

### 对冲/点缀
偶尔会硬一下，不肯退

## 行为禁区
- 不会主动解释自己的行为
- 不会在公开场合表达情绪

## 语言指纹
> "再说吧。"
> "到时候看。"

## 关系网络
| 角色 | 关系 | 温度 |
|-----|------|-----|
| 李四 | 亦敌亦友 | 中性 |
```

章节 (`novel/chapters/001.md`)：
```markdown
---
chapter: 1
title: 开始
word_count: 2847
characters: [张三, 李四]
foreshadowing:
  - id: fs_001
    content: 张三的旧伤疤
    status: pending
---

# 开始

天色渐暗，城西的巷子里风声渐紧...
```

---

## 4. API 接口设计

### 4.1 项目管理 API
- `POST /api/v1/projects/` - 创建项目
- `GET /api/v1/projects/` - 列出项目
- `GET /api/v1/projects/{id}` - 获取项目详情
- `PUT /api/v1/projects/{id}` - 更新项目
- `DELETE /api/v1/projects/{id}` - 删除项目

### 4.2 角色管理 API
- `POST /api/v1/characters/` - 创建角色
- `GET /api/v1/characters/` - 列出角色
- `GET /api/v1/characters/{id}` - 获取角色详情
- `PUT /api/v1/characters/{id}` - 更新角色
- `DELETE /api/v1/characters/{id}` - 删除角色
- `POST /api/v1/characters/{id}/evolution` - 记录角色演变
- `GET /api/v1/characters/{id}/evolution` - 获取演变时间线
- `POST /api/v1/characters/check` - 检查行为一致性

### 4.3 知识图谱 API
- `POST /api/v1/kg/build` - 构建知识图谱
- `POST /api/v1/kg/add` - 添加内容
- `POST /api/v1/kg/query` - 查询知识图谱
- `GET /api/v1/kg/visualize` - 获取可视化数据

### 4.5 内容导入与分析 API

**内容导入：**
- `POST /api/v1/import/upload` - 上传文件
- `POST /api/v1/import/parse` - 解析并结构化内容
- `GET /api/v1/import/status/{task_id}` - 查询导入进度

**笔风分析：**
- `POST /api/v1/style/analyze` - 分析笔风
- `GET /api/v1/style/fingerprint/{project_id}` - 获取笔风指纹
- `POST /api/v1/style/compare` - 比较笔风相似度

**人物/剧情分析：**
- `POST /api/v1/analyze/characters` - 自动分析角色
- `POST /api/v1/analyze/plot` - 分析剧情脉络
- `GET /api/v1/analyze/foreshadowing/{project_id}` - 获取伏笔列表

**续写辅助：**
- `POST /api/v1/continue/generate` - 笔风匹配续写
- `GET /api/v1/continue/suggestions/{project_id}` - 获取续写建议

### 4.6 设置 API
- `GET /api/v1/settings/` - 获取系统设置
- `PUT /api/v1/settings/` - 更新系统设置

---

## 5. 工作流程

### 5.1 四阶段创作模型

**阶段 1：构思和规划**
- 定义创作核心（主题、价值观）
- 制定大纲（三幕结构或章节概要）

**阶段 2：世界构建和角色塑造**
- 使用 `/role create` 创建角色档案
- 使用 `/bg create` 建立世界观

**阶段 3：场景创作**
- 使用 `/infer` 推演角色行为
- 使用 `/plot` 系统维护情节一致性

**阶段 4：审稿和修订**
- 使用 `/check full` 审查稿件
- 使用 `/check ai` 检测 AI 痕迹

### 5.2 角色自主性原则

**核心原则**：AI 是角色行为的观察者和推演者，而非控制者。

**处理"叛逆"时刻：**
| 情况 | 处理方式 |
|------|----------|
| 生命力体现 | 指出合理性，建议接受 |
| 逻辑漏洞 | 指出矛盾，建议合理化方式 |

---

## 6. 部署方案

### 6.1 Docker Compose 部署

服务组成：
- `neo4j`：Neo4j 5.15 Community（知识图谱）
- `qdrant`：Qdrant（向量检索）
- `backend`：FastAPI 应用
- `frontend`：Next.js Vibe Writing 客户端

### 6.2 环境变量配置

```env
# Neo4j
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=novelcraft123

# Qdrant
QDRANT_URL=http://qdrant:6333

# LLM
LLM_API_KEY=your-api-key
LLM_MODEL_NAME=gpt-4
LLM_BASE_URL=https://api.openai.com/v1

# Data
DATA_DIR=/app/data
```

### 6.3 最小化部署

开发环境只需：
```bash
# 启动依赖服务
docker-compose up neo4j qdrant

# 启动后端
cd backend && uvicorn app.main:app --reload

# 启动前端
cd web/app && npm run dev
```

---

## 7. 后续迭代规划

### Phase 1 (MVP) - Vibe Writing 核心

**文件管理基础：**
- [ ] FileManager 服务（MD/YAML 读写）
- [ ] 项目目录结构创建
- [ ] 角色档案 CRUD
- [ ] 章节 CRUD
- [ ] 状态快照读写

**Vibe Writing 核心：**
- [ ] 自然语言意图解析
- [ ] 上下文自动加载
- [ ] 流式响应生成
- [ ] 副作用执行（写入文件）

**知识图谱集成：**
- [ ] LightRAG 集成
- [ ] Neo4j 连接
- [ ] 章节内容自动入库
- [ ] 实体/关系自动提取

**前端：**
- [ ] Vibe Writing 聊天界面
- [ ] Markdown 编辑器
- [ ] Docsify 实时预览

### Phase 2 - 智能辅助增强

**角色推演系统：**
- [ ] 行为推演引擎
- [ ] 多因素加权模型
- [ ] 禁区检测与提醒

**一致性检查：**
- [ ] 角色 OOC 检测
- [ ] 时间线冲突检测
- [ ] 伏笔追踪系统

**笔风分析：**
- [ ] 句式特征提取
- [ ] 词汇特征分析
- [ ] 笔风指纹生成
- [ ] 风格匹配续写

**知识图谱增强：**
- [ ] 图谱可视化前端
- [ ] 关系路径查询
- [ ] 语义搜索

### Phase 3 - 高级功能

- [ ] 内容导入分析
- [ ] 人物自动分析
- [ ] 剧情脉络分析
- [ ] 风格迁移（金庸/张爱玲/Priest/猫腻）
- [ ] AI 痕迹检测
- [ ] 多人协作支持
- [ ] 导出功能（Markdown/EPUB）

---

## 8. 参考资料

- [UI 设计文档](ui_design.md)
- [提示词系统](../prompts/README.md)
- [AI 文本检测模式](ai_detection_patterns.md)
- [人性化处理指南](humanization.md)
- [角色推演指南](character_logic.md)
- [一致性规则](consistency_rules.md)
- [创作工作流程](workflow.md)
- [类型写作模式](genre_patterns.md)
- [风格指南 - 金庸](style_jin_yong.md)
- [风格指南 - 张爱玲](style_zhang_ailing.md)
- [风格指南 - Priest](style_priest.md)
- [风格指南 - 猫腻](style_mao_ni.md)

---

## 9. 致谢

本项目的核心方法论参考了 [novel-craft](https://github.com/duskpen/novel-craft) 项目，该项目提供了一套完整的 AI 协作小说创作框架，重点解决角色活人感、反模板、长篇状态管理与跨窗口接力失真问题。