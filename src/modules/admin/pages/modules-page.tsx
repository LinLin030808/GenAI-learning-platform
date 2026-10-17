// /admin/modules: the feature modules in this build. The route passes plain data in so this
// module never imports the registry.
import { Boxes } from 'lucide-react';
import { Badge, Card, EmptyState, PageHeader } from '@/components/ui';
import { AdminNav } from '../components/admin-nav';

export interface ModuleInfo {
  id: string;
  name: string;
  description: string;
  owner: string | null;
  navLabels: string[];
  widgetCount: number;
  addonCount: number;
}

export function AdminModulesPage({ modules }: { modules: ModuleInfo[] }) {
  return (
    <div>
      <PageHeader
        title="Modules"
        subtitle="Each feature is a module listed once in src/registry/modules.ts. Remove the line and it disappears."
      />
      <AdminNav current="/admin/modules" />
      {modules.length === 0 ? (
        <EmptyState title="No modules installed" />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {modules.map((m) => (
            <li key={m.id}>
              <Card className="h-full p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-line bg-sky-soft">
                    <Boxes className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold">{m.name}</h2>
                    <code className="text-xs text-ink-soft">{m.id}</code>
                  </div>
                </div>
                <p className="mt-3 text-sm">{m.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tint="butter">
                    {m.navLabels.length} nav item{m.navLabels.length === 1 ? '' : 's'}
                    {m.navLabels.length ? `: ${m.navLabels.join(', ')}` : ''}
                  </Badge>
                  <Badge tint="mint">
                    {m.widgetCount} home widget{m.widgetCount === 1 ? '' : 's'}
                  </Badge>
                  {m.addonCount ? (
                    <Badge tint="lilac">
                      {m.addonCount} shell add-on{m.addonCount === 1 ? '' : 's'}
                    </Badge>
                  ) : null}
                  {m.owner ? <Badge tint="paper">Owner: {m.owner}</Badge> : null}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
