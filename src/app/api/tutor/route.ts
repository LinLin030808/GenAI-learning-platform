import { handleTutorRequest } from '@/modules/ai-tutor/server';

// Streams Pip's reply as plain text. All logic lives in the ai-tutor module.
export async function POST(request: Request) {
  return handleTutorRequest(request);
}
