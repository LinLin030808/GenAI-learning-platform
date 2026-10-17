'use client';
// Daily learning events (bars) and XP (line) for a class over the last 14 days.

import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DayPoint } from '../logic';

export function EngagementChart({ data }: { data: DayPoint[] }) {
  const totalEvents = data.reduce((a, d) => a + d.events, 0);
  const totalXp = data.reduce((a, d) => a + d.xp, 0);
  return (
    <figure>
      <div className="h-64 w-full" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" strokeOpacity={0.15} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-ink-soft)' }} interval="preserveStartEnd" />
            <YAxis yAxisId="events" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-ink-soft)' }} />
            <YAxis yAxisId="xp" orientation="right" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-ink-soft)' }} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '2px solid var(--color-line)',
                background: 'var(--color-paper)',
                color: 'var(--color-ink)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar
              yAxisId="events"
              dataKey="events"
              name="Learning events"
              fill="var(--color-mint)"
              stroke="var(--color-line)"
              strokeWidth={2}
              radius={[6, 6, 0, 0]}
            />
            <Line
              yAxisId="xp"
              dataKey="xp"
              name="XP earned"
              type="monotone"
              stroke="var(--color-coral-deep)"
              strokeWidth={3}
              dot={{ r: 3, fill: 'var(--color-butter)', stroke: 'var(--color-line)', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-2 text-sm text-ink-soft">
        Last 14 days: {totalEvents} learning events and {totalXp} XP earned by students in this class.
      </figcaption>
    </figure>
  );
}
