import type { CourseDraft } from '@/core/content/draft';

export const agentsCourse: CourseDraft = {
  title: 'Working with AI Coding Agents',
  summary:
    'Agents can write a lot of code quickly. Learn what to hand them, how to brief them, and how to check their work so you stay in charge.',
  subject: 'Software Engineering',
  level: 'intermediate',
  audience: 'everyone',
  tags: ['ai-agents', 'prompting', 'code-review', 'ai-fluency'],
  emoji: '🤖',
  color: 'lilac',
  lessons: [
    {
      title: 'What a coding agent actually does',
      estimatedMinutes: 10,
      content: `A chatbot answers questions. A **coding agent** takes actions: it reads your project files, makes a plan, edits code, runs commands and tests, looks at the result, and tries again.

\`\`\`
read files → plan → edit → run tests → read the errors → edit again → …
\`\`\`

That loop is what makes agents powerful, and also what makes them risky. An agent can change twenty files in a minute. If the plan was wrong, all twenty changes are wrong.

### What agents are good at

- Boilerplate: forms, CRUD pages, config, repetitive tests
- Explaining unfamiliar code
- Following a clear pattern that already exists in the project
- Trying many small fixes quickly

### Where they slip

- Guessing when the task is vague (they rarely ask)
- Inventing functions or library options that do not exist
- Quietly changing behaviour you did not ask them to touch
- Saying "all tests pass" when the tests do not check the right thing

> The agent is a very fast junior teammate with no memory of your meeting yesterday. Brief it like one, and review its work like one.`,
      activities: [
        {
          type: 'quiz',
          title: 'Agent or chatbot?',
          xpReward: 20,
          config: {
            questions: [
              {
                prompt: 'What makes a coding agent different from a regular chatbot?',
                options: ['It can read files, run commands and act on the results in a loop', 'It always writes correct code', 'It is only for Python', 'It does not need instructions'],
                answerIndex: 0,
                explanation: 'Agents act in your environment: read, edit, run, check, repeat.',
              },
              {
                prompt: 'An agent reports "All tests pass ✅". What should you do?',
                options: ['Check what the tests actually test, and run them yourself', 'Merge immediately', 'Delete the tests', 'Ask the agent if it is sure'],
                answerIndex: 0,
                explanation: 'Passing tests only mean something if they check the behaviour you care about.',
              },
              {
                prompt: 'Which task is the best fit for an agent?',
                options: [
                  'Add a form that follows the same pattern as three existing forms',
                  'Decide which features the client should pay for',
                  'Choose whether to store students\' ID numbers',
                  'Apologise to a client for a missed deadline',
                ],
                answerIndex: 0,
                explanation: 'Clear patterns are where agents shine. Judgement calls about people, money and ethics stay with humans.',
              },
            ],
          },
        },
      ],
    },
    {
      title: 'Delegation: what to hand over, what to keep',
      estimatedMinutes: 10,
      content: `Anthropic's **AI Fluency** framework describes four skills for working with AI. We use it throughout this course:

| Skill | Question to ask yourself |
|---|---|
| **Delegation** | Should AI do this at all? Which part? |
| **Description** | Did I explain the goal, context and limits clearly? |
| **Discernment** | Is the output actually right? How do I know? |
| **Diligence** | Did I verify it, and am I willing to put my name on it? |

This lesson is about the first D. A useful rule of thumb:

- **Hand over** work that is well-defined, easy to check, and low-risk if wrong.
- **Keep** work that needs judgement about people, ethics, money, privacy, or the product's direction, and anything you cannot check yourself.

Many tasks are *split*: let the agent draft, you decide. "Draft three options for the error message" is great delegation. "Decide what we tell users when their data leaked" is not.`,
      activities: [
        {
          type: 'sort',
          title: 'Delegate or keep?',
          xpReward: 25,
          config: {
            instructions: 'Your team is building a student club sign-up app. For each task: hand it to the agent, or keep it human?',
            buckets: ['Give to the agent', 'Keep it human'],
            items: [
              { text: 'Write unit tests for the date-formatting helper', bucket: 'Give to the agent' },
              { text: 'Decide whether to collect students\' phone numbers', bucket: 'Keep it human' },
              { text: 'Rename a variable in 40 files', bucket: 'Give to the agent' },
              { text: 'Choose which feature to cut to hit the deadline', bucket: 'Keep it human' },
              { text: 'Draft a regex that validates student emails', bucket: 'Give to the agent' },
              { text: 'Approve merging the pull request into main', bucket: 'Keep it human' },
              { text: 'Explain an unfamiliar file you inherited', bucket: 'Give to the agent' },
              { text: 'Reply to a club leader who is upset about a bug', bucket: 'Keep it human' },
            ],
          },
        },
      ],
    },
    {
      title: 'Description: briefing an agent properly',
      estimatedMinutes: 12,
      content: `Most bad agent output comes from a bad brief. Compare:

> ❌ "Add login."

> ✅ **Context:** Next.js app, auth helpers are in \`src/core/auth/\`. **Goal:** add a login page at \`/login\` using the existing \`login\` server action. **Constraints:** use components from \`@/components/ui\`, no new packages, do not touch other pages. **Example:** copy the layout of the signup page. **Done when:** a demo user can log in and lands on \`/home\`; wrong passwords show an inline error.

A simple template: **C-G-C-E-D**

- **Context** – where things are, what already exists
- **Goal** – the outcome, not just the action
- **Constraints** – what not to do, which files are off limits
- **Examples** – a pattern to copy
- **Done when** – how you will check it

### Ask for a plan first

For anything bigger than a small fix, ask the agent to *propose a plan before editing*. Reading a 6-line plan is much faster than reading a 600-line diff, and it is the cheapest moment to catch a misunderstanding.`,
      activities: [
        {
          type: 'quiz',
          title: 'Spot the better brief',
          xpReward: 20,
          config: {
            questions: [
              {
                prompt: 'Which brief will most likely get a good result?',
                options: [
                  '"Make the leaderboard better."',
                  '"Add a weekly tab to the leaderboard in src/modules/leaderboard. Reuse rankEntries(). Only edit that module. Done when the tab shows last-7-days XP and has a test."',
                  '"Fix everything in the leaderboard, you know what I mean."',
                  '"Leaderboard. Weekly. Go."',
                ],
                answerIndex: 1,
                explanation: 'It has context, a goal, a constraint and a "done when" you can check.',
              },
              {
                prompt: 'Why ask the agent for a plan before it edits code?',
                options: ['A short plan is the cheapest place to catch a misunderstanding', 'Agents cannot code without one', 'It makes the code run faster', 'Plans are required by Git'],
                answerIndex: 0,
                explanation: 'Fixing a plan takes seconds; untangling a wrong 20-file change takes much longer.',
              },
            ],
          },
        },
        {
          type: 'sequence',
          title: 'A good agent workflow',
          xpReward: 20,
          config: {
            instructions: 'Put the steps of a careful agent-assisted change in order.',
            steps: [
              'Write the brief: context, goal, constraints, done-when',
              'Ask the agent for a plan',
              'Correct the plan, then let it implement',
              'Run the tests and try the feature yourself',
              'Read the full diff line by line',
              'Commit with a clear message and open a PR',
            ],
          },
        },
      ],
    },
    {
      title: 'Discernment & diligence: review the agent\'s code',
      estimatedMinutes: 15,
      content: `The last two Ds are where you earn your place on the team. An agent's code often *looks* right. Your job is to find out if it *is* right.

### A review checklist

1. **Does it do what the brief said, and nothing else?** Look for files that changed but should not have.
2. **Edge cases:** empty input, zero, negative numbers, the exact boundary ("over 50" vs "50 or more").
3. **Names and units:** is \`total\` in dollars or cents? Is the code case-sensitive?
4. **Invented things:** functions, options or APIs that do not actually exist.
5. **Tests:** do they test the real rule, or just that the code runs?

### Diligence means owning it

If it ships under your name, it is your code. In this project we write in every PR which parts the AI generated and what we changed. That is not a confession, it is a professional habit (and great material for a reflection).

> In the exercise below, an agent wrote a discount function. The tests caught some problems. Find and fix them.`,
      activities: [
        {
          type: 'coding',
          title: 'Fix the agent\'s discount bug',
          xpReward: 40,
          config: {
            instructions: `The brief was: **"\`applyDiscount(total, code)\` returns the price after discount. \`SAVE10\` gives 10% off orders of **$50 or more**. \`HALF\` gives 50% off any order. Codes are **not** case-sensitive. Unknown codes change nothing. Round to 2 decimal places."**

The agent's version below fails some tests. Run them, read the failures, and fix the code.`,
            starterCode: `// Written by an AI agent. Looks fine... right?
function applyDiscount(total, code) {
  if (code === 'SAVE10' && total > 50) {
    return total * 0.9;
  }
  if (code === 'HALF') {
    return total * 0.5;
  }
  return total;
}
`,
            functionName: 'applyDiscount',
            tests: [
              { args: [100, 'SAVE10'], expected: 90, label: 'SAVE10 on $100' },
              { args: [50, 'SAVE10'], expected: 45, label: 'SAVE10 exactly at $50' },
              { args: [49.99, 'SAVE10'], expected: 49.99, label: 'SAVE10 below $50' },
              { args: [30, 'half'], expected: 15, label: 'lower-case code' },
              { args: [33.33, 'HALF'], expected: 16.67, label: 'rounding to cents' },
              { args: [64.99, 'SAVE10'], expected: 58.49, label: 'rounding with SAVE10' },
              { args: [20, 'FREE'], expected: 20, label: 'unknown code' },
            ],
            hintContext:
              'There are three problems: the $50 boundary uses > instead of >=, codes are compared case-sensitively, and the result is not rounded to 2 decimals (Math.round(x * 100) / 100).',
          },
        },
        {
          type: 'quiz',
          title: 'Reviewing like a pro',
          xpReward: 15,
          config: {
            questions: [
              {
                prompt: 'The brief said "orders of $50 or more". The code says `total > 50`. What kind of bug is this?',
                options: ['A boundary (off-by-one) bug', 'A security bug', 'A styling bug', 'Not a bug'],
                answerIndex: 0,
                explanation: 'The exact boundary value ($50) behaves wrongly. These are very common in AI-written code.',
              },
              {
                prompt: 'Which habit best shows *diligence*?',
                options: ['Noting in the PR what the AI wrote and what you verified', 'Hiding that you used AI', 'Letting the agent merge its own PR', 'Skipping review when tests pass'],
                answerIndex: 0,
                explanation: 'Diligence is verifying, documenting and taking responsibility for the result.',
              },
            ],
          },
        },
      ],
    },
  ],
};
