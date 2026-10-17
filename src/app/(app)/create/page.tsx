import { requireUser } from '@/core/auth/session';
import { CreatePage } from '@/modules/self-learn/pages/create-page';

export default async function LearnAnythingPage() {
  const user = await requireUser(['learner']);
  return <CreatePage user={user} />;
}
