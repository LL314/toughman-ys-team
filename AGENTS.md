# ys-team Repository Instructions

本仓用于沉淀 `ys-team` 方法论、skills、模板和示例文档，目标是为不同技术栈项目提供低侵入接入方式。

## 工作流

本仓自身使用 ys-team v1。

ys-team v1 强制的是“先路由、再选择合适验收”，不是所有请求都进入完整 spec 流程。

按“不可逆性 × 不确定性”分三档处理：

- `direct`：简单、可逆、低风险、验收显然的改动可以直接做，并说明最小验证。
- `patch`：范围清楚、影响有限的改动可以直接执行，但必须用快速 verifier 验收并留下必要证据。
- `spec`：不可逆、高不确定性、跨方法论 / skills / baseline / CLI / 发布入口，或验收方式不清楚的改动，必须先形成 verifier 卡，再进入实现。

verifier 卡重心是：

- 意图和非目标
- Write-Scope / Delete-Scope
- 目的与验收证明
- 验收保真度等级
- 人等价验收脚本或降级理由
- Feedback Loop
- 项目发布 gate

实现期间以 verifier 为退出条件：验收不真绿，不算完成。

## Primary Rule

- 所有请求先做轻量路由：`direct` / `patch` / `spec`。
- `direct` 和 `patch` 不需要创建 `docs/specs/` 制品，但要说明为什么风险可逆、scope 清楚、verifier 足够。
- `spec` 改动先讨论，再以 `docs/specs/` 中的 verifier 卡为准执行和验收。
- 文档必须反映仓库当前真实状态；实现变化时，同次交付内同步更新。
- 本仓 release-first：close 必须完成版本一致性、`npm pack`、`npm publish`、合回 `main`、tag 和 push。

## 入口闸

以下情况必须先补 verifier 卡：

- 不可逆或高不确定性改动
- 跨方法论、skills、baseline、CLI 或发布入口的改动
- 验收方式不清楚
- 需要用户确认迁移、发布或兼容性策略

以下情况不强制进入完整 ys-team spec 流程：

- 只读查询、状态说明、命令输出解释。
- 单文件小文案、拼写、注释或格式修正。
- 明确可回滚、影响面有限、能用一个快速检查验收的 patch。

这些改动仍要说明最小验证；不能用“简单”作为跳过验收、越界修改或文档不同步的理由。

## 出口闸

- UI/交互类改动的验收低于 L2 默认不通过。
- L0/L1 验收必须说明为什么不能更高。
- 没有跑 verifier 或没有记录无法验证原因，不得声明完成。
- baseline 改动必须保持 `examples/baseline/` 与 `skills/ys-team/baseline/` 全量一致。

## 可见性

优先使用原生 todo、status 和简短结果状态说明进度，例如：

`spec 卡已签 · loop 3/5 验收项过 · 未全绿`

结果状态用于帮助用户判断，不是合规开关。

`status.md` 只做当前仪表盘：活跃项、queued 项和最近 5 条判断。任务过程、命令输出、QA 结论和发布证据写入 spec；可复用经验写入 `.ys_team/memory/`。

## Repository Scope

- `skills/`：对外发布的 skill 包。
- `.ys_team/`：本仓自用的 ys-team 本地工作流配置。
- `docs/project/`：仓库现状、结构和方法论说明。
- `docs/specs/`：本仓关于 ys-team 后续演进的 spec。

## 现实索引

项目现实索引位于 `docs/project/module-index.md`。

在讨论影响范围、编写 spec 或评估改动风险时，先读取该索引，而不是直接探索代码库。

## Delivery Rules

- 更新本仓工作流内容、打包或发布 npm 包时，先读取 `docs/project/npm-publish.md`；相关经验见 `.ys_team/memory/交付守门人.md`。

- 默认优先保持方法论简洁，不堆叠过度解释。
- skill 文案优先写"原则"和"边界"，避免把方法论写成硬流程。
- README 面向使用者，文档要说明 Python / Java 项目如何低成本开始使用。
