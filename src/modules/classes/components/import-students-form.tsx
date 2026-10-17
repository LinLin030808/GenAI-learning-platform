'use client';
// Paste or upload a name,email CSV. After import, temporary passwords for new accounts are
// shown once (they are not stored in plain text anywhere).

import { useActionState, useState, type ChangeEvent } from 'react';
import { KeyRound, Upload } from 'lucide-react';
import type { ActionResult } from '@/core/types';
import { Badge, Card, Field, Notice, Textarea } from '@/components/ui';
import { SubmitButton } from '@/components/ui/submit-button';
import { importStudents, type ImportSummary } from '../actions';
import { CopyButton } from './copy-button';

const MAX_FILE_BYTES = 200_000;

export function ImportStudentsForm({ classId }: { classId: string }) {
  const [csv, setCsv] = useState('');
  const [fileNote, setFileNote] = useState<string | null>(null);
  const [state, action] = useActionState(
    async (prev: ActionResult<ImportSummary> | null, formData: FormData) => {
      const result = await importStudents(prev, formData);
      if (result.ok) {
        setCsv('');
        setFileNote(null);
      }
      return result;
    },
    null,
  );

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setFileNote('That file is over 200 KB. Split it into smaller lists.');
      return;
    }
    setCsv(await file.text());
    setFileNote(`Loaded ${file.name}. Check the list below, then import.`);
  }

  return (
    <div className="flex flex-col gap-4">
      <form action={action} className="flex flex-col gap-3">
        <input type="hidden" name="classId" value={classId} />
        <Field
          label="Students (name,email)"
          htmlFor="import-csv"
          hint="One student per line. A header row is fine. New emails get a learner account."
        >
          <Textarea
            id="import-csv"
            name="csv"
            rows={6}
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            placeholder={'name,email\nMia Wong,mia.wong@uni.edu\nLeo Chan,leo.chan@uni.edu'}
            className="font-mono text-sm"
          />
        </Field>
        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton pendingText="Importing…" disabled={csv.trim().length === 0}>
            Import students
          </SubmitButton>
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-pill border-2 border-line bg-paper px-4 font-display font-semibold shadow-sticker-sm hover:bg-butter-soft focus-within:ring-4 focus-within:ring-sky/50">
            <Upload className="h-4 w-4" aria-hidden />
            Upload .csv
            <input type="file" accept=".csv,text/csv" onChange={onFile} className="sr-only" />
          </label>
        </div>
        {fileNote ? <p className="text-sm text-ink-soft" role="status">{fileNote}</p> : null}
        {state && !state.ok ? <Notice tone="error">{state.error}</Notice> : null}
      </form>

      {state?.ok && state.data ? <ImportResults summary={state.data} message={state.message} /> : null}
    </div>
  );
}

function ImportResults({ summary, message }: { summary: ImportSummary; message?: string }) {
  const passwordList = summary.created.map((c) => `${c.name}, ${c.email}, ${c.tempPassword}`).join('\n');
  return (
    <div className="flex flex-col gap-3">
      <Notice tone="success">
        {message} {summary.created.length} new account{summary.created.length === 1 ? '' : 's'},{' '}
        {summary.added.length} existing, {summary.alreadyInClass.length} already in the class,{' '}
        {summary.skipped.length} skipped.
      </Notice>

      {summary.created.length > 0 ? (
        <Card tint="butter" className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" aria-hidden />
              <h4 className="font-bold">Temporary passwords</h4>
            </div>
            <CopyButton value={passwordList} label="Copy all" />
          </div>
          <p className="mt-2 text-sm font-semibold">
            This is the only time you will see these. Copy them now and send each student their own
            password privately (not in a group chat).
          </p>
          <div className="mt-3 overflow-x-auto rounded-xl border-2 border-line bg-paper">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="bg-sky-soft font-display">
                <tr>
                  <th scope="col" className="px-3 py-2">Name</th>
                  <th scope="col" className="px-3 py-2">Email</th>
                  <th scope="col" className="px-3 py-2">Password</th>
                </tr>
              </thead>
              <tbody>
                {summary.created.map((c) => (
                  <tr key={c.email} className="border-t-2 border-line/20">
                    <td className="px-3 py-2">{c.name}</td>
                    <td className="px-3 py-2">{c.email}</td>
                    <td className="px-3 py-2 font-mono select-all">{c.tempPassword}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {summary.skipped.length > 0 ? (
        <details className="rounded-xl border-2 border-line bg-paper p-3">
          <summary className="cursor-pointer font-display font-semibold">
            Skipped rows <Badge tint="coral">{summary.skipped.length}</Badge>
          </summary>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {summary.skipped.map((s, i) => (
              <li key={`${s.row}-${i}`}>
                <span className="font-semibold">Row {s.row}:</span> {s.reason}
                {s.text ? <span className="text-ink-soft"> ({s.text})</span> : null}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {summary.alreadyInClass.length > 0 ? (
        <p className="text-sm text-ink-soft">Already in the class: {summary.alreadyInClass.join(', ')}</p>
      ) : null}
    </div>
  );
}
