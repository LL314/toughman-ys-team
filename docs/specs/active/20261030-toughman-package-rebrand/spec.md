---
Spec-Type: release
Initiative: 20261030-toughman-package-rebrand
Status: in-progress
Owner-Session: 2026-10-30
Write-Scope:
  - package.json
  - README.md
  - scripts/ys-team.mjs
  - docs/guide/getting-started.md
  - docs/project/npm-publish.md
  - docs/specs/active/20261030-toughman-package-rebrand/
  - git remote configuration
Delete-Scope: []
Depends-On: [20261030-core-rule-refinement]
Verification: "scoped package metadata, package contents, CLI dry-runs, and repository identity checks"
---

# toughman 独立发布身份

## 假设与决定

- npm 包名采用 `@toughman/ys-team`。
- CLI binary 继续叫 `ys-team`，减少已安装用户的迁移成本。
- 当前已登录 GitHub 账号为 `LL314`，新仓库采用 `LL314/toughman-ys-team`；不冒充 `toughman` 的 GitHub 身份。
- 原作者 MIT 许可证和版权声明必须保留；本次只切换发布维护者、包名、仓库和安装入口。

## 非目标

- 不重命名 `ys-team` 方法论、skills、managed marker 或内部目录。
- 不删除原作者署名，不声称全部内容由 toughman 原创。
- 不修改业务规则或已有用户项目。

## 目的与验收证明

| 目的 | 验收证明 |
|------|----------|
| npm 身份不再撞原包 | `package.json.name` 为 `@toughman/ys-team`，`npm pack --dry-run` 元数据正确 |
| 安装入口不再指向原包 | README、指南、发布文档和 CLI help 使用 `npx @toughman/ys-team...` |
| 源码仓库与原作者分离 | package repository 与 git origin 指向 `LL314/toughman-ys-team` |
| 来源与版权合规 | LICENSE 保留 `Copyright (c) 2026 ys`，README 有来源说明 |
| 包仍可正常工作 | 临时目录解包后运行 CLI help、install-skills dry-run、init-project dry-run |

## 退出条件

1. `git diff --check` 通过。
2. `npm pack --dry-run` 与临时目录解包验证通过。
3. 两份 baseline 保持一致。
4. npm 认证可用时发布 `@toughman/ys-team@1.0.4`；认证不可用则保留本 spec active，并交付 tarball 和阻断原因。
5. 发布成功后再切换 origin、合回 `main`、创建并 push `v1.0.4` tag。
