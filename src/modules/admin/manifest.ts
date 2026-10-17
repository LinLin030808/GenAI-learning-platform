import { ShieldCheck } from 'lucide-react';
import type { ModuleManifest } from '@/core/types';
import { PlatformWidget } from './components/platform-widget';

export const adminManifest: ModuleManifest = {
  id: 'admin',
  name: 'Admin console',
  description: 'Users and roles, course review queue, AI usage and platform stats.',
  navItems: [
    { href: '/admin', label: 'Admin', icon: ShieldCheck, roles: ['admin'], order: 90 },
  ],
  homeWidgets: [
    { id: 'admin.platform', roles: ['admin'], order: 30, size: 'half', component: PlatformWidget },
  ],
};
