import { Users } from 'lucide-react';
import type { ModuleManifest } from '@/core/types';
import { ClassPulseWidget, MyClassesWidget } from './components/class-widgets';

export const classesManifest: ModuleManifest = {
  id: 'classes',
  name: 'Classes & engagement',
  description: 'Instructors import students, assign courses and track engagement.',
  navItems: [
    { href: '/classes', label: 'Classes', icon: Users, roles: ['learner', 'instructor', 'admin'], order: 60 },
  ],
  homeWidgets: [
    { id: 'classes.pulse', roles: ['instructor', 'admin'], order: 40, size: 'half', component: ClassPulseWidget },
    { id: 'classes.mine', roles: ['learner'], order: 60, size: 'half', component: MyClassesWidget },
  ],
};
