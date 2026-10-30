---
Spec-Type: control
Initiative: 20261030-core-rule-refinement
Status: in-progress
Owner-Session: 2026-10-30
Write-Scope:
  - skills/ys-team-spec-talk/SKILL.md
  - skills/ys-team-spec-work/SKILL.md
  - docs/methodology/overview.md
  - docs/methodology/reference.md
  - docs/methodology/VERSION
  - docs/guide/examples.md
  - README.md
  - .ys_team/rules.md
  - .ys_team/templates/spec.md
  - .ys_team/templates/checklist.md
  - .ys_team/VERSION
  - .ys_team/status.md
  - examples/baseline/.ys_team/rules.md
  - examples/baseline/.ys_team/templates/spec.md
  - examples/baseline/.ys_team/templates/checklist.md
  - examples/baseline/.ys_team/VERSION
  - examples/baseline/CHANGELOG.md
  - skills/ys-team/baseline/.ys_team/rules.md
  - skills/ys-team/baseline/.ys_team/templates/spec.md
  - skills/ys-team/baseline/.ys_team/templates/checklist.md
  - skills/ys-team/baseline/.ys_team/VERSION
  - skills/ys-team/baseline/CHANGELOG.md
  - package.json
  - docs/specs/queued/20261030-core-rule-refinement/
  - docs/specs/active/20261030-core-rule-refinement/
  - docs/specs/archive/20261030-core-rule-refinement/
Delete-Scope:
  - docs/specs/queued/20261030-core-rule-refinement/
  - docs/specs/active/20261030-core-rule-refinement/
Depends-On: []
Verification: "见 ## 验收"
---

# 核心规则优化：可信验收、完整行为拆分与去重

## 意图

用户已确认只落实调研建议①②③：提高 verifier 的判错能力，按完整行为拆任务，并精简重复指令。通过替换与合并现有规则完成，不增加核心概念。

## 非目标

- 不做④提问优化或⑤机械检查产品化；不改 grill、CLI、hook、agent 编排、路由或配置结构。
- 不增加核心 skill、references 文件或通用测试工具。
- 不强制所有任务人为制造错误，不把纯文档修改强行套成代码 TDD。
- 不整理历史 spec、旧 status 判断或无关项目文档。

## Write-Scope

frontmatter 列出的路径是完整写入范围：两个执行入口承载规则精简；方法论文档说明判据；rules、spec/checklist 模板和两份 baseline 同步；README 与短示例解释用户效果；版本及 CHANGELOG 用于发布；本 spec 和 status 承载进度与证据。

发布线拟升至 1.0.4，方法论线升至 2.2.1。保留现有字段及入口，不迁移已有项目数据。spec 目录移动仅服务本次生命周期。

## 目的与验收证明

| 目的 | 验收证明 |
|------|----------|
| 验收断言不与实现一起犯错 | rules / 模板 / spec-talk 明确预期来自需求或独立样例；场景走查拒绝按实现算法重算期望的伪测试 |
| bug 修复能捕获用户症状 | 同一检查的修复前失败、修复后通过证据要求可追溯；无法复现时必须说明尝试、限制与剩余风险，不伪称验证通过 |
| 每个小任务交付可验收行为 | spec-work 与 reference 按完整行为拆分，记录行为、涉及文件、验收和必要依赖；不能独立验收时注明统一验收点 |
| 文案更短且门槛不丢失 | 两个 SKILL.md 总字符数减少；保留入口检查、Write/Delete-Scope、UI 最低 L2、Feedback Loop、最终 Verification、独立审阅及 evidence/status 职责 |
| 安装用户获得一致的新规则 | baseline 全量 diff、版本一致性、实际 npm pack 内容与临时目录安装检查通过 |

## 验收

### 保真度等级

核心规则采用 L1 文档结构/一致性检查，加独立审阅者的场景走查；这是文档型 agent 指令，静态检查和少量场景不能证明不同模型长期运行的遵循率，不夸大为 L2/L3 业务验收。分发链路另用真实 CLI 在临时目录安装包验证，不触碰用户项目。

### 人等价验收脚本

1. 阅读两个新 skill 和模板，分别走查：独立预期的有效测试、镜像算法的伪测试、可复现 bug、不可复现 bug、纯文档任务、跨层完整行为、不能单独验收的迁移、UI 只有编译通过、越界修改、复杂任务缺少独立审阅。每例写出判定及规则依据。
2. 比较基线 `56cf9e7` 与修改后的两个 SKILL.md 字符数；核对去重后所有必需门槛仍有定义且执行步骤能到达。
3. `diff -qr examples/baseline skills/ys-team/baseline`、`git diff --check`；核对四处发布线版本为 1.0.4，方法论为 2.2.1。
4. `npm pack --json --pack-destination <临时目录>`；解包后运行包内 CLI，将 skills 安装到另一个临时目录，核对四个 skill 和新 baseline 内容。不得向全局 skills 或真实项目安装。
5. QA 通过后执行 release-first close：发布 1.0.4、确认 registry 版本和 dist-tags、合回 main、创建并 push tag。认证失败保留 active/close BLOCKED，不宣称完成或归档。

期望来自本卡与用户已确认的范围；场景结论由未继承实现上下文的审阅者给出。规则静态核对预计数秒，场景审阅及打包预计数分钟。

### Feedback Loop

- 命令：`git diff --check` 和 `diff -qr examples/baseline skills/ys-team/baseline`。
- 期望：退出码均为 0；这是格式/同步信号，最终验收仍须完成上述规则与场景核对。
- 复现成本：目标 < 30 秒。

## 交付清单

- [ ] 规则、skills、模板、用户文档同步。
- [ ] spec-review PASS 后在 work 分支执行，完成独立 QA。
- [ ] 两份 baseline 一致、版本一致、实际 npm pack 与安装验证通过。
- [ ] npm publish、main 合并、tag 和 push 完成后才 close / archive。

## 依赖 / 风险

- 当前 main 与 origin/main 一致，工作区干净，基线为 56cf9e7。
- npm latest 为 1.0.3；本机 `npm whoami` 返回 ENEEDAUTH，发布前需恢复 npm 认证。
- 去重可能隐藏关键门槛：入口保留 Preflight，步骤用同文件章节指针；逐项对照旧版验证。
- 现有项目保留本地定制；不改 CLI 的复制策略，旧规则/模板由 rebuild 按 CHANGELOG 合并。
- 回滚：发布前回退本分支改动；发布后通过后续修订版本修复，不覆盖已发布版本。
