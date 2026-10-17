import { requireUser } from '@/core/auth/session';
import { StudioHomePage } from '@/modules/studio/pages/studio-home';

export default async function StudioPage() {
  const user = await requireUser(['instructor', 'admin']);
  return <StudioHomePage user={user} />;
}
