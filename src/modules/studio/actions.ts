'use server';

// Studio mutations. Every action: requireUser(staff) → zod → canEditCourse → write → revalidate.
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { count, eq } from 'drizzle-orm';
import { z } from 'zod';
import { generateJson, generateText } from '@/core/ai/client';
import { requireUser } from '@/core/auth/session';
import {
  COURSE_COLORS,
  generateCourseDraft,
  saveCourseDraft,
  uniqueSlug,
  type CourseDraft,
} from '@/core/content/draft';
import { canViewCourse, getCourseById, getCourseOutline } from '@/core/content/queries';
import { getDb } from '@/core/db/client';
import {
  activities,
  courses,
  lessons,
  type CourseStatus,
  type CourseVisibility,
  type UserRole,
} from '@/core/db/schema';
import { newId } from '@/core/ids';
import type { ActionResult } from '@/core/types';
import { ACTIVITY_TYPES, activitySpecs, getActivityType } from '@/registry/activities';
import {
  activityOrder,
  lessonOrder,
  loadEditableActivity,
  loadEditableCourse,
  loadEditableLesson,
  renumberActivities,
  renumberLessons,
  touchCourse,
} from './access';
import { formatIssues, moveItem, parseTags } from './ordering';
import {
  buildActivitySystemPrompt,
  buildActivityUserPrompt,
  buildRewritePrompt,
  REWRITE_SYSTEM_PROMPT,
  stripOuterFence,
} from './prompts';

const STAFF: UserRole[] = ['instructor', 'admin'];
const MAX_LESSONS = 20;
const MAX_ACTIVITIES_PER_LESSON = 10;

const NOT_ALLOWED: ActionResult = { ok: false, error: 'You can only edit your own courses.' };

/** Optional text field: trims, and treats an empty string as "not given". */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

const levelSchema = z.enum(['beginner', 'intermediate', 'advanced']);
const audienceSchema = z.enum(['everyone', 'non_cs', 'cs']);

function firstError(error: z.ZodError, fallback: string): string {
  return error.issues[0]?.message ?? fallback;
}

function revalidateCourse(course: { id: string; slug: string }) {
  revalidatePath('/studio');
  revalidatePath(`/studio/${course.id}`, 'layout');
  revalidatePath(`/courses/${course.slug}`, 'layout');
}

// ---------------------------------------------------------------------------
// Create courses
// ---------------------------------------------------------------------------

const generateSchema = z.object({
  topic: z.string().trim().min(3, 'Tell Pip what the course is about (at least 3 characters).').max(200),
  audienceNote: optionalText(300),
  level: levelSchema.catch('beginner'),
  lessonCount: z.coerce.number().int().min(1).max(6).catch(3),
  materials: optionalText(20000),
  requirements: optionalText(1000),
  types: z.array(z.string()).default([]),
});

export async function generateCourse(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireUser(STAFF);
  const parsed = generateSchema.safeParse({ ...Object.fromEntries(formData), types: formData.getAll('types') });
  if (!parsed.success) return { ok: false, error: firstError(parsed.error, 'Check the form and try again.') };
  const known = parsed.data.types.filter((t) => getActivityType(t));
  if (ACTIVITY_TYPES.length > 0 && known.length === 0) {
    return { ok: false, error: 'Pick at least one activity type.' };
  }

  const { draft, mocked } = await generateCourseDraft({
    topic: parsed.data.topic,
    audienceNote: parsed.data.audienceNote,
    level: parsed.data.level,
    lessonCount: parsed.data.lessonCount,
    materials: parsed.data.materials,
    requirements: parsed.data.requirements,
    specs: activitySpecs(known),
    feature: 'studio.generate_course',
    userId: user.id,
  });
  const saved = await saveCourseDraft(draft, {
    ownerId: user.id,
    source: 'ai',
    status: 'draft',
    visibility: 'private',
  });
  revalidatePath('/studio');
  redirect(`/studio/${saved.id}${mocked ? '?demo=1' : ''}`);
}

const blankSchema = z.object({
  title: z.string().trim().min(3, 'Give the course a title (at least 3 characters).').max(100),
  subject: optionalText(60),
  level: levelSchema.catch('beginner'),
  audience: audienceSchema.catch('everyone'),
});

