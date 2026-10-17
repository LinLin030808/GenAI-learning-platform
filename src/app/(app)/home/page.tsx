import { requireUser } from '@/core/auth/session';
import { getUserStats } from '@/core/progress/service';
import { growthStage } from '@/core/progress/xp';
import { cn, PipSays } from '@/components/ui';
import { homeWidgetsFor } from '@/registry/modules';

function greeting(name: string, hour: number) {
  const first = name.split(' ')[0];
  if (hour < 5) return `Still up, ${first}? Pip is too.`;
  if (hour < 12) return `Morning, ${first}! Fresh brain, good time to learn.`;
  if (hour < 18) return `Hey ${first}, ready for a quick lesson?`;
  return `Evening, ${first}. One small step before bed?`;
}

export default async function HomePage() {
  const user = await requireUser();
  const [stats, widgets] = [await getUserStats(user.id), homeWidgetsFor(user.role)];
  const hour = new Date().getHours();

  return (
    <div className="flex flex-col gap-6">
      <PipSays mood="happy" stage={growthStage(stats.level.level)} size={84}>
        <p className="font-display text-xl font-bold">{greeting(user.name, hour)}</p>
        {user.role === 'learner' ? (
          <p className="text-sm text-ink-soft">
            You are a <strong>{stats.level.name}</strong> with {stats.totalXp} XP
            {stats.streak > 0 ? ` and a ${stats.streak}-day streak` : ''}.
          </p>
        ) : (
          <p className="text-sm text-ink-soft">Here is what is happening on Sprout today.</p>
        )}
      </PipSays>

      <div className="grid gap-6 lg:grid-cols-2">
        {widgets.map(({ id, component: Widget, size }) => (
          <section key={id} className={cn(size === 'full' && 'lg:col-span-2')}>
            <Widget user={user} />
          </section>
        ))}
      </div>
    </div>
  );
}
