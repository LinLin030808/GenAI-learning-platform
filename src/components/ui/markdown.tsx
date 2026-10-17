import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from './cn';

/** Renders lesson / AI markdown. Raw HTML is not rendered (safe for AI output). */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn('prose-sprout', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
