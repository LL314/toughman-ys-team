# Baseline Changelog

记录 `examples/baseline/` 及其直接配套接入面的结构化变化，供用户迁移、rebuild 判断和后续 `check-update` 摘要提取使用。

## [1.0.4] - 2026-10-30

### What Changed

- **验收判错**：预期必须来自需求、规格或独立样例；bug 修复优先记录同一复现检查的前后结果。
- **完整行为任务**：复杂任务优先按可独立验收的行为拆分，不能独立验收时注明依赖和统一验收点。
- **规则去重**：执行入口引用权威规则，减少重复门槛和维护漂移。

### Why

- 防止测试与实现使用同一算法而同时通过。
- 让每个小任务都有清晰的可验收结果。
- 降低规则修改时只改一处、其他处失真的风险。

## [1.0.2] - 2026-06-30

### What Changed

- **短 status**：`status.md` 改为当前仪表盘，只保留活跃项、queued 项和最近 5 条判断
- **目的与验收证明**：verifier 卡模板新增目标-证据矩阵，要求先证明用户目标而不是只列实现动作
- **入口同步**：`AGENTS.md` / `CLAUDE.md` 托管块同步短 status 和目的-验收证明口径

### Why

- 任务日志应留在 spec，项目经验应留在 memory；常驻 status 过长会降低 agent 读取质量
- 复杂改动需要先绑定“目的”和“证明方式”，避免只完成交付物但没有证明用户目标成立

### Key Files

- `examples/baseline/.ys_team/status.md`
- `examples/baseline/.ys_team/templates/spec.md`
- `examples/baseline/.ys_team/templates/checklist.md`
- `examples/baseline/.ys_team/rules.md`
- `examples/baseline/AGENTS.md`
- `examples/baseline/CLAUDE.md`

### Migration Hint

- 已初始化项目可在 rebuild 后把 `status.md` 压缩为当前仪表盘，历史过程不要搬回 status
- 后续复杂 spec 建议补 `目的与验收证明`，旧 spec 不必为归档补格式

## [1.0.1] - 2026-06-15

### What Changed

- **入口托管块**：`AGENTS.md` / `CLAUDE.md` 增加 `ys-team:managed` 标记，升级时只替换 ys-team 入口块，不覆盖项目本地规则
- **CLI 安全升级**：`init-project` 不再只做整文件复制；已有项目会更新 managed block、替换可识别旧 ys-team 段落，或在标题后插入托管块
- **旧口径检测**：rebuild 口径要求检查 L0/L1/L2、固定响应尾标、`governance_slots` / `slot_bindings` 等旧入口残留

### Why

- 已初始化项目通常会在 `AGENTS.md` / `CLAUDE.md` 写入本地性能、发布、文档或安全规则，整文件覆盖会丢定制，完全跳过又会留下旧流程
- 托管块把“ys-team 入口版本”与“项目本地规则”拆开，旧用户可以安全升级入口口径

### Key Files

- `scripts/ys-team.mjs`
- `examples/baseline/AGENTS.md`
- `examples/baseline/CLAUDE.md`
- `skills/ys-team-init/SKILL.md`
- `README.md`
- `docs/guide/getting-started.md`

### Migration Hint

- 已有项目升级后运行 `npx ys-team@latest init-project --dir <repo>`，刷新 repo-local skills 和 `AGENTS.md` / `CLAUDE.md` 托管块
- 将项目自己的运行、发布、性能、安全规则放在 `ys-team:managed` 托管块外
- 若入口文件仍残留 L0/L1/L2、固定尾标或 role/slot 口径，按 v1 `direct / patch / spec` 托管块清理

## [1.0.0] - 2026-06-12

### What Changed

- **Loop-era 换代**：baseline 从流程约束转为 verifier-first，复杂改动先写 verifier 卡，再由 agent loop 自跑到验收真绿
- **验收分级**：新增 L3/L2/L1/L0 保真度标准，UI/交互类低于 L2 默认不通过
- **三道闸**：用入口闸、出口闸、可见性闸替代旧的硬尾标和流程仪式
- **结构瘦身**：移除 `role-pool.yaml`、治理槽位绑定和月报模板，`memory/` 改为项目错题本
- **模板更新**：`templates/spec.md` 改为 verifier 卡，`templates/checklist.md` 改为交付清单模板
- **现实索引改性**：`reality.md` 改为约束与风险地图，不再复述目录结构

### Why

- 实测显示流程合规不能保证交付质量，真正决定一次通过率的是验收信号保真度
- agent 已具备 loop 能力，baseline 应供给高质量退出条件，而不是重复驱动流程

### Key Files

- `examples/baseline/.ys_team/config.yaml`
- `examples/baseline/.ys_team/templates/spec.md`
- `examples/baseline/.ys_team/templates/checklist.md`
- `examples/baseline/.ys_team/reality.md`
- `examples/baseline/.ys_team/rules.md`
- `examples/baseline/AGENTS.md`
- `examples/baseline/CLAUDE.md`

### Migration Hint