export async function createBlankCourse(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireUser(STAFF);
  const parsed = blankSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error, 'Give the course a title.') };
  const draft: CourseDraft = {
    title: parsed.data.title,
    summary: '',
    subject: parsed.data.subject ?? 'General',
    level: parsed.data.level,
    audience: parsed.data.audience,
    tags: [],
    emoji: '🌱',
    color: 'mint',
    lessons: [
      {
        title: 'Lesson 1',
        content: '## Lesson 1\n\nWrite your lesson here. Markdown works: **bold**, lists, tables and code.',
        estimatedMinutes: 10,
        activities: [],
      },
    ],
  };
  const saved = await saveCourseDraft(draft, {
    ownerId: user.id,
    source: 'manual',
    status: 'draft',
    visibility: 'private',
  });
  revalidatePath('/studio');
  redirect(`/studio/${saved.id}`);
}

// ---------------------------------------------------------------------------
// Course details, publishing, duplicating
// ---------------------------------------------------------------------------

const metaSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().trim().min(3, 'Give the course a title (at least 3 characters).').max(100, 'Keep the title under 100 characters.'),
  summary: z.string().trim().max(400, 'Keep the summary under 400 characters.').default(''),
  subject: z.string().trim().max(60, 'Keep the subject under 60 characters.').default(''),
  level: levelSchema,
  audience: audienceSchema,
  tags: z.string().max(400).default(''),
  emoji: z.string().trim().min(1, 'Pick an emoji for the course.').max(16, 'Use a single emoji.'),
  color: z.enum(COURSE_COLORS),
});

export async function updateCourseMeta(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireUser(STAFF);
  const parsed = metaSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error, 'Check the course details.') };
  const course = await loadEditableCourse(user, parsed.data.courseId);
  if (!course) return NOT_ALLOWED;
  const { courseId: _id, tags, subject, ...fields } = parsed.data;
  const db = await getDb();
  await db
    .update(courses)
    .set({ ...fields, subject: subject || 'General', tags: parseTags(tags), updatedAt: new Date() })
    .where(eq(courses.id, course.id));
  revalidateCourse(course);
  return { ok: true, message: 'Course details saved.' };
}

const statusSchema = z.object({
  courseId: z.string().min(1),
  intent: z.enum(['publish_class', 'submit_public', 'unpublish', 'archive']),
});

const STATUS_CHANGES: Record<
  z.infer<typeof statusSchema>['intent'],
  { status: CourseStatus; visibility?: CourseVisibility; message: string }
> = {
  publish_class: {
    status: 'published',
    visibility: 'class',
    message: 'Published to your classes. Assign it to a class so learners can find it.',
  },
  submit_public: {
    status: 'pending_review',
    visibility: 'public',
    message: 'Sent for review. It shows up in the public catalog once an admin approves it.',
  },
  unpublish: { status: 'draft', message: 'Back to draft. Learners cannot open it for now.' },
  archive: { status: 'archived', message: 'Archived. It is hidden from learners and the catalog.' },
};

export async function setCourseStatus(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireUser(STAFF);
  const parsed = statusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'Something went wrong. Reload the page and try again.' };
  const course = await loadEditableCourse(user, parsed.data.courseId);
  if (!course) return NOT_ALLOWED;
  const db = await getDb();
  const change = STATUS_CHANGES[parsed.data.intent];
  if (change.status === 'published' || change.status === 'pending_review') {
    const [row] = await db.select({ n: count() }).from(lessons).where(eq(lessons.courseId, course.id));
    if (!row?.n) return { ok: false, error: 'Add at least one lesson before publishing.' };
  }
  await db
    .update(courses)
    .set({
      status: change.status,
      ...(change.visibility ? { visibility: change.visibility } : {}),
      updatedAt: new Date(),
    })
    .where(eq(courses.id, course.id));
  revalidateCourse(course);
  revalidatePath('/courses');
  return { ok: true, message: change.message };
}

const courseIdSchema = z.object({ courseId: z.string().min(1) });

