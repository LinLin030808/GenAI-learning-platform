import { handleRoleplayChat } from '@/modules/activities/roleplay/server';

export const maxDuration = 60;

export function POST(request: Request) {
  return handleRoleplayChat(request);
}
