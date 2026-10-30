---
name: ys-team-spec-talk
description: "Create or review a ys-team verifier card for a non-trivial change. Use when 用户说「起一个 spec」「为这件事开 spec-talk」「grill 我」「把刚才讨论写成 spec」等。"
---

# ys-team-spec-talk

<what-to-do>

被调用时立即执行：

1. 按下方 **Read Order** 读取项目规则、术语和相关资料。
2. 按下方 **Intent First** 做意图三段判断。
3. 边界不清时按下方 **Grill** 收敛；问题过多时生成 `questions.md`。
4. 收敛后把 verifier 卡写到 `docs/specs/queued/<initiative-id>/spec.md`。
5. 对关键、不可逆、多模块工作，可按下方 **Adversarial Review** 请求跨模型审阅。
6. 更新 `.ys_team/status.md`。

</what-to-do>

<supporting-info>

## Read Order

1. `.ys_team/config.yaml`
2. `.ys_team/rules.md`
3. `.ys_team/reality.md`
4. `.ys_team/glossary.md`
5. 相关项目文档、ADR、已有 spec
6. `.ys_team/memory/` 中相关领域错题本
7. `.ys_team/templates/spec.md` 与 `questions.md`

只读取与任务相关的错题本，不加载无关历史。

## Intent First

先判断：

- 当前对象：idea / requirement / existing spec / implementation gap
- 当前目标：澄清 / 起草 verifier 卡 / 审阅 / 执行准备
- 当前阻塞：边界不清 / 验收不清 / scope 不清 / 无阻塞

阻塞不清时先问用户。

## Grill

适用于需求模糊、验收不清或用户明确要求“问我”。

规则：

- 一次只问一个问题。
- 优先问会影响验收和 Write-Scope 的问题。
- 5-7 轮内收口。
- 收口后形成“已澄清命题”，再写 verifier 卡。

## 文件化 Grill

触发：

- 待确认问题超过 5 个。
- 横跨目标、范围、行为、验收、迁移、风险多个维度。
- 聊天追问会丢失问题树。

产物：`docs/specs/queued/<initiative-id>/questions.md`，优先使用 `.ys_team/templates/questions.md`。

Ready For Spec：

- 目标清楚
- 非目标清楚
- 关键行为清楚
- 验收方式清楚
- Write-Scope 可估计

## Verifier Card

必须包含：

- 意图
- 非目标
- Write-Scope
- 目的与验收证明
- 验收
  - 保真度等级 L3/L2/L1/L0
  - 人等价验收脚本，或降级理由
  - Feedback Loop
- 交付清单
- 依赖 / 风险

兼容仓库旧 spec 模板时，也必须让这些信息可追溯。

## Structure Lint

进入 spec-review / spec-work 前必检：

- Write-Scope 非空。
- Delete-Scope 覆盖删除行为。
- 目的与验收证明存在，且目的不是实现动作。
- 每个交付项能追溯到 Write-Scope。
- 验收预期来自用户目标、规格或独立样例；没有用被测实现重算预期。
- bug 修复有同一复现检查的前后证据，或有明确的不可复现说明。
- 验收声明 L3/L2/L1/L0。
- UI/交互类验收低于 L2 时 REJECT。
- Feedback Loop 存在且可运行，或 N/A 理由成立。
- 文档同步、发布 gate、本地 SOP 交付项已列入。

v1.0 采用文档化必检规则，不默认生成脚本。

## Adversarial Review

两类审阅，区分清楚：

**实现前 spec-review**（本 skill 产出）：结构 lint + 意图/验收/scope 检查，在 spec 进入实现前。

**实现后独立审阅**（spec-work 末尾，spec 级默认启用）：实现完成后由新 subagent（不继承实现上下文）做两阶段 review——spec 合规 + 代码质量。抓单 agent 自审漏掉的运行时缺陷。trivial/patch 跳过。

审阅者只看制品（verifier 卡、代码 diff、验证结果），不看起草/实现推理过程。

**跨模型对抗审阅**（高风险 spec 可选叠加）：用一个不同模型审。触发建议：

- 不可逆发布或数据迁移
- 安全、权限、支付、计费
- 多模块协议变化
- 用户明确要求独立审

trivial / 低风险 patch 可跳过。

**agent 中立**：独立审阅表述为「开新 subagent 会话」。支持自动派 subagent 的 agent 直接派；不支持的由用户主动命名启动新会话。流程要求不绑定任一方专属 API。

## Status

写入 `.ys_team/status.md`：

- active spec
- queued spec
- 当前阶段
- 最新判断（最多 5 条）
- 阻塞项或待确认问题

status 只做当前仪表盘；任务过程和验证证据写入 spec 目录，可复用经验写入 `.ys_team/memory/`。

## Output

输出应包含：

- 决策：PASS / BLOCKED / REJECT
- 当前状态
- 为什么
- 产出路径
- 下一步

可追加结果状态尾缀；尾缀不是完成条件。

</supporting-info>
