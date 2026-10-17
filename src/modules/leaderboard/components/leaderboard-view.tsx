import Link from 'next/link';
import { EyeOff } from 'lucide-react';
import type { SessionUser } from '@/core/types';
import { Button, Card, cn, EmptyState, Notice, PageHeader } from '@/components/ui';
import { setClassBoard } from '../actions';
import { getBoard, getCourseRace, getPrefs, getRaceCourses, getScopes, PERIODS, type Period } from '../queries';
import { ChaseCard, Highlights, Podium, RaceTrack, RankRow } from './board-parts';
import { LiveRefresh } from './live-refresh';
import { PrivacyForm } from './privacy-form';

interface Params {
  scope?: string;
  period?: string;
  view?: string;
  course?: string;
}

function chip(active: boolean) {
  return cn(
    'rounded-pill border-2 border-line px-3 py-1 text-sm font-semibold whitespace-nowrap',
    active ? 'bg-butter shadow-sticker-sm' : 'bg-paper hover:bg-butter-soft',
  );
}

export async function LeaderboardView({ user, params }: { user: SessionUser; params: Params }) {
  const scopes = await getScopes(user);
  const scope = scopes.find((s) => s.id === params.scope) ?? scopes[0]!;
  const period: Period = PERIODS.some((p) => p.id === params.period) ? (params.period as Period) : 'week';
  const view = params.view === 'race' ? 'race' : 'xp';
  const href = (patch: Partial<Params>) => {
    const q = new URLSearchParams({ scope: scope.id, period, view, ...(params.course ? { course: params.course } : {}), ...patch } as Record<string, string>);
    return `/leaderboard?${q.toString()}`;
  };
  const hiddenForLearner = scope.isClass && !scope.enabled && user.role === 'learner';

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Leaderboard"
        subtitle="Everyone's progress, out in the open. XP comes from activities, finished lessons and finished courses."
        action={<LiveRefresh />}
      />

      <div className="flex flex-col gap-3">
        <nav aria-label="Who to compare with" className="flex gap-2 overflow-x-auto pb-1">
          {scopes.map((s) => (
            <Link key={s.id} href={`/leaderboard?scope=${s.id}&period=${period}&view=${view}`} className={chip(s.id === scope.id)} aria-current={s.id === scope.id ? 'page' : undefined}>
              {s.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap gap-2">
          <Link href={href({ view: 'xp' })} className={chip(view === 'xp')}>
            XP ranking
          </Link>
          <Link href={href({ view: 'race' })} className={chip(view === 'race')}>
            Course race
          </Link>
          {view === 'xp' ? (
            <span className="ml-auto flex gap-2">
              {PERIODS.map((p) => (
                <Link key={p.id} href={href({ period: p.id })} className={chip(p.id === period)}>
                  {p.label}
                </Link>
              ))}
            </span>
          ) : null}
        </div>
      </div>

      {scope.canManage ? (
        <Card tint="sky" className="flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm">
            <strong>Instructor setting:</strong> the board for {scope.label} is {scope.enabled ? 'visible to students' : 'hidden from students'}.
          </p>
          <form action={setClassBoard}>
            <input type="hidden" name="classId" value={scope.id} />
            <input type="hidden" name="enabled" value={String(!scope.enabled)} />
            <Button type="submit" size="sm" variant="secondary">
              {scope.enabled ? 'Hide from students' : 'Show to students'}
            </Button>
          </form>
        </Card>
      ) : null}

      {hiddenForLearner ? (
        <EmptyState title="Your teacher has paused this board" mood="sleepy">
          You can still see the “Everyone” board, and your own progress is on the home page.
        </EmptyState>
      ) : view === 'xp' ? (
        <XpBoard user={user} scope={scope} period={period} />
      ) : (
        <Race user={user} scope={scope} courseId={params.course} hrefFor={(course) => href({ course })} />
      )}

      {user.role === 'learner' ? <Privacy userId={user.id} /> : null}
    </div>
  );
}

async function XpBoard({ user, scope, period }: { user: SessionUser; scope: Awaited<ReturnType<typeof getScopes>>[number]; period: Period }) {
  const board = await getBoard(user, scope, period);
  const periodLabel = PERIODS.find((p) => p.id === period)!.label;
  if (!board.entries.length) {
    return <EmptyState title="No one on this board yet">Finish an activity to put yourself on the map.</EmptyState>;
  }
  const maxXp = board.entries[0]?.xp ?? 0;
  const rest = board.entries.slice(3);
  return (
    <div className="flex flex-col gap-5">
      {board.chase && user.role === 'learner' ? <ChaseCard chase={board.chase} periodLabel={`Your rank · ${periodLabel.toLowerCase()} · ${scope.label}`} /> : null}
      <Card className="px-3 pb-4 sm:px-6">
        <Podium entries={board.entries} />
        <div className="h-0.5 rounded bg-line" />
        {rest.length ? (
          <ol className="mt-4 flex flex-col gap-1.5" aria-label="Rankings">
            {rest.map((e) => (
              <RankRow key={e.userId} e={e} maxXp={maxXp} />
            ))}
          </ol>
        ) : null}
      </Card>
      <Highlights highlights={board.highlights} />
      {board.me === null && user.role === 'learner' ? (
        <Notice>
          <EyeOff className="mr-1 inline h-4 w-4" /> You are hidden from other people. Change it below.
        </Notice>
      ) : null}
    </div>
  );
}

async function Race({
  user,
  scope,
  courseId,
  hrefFor,
}: {
  user: SessionUser;
  scope: Awaited<ReturnType<typeof getScopes>>[number];
  courseId?: string;
  hrefFor: (courseId: string) => string;
}) {
  const options = await getRaceCourses(scope);
  if (!options.length) return <EmptyState title="No courses to race on yet">Once a class has courses assigned, the race starts here.</EmptyState>;
  const current = options.find((o) => o.id === courseId) ?? options[0]!;
  const race = await getCourseRace(user, scope, current.id);
  return (
    <div className="flex flex-col gap-4">
      <nav aria-label="Pick a course" className="flex gap-2 overflow-x-auto pb-1">
        {options.map((o) => (
          <Link key={o.id} href={hrefFor(o.id)} className={chip(o.id === current.id)}>
            {o.emoji} {o.title}
          </Link>
        ))}
      </nav>
      <Card className="p-4 sm:p-6">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-xl font-bold">
            {current.emoji} {current.title}
          </h2>
          <span className="text-sm text-ink-soft">{race.lanes.length} racing</span>
        </div>
        {race.lanes.length ? (
          <RaceTrack total={race.total} lanes={race.lanes} />
        ) : (
          <EmptyState title="Nobody has started this one">Be the first on the track.</EmptyState>
        )}
      </Card>
    </div>
  );
}

async function Privacy({ userId }: { userId: string }) {
  const prefs = await getPrefs(userId);
  return <PrivacyForm displayMode={prefs.displayMode} nickname={prefs.nickname} />;
}
