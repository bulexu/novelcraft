# Deferred Work

Items deferred from code reviews and other workflows.

## Deferred from: code review of 1-7-auto-save-and-shortcut-system.md (2026-04-03)

- 冗余 findIndex 调用 [page.tsx] — 可在 handler 开始时计算一次 currentIndex，延后处理为优化建议

## Deferred from: code review of 1-8-bottom-status-bar.md (2026-04-07)

- 重复的条件渲染逻辑 (DRY 违反) [page.tsx:466-481, 489-507] — 保存状态的三元表达式在 footer 和沉浸模式状态栏中重复，仅颜色不同。建议提取为 `SaveStatusIndicator` 组件。
- 状态指示器缺少无障碍标签 [page.tsx:466-481, 489-507] — 图标无 `aria-label` 或 `role="status"`，沉浸模式状态栏缺少 `aria-live`。建议添加无障碍属性。
- 自动保存计时器在快速输入时不断重置 [page.tsx:152-162] — 每次 `content` 变化都重置 30s 计时器，持续输入时自动保存永不触发。可能是预期行为，需确认。

## Deferred from: code review of 2-4-character-relationship-network-management.md (2026-04-08)

- AC1违背：关系温度选项不匹配 — AC要求"亲密/疏远/中性/敌对"，实现用"热烈/温热/中性/冷淡"，符合 Dev Notes 中 relationTypeOptions 和 temperatureOptions 设计。暂以实现为准。
- AC2违背：演变时间线未结构化 — spec说"形成演变时间线"，但evolution是string[]，符合现有CharacterRelation设计。
- 编辑模式下清空关系时数据不一致 — 当用户编辑角色并清空所有关系时，后端可能保留旧关系而非清空。需要明确后端行为。

## Deferred from: code review of 2-5-character-arc-recording.md (2026-04-08)

- 空字符串 vs null 语义不清 [CharacterForm.tsx:263-267] — 需要后端 API 配合明确 null vs "" 语义，当前变更范围内无法独立修复。

## Deferred from: code review of 2-6-character-card-popup.md (2026-04-09)

- 键盘事件监听器频繁添加/移除 [CharacterSearchModal.tsx] — 性能优化项，handleKeyDown 依赖变化时重建监听器，非关键问题
- CharacterCard.tsx startsWith() 可能在 null 上抛出 TypeError [CharacterCard.tsx:33,36] — Story 2.5 遗留问题，personality.derivatives.description 可能为 null
- CharacterForm.tsx setTimeout 竞态条件清空阶段 [CharacterForm.tsx:714-720] — Story 2.5 遗留问题，快速切换弧线类型时可能产生竞态
- 表单验证器可能读取陈旧值 [CharacterForm.tsx:683-694] — Ant Design 表单验证时序问题，快速输入提交可能绕过验证
- 删除/提交失败时缺少用户可见错误反馈 [CharacterCard.tsx, CharacterForm.tsx] — 多个 Story 遗留的 UX 问题，catch 块仅 console.error
- NovelEditor.tsx 缩进不一致 [NovelEditor.tsx:37-39] — minor style issue，Escape 处理代码缩进混乱

## Critical Backend Issue (2026-04-09) — RESOLVED

- **Backend Character 模型缺失 motivation 和 character_arc 字段** — Story 2.3/2.5 前端数据无法持久化
  - 已创建修复任务: `backend-character-model-fix.md`
  - Priority: HIGH
  - **Status: RESOLVED** — 2026-04-09 backend models, FileManager, API endpoints all implemented and verified

## Deferred from: code review of 2-7-character-list-and-search.md (2026-04-09)

- d.description?.startsWith null safety [CharacterCard.tsx:33-38] — Story 2.5 遗留问题，personality.derivatives.description 可能为 null
- handleDelete 缺少错误反馈 [CharacterCard.tsx:17-24] — 多个 Story 遗留问题，catch 块无用户可见通知
- rel.target_name/relation_type/temperature null checks [CharacterCard.tsx:229-231] — 关系数据可能为 null/undefined
- rel.evolution.join 可能因 null 元素失败 [CharacterCard.tsx:233-236] — evolution 数组元素可能为 null
- arc_type 和 character_arc?.arc_type 同时显示 [CharacterCard.tsx:305-310] — 两个独立字段可能导致用户困惑

## Deferred from: code review of 3-1-ai-panel-component.md (2026-04-10)

- Character Mention 状态竞态条件 [NovelEditor.tsx:73-104] — handleMentionSelect 使用闭包中的 content，可能在 requestAnimationFrame 执行时已过期
- AI Panel 状态在章节导航时不保持 [page.tsx:68] — aiPanelVisible 是组件本地状态，章节切换时重置
- 角色搜索输入无防抖 [CharacterSearchModal.tsx:117-120] — 大量角色时可能影响性能
- 角色数据更新后不刷新 [page.tsx:127-142] — 编辑器页面角色数据仅加载一次，不感知其他页面的修改