/** Copies a published course (lessons + activities) into a private draft owned by the user. */
export async function duplicateCourse(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireUser(STAFF);
  const parsed = courseIdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'Pick a course to duplicate.' };
  const source = await getCourseById(parsed.data.courseId);
  if (!source || source.status !== 'published' || !(await canViewCourse(user, source))) {
    return { ok: false, error: 'Only published courses you can see can be duplicated.' };
  }
  const outline = await getCourseOutline(source.id);
  if (!outline) return { ok: false, error: 'That course no longer exists.' };

  const db = await getDb();
  const id = newId('course');
  const title = `${source.title} (my copy)`.slice(0, 100);
  await db.insert(courses).values({
    id,
    slug: await uniqueSlug(title),
    title,
    summary: source.summary,
    subject: source.subject,
    level: source.level,
    audience: source.audience,
    tags: source.tags,
    color: source.color,
    emoji: source.emoji,
    estimatedMinutes: source.estimatedMinutes,
    status: 'draft',
    visibility: 'private',
    source: 'manual',
    ownerId: user.id,
    forkedFromId: source.id,
  });
  const copies = outline.lessons.map((l) => ({ original: l, newId: newId('lesson') }));
  if (copies.length) {
    await db.insert(lessons).values(
      copies.map(({ original, newId: lessonId }) => ({
        id: lessonId,
        courseId: id,
        position: original.position,
        title: original.title,
        content: original.content,
        estimatedMinutes: original.estimatedMinutes,
      })),
    );
  }
  const activityRows = copies.flatMap(({ original, newId: lessonId }) =>
    original.activities.map((a) => ({
      id: newId('activity'),
      lessonId,
      position: a.position,
      type: a.type,
      title: a.title,
      config: a.config,
      xpReward: a.xpReward,
    })),
  );
  if (activityRows.length) await db.insert(activities).values(activityRows);
  revalidatePath('/studio');
  redirect(`/studio/${id}`);
}

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------

export async function addLesson(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireUser(STAFF);
  const parsed = courseIdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'Something went wrong. Reload the page and try again.' };
  const course = await loadEditableCourse(user, parsed.data.courseId);
  if (!course) return NOT_ALLOWED;
  const existing = await lessonOrder(course.id);
  if (existing.length >= MAX_LESSONS) {
    return { ok: false, error: `A mini-course can have up to ${MAX_LESSONS} lessons.` };
  }
  const db = await getDb();
  const lessonId = newId('lesson');
  const title = `Lesson ${existing.length + 1}`;
  await db.insert(lessons).values({
    id: lessonId,
    courseId: course.id,
    position: existing.length,
    title,
    content: `## ${title}\n\nWrite your lesson here.`,
    estimatedMinutes: 10,
  });
  await touchCourse(course.id);
  revalidateCourse(course);
  redirect(`/studio/${course.id}/lessons/${lessonId}`);
}

const lessonIdSchema = z.object({ lessonId: z.string().min(1) });
const moveSchema = z.object({ direction: z.enum(['up', 'down']) });

export async function deleteLesson(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireUser(STAFF);
  const parsed = lessonIdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'Something went wrong. Reload the page and try again.' };
  const found = await loadEditableLesson(user, parsed.data.lessonId);
  if (!found) return NOT_ALLOWED;
  const { lesson, course } = found;
  if ((await lessonOrder(course.id)).length <= 1) {
    return { ok: false, error: 'A course needs at least one lesson. Add another before deleting this one.' };
  }
  const db = await getDb();
  await db.delete(lessons).where(eq(lessons.id, lesson.id));
  await renumberLessons(course.id);
  await touchCourse(course.id);
  revalidateCourse(course);
  return { ok: true, message: 'Lesson deleted.' };
}

export async function moveLesson(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireUser(STAFF);
  const parsed = lessonIdSchema.extend(moveSchema.shape).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'Something went wrong. Reload the page and try again.' };
  const found = await loadEditableLesson(user, parsed.data.lessonId);
  if (!found) return NOT_ALLOWED;
  const rows = await lessonOrder(found.course.id);
  const ordered = moveItem(
    rows.map((r) => r.id),
    found.lesson.id,
    parsed.data.direction,
  );
  await renumberLessons(found.course.id, ordered);
  await touchCourse(found.course.id);
  revalidateCourse(found.course);
  return { ok: true };
}