- v1 原地替换现有 `ys-team` skill；旧版包通过 npm `legacy` tag 保留
- 已初始化项目可先只同步入口文件，去掉旧流程负担；再逐步把 reality、spec 模板和记忆瘦身
- Python / Java 项目可低成本开始：先 init，第一次复杂改动用 verifier 卡，等同类任务重复出现后再沉淀项目本地 SOP

## [0.6.5] - 2026-06-02

### What Changed

- **记忆回顾检查项**：baseline checklist 在 spec-talk 和 spec-work 阶段补充角色记忆回顾确认项
- **项目本地 SOP**：rules/spec/checklist 增加项目本地 SOP 的通用占位，支持项目把高频领域工作沉淀为本地 references、条件式 close gate 和结果责任检查
- **本地化保留**：init/rebuild 口径明确保留项目本地 SOP 定制，不覆盖项目自己的 rules、checklist gate 或本地 skill

### Why

- skill 已有角色记忆回顾与 `[记忆更新]` 通知逻辑，checklist 需要同步承载验收提醒，避免执行链路漏检
- 真实项目实践表明，高频领域工作不应写进 ys-team 核心，而应留在项目本地；baseline 需要提供承载位置和边界

### Key Files

- `examples/baseline/.ys_team/templates/checklist.md`
- `examples/baseline/.ys_team/templates/spec.md`
- `examples/baseline/.ys_team/rules.md`
- `skills/ys-team/baseline/.ys_team/templates/checklist.md`
- `skills/ys-team/baseline/.ys_team/templates/spec.md`
- `skills/ys-team/baseline/.ys_team/rules.md`

### Migration Hint

- 已初始化项目若已有本地 SOP、项目内 skill 或 checklist gate，rebuild 时应保留这些定制
- 没有高频领域风险的项目不需要新增 SOP，继续使用默认 L0/L1/L2 即可

## [0.5.2] - 2026-04-21

### What Changed

- **入口补强**：baseline 的 `AGENTS.md` / `CLAUDE.md` 现在明确列出 ys-team 各阶段固定可见标志格式
- **缺标志回退**：入口规则新增“缺少可见标志 = 未进入 ys-team 工作流，必须切回路由”
- **副本对齐**：`skills/ys-team/baseline/` 与 `examples/baseline/` 的入口文件、CHANGELOG、VERSION 同步

### Why

- 仅要求“回复末尾必须出现 ys-team 标志”对部分 agent 约束不够强，容易漏掉固定尾标
- baseline 是外部项目 `init` / `rebuild` 的真实来源，需要把本仓已验证的入口硬约束回流进去

### Key Files

- `examples/baseline/AGENTS.md`
- `examples/baseline/CLAUDE.md`
- `examples/baseline/.ys_team/VERSION`
- `skills/ys-team/baseline/AGENTS.md`
- `skills/ys-team/baseline/CLAUDE.md`
- `skills/ys-team/baseline/.ys_team/VERSION`

### Migration Hint

- 已初始化项目若入口文件仍只写“回复末尾必须出现 ys-team 标志”，建议至少同步 `AGENTS.md`
- 如需同时统一 Claude / Codex 两侧行为，下一次 `rebuild` 时一并同步 `CLAUDE.md`

## [0.5.0] - 2026-04-16

### What Changed

- **项目瘦身**：baseline 从 ~34 文件精简到 ~10 文件，方法论从 7 篇重写为 2 篇，skills 从 8 个减到 4 个
- **结构重建**：`TEAM.md` + `team.md` → `config.yaml`，`policy.md` + `methods.md` → `rules.md`，`delivery-flow.md` → `templates/checklist.md`，7 种 spec 模板 → 1 种 `spec.md`
- **反向控制**：新增 8 条禁止项（含 Ban Levels 和自检锚点），作为 `rules.md` 核心内容
- **角色压缩**：角色定义从独立文件改为 `config.yaml` 内联（每个角色 3 字段），删除角色卡 schema
- **记忆简化**：删除 `memory/policy.md`，压缩规则内嵌 skill；baseline 只保留空 `memory/` 目录
- **现实索引**：`module-index.md` 重命名为 `reality.md`，移入 `.ys_team/`
- **toolbox/evolution 删除**：不再需要工具内化和演进追踪机制

### Why

- 用户心智负担过重（~10 个概念），需要降到 3 个：规则、现实索引、Spec
- 对照 Karpathy 项目（68 行 CLAUDE.md），ys-team 真正多出的价值只有 5 件事，其余都是治理开销

### Key Files

- `examples/baseline/.ys_team/config.yaml`（新）
- `examples/baseline/.ys_team/rules.md`（新）
- `examples/baseline/.ys_team/reality.md`（新）
- `examples/baseline/.ys_team/templates/checklist.md`（新）
- `examples/baseline/.ys_team/templates/spec.md`（新）
- `examples/baseline/AGENTS.md`（重写）
- `examples/baseline/CLAUDE.md`（重写）

### Migration Hint

