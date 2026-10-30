# 场景走查

2026-10-30 · 依据 `skills/ys-team-spec-talk/SKILL.md`、`skills/ys-team-spec-work/SKILL.md`、`docs/methodology/reference.md` 和模板。

| 场景 | 判定 | 依据 |
|---|---|---|
| 有效测试使用需求中的固定结果 | PASS | 预期来自用户目标、规格或独立样例 |
| 测试用实现同一算法重算预期 | REJECT | 结构 lint 禁止用被测实现重算 |
| bug 有修复前失败、修复后通过 | PASS | 保留同一复现检查的前后证据 |
| bug 无法复现 | PASS（带风险） | 必须写明尝试、限制和剩余风险，不伪称通过 |
| 复杂任务跨模板、CLI、测试但一次可完整验证 | PASS | 按可独立验收的完整行为拆分 |
| 子任务不能单独验证 | PASS（带依赖） | 记录依赖和统一验收点 |
| UI 只有编译通过 | REJECT | UI/交互低于 L2 默认不通过 |
| 试图修改 Write-Scope 外文件 | BLOCKED | 停止并回 spec-talk 或请求确认 |
| spec 级实现未做独立审阅 | BLOCKED | Verification 后必须新会话两阶段 review |
| 纯文档/模板改动被强制写代码测试 | REJECT（流程误用） | 使用结构/同步检查，不强行套 TDD |

结论：10 个场景全部有明确判定；其中 5 个 PASS（含 2 个带条件）、3 个 REJECT、2 个 BLOCKED。规则与旧门槛一致，新增约束只作用于验收证据和任务拆分。
