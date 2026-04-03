# AI 文本检测模式

本文档整合了基于维基百科"AI 写作特征"的检测模式，用于识别和修复 AI 生成文本的痕迹。

## 检测模式分类

### 内容模式 (Content Patterns)

#### 1. 夸大的象征意义
**检测关键词**：
- 标志着、见证了、是……的体现/证明/提醒
- 极其重要的/重要的/至关重要的/核心的/关键性的作用/时刻
- 凸显/强调/彰显了其重要性/意义
- 反映了更广泛的、象征着其持续的/永恒的/持久的
- 为……做出贡献、为……奠定基础
- 标志着/塑造着、代表/标志着一个转变
- 关键转折点、不断演变的格局、焦点、不可磨灭的印记

**检测逻辑**：
```python
def check_exaggerated_significance(text: str) -> List[AIWarning]:
    keywords = ["标志着", "见证了", "是...的体现", "极其重要的", "至关重要的",
                "凸显了", "彰显了", "反映了更广泛的", "象征着", "为...做出贡献",
                "关键转折点", "不断演变的格局", "不可磨灭的印记"]
    warnings = []
    for keyword in keywords:
        if keyword in text:
            warnings.append(AIWarning(
                pattern="exaggerated_significance",
                severity="high",
                message=f"检测到夸大的象征意义: {keyword}",
                suggestion="直接陈述事实，避免过度解读意义"
            ))
    return warnings
```

#### 2. 过度强调知名度和媒体报道
**检测关键词**：
- 独立报道、地方/区域/国家媒体
- 由知名专家撰写
- 活跃的社交媒体账号

#### 3. 以 -ing 结尾的肤浅分析
**检测关键词**：
- 突出/强调/彰显……、确保……
- 反映/象征……、为……做出贡献
- 培养/促进……、涵盖……、展示……

**检测逻辑**：识别动词 + "着/了/了" + 宾语 + "，" + 目的性短语的句式

#### 4. 宣传和广告式语言
**检测关键词**：
- 拥有（夸张用法）、充满活力的、丰富的（比喻）、深刻的、增强其
- 展示、体现、致力于、自然之美、坐落于
- 位于……的中心、开创性的（比喻）、著名的、令人叹为观止的
- 必游之地、迷人的

#### 5. 模糊归因和含糊措辞
**检测关键词**：
- 行业报告显示、观察者指出、专家认为
- 一些批评者认为、多个来源/出版物

#### 6. 提纲式的"挑战与未来展望"部分
**检测关键词**：
- 尽管其……面临若干挑战……
- 尽管存在这些挑战
- 挑战与遗产、未来展望

### 语言和语法模式 (Language Patterns)

#### 7. 过度使用的"AI 词汇"
**高频 AI 词汇**：
- 此外、与……保持一致、至关重要、深入探讨、强调
- 持久的、增强、培养、获得、突出（动词）
- 相互作用、复杂/复杂性、关键（形容词）、格局（抽象名词）
- 关键性的、展示、织锦（抽象名词）、证明、强调（动词）
- 宝贵的、充满活力的

#### 8. 避免使用"是"（系动词回避）
**检测关键词**：
- 作为/代表/标志着/充当 [一个]
- 拥有/设有/提供 [一个]

**检测逻辑**：检测到复杂结构替代简单"是"的情况

#### 9. 否定式排比
**检测模式**：
- "不仅……而且……"
- "这不仅仅是关于……，而是……"

#### 10. 三段式法则过度使用
**检测逻辑**：连续出现三个并列的形容词或名词

#### 11. 刻意换词（同义词循环）
**检测逻辑**：检测语义相同但词汇不同的重复表达

#### 12. 虚假范围
**检测模式**："从 X 到 Y"结构，其中 X 和 Y 不在有意义的尺度上

### 风格模式 (Style Patterns)

#### 13. 破折号过度使用
**检测逻辑**：统计破折号使用频率，超过阈值则警告

#### 14. 粗体过度使用
**检测逻辑**：检测 **加粗** 标记的过度使用

#### 15. 内联标题垂直列表
**检测模式**：
- - **标题：** 内容

#### 16. 表情符号
**检测逻辑**：检测标题或列表中的表情符号

#### 17. 弯引号
**检测逻辑**：检测英文弯引号 "" 的使用（中文应使用「」或""）

### 交流模式 (Communication Patterns)

