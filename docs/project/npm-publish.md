# toughman-ys-team 工作流更新与 npm 发布 SOP

维护日期：2026-11-02。本文是本仓工作流更新、打包、发布和 Git 收尾的统一操作入口；发布经验见 [交付守门人记忆](../../.ys_team/memory/交付守门人.md)。

## 适用范围与固定身份

| 项目 | 值 |
|------|----|
| 本机仓库 | `/Users/xy/Documents/ys-team`（其他机器使用实际检出目录） |
| 用户指定终端 | cmux |
| GitHub | `https://github.com/LL314/toughman-ys-team.git` |
| npm 账号 / 包名 | `toughman` / `toughman-ys-team` |
| CLI / 主分支 | `ys-team` / `main` |
| 许可证 | MIT；保留 LICENSE 和原作者版权声明 |

最近一次已验证发布为 `toughman-ys-team@1.0.4`（2026-11-02）；下一次必须重新读取 package.json、registry 和 Git，不把历史版本当作永久最新值。

- `npm pack` 生成本地 `.tgz`，不需要 npm 发布权限。
- `npm publish` 上传 npm，需要目标包的发布权限和有效认证。
- `git push` 上传源码；GitHub main 更新与 npm 上线分别验证。
- MIT 允许按许可证条件修改和重新分发；原 `ys-team` 包名的发布权限属于其维护者。后续沿用 `toughman-ys-team`，不因单次认证错误擅自改名。

## 1. 读取入口、确认状态和改动范围

先读 [现实索引](module-index.md)、[本仓规则](../../.ys_team/rules.md)，再按 direct / patch / spec 路由。只查询或保存经验不等于授权新一轮发布；需要发布的非 trivial 交付遵循仓库 release-first gate。

在 cmux 中执行，每一步确认结果后再继续：

```bash
cd /Users/xy/Documents/ys-team
git status --short --branch
git remote get-url origin
git fetch origin
git log -1 --oneline origin/main
```

确认 origin 指向自己的仓库，识别并保留未提交改动。工作区干净、从 main 开始新工作时：

```bash
git switch main
git pull --ff-only origin main
git switch -c codex/workflow-update
```

分支名按任务更换；已有适用分支则复用。遇到分叉或冲突先查原因，不强推、不覆盖已有分支。

## 2. 更新工作流与同步文档

跨方法论、skills、baseline、CLI 或发布入口的实现先形成 verifier 卡，写清意图、非目标、Write/Delete-Scope、独立验收预期及证据。小范围可逆 patch 用快速 verifier 验收。

本次沉淀的三项核心原则：

1. 预期来自需求、规格或独立样例，不照抄实现算法。修复 bug 尽量留下同一复现检查修复前失败、修复后通过的证据；无法复现则说明限制。
2. 按完整可验收行为拆任务，例如“用户能初始化项目”；不能独立验收的子步骤注明统一验收点。
3. 优先替换、合并旧规则，不在多个入口重复堆叠同一要求。

| 改动 | 同步检查 |
|------|----------|
| skill 行为 | `skills/` 中对应 SKILL.md |
| 默认规则、模板、CHANGELOG | `examples/baseline/` 与 `skills/ys-team/baseline/` 全量一致 |
| CLI 行为或提示 | `scripts/ys-team.mjs`、README、用户指南 |
| 方法论含义 | `docs/methodology/` 与相关 skill |
| 过程与证据 | 当前 spec 的 work.md / evidence/ |
| 当前进度 | `.ys_team/status.md`，最近判断最多 5 条 |
| 非显然教训 | `.ys_team/memory/`，链接本文而不复制整套 SOP |

## 3. 确定版本

先核对线上版本：

```bash
npm view toughman-ys-team version --registry=https://registry.npmjs.org/
```

已发布版本不能覆盖。下例 `1.0.5` 仅是从 `1.0.4` 升级的示例，执行前选择本次真实目标版本：

```bash
npm version 1.0.5 --no-git-tag-version
node <<'NODE'
const fs = require('node:fs');
const version = require('./package.json').version;
for (const file of [
  '.ys_team/VERSION',
  'examples/baseline/.ys_team/VERSION',
  'skills/ys-team/baseline/.ys_team/VERSION'
]) fs.writeFileSync(file, version + '\n');
NODE
```

发布线共四处：package.json 与上述三个 VERSION。同步两份 baseline CHANGELOG；只有方法论语义发生变化时才调整 `docs/methodology/VERSION`，它独立于 npm 版本。