const lessonSchema = z.object({
  lessonId: z.string().min(1),
  title: z.string().trim().min(1, 'Give the lesson a title.').max(120, 'Keep the title under 120 characters.'),
  estimatedMinutes: z.coerce
    .number({ message: 'Minutes must be a number.' })
    .int('Use whole minutes.')
    .min(1, 'A lesson takes at least 1 minute.')
    .max(120, 'Keep a lesson under 120 minutes.'),
  content: z.string().max(40000, 'This lesson is very long. Split it into two lessons.'),
});

export async function updateLesson(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireUser(STAFF);
  const parsed = lessonSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error, 'Check the lesson fields.') };
  const found = await loadEditableLesson(user, parsed.data.lessonId);
  if (!found) return NOT_ALLOWED;
  const db = await getDb();
  await db
    .update(lessons)
    .set({
      title: parsed.data.title,
      estimatedMinutes: parsed.data.estimatedMinutes,
      content: parsed.data.content,
      updatedAt: new Date(),
    })
    .where(eq(lessons.id, found.lesson.id));
  await touchCourse(found.course.id);
  revalidateCourse(found.course);
  return { ok: true, message: 'Lesson saved.' };
}

const rewriteSchema = z.object({
  lessonId: z.string().min(1),
  instruction: z.string().trim().min(3, 'Pick a preset or say how Pip should rewrite it.').max(500),
  content: z.string().trim().min(1, 'Write something first, then ask Pip to rewrite it.').max(40000),
});

/** Returns rewritten Markdown without saving it: the instructor accepts or discards it. */
export async function rewriteLesson(
  _prev: ActionResult<{ content: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ content: string }>> {
  const user = await requireUser(STAFF);
  const parsed = rewriteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error, 'Say how Pip should rewrite it.') };
  const found = await loadEditableLesson(user, parsed.data.lessonId);
  if (!found) return { ok: false, error: 'You can only edit your own courses.' };
  const { text, mocked } = await generateText(
    [
      { role: 'system', content: REWRITE_SYSTEM_PROMPT },
      {
        role: 'user',
        content: buildRewritePrompt({
          lessonTitle: found.lesson.title,
          content: parsed.data.content,
          instruction: parsed.data.instruction,
        }),
      },
    ],
    {
      feature: 'studio.rewrite_lesson',
      userId: user.id,
      tier: 'fast',
      maxTokens: 3000,
      temperature: 0.5,
      mock: () => parsed.data.content,
    },
  );
  return {
    ok: true,
    data: { content: mocked ? text : stripOuterFence(text) },
    message: mocked
      ? 'Demo mode: no AI key is set up, so Pip returned the lesson unchanged.'
      : 'Here is Pip’s version. Nothing changes until you use it and save.',
  };
}

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------

const addActivitySchema = z.object({
  lessonId: z.string().min(1),
  type: z.string().min(1),
  mode: z.enum(['blank', 'ai']).catch('blank'),
  note: optionalText(500),
});