#### 18. 协作交流痕迹
**检测关键词**：
- 希望这对您有帮助、当然！、一定！
- 您说得完全正确！、您想要……、请告诉我
- 这是一个……

#### 19. 知识截止日期免责声明
**检测关键词**：
- 截至 [日期]、根据我最后的训练更新
- 虽然具体细节有限/稀缺……、基于可用信息……

#### 20. 谄媚/卑躬屈膝的语气
**检测关键词**：
- 好问题！、您说得完全正确
- 这是一个很好的观点、感谢您的提问

### 填充词和回避 (Filler Words and Hedging)

#### 21. 填充短语
**检测关键词**：
- 为了实现这一目标、由于下雨的事实
- 在这个时间点、在您需要帮助的情况下
- 系统具有处理的能力、值得注意的是数据显示

#### 22. 过度限定
**检测模式**：连续使用限定词，如"可以潜在地可能被认为可能会"

#### 23. 通用积极结论
**检测关键词**：
- 未来看起来光明、激动人心的时代即将到来
- 继续追求卓越的旅程、向正确方向迈出的重要一步

### 文本自然度指标 (Natural Language Metrics)

#### 24. 句式多样性
**检测项**：
- 句子长度变化
- 句式结构变化（简单句、并列句、复合句）
- 段落结尾方式多样性

#### 25. 词汇丰富度
**检测项**：
- 高频词重复使用
- 同义词过度循环
- AI 词汇密度

#### 26. 节奏感
**检测项**：
- 长短句交替
- 信息密度变化
- 情感起伏

## 实用检测函数

