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