- 旧项目执行 `ys-team-init --rebuild` 时会收到迁移提示
- `policy.md` → `rules.md`，`team.md` → `config.yaml`，`delivery-flow.md` → `templates/checklist.md`
- `TEAM.md`（项目根目录）配置收进 `config.yaml`
- `toolbox/` 和 `evolution/` 可直接删除
- 角色记忆文件从 `memory/roles/<role>.md` 改为 `memory/<role-id>.md`

## [0.4.0] - 2026-04-15

### What Changed

- **记忆格式升级**：角色记忆文件由事实记录升级为三段式判断规则（错误模式 / 正确做法 / 适用场景），policy.md 明确禁止纯事件描述
- **close 阶段完整化**：close 收口清单补齐为 5 步（memory 兜底回顾、workspace 标记、git commit、status 更新、spec 归档）
- **check-update 增强**：版本落后时输出缺失版本的主要变化和迁移建议，提取失败降级为 CHANGELOG 链接
- **角色记忆更新通知**：spec-talk / spec-work / submit 角色记忆写入时，在 Host Summary 前输出 `[记忆更新]` 可见通知
- **baseline CHANGELOG 建立**：从本版本起按版本沉淀结构化变更记录

### Why

- full-auto 实战验证暴露：角色记忆从未触发，close 阶段缺少兜底机制
- 事实记录型记忆复用价值低，升级为判断规则型才有跨任务迁移价值
- 用户升级时无法感知”改了什么”，需要 check-update + changelog 双轨支撑

### Key Files

- `examples/baseline/.ys_team/memory/policy.md`
- `examples/baseline/CHANGELOG.md`
- `examples/baseline/AGENTS.md`

### Migration Hint

- 若项目角色记忆文件内容为纯事实记录，建议按三段式格式重写（可在下次 spec-work 完成后执行）
- 若项目 close 阶段缺少 5 步收口清单，更新 ys-team skill 后在下次 rebuild 时确认配置同步

## [0.3.2] - 2026-04-14

### What Changed

- 将 ai-gateway 实战验证过的治理规则回流到 baseline，包括 `Infer First`、讨论成本意识、`Spec-Review Gate`、`QA Gate`、记忆隐私约束等
- 对齐发布线治理：明确 `release/<version> -> publish -> merge main -> tag` 的发布顺序，并统一 baseline 与本仓版本线

### Why

- baseline 需要反映真实项目里被验证过的治理规则，而不是停留在最初简版
- 发布线和主干内容一度脱节，需要把“版本号一致”升级为显式治理规则

### Key Files

- `examples/baseline/.ys_team/methods.md`
- `examples/baseline/.ys_team/policy.md`
- `examples/baseline/.ys_team/memory/policy.md`
- `examples/baseline/AGENTS.md`
- `examples/baseline/.ys_team/VERSION`

### Migration Hint

- 若项目初始化于 `0.3.1` 或更早，优先对比并补齐 `methods.md`、`policy.md`、`memory/policy.md` 和 `AGENTS.md`
- 若项目自带发布流程，确认本地发布 gate 与 baseline 的发布顺序规则一致

## [0.3.1] - 2026-04-10

### What Changed

- 补齐 semi-auto / full-auto 所需的四个阶段通信模板：`requirement.md`、`workspace.md`、`review.md`、`qa-report.md`
- 修正 baseline bundling 与 rebuild/install 路径问题，避免项目拿到不完整的 baseline 资产

### Why

- 在 `0.3.0` 引入自动编排后，baseline 模板仍不完整，实际项目无法稳定跑通完整链路
- 安装或 rebuild 如果没有把 baseline 资产放对位置，用户即使升级也无法获得完整模板

### Key Files

- `examples/baseline/.ys_team/templates/requirement.md`
- `examples/baseline/.ys_team/templates/workspace.md`
- `examples/baseline/.ys_team/templates/review.md`
- `examples/baseline/.ys_team/templates/qa-report.md`
- `skills/ys-team/`

### Migration Hint

- 若项目缺少上述四个模板，优先执行一次 `rebuild`
- 若本地安装的 skills 中 baseline 目录不完整，重新安装或重新初始化项目，再核对模板文件是否齐全

## [0.3.0] - 2026-04-10

### What Changed

- 正式建立 v0.3 基线：引入 `manual / semi-auto / full-auto` 编排模式、`TEAM.md` 配置入口和角色记忆结构
- CLI 新增 `check-update`，开始支持本地版本与 npm 最新版的对比

### Why

- ys-team 需要从“静态文档集合”升级为可执行的默认工作流骨架
- 项目升级后需要一个最小的版本感知入口，避免用户完全靠人工猜测是否落后

### Key Files

- `examples/baseline/TEAM.md`
- `examples/baseline/.ys_team/memory/`
- `examples/baseline/.ys_team/team.md`
- `scripts/ys-team.mjs`

### Migration Hint

- 从更早版本升级到 `0.3.0` 时，先确认项目本地已存在 `TEAM.md` 和 `.ys_team/memory/`
- 如果本地仍是旧骨架，优先执行初始化或 rebuild，再开始使用 semi-auto / full-auto
