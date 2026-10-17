import type { Metadata } from 'next';
import { requireUser } from '@/core/auth/session';
import { OnboardingFlow } from '@/modules/onboarding/components/onboarding-flow';

export const metadata: Metadata = { title: 'Plan my path' };

export default async function OnboardingPage() {
  const user = await requireUser(['learner']);
  return <OnboardingFlow name={user.name} />;
}
