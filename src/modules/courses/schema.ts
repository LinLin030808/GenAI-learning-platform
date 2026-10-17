// Module tables are loaded by drizzle-kit outside Next.js, so schema files use relative
// imports instead of the "@/" alias.
import { pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';
import { lessons } from '../../core/db/schema';

export const ADAPTATION_VARIANTS = ['simpler', 'technical', 'example'] as const;
export type AdaptationVariant = (typeof ADAPTATION_VARIANTS)[number];

// "Explain it my way" rewrites, cached per lesson so each variant is generated once.
export const lessonAdaptations = pgTable(
  'lesson_adaptations',
  {
    lessonId: text()
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    variant: text().$type<AdaptationVariant>().notNull(),
    content: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.lessonId, t.variant] })],
);
