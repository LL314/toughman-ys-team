# Work Log

2026-10-30 · 分支 `work/20261030-core-rule-refinement` · 基线 `56cf9e7`

用户已确认①②③；Spec Review PASS 后开始实现。原生执行，修改共享规则与文档，三个闭环存在同文件依赖，串行完成。

## 任务清单

- [x] verifier 能区分独立预期与实现镜像，并要求 bug 原始症状的前后证据；已同步 rules、模板、spec-talk 与说明。
- [x] 复杂任务按可独立验收行为执行；已同步 spec-work、reference 与短示例，注明无法独立验收时的依赖。
- [x] 两个 skill 去重后仍保留所有门槛，版本与 baseline 同步并通过打包安装、独立场景 QA。

## 验证策略

这是文档型 agent 行为调整，无运行时代码修改；不增加通用脚本或程序单测。用 L1 内容/同步检查、固定基线字符数对比、独立场景走查与实际包安装验证替代。

修改前两个 skill 合计 4880 字符；修改后 4869 字符，减少 11 字符。新增规则的 4 个文本检查（独立预期、bug 前后证据、完整行为、统一验收点）在基线均缺失。这是规则存在性基线，不是 bug 红灯证明。

QA 场景证据见 `evidence/qa-scenarios.md`：10/10 有明确判定；5 PASS（含 2 个带条件）、3 REJECT、2 BLOCKED。

验证结果：`git diff --check` PASS；`diff -qr examples/baseline skills/ys-team/baseline` PASS；版本线（npm 1.0.4、baseline 1.0.4、methodology 2.2.1）PASS；`npm pack` + 临时目录解包、CLI help、install-skills、init-project dry-run PASS。

实现后独立审阅：PASS。修复输出路径、status 时间和旧版本声明后，复核确认 4 项通过 / 0 项失败，未发现本次改动新增门槛丢失。

Close 状态：BLOCKED。`npm whoami` 返回 ENEEDAUTH；未执行 `npm publish`、合回 `main`、创建或 push tag，因此 spec 保持 active，不归档。

发布前置：npm latest=1.0.3，legacy=0.6.5；`npm whoami` 返回 ENEEDAUTH。

2026-11-02 · 发布尝试复核：Chrome 已登录 `toughman`，但新建的无 bypass 2FA token 发布 `@toughman/ys-team@1.0.4` 返回 E403。该临时 token 已在 npm 页面撤销，cmux 中的临时 npm 配置也已清理。账号仍需启用 npm 2FA，或由用户创建带 bypass 2FA 的发布 token 后才能继续。

2026-11-02 · 使用新建且带 Bypass 2FA 的 token 重试：`npm whoami` 返回 `toughman`，但发布 `@toughman/ys-team@1.0.4` 返回 E404。匿名 registry 查询显示 `@toughman/ys-team` 不存在，而原 unscoped `ys-team` 已存在 `1.0.3`；当前阻塞收敛为 scoped package 权限/命名问题，未继续盲目重试。

## 2026-11-02 发布成功

新 token 在 cmux 中经隐藏输入使用，`npm whoami` 返回 toughman。发布已接受（退出码 0），随后 registry 确认 `toughman-ys-team@1.0.4`、`latest=1.0.4`、维护者 toughman。下载的 tarball SHA-1 为 `c85d425c16a0707f09e49e35f053858b8d864f61`，与发布前验证的文件一致。

发布前 7 项检查通过 / 0 失败：diff 格式、baseline 全量一致、版本一致、实际 pack、解包 CLI help、install-skills dry-run、init-project dry-run。临时认证文件已清理，未撤销用户提供的新 token。Git main/tag/push 待本次收尾完成。

纠正前面的推断：E404 本身不能证明账号缺少 scoped 发布权限；E_STAGE_REQUIRED 证明旧 token 不能用于直接发布。官方 2026-10-02 公告已支持通过 staged publishing 创建新包，因此“首次创建必须 direct token”不是通用规则。本次使用用户提供的新 token 直接发布成功。

Git 收尾已验证：发布提交 `00d8c6d` 已合回 main，main、work 分支和 `v1.0.4` tag 已推送到 `LL314/toughman-ys-team`。本 spec 完成并归档；原 token 未撤销。
