'use client';

// Five quick questions from Pip. Answers build the learner profile and recommended path.
import { ChevronLeft } from 'lucide-react';
import { useState, useTransition } from 'react';
import { Button, Card, cn, Notice, PipSays, type PipMood } from '@/components/ui';
import { completeOnboarding } from '../actions';
import { INTEREST_OPTIONS, type OnboardingAnswers } from '../recommend';

type Step =
  | { key: 'background'; question: string; mood: PipMood; options: { value: OnboardingAnswers['background']; label: string; note: string }[] }
  | { key: 'codingLevel'; question: string; mood: PipMood; options: { value: OnboardingAnswers['codingLevel']; label: string; note: string }[] }
  | { key: 'goal'; question: string; mood: PipMood; options: { value: OnboardingAnswers['goal']; label: string; note: string }[] }
  | { key: 'interests'; question: string; mood: PipMood }
  | { key: 'style'; question: string; mood: PipMood; options: { value: OnboardingAnswers['style']; label: string; note: string }[] };

const STEPS: Step[] = [
  {
    key: 'background',
    question: 'Hi! I am Pip. First things first: what are you studying, or what did you study?',
    mood: 'happy',
    options: [
      { value: 'non_cs', label: 'Something outside computing', note: 'Business, design, arts, science…' },
      { value: 'cs_student', label: 'Computer science (still studying)', note: 'Or a related degree' },
      { value: 'cs_graduate', label: 'Computer science (graduated)', note: 'Getting ready for a tech job' },
      { value: 'other', label: 'Something else', note: 'Working, switching careers, curious' },
    ],
  },
  {
    key: 'codingLevel',
    question: 'How much have you coded before? No wrong answers here.',
    mood: 'think',
    options: [
      { value: 0, label: 'Never', note: 'Code looks like magic spells' },
      { value: 1, label: 'A little', note: 'A tutorial or a class or two' },
      { value: 2, label: 'Some projects', note: 'I can build small things' },
      { value: 3, label: 'Regularly', note: 'I code most weeks' },
    ],
  },
  {
    key: 'goal',
    question: 'What would make Sprout worth your time?',
    mood: 'wow',
    options: [
      { value: 'understand', label: 'Understand how software is made', note: 'So I can work with tech teams' },
      { value: 'career', label: 'Get ready for a tech job', note: 'Interviews, teamwork, real workflows' },
      { value: 'build', label: 'Build my own idea', note: 'From idea to something that works' },
      { value: 'ai_skills', label: 'Work better with AI coding tools', note: 'Without letting them drive' },
    ],
  },
  { key: 'interests', question: 'Anything that sounds fun? Pick up to three.', mood: 'cheer' },
  {
    key: 'style',
    question: 'Last one. How do you like to learn?',
    mood: 'happy',
    options: [
      { value: 'concepts', label: 'Big picture first', note: 'Explain the idea, then let me try' },
      { value: 'hands_on', label: 'Let me poke at it', note: 'Give me something to do straight away' },
    ],
  },
];

export function OnboardingFlow({ name }: { name: string }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({ interests: [] });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const current = STEPS[step]!;
  const first = name.split(' ')[0];

  function choose(key: keyof OnboardingAnswers, value: unknown) {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish(next);
  }

  function toggleInterest(id: string) {
    const list = answers.interests ?? [];
    setAnswers({ ...answers, interests: list.includes(id) ? list.filter((i) => i !== id) : list.length < 3 ? [...list, id] : list });
  }

  function finish(final: Partial<OnboardingAnswers>) {
    setError(null);
    startTransition(async () => {
      try {
        await completeOnboarding(final as OnboardingAnswers);
      } catch (err) {
        // redirect() surfaces as an error with a NEXT_REDIRECT digest; Next handles it, so ignore it
        const digest = err && typeof err === 'object' && 'digest' in err ? String(err.digest) : '';
        if (!digest.startsWith('NEXT_REDIRECT')) setError('Something went wrong saving your answers. Try once more?');
      }
    });
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 py-6">
      <div className="flex items-center gap-2" aria-label={`Question ${step + 1} of ${STEPS.length}`}>
        {STEPS.map((s, i) => (
          <span key={s.key} className={cn('h-3 flex-1 rounded-pill border-2 border-line', i < step ? 'bg-mint' : i === step ? 'bg-butter' : 'bg-paper')} />
        ))}
      </div>

      <PipSays mood={pending ? 'think' : current.mood} size={96} className="animate-pop" key={current.key}>
        <p className="font-display text-xl font-bold">{step === 0 ? current.question.replace('Hi!', `Hi ${first}!`) : current.question}</p>
      </PipSays>

      <Card className="p-5">
        {pending ? (
          <p className="py-8 text-center font-display text-lg font-semibold">Pip is planting your path…</p>
        ) : current.key === 'interests' ? (
          <div className="flex flex-col gap-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {INTEREST_OPTIONS.map((o) => {
                const on = answers.interests?.includes(o.id);
                return (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleInterest(o.id)}
                    className={cn('rounded-xl border-2 border-line px-4 py-3 text-left font-display font-semibold transition', on ? 'bg-butter shadow-sticker-sm' : 'bg-paper hover:bg-butter-soft')}
                  >
                    {on ? '✓ ' : ''}
                    {o.label}
                  </button>
                );
              })}
            </div>
            <Button className="self-end" onClick={() => setStep(step + 1)}>
              {answers.interests?.length ? 'Next' : 'Skip for now'}
            </Button>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {current.options.map((o) => (
              <button
                key={String(o.value)}
                type="button"
                onClick={() => choose(current.key, o.value)}
                className={cn(
                  'flex flex-col rounded-xl border-2 border-line bg-paper px-4 py-3 text-left transition hover:-translate-y-0.5 hover:bg-butter-soft hover:shadow-sticker-sm',
                  answers[current.key] === o.value && 'bg-butter-soft',
                )}
              >
                <span className="font-display font-semibold">{o.label}</span>
                <span className="text-sm text-ink-soft">{o.note}</span>
              </button>
            ))}
          </div>
        )}
        {error ? <Notice tone="error" className="mt-4">{error}</Notice> : null}
      </Card>

      {step > 0 && !pending ? (
        <Button variant="ghost" className="self-start" onClick={() => setStep(step - 1)}>
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
      ) : null}
    </div>
  );
}
