# npm 发布说明

## 当前状态

仓库当前已经具备 **可发布到 npm registry** 的包形态：

- `package.json` 已声明 `bin`
- `publishConfig.access` 已设为 `public`
- `npm pack --dry-run` 可通过

## 发布线定义

本仓发版时，以下三个文件共同构成发布线版本：

- `package.json`
- `examples/baseline/.ys_team/VERSION`
- `.ys_team/VERSION`

`docs/methodology/VERSION` 是方法论规范版本，独立维护，不跟随每次 npm 发包同步 bump。

## 发布顺序

发版按以下顺序执行：

1. 从当前待发布代码拉出 `release/<version>` 分支
2. 在该分支完成版本号、文档和必要实现更新
3. 执行发布前检查
4. 成功执行 `npm publish`
5. 将 `release/<version>` 合并回 `main`
6. 创建 git tag `<version>`
7. 只有到这一步，相关 spec 才能 close

对发版类 spec，QA Gate 的核心通过条件就是第 4 步：真实发布成功。

## 安装模式

### 全局模式

```bash
npx @toughman/ys-team install-skills
```

默认写入：

```text
~/.claude/skills
```

### 项目模式

```bash
npx @toughman/ys-team init-project --dir /path/to/project
```

默认写入：

- `/path/to/project/.agents/skills`
- `/path/to/project/AGENTS.md`
- `/path/to/project/CLAUDE.md`

## 真实发布仍需的条件

以下步骤尚未在仓库内自动化：

1. 准备 npm 账号
2. 执行 `npm login`
3. 如启用 2FA，按 npm 要求完成验证
4. 在发布环境中执行：

```bash
npm publish
```

## 建议发布前检查

```bash
node scripts/ys-team.mjs --help
node scripts/ys-team.mjs install-skills --dry-run
node scripts/ys-team.mjs init-project --dir /tmp/ys-team-project-check --dry-run
npm pack --dry-run
```

`init-project` 的 dry-run 应显示 `AGENTS.md` / `CLAUDE.md` 托管块动作，例如 `created`、`managed-block-updated`、`legacy-entry-replaced` 或 `managed-block-inserted`。
