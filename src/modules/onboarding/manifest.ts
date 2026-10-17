import type { ModuleManifest } from '@/core/types';
import { OnboardingWidget } from './components/onboarding-widget';

export const onboardingManifest: ModuleManifest = {
  id: 'onboarding',
  name: 'Onboarding & personal path',
  description: 'A short chat with Pip that builds a learner profile and a recommended path.',
  homeWidgets: [
    { id: 'onboarding.path', roles: ['learner'], order: 10, size: 'full', component: OnboardingWidget },
  ],
};