```python
from typing import List, Dict, Any
from dataclasses import dataclass
import re

@dataclass
class AIWarning:
    """AI 模式警告"""
    pattern: str
    severity: str  # low, medium, high
    message: str
    suggestion: str
    location: str = ""  # 文本中的位置
    score_penalty: float = 0.0  # 扣分

class AIDetector:
    """AI 文本检测器"""

    def __init__(self):
        self.patterns = self._load_patterns()

    def detect_all(self, text: str) -> Dict[str, Any]:
        """检测所有 AI 模式"""
        results = {
            "warnings": [],
            "score": 0.0,
            "categories": {}
        }

        # 检测各个类别
        results["categories"]["content"] = self._detect_content_patterns(text)
        results["categories"]["language"] = self._detect_language_patterns(text)
        results["categories"]["style"] = self._detect_style_patterns(text)
        results["categories"]["communication"] = self._detect_communication_patterns(text)
        results["categories"]["filler"] = self._detect_filler_patterns(text)
        results["categories"]["naturalness"] = self._detect_naturalness_metrics(text)

        # 汇总所有警告
        for category, warnings in results["categories"].items():
            results["warnings"].extend(warnings)

        # 计算总分
        results["score"] = self._calculate_score(results)

        return results

    def _detect_content_patterns(self, text: str) -> List[AIWarning]:
        """检测内容模式"""
        warnings = []

        # 1. 夸大的象征意义
        significance_keywords = [
            "标志着", "见证了", "是...的体现", "是...的证明", "是...的提醒",
            "极其重要的", "重要的", "至关重要的", "核心的", "关键性的", "重要的",
            "凸显了", "强调了", "彰显了", "反映了更广泛的", "象征着", "为...做出贡献",
            "关键转折点", "不断演变的格局", "不可磨灭的印记"
        ]
        for keyword in significance_keywords:
            if keyword in text:
                warnings.append(AIWarning(
                    pattern="exaggerated_significance",
                    severity="high",
                    message=f"检测到夸大的象征意义: {keyword}",
                    suggestion="直接陈述事实，避免过度解读意义",
                    score_penalty=2.0
                ))

        # ... 其他模式检测

        return warnings

    def _detect_language_patterns(self, text: str) -> List[AIWarning]:
        """检测语言模式"""
        warnings = []

        # 7. AI 词汇
        ai_vocab = [
            "此外", "与...保持一致", "至关重要", "深入探讨", "强调", "持久的",
            "增强", "培养", "获得", "突出", "相互作用", "复杂", "复杂性",
            "关键", "格局", "关键性的", "展示", "织锦", "证明", "宝贵的",
            "充满活力的"
        ]
        for vocab in ai_vocab:
            if vocab in text:
                warnings.append(AIWarning(
                    pattern="ai_vocabulary",
                    severity="medium",
                    message=f"检测到高频 AI 词汇: {vocab}",
                    suggestion="考虑用更自然的方式表达",
                    score_penalty=1.0
                ))

        # ... 其他模式检测

        return warnings

    def _detect_style_patterns(self, text: str) -> List[AIWarning]:
        """检测风格模式"""
        warnings = []

        # 13. 破折号过度使用
        dash_count = text.count("——")
        if dash_count > 2:
            warnings.append(AIWarning(
                pattern="overuse_dashes",
                severity="medium",
                message=f"破折号使用次数过多: {dash_count} 次",
                suggestion="破折号应慎用，大多数情况可以用逗号或句号替代",
                score_penalty=1.5
            ))

        # ... 其他模式检测

        return warnings

    def _detect_communication_patterns(self, text: str) -> List[AIWarning]:
        """检测交流模式"""
        warnings = []

        # 18. 协作交流痕迹
        chat_phrases = [
            "希望这对您有帮助", "当然！", "一定！",
            "您说得完全正确", "您想要", "请告诉我"
        ]
        for phrase in chat_phrases:
            if phrase in text:
                warnings.append(AIWarning(
                    pattern="chat_traces",
                    severity="high",
                    message=f"检测到聊天对话痕迹: {phrase}",
                    suggestion="删除聊天机器人式的客套话",
                    score_penalty=3.0
                ))

        # ... 其他模式检测

        return warnings

    def _detect_filler_patterns(self, text: str) -> List[AIWarning]:
        """检测填充词模式"""
        warnings = []

        # 21. 填充短语
        filler_phrases = [
            "为了实现这一目标", "由于...的事实", "在这个时间点",
            "在您需要帮助的情况下", "系统具有处理的能力", "值得注意的是"
        ]
        for phrase in filler_phrases:
            if phrase in text:
                warnings.append(AIWarning(
                    pattern="filler_phrases",
                    severity="medium",
                    message=f"检测到填充短语: {phrase}",
                    suggestion="简化表达，去掉冗余词汇",
                    score_penalty=1.0
                ))

        # ... 其他模式检测

        return warnings

    def _detect_naturalness_metrics(self, text: str) -> List[AIWarning]:
        """检测自然度指标"""
        warnings = []

        # 24. 句式多样性
        sentences = re.split(r'[。！？]', text)
        sentences = [s.strip() for s in sentences if s.strip()]

        if len(sentences) >= 3:
            # 检查句子长度变化
            lengths = [len(s) for s in sentences]
            if len(set(lengths)) <= 2:  # 长度变化太少
                warnings.append(AIWarning(
                    pattern="low_sentence_diversity",
                    severity="medium",
                    message=f"句子长度变化不足，长度类型: {len(set(lengths))} 种",
                    suggestion="混合使用长短句，增加节奏感",
                    score_penalty=1.5
                ))

        # 25. 词汇丰富度
        words = text.split()
        word_count = {}
        for word in words:
            if len(word) > 1:  # 忽略单字
                word_count[word] = word_count.get(word, 0) + 1

        # 检查高频词
        frequent_words = [w for w, c in word_count.items() if c > 5]
        if frequent_words:
            warnings.append(AIWarning(
                pattern="frequent_words",
                severity="low",
                message=f"部分词语使用频繁: {', '.join(frequent_words[:5])}",
                suggestion="考虑替换重复的词语",
                score_penalty=0.5
            ))

        return warnings

    def _calculate_score(self, results: Dict[str, Any]) -> float:
        """计算自然度评分 (0-100)"""
        base_score = 100.0
        total_penalty = sum(w.score_penalty for w in results["warnings"])
        return max(base_score - total_penalty, 0)

    def _load_patterns(self) -> Dict[str, Any]:
        """加载所有检测模式"""
        # 可以从文件或配置中加载
        return {}
```

## 使用示例

```python
detector = AIDetector()
results = detector.detect_all("这是一些文本内容...")

print(f"自然度评分: {results['score']}/100")
print(f"检测到 {len(results['warnings'])} 个 AI 模式")

for warning in results['warnings']:
    print(f"[{warning.severity}] {warning.message}")
    print(f"  建议: {warning.suggestion}")
```

## 与角色一致性检查的集成

在角色创作中，AI 模式检测可以帮助：

1. **对话自然度**：检测角色对话是否像真人说话
2. **叙述风格**：确保叙述语言自然流畅
3. **避免 AI 味**：让小说创作更有人类作者的风格

将 `AIDetector` 集成到 `ConsistencyChecker` 的 `check_style` 方法中，可以提供更全面的文本质量评估。
