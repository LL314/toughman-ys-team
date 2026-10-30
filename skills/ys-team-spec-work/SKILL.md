---
name: ys-team-spec-work
description: "Execute an approved ys-team verifier card in a loop until its verifier passes. Use when 用户说「按 spec 执行」「进入 spec-work」「把这个 spec 落地」「执行 active spec」等。"
---

# ys-team-spec-work

<what-to-do>

被调用时立即执行：

1. 读取当前 active spec 的 `spec.md`、`work.md`、`qa-report.md`（如存在）、`.ys_team/rules.md`、`.ys_team/reality.md` 和相关错题本。
2. 按下方 **Preflight** 校验进入条件。
3. 按下方 **Execution Loop** 建立 todo 并执行可独立验收的完整行为；不能独立验收时记录依赖和统一验收点。
4. 在 loop 内反复运行 Feedback Loop；失败则继续修。
5. 最终运行 Verification；未全绿不得声明完成。
6. 按下方 **Evidence / Work Log / Status** 记录证据和状态。

scope 外修改需求出现时停止，回到 spec-talk 或请求用户确认。

</what-to-do>

<supporting-info>

## Read Order

1. `.ys_team/config.yaml`
2. active spec `spec.md`
3. active spec `work.md`（如存在）
4. active spec `qa-report.md`（如存在）
5. `.ys_team/rules.md`
6. `.ys_team/reality.md`
7. `.ys_team/memory/` 中相关领域错题本

## Preflight

必须满足：

- spec 已通过审阅或用户明确确认。
- 已切到 release/work 分支。
- Write-Scope / Delete-Scope 覆盖预期改动。
- 目的与验收证明存在，且能覆盖用户目标。
- 验收保真度声明存在。
- UI/交互类改动不低于 L2。
- Feedback Loop 存在，或 N/A 理由经审阅接受。

不满足时停止，不进入实现。

## Execution Loop

1. 从 verifier 卡提取交付项和验收项。
2. **任务拆解**（复杂 spec 必做，简单 spec 可跳）：优先把每项拆成可独立验收的完整行为，写清行为结果、涉及文件、验收信号和必要依赖。不能独立验收时注明统一验收点。行为变更遵循 TDD 节奏（写失败测试 → 跑确认失败 → 最小实现 → 跑确认通过 → commit）；纯文档或模板改动使用对应的结构/同步检查。拆解写入 `work.md` 任务清单。
3. 建立 todo。
4. 执行一个小闭环。
5. 运行 Feedback Loop。
6. 红了继续改，绿了进入下一项。
7. 全部交付项完成后运行完整 Verification。
8. **独立审阅**（spec 级默认，trivial/patch 跳过）：Verification 全绿后，开新 subagent 会话（不继承实现上下文，只给 spec + 代码 diff + 验证结果）做两阶段 review——spec 合规（不多不少）+ 代码质量（bug/边界/安全/模式）。两阶段都过才放行；发现问题回 spec-work 修，修完重审。具体派发由所在 agent 决定：支持自动派的直接派，不支持的由用户主动命名启动新会话。
9. 写 evidence 和 work.md（含独立审阅结论）。

不要把“编译通过”冒充 UI/交互完成。无法自动化时标注 L0 和人工剩余项。

## Evidence

可接受证据：

- 测试或构建输出
- 静态检查输出
- Playwright / CLI / API 探针日志
- 截图或录屏
- 人工抽检步骤与结果
- 发布或 registry 证据

关键是可复核，不是文件数量。

## Work Log

`work.md` 记录：

- 执行开始时间和分支
- 每个闭环的目标、验证、结果
- scope 偏差和处理
- L0/L1 降级理由
- 最终 Verification 摘要

## Status

节点：

- 开始：spec-work / in-progress
- 验证未全绿：继续执行，不声明完成
- 全绿：ready for qa
- 阻塞：blocked，并写清需要谁处理什么

`status.md` 只记录当前仪表盘和最近 5 条判断。完整过程、命令输出、QA 结论和发布证据写入 `work.md`、`qa-report.md` 或 `evidence/`；可复用经验写入 `.ys_team/memory/`。

## Output

输出当前 loop 状态：

- 关联 spec
- 已过验收项 / 总验收项
- 未通过项
- 下一步

可追加结果状态，例如 `loop 2/4 验收项过 · 未全绿`。

</supporting-info>
