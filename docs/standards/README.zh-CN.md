# 团队规范（从这里开始）

> English version: [README.md](README.md)

这些文档让三个人用不同 AI agent 构建的三个原型保持足够的兼容性，使我们能在 10.19 评审后把最佳部分合并成一个应用。

| 文档 | 何时读 |
|---|---|
| [TECH_STACK.zh-CN.md](TECH_STACK.zh-CN.md) | 搭建项目、选库、部署时 |
| [CODING_STANDARDS.zh-CN.md](CODING_STANDARDS.zh-CN.md) | 写任何代码前（架构、模块规则、命名、git） |
| [DATA_MODEL.zh-CN.md](DATA_MODEL.zh-CN.md) | 添加或读取数据、命名字段和事件时 |
| [UI_GUIDELINES.zh-CN.md](UI_GUIDELINES.zh-CN.md) | 构建任何界面、写任何用户文案时 |

## 如何和 AI agent 一起使用这些文档

**如果你从这个仓库开始**（推荐）：根目录的 `AGENTS.md` 和 `CLAUDE.md` 指向这些文件，所以 Claude Code 和 Codex 会自动读取它们。给你的 agent 一个任务就行：

> 按照 AGENTS.md 和 docs/standards 构建一个新模块 `src/modules/flashcards/`。
> 在 src/registry/modules.ts 里注册它。不要碰其他模块。

**如果你从头开始自己的原型**，先把 `AGENTS.md`、`CLAUDE.md`、`docs/standards/`、`package.json`、`tsconfig.json`、`eslint.config.mjs`、`.prettierrc.json` 和 `src/app/globals.css` 复制进去，然后告诉你的 agent：

> 写代码前先读 AGENTS.md 和 docs/standards 里的所有内容。严格使用这个技术栈、
> 文件夹结构、命名和 UI token。把每个特性构建成 src/modules/<name>/ 里的模块，
> 带 manifest.ts，这样后面能复制到另一个项目里。

## 后续合并时最重要的三件事

1. **一个特性 = 一个文件夹**，在 `src/modules/` 里，通过 `manifest.ts` 插入。
2. **模块之间永远不互相 import**。它们通过核心表和 `learning_events` 共享数据。
3. **同样的东西用同样的名字**：表、字段和事件类型来自 DATA_MODEL.zh-CN.md。
