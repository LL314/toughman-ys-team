# 行为规则

## 三道闸

| 闸 | 规则 | 自检 |
|----|------|------|
| 入口闸 | 非 trivial 改动先形成 verifier 卡 | 是否写清 Write-Scope、保真度等级、验收脚本或降级理由？ |
| 出口闸 | verifier 不真绿，不声明完成 | 是否运行 Feedback Loop 和最终 Verification？ |
| 可见性闸 | 用 todo、status、结果状态说明进展 | 用户能否看出是否全绿、还差什么？ |

## Verifier 卡

- 非 trivial spec 应写清“目的与验收证明”：目的描述用户真正要达成的结果，验收证明描述什么证据能证明它达成。
- 目的不能只是“修改某文件”或“新增某字段”这类实现动作。
- 验收证明必须是可观察结果、命令断言、人工脚本或明确降级理由。
- 验收预期应来自用户目标、规格或独立样例；不能用被测实现的同一算法重算预期。
- 修复 bug 时，优先保留同一复现检查在修复前失败、修复后通过的证据；无法复现时写明尝试、限制和剩余风险。
- “目的与验收证明”不替代人等价验收脚本和 Feedback Loop；它负责把目标与 verifier 对齐。

## 验收门槛

- UI/交互类改动低于 L2 默认不通过。
- L0/L1 必须写明为什么不能更高，以及剩余人工风险。
- 没有合格 verifier 的复杂改动不能进入实现。
- 无法验证时必须明确说明限制和人工抽检步骤。
- 复杂任务优先按可独立验收的完整行为拆分；无法独立验收时注明依赖和统一验收点。

## Scope

- spec-work 只能修改 Write-Scope / Delete-Scope 声明的文件。
- 发现必须改 scope 外文件时，停止并回到讨论或请求确认。
- 不顺手重构无关代码。

## 现实

- 讨论影响范围、风险或方案选择时，先读 `.ys_team/reality.md` 和相关项目文件。
- `reality.md` 只记录 agent 难以重建的约束与风险，不复述目录树。

## 项目本地 SOP

- 高频、领域强、漏项成本高的工作可以沉淀为项目本地 SOP。
- SOP 只补充交付清单和验收 gate，不改变用户入口。
- 项目业务知识留在本地 rules、references、文档或 skill 中，不写回通用 baseline。

## 结果状态

`status.md` 只做当前仪表盘：

- 活跃和 queued 项只保留当前判断与一句目的。
- 最新判断最多保留最近 5 条。
- 任务过程、命令输出、QA 结论和发布证据写入 spec 的 `work.md`、`qa-report.md` 或 `evidence/`。
- 可复用经验写入 `.ys_team/memory/`，不留在 status。

可以用简短状态帮助用户判断，例如：

`spec 卡已签 · loop 3/5 验收项过 · 未全绿`

结果状态不是完成条件；verifier 与 evidence 才是完成条件。

---

## 本仓补充规则

### Documentation Authority

| 关注面 | 权威文档 |
|--------|----------|
| 方法论定义、仓库现状 | `docs/methodology/overview.md` |
| 模块关系与影响面索引 | `docs/project/module-index.md` |
| 使用方式 | `README.md` |
| 对外 skill 定义 | `skills/*/SKILL.md` |

### Spec Rules

- spec 文件写入 `docs/specs/<phase>/<initiative-id>/`。
- `phase` 使用 `queued`、`active`、`completed`、`cancelled`。
- evidence 放在 initiative 目录下的 `evidence/`。
- 验收必须包含可复核证据。

### Release Gate

- 发布线版本由 `package.json`、`examples/baseline/.ys_team/VERSION`、`.ys_team/VERSION` 共同组成。
- `docs/methodology/VERSION` 是方法论规范版本，独立于发布线。
- 本仓所有非 trivial 可交付改动都按 release-first 处理；不得自行降级为“只提交不发布”。
- spec-review PASS 后必须先切到 `release/<version>` 或 `work/<spec-id>` 分支，未切分支不得进入 spec-work。
- close 前必须完成 npm 发布链路：版本一致性检查、`npm pack` 验证、`npm publish` 成功。
- npm 发布成功后，发布分支必须合回 `main`，创建同版本 git tag，并 push main / tag。
- 未完成 npm publish、合回 main、tag、push 的 spec 不得 close 或 archive。

### Spec-Review Gate

semi-auto / full-auto 模式下，spec-talk 完成后自动触发独立审阅。

- PASS → 进入 spec-work（semi-auto 暂停等确认）。
- REJECT → 回退到 spec-talk，重试计数 +1。

### QA Gate

semi-auto / full-auto 模式下，spec-work 完成后自动触发独立验证。

- PASS → 进入 close（semi-auto 暂停等确认）。
- REJECT → 回退到 spec-work，重试计数 +1。
- 本仓 QA PASS 只表示实现可发布；真实 `npm publish` 成功证据由 close 阶段收集。

### Quality Bar

- 根因修复，不做兼容层。
- 未完成文档同步的实现视为未完成交付。
- 改动方法论定义时，优先减少概念数量，避免增加用户心智负担。
- baseline 改动必须保持 `examples/baseline/` 与 `skills/ys-team/baseline/` 全量一致。
