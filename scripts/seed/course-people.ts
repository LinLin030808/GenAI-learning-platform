import type { CourseDraft } from '@/core/content/draft';

export const peopleCourse: CourseDraft = {
  title: 'People Skills for Tech Teams',
  summary:
    'The parts of software work that are not code: explaining things clearly, giving useful feedback, and telling your story in an interview.',
  subject: 'Soft & Product Skills',
  level: 'beginner',
  audience: 'everyone',
  tags: ['communication', 'teamwork', 'interview', 'soft-skills', 'product'],
  emoji: '🤝',
  color: 'mint',
  lessons: [
    {
      title: 'Explaining tech to non-tech people',
      estimatedMinutes: 10,
      content: `Sooner or later you will need to explain a technical problem to someone who does not care about the technology: a client, a manager, a user. They care about **what it means for them**.

### Three moves

1. **Lead with the impact.** "Orders placed after 11:30 are not reaching the kitchen" beats "the webhook queue is backing up".
2. **Use an analogy from their world.** A database index is like the index at the back of a book; caching is like keeping the popular dishes pre-made.
3. **End with a decision or next step.** "We can fix it today with a workaround, or properly by Friday. Which do you prefer?"

### Jargon translator

| Instead of… | Try… |
|---|---|
| "We need to refactor the backend" | "We need to tidy up some code so future changes are faster and safer" |
| "There's a race condition" | "Two things happen at the same moment and sometimes trip over each other" |
| "It's deployed to staging" | "It's on our test version of the site, not live yet" |

> If they ask a follow-up question, that is a good sign. If they nod politely and change the subject, you lost them.`,
      activities: [
        {
          type: 'sort',
          title: 'Clear or confusing?',
          xpReward: 20,
          config: {
            instructions: 'You are updating a café owner (not technical). Which messages would she understand?',
            buckets: ['Clear for her', 'Too much jargon'],
            items: [
              { text: '"Some orders after 11:30 aren\'t reaching the kitchen. We\'ll fix it by tonight."', bucket: 'Clear for her' },
              { text: '"The webhook retries are exhausting the queue."', bucket: 'Too much jargon' },
              { text: '"The new menu is on our test site. Want to try it before it goes live?"', bucket: 'Clear for her' },
              { text: '"We pushed v2 to staging behind a feature flag."', bucket: 'Too much jargon' },
              { text: '"Card payments are safe: we never see or store the card number."', bucket: 'Clear for her' },
              { text: '"We\'re PCI-compliant via tokenisation."', bucket: 'Too much jargon' },
            ],
          },
        },
      ],
    },
    {
      title: 'Code review without the drama',
      estimatedMinutes: 10,
      content: `Code review is where teams catch bugs and share knowledge. It is also where feelings get hurt. Good reviewers are **specific, kind and focused on the code, not the person**.

### Writing useful comments

- **Be specific:** point at the line and say what could go wrong. "If \`items\` is empty, line 12 divides by zero."
- **Explain why:** "Could we name this \`totalCents\`? I wasn't sure if it was dollars."
- **Suggest, don't command:** "What do you think about…" invites discussion.
- **Separate must-fix from nice-to-have:** prefix small things with "nit:".
- **Say what is good,** too. "Nice test for the empty case!"

### Receiving feedback

Assume good intent, ask questions when unclear, and remember: comments on your code are not comments on you. On an AI-assisted team, many comments will be about code an agent wrote. Reviewing it together is the point.`,
      activities: [
        {
          type: 'sort',
          title: 'Helpful or unhelpful review comment?',
          xpReward: 20,
          config: {
            instructions: 'Sort these real-looking review comments.',
            buckets: ['Helpful', 'Unhelpful'],
            items: [
              { text: '"If the cart is empty, line 12 divides by zero. Maybe return 0 early?"', bucket: 'Helpful' },
              { text: '"This is wrong."', bucket: 'Unhelpful' },
              { text: '"nit: could we call this totalCents so the unit is clear?"', bucket: 'Helpful' },
              { text: '"Why would anyone write it like this?"', bucket: 'Unhelpful' },
              { text: '"Nice test for the boundary case. Could we add one for negative numbers?"', bucket: 'Helpful' },
              { text: '"Just rewrite the whole thing."', bucket: 'Unhelpful' },
            ],
          },
        },
        {
          type: 'quiz',
          title: 'Review etiquette',
          xpReward: 15,
          config: {
            questions: [
              {
                prompt: 'A teammate\'s PR has one real bug and five tiny style issues. What is the best review?',
                options: [
                  'Flag the bug clearly as must-fix, mark the style points as "nit:"',
                  'Reject the PR without comments',
                  'Fix everything yourself silently',
                  'Only mention the style issues',
                ],
                answerIndex: 0,
                explanation: 'Make priorities obvious so the author knows what actually blocks the merge.',
              },
            ],
          },
        },
      ],
    },
    {
      title: 'Telling your story: the STAR method',
      estimatedMinutes: 15,
      content: `Behavioural interview questions ("Tell me about a time you…") are not trick questions. The interviewer wants evidence of how you work. The **STAR** structure keeps your answer clear and short:

| | What to say | Example |
|---|---|---|
| **S**ituation | Where and when, in one sentence | "In my software engineering course, our team had four weeks to build a learning app." |
| **T**ask | What *you* were responsible for | "I owned the leaderboard and our coding standards." |
| **A**ction | What *you* did, with specifics | "I wrote shared rules so everyone's AI agent produced compatible code, and reviewed every PR touching shared files." |
| **R**esult | What happened, ideally with a number | "We merged three prototypes in one day, with zero broken builds." |

### Tips

- Say **"I"**, not only "we". The interviewer is hiring you.
- Keep it under two minutes. Practise out loud.
- Have 3–4 stories ready (a conflict, a mistake, a success, a time you learned fast) and adapt them.
- It is fine to talk about AI tools. Explain how *you* directed and checked them.`,
      activities: [
        {
          type: 'sequence',
          title: 'Build a STAR answer',
          xpReward: 20,
          config: {
            instructions: 'Put these sentences in STAR order to make a strong answer.',
            steps: [
              'Last semester our team project was two weeks behind schedule.',
              'As the team lead, I had to get us back on track without burning people out.',
              'I split the remaining work into small tasks and set up a 10-minute daily check-in.',
              'We delivered on time, and our final demo got the top grade in the class.',
            ],
          },
        },
        {
          type: 'roleplay',
          title: 'Mock interview with Jordan',
          xpReward: 45,
          config: {
            scenario: 'You are interviewing for a junior software engineer internship at a mid-size tech company. Jordan, an engineering manager, runs the behavioural part of the interview.',
            persona: 'Jordan',
            personaRole: 'Engineering manager interviewing you for an internship',
            personaBrief:
              'Friendly, professional, curious. Asks one behavioural question at a time: first "Tell me about a time you worked in a team that disagreed", then follows up on vague parts ("What did YOU do specifically?", "What was the result?"), then asks "How do you use AI tools in your work, and how do you check what they produce?". Rewards specific, structured answers. Never gives feedback during the interview.',
            learnerRole: 'Internship candidate',
            goals: ['Answer with a clear STAR structure', 'Talk about what YOU did, with specifics', 'Explain how you check AI-generated work'],
            opening: 'Thanks for joining today. To start, tell me about a time you worked in a team where people disagreed. What happened?',
            rubric: [
              { criterion: 'Structure (STAR)', description: 'Situation, task, action and result are all there and easy to follow' },
              { criterion: 'Specific personal actions', description: 'Uses "I", concrete steps, not just "we did stuff"' },
              { criterion: 'Results and reflection', description: 'Gives an outcome and what was learned' },
            ],
            maxTurns: 6,
            mockReplies: [
              'Interesting. What did you personally do to resolve it?',
              'And what was the outcome? How did you know it worked?',
              'Thanks. Next question: how do you use AI tools in your work, and how do you check what they produce?',
              'Can you give me a concrete example of catching a mistake an AI made?',
              'Great. Last one: what would you do differently next time?',
              'Thanks, that is all from me. Do you have any questions for us?',
            ],
          },
        },
      ],
    },
    {
      title: 'Working on a team that uses AI',
      estimatedMinutes: 8,
      content: `When everyone has an AI assistant, teamwork changes. Three people with three agents can produce three different styles of code in an afternoon. A few team habits keep things sane:

- **Agree on shared rules once** (stack, naming, folder structure) and give them to every agent. Our project keeps them in \`AGENTS.md\`.
- **Be open about AI use.** In each pull request, note what the AI wrote and what you checked. It makes reviews faster and builds trust.
- **Share good prompts.** If a brief worked well, paste it in the team chat. Prompts are team knowledge now.
- **Review each other's AI output.** A second pair of eyes catches what your agent and you both missed.
- **Own the result.** "The AI did it" is never an answer in a retro.

> Ask yourself after each task: which of the 4Ds did I use? Which did I skip?`,
      activities: [
        {
          type: 'quiz',
          title: 'Team habits check',
          xpReward: 15,
          config: {
            questions: [
              {
                prompt: 'Three teammates use different AI agents and the code styles clash. What is the best fix?',
                options: [
                  'Agree on shared rules (stack, naming, structure) and give the same rules file to every agent',
                  'Everyone switches to the same agent',
                  'Ban AI tools',
                  'Let the last person to commit decide',
                ],
                answerIndex: 0,
                explanation: 'Shared, written rules work with any tool and also help new teammates.',
              },
              {
                prompt: 'Your AI-written feature broke production. In the retro, you say…',
                options: [
                  '"I merged it without testing the edge case. Next time I will add a test first."',
                  '"The AI did it."',
                  '"Nobody told me to test it."',
                  '"It worked on my machine."',
                ],
                answerIndex: 0,
                explanation: 'Diligence means owning the result and improving the process.',
              },
            ],
          },
        },
      ],
    },
  ],
};