## 4. 打包与验收

```bash
git diff --check
diff -qr examples/baseline skills/ys-team/baseline
node <<'NODE'
const fs = require('node:fs');
const p = require('./package.json');
if (p.name !== 'toughman-ys-team') throw new Error('Unexpected package name');
for (const f of ['.ys_team/VERSION', 'examples/baseline/.ys_team/VERSION', 'skills/ys-team/baseline/.ys_team/VERSION']) {
  if (fs.readFileSync(f, 'utf8').trim() !== p.version) throw new Error('Version mismatch: ' + f);
}
console.log(p.name + '@' + p.version);
NODE
```

在同一个 cmux shell 中创建并验证实际 tarball；下面的变量仅在该 shell 内有效：

```bash
TASK_RELEASE_DIR=$(mktemp -d)
TASK_RELEASE_VERSION=$(node -p "require('./package.json').version")
npm pack --pack-destination "$TASK_RELEASE_DIR"
TASK_RELEASE_TARBALL="$TASK_RELEASE_DIR/toughman-ys-team-$TASK_RELEASE_VERSION.tgz"
tar -tzf "$TASK_RELEASE_TARBALL"
tar -xzf "$TASK_RELEASE_TARBALL" -C "$TASK_RELEASE_DIR"
mkdir -p "$TASK_RELEASE_DIR/project"
node "$TASK_RELEASE_DIR/package/scripts/ys-team.mjs" --help
node "$TASK_RELEASE_DIR/package/scripts/ys-team.mjs" install-skills --dest "$TASK_RELEASE_DIR/skills" --dry-run
node "$TASK_RELEASE_DIR/package/scripts/ys-team.mjs" init-project --dir "$TASK_RELEASE_DIR/project" --dry-run
```

检查包名、版本、LICENSE、必要文件，排除凭据、临时配置和私人文件。上述检查不能替代本次 verifier；安装/迁移行为变化时还需在临时项目真实执行并检查写入结果。不得拿真实用户项目做破坏性测试。

所有必需检查通过后，发布同一份已验证 tarball。QA PASS 表示可发布；close 阶段才收集真实发布成功证据。

## 5. 认证和发布

### 交互式登录

```bash
npm login --auth-type=web --registry=https://registry.npmjs.org/
npm whoami --registry=https://registry.npmjs.org/
npm publish "$TASK_RELEASE_TARBALL" --access public --registry=https://registry.npmjs.org/
```

`whoami` 必须是 toughman；按 npm 提示完成网页登录和 2FA。Chrome 已登录不代表 CLI 已登录。环境变量或临时 userconfig 可能覆盖默认认证，排查时只报告配置来源，不输出凭据。

### token

按执行时 npm 官方政策选择认证方式。直接发布需要有效期内、包权限覆盖目标且有 `Read and write (publish and stage)` 能力的 token；免 OTP 路径还需要相应 Bypass 2FA 能力。Bypass 2FA 与发布方式是独立设置，绿色勾不证明可以直接发布。

- token 不放进聊天、截图、Git、命令参数或 shell 历史；不搜索浏览器数据库或历史记录找密钥。
- 用隐藏输入读取，临时 npmrc 权限设为 0600，并通过 try/finally 或等效机制在成功、失败、中断时清理；不覆盖用户原 npmrc。
- 自动操作终端时，先观察到明确隐藏输入提示，再粘贴一次并提交；状态不明时先重新观察，绝不补发 token 试探。
- 不依赖系统剪贴板保留旧值。用户可能同时复制了其他内容。
- 输出只保留账号、退出码和脱敏错误。已暴露 token 建议撤销，撤销及新建凭据按用户授权和平台操作规则执行。

### staged publishing

支持该命令的 npm CLI 可使用：

```bash
npm stage publish "$TASK_RELEASE_TARBALL" --access public
```

之后在 npm 的 Staged Packages 页面由维护者审核并完成 2FA，批准版本上线。暂存成功不等于公开可安装。

官方 2026-10-02 公告已支持通过 staged publishing 创建新包；不能把“首次创建必须 direct token”当成通用限制。旧 CLI 不支持 npm stage 时，先核对 Node.js 兼容性和 npm 升级要求。

截至 2026-11-02，官方计划在 2027 年 1 月移除 bypass token 的直接发布能力。这是有时效的政策，后续必须重查：

