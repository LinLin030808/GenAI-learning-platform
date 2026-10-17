'use client';
// Role picker for one user row. Disabled for the signed-in admin (no self-demotion).

import { useActionState } from 'react';
import type { UserRole } from '@/core/db/schema';
import { Select } from '@/components/ui';
import { SubmitButton } from '@/components/ui/submit-button';
import { changeUserRole } from '../actions';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'learner', label: 'Learner' },
  { value: 'instructor', label: 'Instructor' },
  { value: 'admin', label: 'Admin' },
];

export function RoleForm({
  userId,
  userName,
  role,
  isSelf,
}: {
  userId: string;
  userName: string;
  role: UserRole;
  isSelf: boolean;
}) {
  const [state, action] = useActionState(changeUserRole, null);
  const selectId = `role-${userId}`;
  return (
    <form action={action} className="flex flex-col gap-1">
      <input type="hidden" name="userId" value={userId} />
      <div className="flex items-center gap-2">
        <label htmlFor={selectId} className="sr-only">
          Role for {userName}
        </label>
        <Select id={selectId} name="role" defaultValue={role} disabled={isSelf} className="h-8 w-36 py-0 text-sm">
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <SubmitButton variant="secondary" size="sm" pendingText="Saving…" disabled={isSelf} aria-label={`Save role for ${userName}`}>
          Save
        </SubmitButton>
      </div>
      {isSelf ? <p className="text-xs text-ink-soft">That is you. Another admin can change your role.</p> : null}
      {state ? (
        <p role={state.ok ? 'status' : 'alert'} className={state.ok ? 'text-xs font-semibold text-mint-deep' : 'text-xs font-semibold text-danger'}>
          {state.ok ? state.message : state.error}
        </p>
      ) : null}
    </form>
  );
}
