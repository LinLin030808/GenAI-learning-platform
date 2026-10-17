import type { CourseDraft } from '@/core/content/draft';

export const basicsCourse: CourseDraft = {
  title: 'How Software Gets Built',
  summary:
    'Follow a small student team from "we should make an app" to a working release. No coding needed: this is about how the work is organised.',
  subject: 'Software Engineering',
  level: 'beginner',
  audience: 'everyone',
  tags: ['fundamentals', 'sdlc', 'requirements', 'teamwork'],
  emoji: '🛠️',
  color: 'coral',
  lessons: [
    {
      title: 'From idea to app: the life of a feature',
      estimatedMinutes: 10,
      content: `Meet **CampusEats**: four students who want to let classmates pre-order lunch from the canteen so they can skip the queue.

Nobody starts by typing code. Before a single line is written, the team goes through a loop that almost every software project shares:

| Stage | The question it answers | CampusEats example |
|---|---|---|
| Understand | What problem are we solving, and for whom? | The lunch queue takes 20 minutes |
| Plan | What do we build first? | Ordering before payments |
| Design | How will it look and fit together? | Sketch the order screen |
| Build | Make it work | Write the order form and a simple database |
| Test | Does it really work? | Try 30 fake orders at once |
| Release | Get it to real users | Launch for one canteen |
| Learn | What did users actually do? | People want "order again" |

### It is a loop, not a line

After "Learn", the team goes back to "Understand" with new information. Each trip around the loop is short (often one or two weeks). That way, if they are building the wrong thing, they find out early, while it is still cheap to change.

> **Takeaway:** good teams spend a surprising amount of time *before* and *after* coding. That is where most expensive mistakes are caught.`,
      activities: [
        {
          type: 'slides',
          title: 'Pip explains the software loop',
          xpReward: 15,
          config: {
            slides: [
              { heading: 'Software is built in loops', bullets: ['Understand → Plan → Design', 'Build → Test → Release → Learn'], narration: 'Here is the big secret: software is not built in one straight line. Teams go round a loop, again and again.' },
              { heading: 'Why loops?', bullets: ['Find mistakes early', 'Change is cheaper at the start'], narration: 'Fixing a wrong idea on a whiteboard costs minutes. Fixing it after launch can cost months. Short loops catch problems early.' },
              { heading: 'Coding is one stage of seven', bullets: ['Lots of thinking before', 'Lots of checking after'], narration: 'Notice that writing code is only one of the seven stages. The thinking before and the checking after matter just as much.' },
              { heading: 'Your turn', bullets: ['Put the stages in order', 'Think about CampusEats'], narration: 'Now let us see if you can put the stages in the right order. Picture the CampusEats team as you go.' },
            ],
          },
        },
        {
          type: 'sequence',
          title: 'Put the CampusEats journey in order',
          xpReward: 20,
          config: {
            instructions: 'The CampusEats team did these things for their first version. What order did they happen in?',
            steps: [
              'Interview students about the lunch queue',
              'Decide to build ordering before payments',
              'Sketch the order screen on paper',
              'Build the order form and database',
              'Test with 30 fake orders',
              'Launch at one canteen',
              'Notice people want "order again"',
            ],
          },
        },
      ],
    },
    {
      title: 'Requirements: what are we actually building?',
      estimatedMinutes: 12,
      content: `A **requirement** is something the software must do or be. Vague requirements are the number one reason projects go wrong: "make it easy to use" means something different to everyone.

### User stories

Teams often write requirements as short **user stories**:

> As a **student**, I want to **save my usual order** so that **I can reorder in one tap**.

Three parts: *who* wants it, *what* they want, and *why*. The "why" is the part people skip, and it is the most useful: it tells the team what problem they are really solving.

### Acceptance criteria

A story is not finished until everyone agrees how to check it. Acceptance criteria make that concrete:

- Given I have ordered before, when I open the app, I see "Order again"
- Tapping it fills the cart with my last order
- I can still change items before paying

### Functional vs non-functional

- **Functional** requirements are *what the system does*: "students can cancel an order".
- **Non-functional** requirements are *how well it does it*: speed, security, accessibility, cost. "The menu loads in under 2 seconds on mobile data."

Non-functional requirements are easy to forget and painful to add later. Ask about them early.`,
      activities: [
        {
          type: 'sort',
          title: 'Functional or non-functional?',
          xpReward: 20,
          config: {
            instructions: 'Sort these CampusEats requirements.',
            buckets: ['Functional', 'Non-functional'],
            items: [
              { text: 'Students can cancel an order before 11:30', bucket: 'Functional' },
              { text: 'The menu loads in under 2 seconds on 4G', bucket: 'Non-functional' },
              { text: 'Canteen staff see new orders on a tablet', bucket: 'Functional' },
              { text: 'Works with a phone screen reader', bucket: 'Non-functional' },
              { text: 'Students get a notification when food is ready', bucket: 'Functional' },
              { text: 'Card details are never stored on our server', bucket: 'Non-functional' },
              { text: 'Handles 500 orders in the lunch rush', bucket: 'Non-functional' },
              { text: 'Students can save a favourite order', bucket: 'Functional' },
            ],
          },
        },
        {
          type: 'quiz',
          title: 'User story check',
          xpReward: 20,
          config: {
            questions: [
              {
                prompt: 'Which of these is a well-formed user story?',
                options: [
                  'As a canteen manager, I want a daily order summary so that I can prepare the right amount of food.',
                  'Add a summary page.',
                  'The system shall use a PostgreSQL database.',
                  'Make the app faster.',
                ],
                answerIndex: 0,
                explanation: 'It names who (canteen manager), what (daily summary) and why (prepare the right amount).',
              },
              {
                prompt: 'Why is the "so that…" part of a user story useful?',
                options: ['It tells the team the real problem being solved', 'It makes the story longer', 'It is required by law', 'It decides the programming language'],
                answerIndex: 0,
                explanation: 'Knowing the goal lets the team suggest simpler or better solutions.',
              },
              {
                prompt: 'What are acceptance criteria for?',
                options: ['Agreeing how we will check a story is done', 'Estimating the price', 'Choosing who writes the code', 'Naming the database tables'],
                answerIndex: 0,
                explanation: 'They turn "done" into something you can actually test.',
              },
            ],
          },
        },
      ],
    },
    {
      title: 'Talking to your first client',
      estimatedMinutes: 15,
      content: `Clients rarely know exactly what they need. They know what *hurts*. Your job in a requirements conversation is to find the pain behind the request.

### Habits that work

1. **Ask open questions.** "What happens at lunchtime?" gets a story. "Do you want an app?" gets a yes.
2. **Ask why, more than once.** "Why do you want an app?" → "To be modern." → "Why does that matter?" → "Because regulars leave when the queue is long." Now you know the real goal.
3. **Ask about constraints early:** budget, deadline, who will use it, what already exists.
4. **Summarise back.** "So the real problem is the lunch queue, the budget is small and it needs to work before summer. Did I get that right?"
5. **Do not design during the meeting.** Write things down, promise a proposal later.

### Common traps

- Agreeing to features before understanding the problem
- Using jargon ("we'll spin up a backend") that makes the client nod without understanding
- Forgetting to ask who the *users* are, which may not be the client

> In the role-play below, Mrs. Lau will only tell you the useful details if you ask good questions.`,
      activities: [
        {
          type: 'roleplay',
          title: 'Requirements meeting with Mrs. Lau',
          xpReward: 40,
          config: {
            scenario: 'Mrs. Lau runs a busy café near campus. She emailed your team saying "I need an app". You have a short meeting to find out what she really needs.',
            persona: 'Mrs. Lau',
            personaRole: 'Café owner, your first client',
            personaBrief:
              'Busy, a bit impatient, kind underneath. Thinks she needs "an app" because a competitor has one. Real problem: at lunch (12:00-13:30) the queue goes out the door and office workers from the next building leave. Budget is small (around HK$30,000). Wants something before July. Has no interest in technology itself. Only reveals the queue problem, the office workers and the budget when asked open or "why" questions. If the learner talks jargon, she gets confused and a bit annoyed.',
            learnerRole: 'Junior developer from a small student team',
            goals: ['Find the real problem behind "an app"', 'Learn the budget and deadline', 'Summarise what you heard back to her'],
            opening: 'Thanks for coming. So, I need an app. My competitor across the road has one. How quickly can you build it?',
            rubric: [
              { criterion: 'Asks open questions', description: 'Uses what / why / how questions instead of yes/no or jumping to solutions' },
              { criterion: 'Uncovers the real need', description: 'Finds out about the lunch queue and who the customers are' },
              { criterion: 'Checks constraints and summarises', description: 'Asks about budget/deadline and summarises back in plain words' },
            ],
            maxTurns: 7,
            mockReplies: [
              'Well... mostly I see people give up at lunchtime. The queue goes out the door.',
              'Lunch customers? Office workers from the building next door, they only have 45 minutes.',
              'Budget? I am a small café, not a bank. Maybe thirty thousand dollars.',
              'Before July, please. Summer is when it gets really busy.',
              'Honestly, I do not care how it works. I just do not want to lose those customers.',
              'Yes, that is it exactly. You explain it better than I did!',
            ],
          },
        },
      ],
    },
    {
      title: 'Agile in one page: sprints, stand-ups and retros',
      estimatedMinutes: 10,
      content: `Most teams today work in an **agile** way: plan a little, build a little, show it, adjust. The most common recipe is **Scrum**. You only need five words to follow along in any tech team:

- **Backlog** – the to-do list of user stories, most important at the top.
- **Sprint** – a fixed time box (usually 1–2 weeks) where the team commits to a few stories.
- **Sprint planning** – the meeting at the start: "what can we finish this sprint?"
- **Daily stand-up** – 15 minutes each morning: what I did, what I'll do, what is blocking me.
- **Retrospective (retro)** – at the end: what went well, what didn't, what we'll try next time.

There is also a **sprint review**, where the team shows working software to stakeholders and gets feedback.

### A board makes it visible

Teams track work on a board with columns like **To do → In progress → Review → Done**. In our own project, that board lives in GitHub Projects, and every card links to an issue.

> Agile is not about meetings. It is about getting feedback often enough that you never drift far from what people need.`,
      activities: [
        {
          type: 'sort',
          title: 'Which meeting is this?',
          xpReward: 20,
          config: {
            instructions: 'Each line was said in a team meeting. Which meeting?',
            buckets: ['Sprint planning', 'Daily stand-up', 'Retrospective'],
            items: [
              { text: '"We can probably finish these three stories in two weeks."', bucket: 'Sprint planning' },
              { text: '"Yesterday I finished the menu page, today I start on cancel."', bucket: 'Daily stand-up' },
              { text: '"Our PRs were too big this time, let us keep them small."', bucket: 'Retrospective' },
              { text: '"I am blocked: I need the payment API key."', bucket: 'Daily stand-up' },
              { text: '"Payments are too risky for this sprint, push them to the next one."', bucket: 'Sprint planning' },
              { text: '"Pairing on the hard bug really helped, let us do it more."', bucket: 'Retrospective' },
            ],
          },
        },
        {
          type: 'quiz',
          title: 'Agile basics',
          xpReward: 20,
          config: {
            questions: [
              {
                prompt: 'Why are sprints kept short (1–2 weeks)?',
                options: ['To get feedback early and change course cheaply', 'So people can take holidays', 'Because computers need restarting', 'To avoid writing tests'],
                answerIndex: 0,
                explanation: 'Short cycles mean you never build for long in the wrong direction.',
              },
              {
                prompt: 'What belongs at the top of the backlog?',
                options: ['The most important stories', 'The easiest stories', 'The oldest stories', 'Bug reports only'],
                answerIndex: 0,
                explanation: 'The backlog is ordered by value, so the team always works on what matters most.',
              },
            ],
          },
        },
      ],
    },
  ],
};
