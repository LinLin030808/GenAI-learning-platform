// /admin/ai-usage: how much AI the platform uses, per feature, and how much ran in demo mode.
import { Bot, Clock, KeyRound, Sparkles } from 'lucide-react';
import { isAiConfigured } from '@/core/ai/client';
import { Badge, Card, CardBody, CardHeader, EmptyState, Notice, PageHeader, Stat } from '@/components/ui';
import { AdminNav } from '../components/admin-nav';
import { UsageChart } from '../components/usage-chart';
import { getAiUsageReport } from '../queries';

const fmt = (n: number) => n.toLocaleString('en-GB');
const latency = (ms: number | null) => (ms === null ? '–' : ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${ms} ms`);

export async function AdminAiUsagePage() {
  const report = await getAiUsageReport(14);
  const configured = isAiConfigured();
  const { totals } = report;

  return (
    <div>
      <PageHeader title="AI usage" subtitle="Every AI call is logged with its feature, model, tokens and speed." />
      <AdminNav current="/admin/ai-usage" />

      <Notice tone={configured ? 'success' : 'info'} className="mb-6 flex items-center gap-2">
        <KeyRound className="h-4 w-4 shrink-0" aria-hidden />
        {configured
          ? 'An AI key is set. Calls go to the real provider until a user hits the daily limit.'
          : 'No AI key is set, so every feature answers in demo mode with built-in mock replies.'}
      </Notice>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="All calls" value={fmt(totals.calls)} icon={<Bot className="h-5 w-5" aria-hidden />} />
        <Stat
          label="Real / demo"
          value={`${fmt(totals.real)} / ${fmt(totals.mock)}`}
          icon={<Sparkles className="h-5 w-5" aria-hidden />}
          tint="lilac"
        />
        <Stat
          label="Tokens in / out"
          value={`${fmt(totals.promptTokens)} / ${fmt(totals.completionTokens)}`}
          tint="butter"
        />
        <Stat
          label="Avg real latency"
          value={latency(totals.avgLatencyMs)}
          icon={<Clock className="h-5 w-5" aria-hidden />}
          tint="sky"
        />
      </div>

      <Card className="mb-6">
        <CardHeader title="Calls per day" subtitle="Last 14 days, UTC" />
        <CardBody>
          <UsageChart data={report.series} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="By feature" subtitle="Feature names follow module.action, e.g. tutor.chat" />
        <CardBody>
          {report.features.length === 0 ? (
            <EmptyState title="No AI calls yet">Try the tutor or generate a course, then come back.</EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="font-display text-ink-soft">
                  <tr>
                    <th scope="col" className="py-2 pr-3">Feature</th>
                    <th scope="col" className="py-2 pr-3">Calls</th>
                    <th scope="col" className="py-2 pr-3">Real</th>
                    <th scope="col" className="py-2 pr-3">Demo</th>
                    <th scope="col" className="py-2 pr-3">Tokens in</th>
                    <th scope="col" className="py-2 pr-3">Tokens out</th>
                    <th scope="col" className="py-2">Avg latency</th>
                  </tr>
                </thead>
                <tbody>
                  {report.features.map((f) => (
                    <tr key={f.feature} className="border-t-2 border-line/15">
                      <td className="py-2.5 pr-3"><Badge tint="lilac">{f.feature}</Badge></td>
                      <td className="py-2.5 pr-3 font-semibold">{fmt(f.calls)}</td>
                      <td className="py-2.5 pr-3">{fmt(f.real)}</td>
                      <td className="py-2.5 pr-3">{fmt(f.mock)}</td>
                      <td className="py-2.5 pr-3">{fmt(f.promptTokens)}</td>
                      <td className="py-2.5 pr-3">{fmt(f.completionTokens)}</td>
                      <td className="py-2.5">{latency(f.avgLatencyMs)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
