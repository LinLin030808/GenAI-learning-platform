# UI 指南

> English version: [UI_GUIDELINES.md](UI_GUIDELINES.md)。10.17 会议的目标：**可爱友好、一眼不是模板、没有"AI 味"**。

## 1. 视觉风格："贴纸簿"

所有东西看起来像米黄色纸上的粗边贴纸。

- **米黄圆点背景**，白色"纸质"卡片。
- **2px 深色描边**（`border-2 border-line`），卡片、按钮、输入框、徽章都有。
- **实心偏移阴影**，不用模糊阴影（`shadow-sticker`、`-sm`、`-lg`）。按钮悬停时抬起，点击时按下。
- **大圆角**：卡片 `rounded-blob`、按钮/徽章 `rounded-pill`、输入框 `rounded-xl`。
- **圆润字体**：Fredoka 用于标题（`font-display`）、Nunito 用于正文。
- **Pip the sprout**（我们自己的吉祥物，`<Pip />`）出现在欢迎、空状态、反馈和助教里。学生升级时 Pip 会长叶子（`stage` 0-4），还有心情（`happy`、`cheer`、`think`、`sleepy`、`wow`）。

## 2. 颜色 token

用 Tailwind 类名，不要直接写十六进制。定义在 `src/app/globals.css`。

| Token | 用途 | 类名 |
|---|---|---|
| `cream` | 页面背景 | `bg-cream` |
| `paper` | 卡片、输入框 | `bg-paper` |
| `ink` / `ink-soft` | 文本 / 次要文本 | `text-ink`、`text-ink-soft` |
| `line` | 描边和阴影 | `border-line` |
| `coral`（+`-soft`、`-deep`） | 主操作、连续天数、错误 | `bg-coral`、`bg-coral-soft` |
| `mint`（+`-soft`、`-deep`） | 成功、进度、Pip | `bg-mint` |
| `butter`（+`-soft`） | XP、高亮、激活的导航 | `bg-butter` |
| `sky`（+`-soft`） | 信息、焦点环、教师区域 | `bg-sky` |
| `lilac`（+`-soft`） | AI 功能、角色扮演 | `bg-lilac` |

每门课有一个 `color`（`coral | mint | butter | sky | lilac`）。用 `asTint(course.color)` 和 `TINT_BG` / `TINT_SOLID` 把它变成卡片色调。

## 3. 组件（用这些，不要自己重新写样式）

`import { Button, buttonClasses, Card, CardHeader, CardBody, Badge, Field, Input, Textarea, Select,
Notice, ProgressBar, Stat, PageHeader, EmptyState, Markdown, Pip, PipSays, Avatar } from '@/components/ui'`

- `SubmitButton`（客户端）：`import { SubmitButton } from '@/components/ui/submit-button'`
- 看起来像按钮的链接：`<Link className={buttonClasses('secondary', 'sm')}>`
- 每个视图一个主按钮（coral）。其他的是 `secondary`、`mint` 或 `ghost`。
- 页面结构：`<PageHeader title subtitle action />`，然后用 grid 排卡片。
- 图标：只用 `lucide-react`，按钮里 `h-4 w-4`，导航里 `h-5 w-5`。

## 4. 文案语调

- 像友好的学长学姐说话，不是营销文案。短句。
- 说清楚会发生什么："Generate course"、"Save lesson"、"Join class"（不是"Submit"、"Go"）。
- Pip 在欢迎和反馈里可以稍微俏皮；按钮和错误保持平实。
- 错误提示说下一步做什么："Use at least 8 characters."，不是"Invalid input"。
- **禁用词**：unlock、empower、journey、seamless、revolutionize、cutting-edge、"dive in"、"elevate"。按钮里不用 emoji；标题最多一个 emoji（课程 emoji 可以）。

## 5. 做 / 不做

| 做 | 不做 |
|---|---|
| 米黄背景上的描边贴纸卡片 | 紫蓝渐变、毛玻璃、柔和投影 |
| 空状态和成功状态显示 Pip | 通用的库存插画或 emoji 墙 |
| 显示真实数字（XP、排名、%）配进度条 | 没有数据的含糊"Great job!" |
| 用小弹出 / 摇晃动画庆祝 | 每次点击都撒纸屑 |
| 移动优先：375px 宽度能用 | 整页横滚的固定宽度表格 |

## 6. 无障碍基础

- 每个交互元素都能用键盘触达，有可见的焦点环（已内置）。
- 纯图标按钮需要 `aria-label`。图片/SVG 需要 `aria-label` 或 `aria-hidden`。
- 颜色不是唯一信号：配合文本或图标（例如 ✓ / ✗ + 颜色）。
- 文本对比度：浅色背景用 `text-ink`；`text-ink-soft` 只用于次要文本。
- 尊重 `prefers-reduced-motion`（`globals.css` 里已处理）。
