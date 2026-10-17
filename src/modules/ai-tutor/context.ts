// Loads what the tutor needs to know: the current lesson (only if the learner may see it)
// and the learner's onboarding profile. Server only.
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '@/core/db/client';
import { learnerProfiles } from '@/core/db/schema';
import { canViewCourse, getCourseById, getLessonWithActivities } from '@/core/content/queries';
import type { SessionUser } from '@/core/types';
import { LESSON_CHAR_LIMIT, truncate, type TutorLearnerProfile, type TutorLessonContext } from './prompt';

// Only the question prompts are read, never the answers, so they cannot leak into the prompt.
const quizPromptsSchema = z.object({ questions: z.array(z.object({ prompt: z.string() })) });

export async function loadLessonContext(user: SessionUser, lessonId: string): Promise<TutorLessonContext | null> {
  const lesson = await getLessonWithActivities(lessonId);
  if (!lesson) return null;
  const course = await getCourseById(lesson.courseId);
  if (!course || !(await canViewCourse(user, course))) return null;

  const gradedItems: string[] = [];
  for (const activity of lesson.activities) {
    if (activity.type === 'quiz') {
      const parsed = quizPromptsSchema.safeParse(activity.config);
      if (parsed.success) {
        for (const q of parsed.data.questions) gradedItems.push(`Quiz question: ${q.prompt.slice(0, 200)}`);
        continue;
      }
    }
    gradedItems.push(`${activity.type} activity: ${activity.title}`);
  }

  return {
    id: lesson.id,
    courseId: course.id,
    title: lesson.title,
    courseTitle: course.title,
    subject: course.subject,
    content: truncate(lesson.content, LESSON_CHAR_LIMIT),
    gradedItems: gradedItems.slice(0, 20),
  };
}

export async function loadLearnerProfile(userId: string): Promise<TutorLearnerProfile | null> {
  const db = await getDb();
  const [row] = await db
    .select({
      background: learnerProfiles.background,
      codingLevel: learnerProfiles.codingLevel,
      track: learnerProfiles.track,
    })
    .from(learnerProfiles)
    .where(eq(learnerProfiles.userId, userId))
    .limit(1);
  return row ?? null;
}
