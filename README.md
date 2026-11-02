# toughman-ys-team

本包由 npm 账号 `toughman` 维护，CLI 命令仍为 `ys-team`。内容基于原 `ys-team` 项目继续维护；MIT 许可证和原作者版权声明见 [LICENSE](LICENSE)。

给 AI coding agent 装一层 verifier-first 的项目纪律。安装一次，正常开发。

## 为什么需要它

AI agent 已经会自己循环读代码、改代码、跑命令。但它经常败在退出条件：

- 编译绿了，真实交互仍然坏
- 测试跑了，但没覆盖用户真正会做的操作
- 改动范围越扩越大，最后没人能说清验收标准
- 交付后才发现文档、发布或迁移步骤漏了

ys-team v1 的核心是把流程重量搬到 verifier：复杂改动先写一张 verifier 卡，说明怎么用接近真人的方式判断成败；agent 在 loop 里跑到 verifier 真绿，才算完成。

## 它怎么工作

四个原则：

- 现实先于生成：先读项目事实和硬约束
- 规格先于执行：非 trivial 改动先写 verifier 卡
- 讨论归于收敛：先 grill 澄清意图，必要时跨模型对抗审阅
- 证据胜于感觉：验收不真绿，不声明完成

v1 不再排他，也不靠强制尾标证明“进入流程”。真正的 gate 是三道闸：

- 入口闸：没有合格 verifier 卡，复杂改动不进入实现
- 出口闸：verifier 不真绿，不算完成
- 可见性闸：用 todo、status 和结果状态说明进度

## 你只需要理解 5 个概念

1. **规则**：AI 的行为边界
2. **约束地图**：项目硬约束和风险
3. **术语表**：避免领域语言漂移
4. **错题本**：跨任务复用的失败模式
5. **verifier 卡**：复杂改动的执行与验收合约

两个真决策点：

1. 看 spec 卡，尤其目的与验收证明是否对齐，验收是否足够像真人会做的检查。
2. 看最终证据，确认 verifier 真绿或人工剩余项已诚实标注。

复杂任务优先按可独立验收的完整行为拆分；验收预期来自需求、规格或独立样例，不能用实现本身重算。修复 bug 时，看同一复现检查是否从修复前失败变为修复后通过。

## 30 秒开始

```bash
npx toughman-ys-team install-skills --force
```

然后在你的项目里对 agent 说：

```text
用 ys-team-init 初始化这个项目
```

Python / Java 项目低成本开始方式：

1. 先 init，生成 `.ys_team/` 骨架。
2. 第一次复杂改动用 verifier 卡收敛。
3. 等同类任务重复出现、且每次容易漏同类验收时，再沉淀项目本地 SOP。

## 日常使用

照常描述需求。

简单、可逆、验收显然的改动会直接做，并说明最小验证。

非 trivial 改动会先进入：

```text
grill → verifier 卡 → loop 自跑 → 独立审阅 → 抽检证据
```

spec 级改动实现后默认由新 subagent（不继承实现上下文）做独立审阅：spec 合规 + 代码质量两阶段。单 agent 自审有盲区，独立审阅能抓「测试通过但运行时坏」的缺陷。trivial/patch 跳过。流程 agent 中立，Claude/Codex 共用。

verifier 卡会写清：

- 意图和非目标
- Write-Scope / Delete-Scope
- 目的与验收证明
- 验收保真度等级 L3/L2/L1/L0
- 人等价验收脚本或降级理由
- Feedback Loop
- 项目交付清单

UI/交互类改动低于 L2 默认不通过。也就是说，不能只靠单测或编译来证明一个真实交互已经好用。

`status.md` 只做当前仪表盘。任务过程、命令输出、QA 结论和发布证据留在 spec；项目经验和失败模式留在 `.ys_team/memory/`。

## 输出模式

默认是技术输出：

```yaml
output_mode: technical
```

如果希望保留技术细节的同时追加一段普通语言说明：

```yaml
output_mode: friendly
```

友好总结不改变验收门槛，也不替代 evidence。

## CLI 参考

```bash
npx toughman-ys-team install-skills [--dest <dir>] [--force] [--dry-run]
npx toughman-ys-team init-project [--dir <project-dir>] [--force] [--dry-run]
npx toughman-ys-team check-update
```

`install-skills --force` 会替换当前 ys-team 已安装的同名 skill，并清理当前 npm 包不再提供的旧 ys-team skill。

`init-project` 会安全刷新项目内 `.agents/skills`，并更新 `AGENTS.md` / `CLAUDE.md` 的 `ys-team:managed` 托管块。已有项目规则应写在托管块外；升级时只替换托管块，不覆盖项目本地约束。旧项目如果仍有 L0/L1/L2、固定尾标或 role/slot 入口段，`init-project` 会尽量替换为 v1 `direct / patch / spec` 入口。

## 仓库发版约束

ys-team 本仓是 npm 分发产品。本仓所有非 trivial 可交付改动都按 release-first close：

1. spec-review 通过后切到 `release/<version>` 或 `work/<spec-id>` 分支。
2. spec-work 和 QA 在分支上完成。
3. close 完成版本一致性检查、`npm pack`、`npm publish`、合回 `main`、创建并 push 同版本 git tag。

版本线：

- npm 发布线：`package.json` + baseline `.ys_team/VERSION`
- 方法论线：`docs/methodology/VERSION`

v1 原地替换现有 `ys-team` skill；旧版 npm 包通过 `legacy` tag 保留。

## 文档地图

| 文档 | 说明 |
|------|------|
| [为什么需要 ys-team](docs/guide/why-ys-team.md) | 问题、解法、反模式案例 |
| [开始使用](docs/guide/getting-started.md) | 安装、初始化、日常使用、常见问题 |
| [短示例](docs/guide/examples.md) | direct / patch、目的-验收 spec、本地 SOP 的 curated examples |
| [方法论规范](docs/methodology/) | 形式化规则与协议 |
