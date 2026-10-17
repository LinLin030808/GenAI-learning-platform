import Link from 'next/link';
import { Play } from 'lucide-react';
import type { HomeWidgetProps } from '@/core/types';
import { asTint, buttonClasses, Card, CardBody, CardHeader, EmptyState, ProgressBar } from '@/components/ui';
import { getContinueTarget } from '../queries';

export async function ContinueWidget({ user }: HomeWidgetProps) {
  const target = await getContinueTarget(user.id);
  if (!target) {
    return (
      <Card className="h-full">
        <CardHeader title="Keep going" />
        <CardBody>
          <EmptyState
            title="Nothing in progress"
            mood="sleepy"
            action={
              <Link href="/courses" className={buttonClasses('primary', 'sm')}>
                Pick a course
              </Link>
            }
          >
            Start any course and it will show up here.
          </EmptyState>
        </CardBody>
      </Card>
    );
  }
  const { course, lesson, lessonNumber, percent } = target;
  return (
    <Card tint={asTint(course.color)} className="h-full">
      <CardHeader title="Keep going" subtitle={`${course.emoji} ${course.title}`} />
      <CardBody className="flex flex-col gap-4">
        <div>
          <div className="text-sm font-semibold text-ink-soft">
            Lesson {lessonNumber} of {course.lessons.length}
          </div>
          <div className="font-display text-xl font-bold">{lesson.title}</div>
        </div>
        <ProgressBar value={percent} label="Course progress" />
        <Link href={`/courses/${course.slug}/lessons/${lesson.id}`} className={buttonClasses('primary', 'md', 'self-start')}>
          <Play className="h-4 w-4" /> Continue ({lesson.estimatedMinutes} min)
        </Link>
      </CardBody>
    </Card>
  );
}