/** Adds an activity of any registered type: blank (its defaultConfig) or written by AI. */
export async function addActivity(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireUser(STAFF);
  const parsed = addActivitySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'Pick an activity type.' };
  const def = getActivityType(parsed.data.type);
  if (!def) return { ok: false, error: 'That activity type is not installed.' };
  const found = await loadEditableLesson(user, parsed.data.lessonId);
  if (!found) return NOT_ALLOWED;
  const { lesson, course } = found;
  const existing = await activityOrder(lesson.id);
  if (existing.length >= MAX_ACTIVITIES_PER_LESSON) {
    return { ok: false, error: `A lesson can have up to ${MAX_ACTIVITIES_PER_LESSON} activities.` };
  }

  let config: unknown = def.defaultConfig;
  let mocked = false;
  if (parsed.data.mode === 'ai') {
    const result = await generateJson(
      [
        { role: 'system', content: buildActivitySystemPrompt(def) },
        {
          role: 'user',
          content: buildActivityUserPrompt({
            courseTitle: course.title,
            lessonTitle: lesson.title,
            content: lesson.content,
            note: parsed.data.note,
          }),
        },
      ],
      def.schema,
      {
        feature: 'studio.generate_activity',
        userId: user.id,
        tier: 'fast',
        maxTokens: 2500,
        mock: () => def.mock({ topic: course.title, lessonTitle: lesson.title }),
      },
    );
    config = result.data;
    mocked = result.mocked;
  }

  const db = await getDb();
  await db.insert(activities).values({
    id: newId('activity'),
    lessonId: lesson.id,
    position: existing.length,
    type: def.type,
    title: (parsed.data.mode === 'ai' ? `${def.label}: ${lesson.title}` : def.label).slice(0, 120),
    config,
    xpReward: 20,
  });
  await touchCourse(course.id);
  revalidateCourse(course);
  if (parsed.data.mode === 'blank') return { ok: true, message: `${def.label} added. Edit it below.` };
  return {
    ok: true,
    message: mocked
      ? `Demo mode: no AI key is set up, so Pip added a sample ${def.label.toLowerCase()}.`
      : `Pip wrote a ${def.label.toLowerCase()} from this lesson. Check it below.`,
  };
}

const updateActivitySchema = z.object({
  activityId: z.string().min(1),
  title: z.string().trim().min(1, 'Give the activity a title.').max(120, 'Keep the title under 120 characters.'),
  xpReward: z.coerce
    .number({ message: 'XP must be a number.' })
    .int('Use a whole number of XP.')
    .min(5, 'XP must be between 5 and 100.')
    .max(100, 'XP must be between 5 and 100.'),
  config: z.string().max(60000, 'This setup is too large.'),
});

export async function updateActivity(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireUser(STAFF);
  const parsed = updateActivitySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error, 'Check the activity fields.') };
  const found = await loadEditableActivity(user, parsed.data.activityId);
  if (!found) return NOT_ALLOWED;
  const def = getActivityType(found.activity.type);
  if (!def) {
    return { ok: false, error: `The “${found.activity.type}” activity type is not installed, so this setup cannot be checked.` };
  }
  let raw: unknown;
  try {
    raw = JSON.parse(parsed.data.config);
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'check commas and quotes';
    return { ok: false, error: `The setup is not valid JSON: ${detail}` };
  }
  const config = def.schema.safeParse(raw);
  if (!config.success) {
    return { ok: false, error: `The setup does not fit a ${def.label.toLowerCase()}:\n${formatIssues(config.error.issues)}` };
  }
  const db = await getDb();
  await db
    .update(activities)
    .set({ title: parsed.data.title, xpReward: parsed.data.xpReward, config: config.data, updatedAt: new Date() })
    .where(eq(activities.id, found.activity.id));
  await touchCourse(found.course.id);
  revalidateCourse(found.course);
  return { ok: true, message: 'Activity saved.' };
}

const activityIdSchema = z.object({ activityId: z.string().min(1) });

export async function deleteActivity(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireUser(STAFF);
  const parsed = activityIdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'Something went wrong. Reload the page and try again.' };
  const found = await loadEditableActivity(user, parsed.data.activityId);
  if (!found) return NOT_ALLOWED;
  const db = await getDb();
  await db.delete(activities).where(eq(activities.id, found.activity.id));
  await renumberActivities(found.lesson.id);
  await touchCourse(found.course.id);
  revalidateCourse(found.course);
  return { ok: true, message: 'Activity deleted.' };
}

export async function moveActivity(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireUser(STAFF);
  const parsed = activityIdSchema.extend(moveSchema.shape).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'Something went wrong. Reload the page and try again.' };
  const found = await loadEditableActivity(user, parsed.data.activityId);
  if (!found) return NOT_ALLOWED;
  const rows = await activityOrder(found.lesson.id);
  const ordered = moveItem(
    rows.map((r) => r.id),
    found.activity.id,
    parsed.data.direction,
  );
  await renumberActivities(found.lesson.id, ordered);
  await touchCourse(found.course.id);
  revalidateCourse(found.course);
  return { ok: true };
}
