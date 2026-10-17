import { PencilRuler } from 'lucide-react';
import type { ModuleManifest } from '@/core/types';
import { StudioWidget } from './components/studio-widget';

export const studioManifest: ModuleManifest = {
  id: 'studio',
  name: 'Course studio',
  description: 'Instructors create, AI-generate, edit and publish mini-courses.',
  navItems: [
    { href: '/studio', label: 'Studio', icon: PencilRuler, roles: ['instructor', 'admin'], order: 50 },
  ],
  homeWidgets: [
    { id: 'studio.overview', roles: ['instructor', 'admin'], order: 120, size: 'half', component: StudioWidget },
  ],
};