- [npm token 类型与权限](https://docs.npmjs.com/about-access-tokens)
- [Staged publishing](https://docs.npmjs.com/staged-publishing)
- [Staged publishing 支持创建新包的公告](https://github.blog/changelog/2026-10-02-npm-staged-publishing-now-supports-creating-new-packages/)
- [Bypass 2FA 弃用计划](https://github.blog/changelog/2026-07-08-npm-install-time-security-and-gat-bypass2fa-deprecation/)

## 6. 错误处理：先定位，不重复碰运气

| 信号 | 含义与下一步 |
|------|------------|
| pack 成功 | 仅证明本地打包完成，继续验收 |
| E401 / ENEEDAUTH | 核对认证来源、账号、过期或撤销状态 |
| E403 明确要求 2FA | 核对发布认证是否满足该要求 |
| E_STAGE_REQUIRED | 当前 token 不可直接发布；核对 staged 路径或合适的直接发布认证 |
| E403 明确无目标包权限 | 核对包所有者、账号和 token 范围 |
| E404 | 可能不存在或访问受限；核对 registry、包名、账号和权限，不能单凭此认定 scoped 包不可用 |
| 已发布版本不可覆盖 | 选择新版本并重新验收打包 |
| being processed | npm 已接受但仍在处理；等待 registry，暂不再次 publish |

没有证据变化时不重复执行同一发布命令；记录准确错误与仍未确认的原因。不要把认证失败误判为需要原作者授权。

## 7. 确认真正上线

```bash
npm view "toughman-ys-team@$TASK_RELEASE_VERSION" name version dist.shasum --registry=https://registry.npmjs.org/
npm view toughman-ys-team dist-tags --registry=https://registry.npmjs.org/
shasum -a 1 "$TASK_RELEASE_TARBALL"
```

指定版本可查询、latest 指向预期版本、线上 dist.shasum 与本地 tarball SHA-1 一致后才报告上线；需要时下载 registry tarball 再核对哈希及安装行为。处理中短暂 404 不意味着需要重新上传。

## 8. GitHub 与经验收尾

把版本、验收证据、npm 结果、tarball 校验值记录到当前 spec，不记录 token。检查并只提交本次明确文件列表：

```bash
git diff --check
git status --short
git diff
```

随后用 `git add <本次文件列表>`、`git commit` 提交；占位符必须替换，不能直接复制执行。本仓 docs/specs 被 ignore，确认是应提交的指定证据文件后可对这些具体路径使用 git add -f，不强加整个忽略目录。

npm 上线验证后合回 main；以下分支和版本均需替换为本次值：

```bash
git fetch origin
git switch main
git pull --ff-only origin main
git merge --ff-only codex/workflow-update
git tag -a v1.0.5 -m "toughman-ys-team 1.0.5"
git push --atomic origin main refs/tags/v1.0.5
```

合并失败、远端有新提交或 tag 已存在时先核对原因，不强推、不覆盖 tag。更新 status、归档本次 spec，提交并推送归档结果；其他未完成 spec 保持原状态。多 spec 合并发版时按一个 release 单元收尾，避免重复发布。

```bash
git rev-parse main
git ls-remote origin refs/heads/main
git status --short --branch
```

本地与远端 main 哈希一致，版本 tag 已在远端，工作区无遗漏的本次改动，才报告 Git 收尾完成。版本 tag 指向发布提交；后续纯归档提交可在其后，不移动已发布 tag。

## 9. 使用者升级

```bash
npx toughman-ys-team@latest install-skills --force
npx toughman-ys-team@latest init-project --dir /你的项目路径
```

默认全局 skills 目录为 `~/.claude/skills`；项目初始化更新 `.agents/skills`、AGENTS.md 和 CLAUDE.md 的托管内容。`--force` 会替换同名 skill，先保留自行定制的内容；项目自定义规则放在托管块之外。

## 可复用任务指令

```text
请按 docs/project/npm-publish.md 更新 toughman-ys-team。
本次需求：……
目标版本：……（发布前核对是否已占用）
交付范围：……（只修改 / 本地打包 / 正式发布）
在 cmux 操作终端，保留已有改动，验证两份 baseline 与实际 tarball。
凭据通过隐藏输入使用，不写入聊天、日志或仓库。
正式发布需验证 registry，再完成 main、tag、push 与归档。
最终说明验证结果、未完成项及实际风险。
```
