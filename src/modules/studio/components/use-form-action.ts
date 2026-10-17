'use client';

// Runs a server action from onSubmit instead of <form action>, so React does not reset the
// form after the action returns (keeps typed text when there is a validation error).
import { startTransition, useActionState, type FormEvent } from 'react';
import type { ActionResult } from '@/core/types';

export type FormAction<T = undefined> = (
  prev: ActionResult<T> | null,
  formData: FormData,
) => Promise<ActionResult<T>>;

export function useFormAction<T = undefined>(action: FormAction<T>) {
  const [state, dispatch, pending] = useActionState<ActionResult<T> | null, FormData>(action, null);
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const formData = new FormData(event.currentTarget, submitter);
    startTransition(() => dispatch(formData));
  }
  return { state, pending, onSubmit };
}
