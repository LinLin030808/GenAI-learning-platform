// /studio/new: page frame around the generate / blank course forms.
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { buttonClasses, PageHeader } from '@/components/ui';
import { NewCourseForms } from '../components/new-course-forms';

export function NewCoursePage({ mode }: { mode?: string }) {
  return (
    <div>
      <PageHeader
        eyebrow={
          <Link href="/studio" className={buttonClasses('ghost', 'sm', '-ml-3')}>
            <ArrowLeft className="h-4 w-4" aria-hidden /> Studio
          </Link>
        }
        title="New course"
        subtitle="Tell Pip the topic and who it is for. You get a private draft to edit before anyone sees it."
      />
      <NewCourseForms initialMode={mode === 'blank' ? 'blank' : 'ai'} />
    </div>
  );
}
