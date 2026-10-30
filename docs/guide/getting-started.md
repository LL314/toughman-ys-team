# 开始使用

## 前置条件

- 已安装 Claude Code 或其他支持本地 skill 的 coding agent
- Node.js 18+

## 安装

```bash
npx @toughman/ys-team install-skills --force
```

自定义安装路径：

```bash
npx @toughman/ys-team install-skills --dest /your/path --force
```

更新：

```bash
npx @toughman/ys-team check-update
npx @toughman/ys-team@latest install-skills --force
npx @toughman/ys-team@latest init-project --dir /path/to/project
```

`init-project` 对已有项目是安全更新：它会刷新 repo-local skills，并只更新 `AGENTS.md` / `CLAUDE.md` 中的 `ys-team:managed` 托管块。项目自己的运行命令、发布规则、性能或安全约束应保留在托管块外。

## 初始化项目

在项目目录里对 agent 说：

```text
用 ys-team-init 初始化这个项目
```

init 会生成：

- `.ys_team/config.yaml`
- `.ys_team/rules.md`
- `.ys_team/reality.md`
- `.ys_team/glossary.md`
- `.ys_team/status.md`
- `.ys_team/templates/`
- `.ys_team/memory/`
- `docs/specs/`
- `AGENTS.md` / `CLAUDE.md`（如不存在）

你不需要先理解这些文件。先让项目能使用 verifier 卡，再在真实任务里逐步补充约束地图和错题本。

## 日常使用

照常说需求。ys-team v1 不再排他，不要求你选择内部流程。

简单、可逆、验收显然的改动会直接做。

非 trivial 改动会走：

```text
grill → verifier 卡 → loop 自跑 → 抽检证据
```

两个真决策点：

1. **签 verifier 卡**：重点看目的与验收证明是否对齐，验收标准是否像真人会做的检查。
2. **抽检证据**：确认 verifier 真绿，或 L0/L1 的人工剩余项已写清楚。

## Verifier 卡长什么样

核心字段：

- 意图
- 非目标
- Write-Scope
- 目的与验收证明
- 验收
  - 保真度等级 L3/L2/L1/L0
  - 人等价验收脚本
  - Feedback Loop
- 交付清单
- 依赖 / 风险

UI/交互类改动低于 L2 默认不通过。比如按钮、粘贴、拖拽、表单流转，应该用真实交互或行为测试验证，不能只用编译通过冒充完成。

`目的与验收证明` 建议写成两列表：左边是用户真正想达成的结果，右边是什么证据能证明它达成。目的不要写成“改某文件”。

`status.md` 只做当前仪表盘：活跃项、queued 项和最近 5 条判断。任务过程、命令输出、QA 结论和发布证据写入 spec；可复用经验写入 `.ys_team/memory/`。

更多写法见 [短示例](examples.md)。

## Python / Java 项目怎么低成本开始

不要一上来写复杂 SOP。

1. 先 init。
2. 第一次复杂需求用 verifier 卡把 scope 和验收讲清楚。
3. 如果同类任务反复出现，并且每次都容易漏同类交付面，再沉淀项目本地 SOP。

Python 常见 SOP 信号：

- 数据迁移
- 后台任务
- 外部 API adapter
- 权限与审计

Java 常见 SOP 信号：

- 数据库迁移
- 事务边界
- 多模块接口
- 发布配置

SOP 应留在项目本地 rules、references、文档或 skill 中，不写回通用 ys-team。

## 什么时候 rebuild

项目形态明显变化时：

```text
用 ys-team-init --rebuild 重估这个项目
```

典型触发：

- 技术栈变化
- 新增主要模块
- 发布方式变化
- 项目本地 SOP 变化
- baseline 大版本升级

rebuild 应保留本地定制。

从旧版本升级后，检查 `AGENTS.md` / `CLAUDE.md` 主入口是否还残留 `L0/L1/L2`、固定响应尾标、`role-pool`、`governance_slots` 或 `slot_bindings`。这些旧口径应被 v1 的 `direct / patch / spec` 托管块替代；托管块外的项目规则保留。

## 输出模式

默认：

```yaml
output_mode: technical
```

需要普通语言补充说明：

```yaml
output_mode: friendly
```

friendly 只追加解释，不降低验收要求。

## 常见问题

**Q: 每次都会很重吗？**

不会。简单、可逆、验收显然的改动直接做。复杂工作才写 verifier 卡。

**Q: 没有自动化验收怎么办？**

可以标 L0，但必须写清人工抽检步骤和剩余风险。不能假装自动验收已覆盖。

**Q: 我想继续用旧版怎么办？**

v1 原地替换当前 skill。旧版 npm 包通过 `legacy` tag 保留，可安装旧版本继续使用。
