---
name: ys-team-init
description: "Initialize or rebuild a repository-local ys-team v1 baseline: rules, constraint map, verifier-card templates, glossary, status, and project mistake book. Use when 用户说「初始化 ys-team」「rebuild baseline」「装一下方法论」「项目结构变了，重建一下」等。"
---

# ys-team-init

<what-to-do>

被调用时立即执行：

1. 检查仓库根的 `.ys_team/` 及其中 `config.yaml`、`rules.md`、`reality.md` 是否齐全。
2. 目录不存在：Init 模式，复制 v1 baseline，生成约束与风险地图骨架，创建 docs/specs 目录。
3. 目录已存在：从 baseline 补齐上述缺失文件，不覆盖已有文件；对比 baseline 版本，仅在需要升级或项目现实变化时执行 Rebuild 同步，文件齐全且无需重建时不重复初始化。
4. 检测旧结构：`role-pool.yaml`、`governance_slots`、`slot_bindings`、按角色命名的记忆文件、旧 checklist 流程项、旧 `AGENTS.md` / `CLAUDE.md` 入口口径。
5. 保留本地定制，不覆盖项目 SOP。
6. 输出变更清单前，复查上述三个文件；仍有缺失时列出缺项并标记「接入不完整」，不得宣称初始化完成。

</what-to-do>

<supporting-info>

## Purpose

ys-team-init 只负责把项目接入 v1 baseline。它不要求用户学习内部流程，也不把项目业务知识写进通用模板。

## Baseline Source

按顺序解析：

1. `examples/baseline/`（仓库内开发）
2. `../ys-team/baseline/`（npm 安装后）

## Init 输出

从 baseline 复制：

- `.ys_team/config.yaml`
- `.ys_team/rules.md`
- `.ys_team/reality.md`
- `.ys_team/glossary.md`
- `.ys_team/status.md`
- `.ys_team/VERSION`
- `.ys_team/templates/spec.md`
- `.ys_team/templates/checklist.md`
- `.ys_team/templates/questions.md`
- `.ys_team/history/`
- `.ys_team/memory/`
- `docs/specs/`
- `AGENTS.md` / `CLAUDE.md`（如不存在；如存在则只更新 `ys-team:managed` 托管块）

不再默认生成 `role-pool.yaml`。

## Project Detection

检测 Python、Java、React、fullstack 或 general 只用于生成现实提示和后续 SOP 建议，不再用于绑定固定角色槽位。

低成本开始：

- Python / Java 项目先 init。
- 第一次复杂改动用 verifier 卡收敛。
- 同类任务重复出现后，再沉淀项目本地 SOP。

## Reality

v1 的 `reality.md` 是约束与风险地图，不复述目录树。

应记录：

- 难以从代码直接推断的运行约束
- 发布、数据、权限、安全风险
- 项目本地 SOP 入口
- 必须读取的权威文档

如果暂时没有内容，保留骨架即可。

## Memory

`memory/` 是项目错题本，不按人格建文件。

推荐领域：

- `verification.md`
- `release.md`
- `ui-interaction.md`
- `data-migration.md`

init 默认保留空目录或 `.gitkeep`，不强行生成领域文件。

## Rebuild

rebuild 原则：

- 改最小面。
- 保留本地 SOP、rules、references 和用户定制。
- 更新 VERSION。
- 更新 verifier 卡模板中的“目的与验收证明”和短 status 规则。
- 更新 `AGENTS.md` / `CLAUDE.md` 的 `ys-team:managed` 托管块；托管块外的项目本地内容不得覆盖。
- 提示旧结构迁移，不静默删除用户内容。
- 如用户确认升级 v1，可迁移旧 role-pool / slot config 到错题本和 verifier 策略。

旧结构提示：

- `role-pool.yaml`：v1 baseline 不再需要。
- `governance_slots` / `slot_bindings`：改为轻量 verification/review 策略。
- `templates/monthly-summary.md`：不再默认提供。
- `.ys_team/memory/<role>.md`：建议拍平成领域错题本。
- `AGENTS.md` / `CLAUDE.md` 中的 `L0/L1/L2`、`Response Markers`、`必须带状态标记`、`排他工作流`：替换为 v1 `direct / patch / spec` 托管块。

## AGENTS / CLAUDE Managed Block

v1 的入口文件使用托管块保护项目本地定制：

```markdown
<!-- ys-team:managed:start version=1.0.2 -->
... ys-team v1 routing ...
<!-- ys-team:managed:end -->
```

rebuild 时：

1. 若文件有托管块，只替换托管块。
2. 若文件没有托管块但有旧 ys-team 入口段，替换该段并保留其它项目规则。
3. 若文件没有托管块也没有旧入口段，在标题后插入托管块。
4. 若检测到托管块外仍有旧口径，提示用户手工清理，不能声明升级完成。

可建议用户运行：

```bash
npx @toughman/ys-team@latest init-project --dir <repo>
```

该命令会安全刷新 repo-local skills 和 `AGENTS.md` / `CLAUDE.md` 托管块。

## Success Criteria

init/rebuild 后：

- 非 trivial 改动能起 verifier 卡。
- spec-work 能根据 Feedback Loop 自跑。
- UI/交互类最低验收等级清楚。
- 项目本地 SOP 有承载位置，但不是必须立即编写。
- `AGENTS.md` / `CLAUDE.md` 主入口不再残留旧 L0/L1/L2、固定尾标或 role/slot 口径。

</supporting-info>
