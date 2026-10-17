# UI Guidelines

> Chinese version: [UI_GUIDELINES.zh-CN.md](UI_GUIDELINES.zh-CN.md).
> Goal from the 10.17 meeting: **cute and friendly, clearly not a template, no "AI smell"**.

## 1. The look: "sticker book"

Everything looks like a thick-outlined sticker on cream paper.

- **Cream dotted background**, white "paper" cards.
- **2px dark outline** (`border-2 border-line`) on cards, buttons, inputs, badges.
- **Solid offset shadow** instead of blur (`shadow-sticker`, `-sm`, `-lg`). Buttons lift on hover and
  press down on click.
- **Big rounded corners**: cards `rounded-blob`, buttons/badges `rounded-pill`, inputs `rounded-xl`.
- **Rounded type**: Fredoka for headings (`font-display`), Nunito for body text.
- **Pip the sprout** (our own mascot, `<Pip />`) appears in greetings, empty states, feedback and
  the tutor. Pip grows leaves as the learner levels up (`stage` 0-4) and has moods
  (`happy`, `cheer`, `think`, `sleepy`, `wow`).

## 2. Colour tokens

Use the Tailwind classes, never hex values. Defined in `src/app/globals.css`.

| Token | Use for | Classes |
|---|---|---|
| `cream` | page background | `bg-cream` |
| `paper` | cards, inputs | `bg-paper` |
| `ink` / `ink-soft` | text / secondary text | `text-ink`, `text-ink-soft` |
| `line` | outlines and shadows | `border-line` |
| `coral` (+`-soft`, `-deep`) | primary action, streaks, errors | `bg-coral`, `bg-coral-soft` |
| `mint` (+`-soft`, `-deep`) | success, progress, Pip | `bg-mint` |
| `butter` (+`-soft`) | XP, highlights, active nav | `bg-butter` |
| `sky` (+`-soft`) | info, focus ring, instructor areas | `bg-sky` |
| `lilac` (+`-soft`) | AI features, role-play | `bg-lilac` |

Each course has a `color` (`coral | mint | butter | sky | lilac`). Turn it into card tints with
`asTint(course.color)` and `TINT_BG` / `TINT_SOLID`.

## 3. Components (use these, do not re-style your own)

`import { Button, buttonClasses, Card, CardHeader, CardBody, Badge, Field, Input, Textarea, Select,
Notice, ProgressBar, Stat, PageHeader, EmptyState, Markdown, Pip, PipSays, Avatar } from '@/components/ui'`

- `SubmitButton` (client): `import { SubmitButton } from '@/components/ui/submit-button'`
- Links that look like buttons: `<Link className={buttonClasses('secondary', 'sm')}>`
- One primary (coral) button per view. Others are `secondary`, `mint` or `ghost`.
- Page structure: `<PageHeader title subtitle action />`, then cards in a grid.
- Icons: `lucide-react` only, `h-4 w-4` in buttons, `h-5 w-5` in nav.

## 4. Copy tone

- Talk like a friendly senior student, not a marketing page. Short sentences.
- Say what happens: "Generate course", "Save lesson", "Join class" (not "Submit", "Go").
- Pip can be a little playful in greetings and feedback; buttons and errors stay plain.
- Errors say what to do next: "Use at least 8 characters." not "Invalid input".
- **Banned words**: unlock, empower, journey, seamless, revolutionize, cutting-edge, "dive in",
  "elevate". No emoji in buttons; at most one emoji per heading (course emoji is fine).

## 5. Do / Don't

| Do | Don't |
|---|---|
| Outlined sticker cards on cream | Purple-blue gradients, glassmorphism, soft drop shadows |
| Show Pip in empty and success states | Generic stock illustrations or emoji walls |
| Show real numbers (XP, rank, %) with progress bars | Vague "Great job!" with no data |
| Celebrate with a small pop / wiggle animation | Confetti on every click |
| Mobile first: everything works at 375px wide | Fixed-width tables that scroll the whole page |

## 6. Accessibility basics

- Every interactive element is reachable by keyboard and has a visible focus ring (built in).
- Icon-only buttons need `aria-label`. Images/SVGs need `aria-label` or `aria-hidden`.
- Colour is never the only signal: pair it with text or an icon (e.g. ✓ / ✗ + colour).
- Text contrast: use `text-ink` on light backgrounds; `text-ink-soft` only for secondary text.
- Respect `prefers-reduced-motion` (already handled in `globals.css`).
