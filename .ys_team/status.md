# 团队状态

updated: 2026-11-02T17:26:07+08:00

本文件只做当前仪表盘。任务过程、命令输出、QA 结论和发布证据写入对应 spec；可复用经验写入 `.ys_team/memory/`。

## 活跃 Spec

| Spec | 阶段 | 状态 | 负责角色 | 重试次数 | 模式 |
|------|------|------|---------|---------|------|
| 20260421-baseline-status-and-role-pool-sourcing | close | in-progress | gate | 1 | full-auto |
| 20260421-baseline-visible-marker-hardening | close | in-progress | arch, gate | 0 | full-auto |
| 20261030-core-rule-refinement | close | in-progress | gate | 0 | full-auto |

## Queued Spec

| Spec | 依赖 | 简述 |
|------|------|------|
| （无） | - | 当前无 queued spec |

## 最新判断（最近 5 条）

| 时间 | Spec | 角色 | 决定 | 原因 |
|------|------|------|------|------|
| 2026-06-30 | 20260630-compact-status-purpose-proof | spec-work | READY_FOR_QA | 短 status、目的与验收证明、skill 分层口径、curated examples、版本线和 baseline 双副本已落地；不处理 hook |
| 2026-06-30 | 20260630-compact-status-purpose-proof | spec-work | STARTED | 用户确认先落地短 status、目的与验收证明、skill 分层口径和 curated examples；hook 机制明确排除；已切到 `work/20260630-compact-status-purpose-proof` |
| 2026-10-30 | 20261030-core-rule-refinement | spec-work | STARTED | 用户确认只做①验收能抓错、②按完整行为拆任务、③精简重复指令；spec-review PASS；已切到 `work/20261030-core-rule-refinement` |
| 2026-10-30 | 20261030-core-rule-refinement | qa | PASS_READY_FOR_CLOSE | 10 个场景有明确判定；baseline、版本、diff、npm pack、临时安装和 CLI dry-run 均通过；npm 认证阻塞 publish |
| 2026-11-02 | 20261030-core-rule-refinement | close | NPM_PUBLISHED | toughman-ys-team@1.0.4 已上线，latest=1.0.4，registry tarball 与本地一致；Git 收尾进行中 |

## 阻塞项

- `20260421-baseline-status-and-role-pool-sourcing`：历史 close in-progress，需决定是否补 Git 收口或取消。
- `20260421-baseline-visible-marker-hardening`：历史 close in-progress，需决定是否补 Git 收口或取消。

## 待办

- [ ] 完成 `20260630-compact-status-purpose-proof` 的 main / tag push。
- [ ] 决定两个 20260421 历史 active spec 的收口方式。
- [ ] 完成 20261030-core-rule-refinement 的 QA 与 release-first close。
