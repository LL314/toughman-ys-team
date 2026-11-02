# CLAUDE.md

本仓库使用 ys-team v1。

## 第一优先级

- 先判断本次请求属于 `direct`、`patch` 还是 `spec`。
- 简单、可逆、验收显然的 `direct` 改动可以直接做，并说明最小验证。
- 范围清楚、影响有限的 `patch` 改动可以直接做，但要用快速 verifier 验收。
- 不可逆、高不确定性、跨方法论 / skills / baseline / CLI / 发布入口，或验收方式不清楚的 `spec` 改动，先形成 verifier 卡，再执行。
- verifier 卡必须写清 Write-Scope、目的与验收证明、验收保真度、人等价验收脚本或降级理由、Feedback Loop。
- 验收不真绿，不声明完成。

## 验收门槛

- UI/交互类改动低于 L2 默认不通过。
- L0/L1 验收必须说明为什么不能更高。
- 范围扩大时先停下，回到讨论或请求确认。

## 当前仓库约束

- 更新本仓工作流内容、打包或发布 npm 包时，先读取 `docs/project/npm-publish.md`；相关经验见 `.ys_team/memory/交付守门人.md`。

- 现实索引优先读取 `docs/project/module-index.md`。
- `direct` / `patch` 不强制创建 `docs/specs/` 制品；`spec` 改动按 `docs/specs/` 执行和验收。
- 文档、skills、baseline、CLI 和状态文件必须同次交付同步。
- baseline 双副本必须保持全量一致：`examples/baseline/` 与 `skills/ys-team/baseline/`。

## 可见性

用原生 todo、状态文件和简短结果状态说明进度，例如：

`spec 卡已签 · loop 3/5 验收项过 · 未全绿`

`status.md` 只做当前仪表盘：活跃项、queued 项和最近 5 条判断。任务过程、命令输出、QA 结论和发布证据写入 spec；可复用经验写入 `.ys_team/memory/`。

结果状态不是完成条件；verifier 与 evidence 才是完成条件。
