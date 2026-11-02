# Work Log

2026-10-30 · 目标：将当前修改内容从原 `ys-team` 包身份切换为 toughman 的独立 npm 包。

- [x] 更新包名、仓库元数据和 scoped 安装入口。
- [x] 保留 MIT 版权并补充来源说明。
- [x] 完成打包、解包和 CLI 验证；`git diff --check`、baseline 双副本 diff、`npm pack --dry-run`、临时解包和两个 CLI dry-run 均通过。
- [ ] 认证可用后发布、切换 origin、合回 main、tag、push。

验证记录：`npm whoami` 已确认账号为 `toughman`；scoped 包 `@toughman/ys-team` 发布返回 E404，改用未占用的 unscoped 包名 `toughman-ys-team`。新 GitHub 仓库已创建并已切换本地 `origin`，本机 Git 没有可用 HTTPS 凭据，push 返回 `could not read Username`。

2026-11-02 · `package.json`、README、指南、CLI help 和 CHANGELOG 已切换到 `toughman-ys-team`；`npm pack --dry-run`、CLI help、`git diff --check` 通过。使用当前 token 首次发布返回 E_STAGE_REQUIRED：该 token 只能 staging，不能创建尚不存在的包；需 direct-capable token 才能完成首次发布。

## 2026-11-02 发布成功

新 token 在 cmux 中经隐藏输入使用，`npm whoami` 返回 toughman。发布已接受（退出码 0），随后 registry 确认 `toughman-ys-team@1.0.4`、`latest=1.0.4`、维护者 toughman。下载的 tarball SHA-1 为 `c85d425c16a0707f09e49e35f053858b8d864f61`，与发布前验证的文件一致。

发布前 7 项检查通过 / 0 失败：diff 格式、baseline 全量一致、版本一致、实际 pack、解包 CLI help、install-skills dry-run、init-project dry-run。临时认证文件已清理，未撤销用户提供的新 token。Git main/tag/push 待本次收尾完成。

纠正前面的推断：E404 本身不能证明账号缺少 scoped 发布权限；E_STAGE_REQUIRED 证明旧 token 不能用于直接发布。官方 2026-10-02 公告已支持通过 staged publishing 创建新包，因此“首次创建必须 direct token”不是通用规则。本次使用用户提供的新 token 直接发布成功。
