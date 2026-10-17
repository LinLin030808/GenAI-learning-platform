# 技术栈

> English version: [TECH_STACK.md](TECH_STACK.md)。版本号在 `package.json` 里精确固定。未经小组同意，不要升级或添加依赖。

## 1. 技术栈总览

| 层次 | 选型 | 版本 | 原因 |
|---|---|---|---|
| 运行时 | Node.js | ≥ 22.12（我们用 24） | Next 16 / Vitest 5 的要求 |
| 框架 | Next.js App Router, Turbopack | 16.4.2 | 前后端在同一个项目，一键部署到 Vercel |
| UI 库 | React | 19.3.1 | Server Components、表单用 `useActionState` |
| 语言 | TypeScript, strict | 5.9.3 | 类型错误在早期就能发现 AI agent 的大部分错误 |
| 样式 | Tailwind CSS v4（CSS-first `@theme`） | 4.3.3 | 设计 token 写在 `src/app/globals.css` |
| 数据库 | PostgreSQL via Drizzle ORM | drizzle-orm 0.45.4, drizzle-kit 0.31.11 | 类型安全的 SQL、纯文本迁移 |
| DB（本地） | PGlite（嵌入式 Postgres，不需要装数据库） | 0.5.10 | Clone → `npm run setup` → 就能跑。不需要 Docker、不需要账号 |
| DB（生产） | Neon serverless Postgres（通过 Vercel Storage） | @neondatabase/serverless 1.2.0 | 免费额度，自动设置 `DATABASE_URL` |
| 认证 | 邮箱 + 密码，JWT session cookie | jose 6.2.12, bcryptjs 3.0.3 | 代码量小、易读、不依赖第三方认证服务 |
| 验证 | Zod | 4.6.7 | 表单、JSON body、AI 输出 |
| AI | 任何 OpenAI 兼容的 Chat API，默认 DeepSeek | 纯 `fetch`，在 `src/core/ai/client.ts` | 换 AI 提供商只改一个文件；没 key 时自动 mock |
| Markdown | react-markdown + remark-gfm | 10.1.0 / 4.0.1 | 课程内容、AI 回复（不渲染原始 HTML） |
| 代码编辑器 | CodeMirror（`@uiw/react-codemirror`） | 4.25.12 | 编程活动；代码在 Web Worker 里运行 |
| 图表 | Recharts | 3.10.1 | 教师参与度仪表盘 |
| CSV | Papa Parse | 5.7.0 | 学生导入 |
| 图标 | lucide-react | 1.58.0 | 全站统一的图标集 |
| 测试 | Vitest | 5.0.5 | 纯逻辑的单元测试 |
| Lint / format | ESLint 9（flat config, eslint-config-next）+ Prettier 3 | 9.39.5 / 3.9.10 | 模块边界规则 + 格式化 |
| 托管 | Vercel | — | Push 到 GitHub → 自动部署；每个 PR 有预览链接 |

### 故意不用的

- 没有单独的后端服务器、没有 Docker、没有 Redux/Zustand（server components + URL state 已经够了）。
- 除了我们自己的 `src/components/ui` 外，没用组件库（保证视觉是我们自己的，不是"默认 shadcn"）。
- 不用 AI SDK 封装：直接 `fetch` 调 AI 提供商，代码易读、易换。
- Next.js **Cache Components** 关掉了（`cacheComponents: false`）：每个页面都是针对当前用户的。

## 2. 命令

| 命令 | 作用 |
|---|---|
| `npm install` | 安装 `package-lock.json` 里固定的版本 |
| `npm run setup` | 创建本地数据库表 + 演示数据（第一次用） |
| `npm run dev` | 启动开发服务器 http://localhost:3000 |
| `npm run check` | 类型检查 + lint + 单元测试（每次提 PR 前都跑） |
| `npm run db:generate` | 修改 `schema.ts` 后：生成新的 SQL 迁移 |
| `npm run db:migrate` | 应用迁移 |
| `npm run db:seed` | 插入演示数据（如果没有的话） |
| `npm run db:reset` | 删除本地数据库，重建表和演示数据 |
| `npm run build` | 生产构建 |

PGlite 同一时间只允许**一个进程**访问：跑 `db:migrate`、`db:seed` 或 `db:reset` 前，先停掉 `npm run dev`。

## 3. 环境变量

把 `.env.example` 复制成 `.env.local`。`.env.local` 不要提交到 GitHub。

| 变量 | 是否必须 | 说明 |
|---|---|---|
| `DATABASE_URL` | 只在生产环境 | 本地留空（用 PGlite）。添加 Neon 后 Vercel 自动设置 |
| `AUTH_SECRET` | 生产环境 | 长随机字符串，用于签名 session cookie |
| `AI_API_KEY` | 否 | 留空 = mock AI。填 DeepSeek key 就能调真实 AI |
| `AI_BASE_URL` | 否 | 默认 `https://api.deepseek.com` |
| `AI_MODEL_FAST` / `AI_MODEL_SMART` | 否 | 低成本和高质量调用分别用的模型名 |
| `AI_JSON_MODE` | 否 | 如果提供商不支持 `response_format` 就设成 `false` |
| `AI_DAILY_LIMIT_PER_USER` | 否 | 默认每人每天 200 次真实调用 |

## 4. 部署到 Vercel

1. 把仓库 push 到 GitHub，然后在 Vercel 里 **Import Project**。
2. 在 Vercel 项目里：**Storage → Create → Neon (Postgres)**，连接上。这会自动设置 `DATABASE_URL`。
3. **Settings → Environment Variables**：添加 `AUTH_SECRET`，如果有 AI key 也加上 `AI_API_KEY`。
4. Build command：`npm run vercel-build`（会跑迁移、如果数据库为空就插入种子数据、然后构建）。
5. 部署。用 README 里列出的演示账号登录。
