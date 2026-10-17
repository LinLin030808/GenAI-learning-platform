// Relative imports: drizzle-kit loads schema files outside Next.js (no "@/" alias).
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { classes, users } from '../../core/db/schema';

export type DisplayMode = 'name' | 'nickname' | 'hidden';

/** How a learner appears on boards. No row = real name. */
export const leaderboardPrefs = pgTable('leaderboard_prefs', {
  userId: text()
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  displayMode: text().$type<DisplayMode>().notNull().default('name'),
  nickname: text(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/** Instructor switch per class. No row = board visible. */
export const leaderboardClassSettings = pgTable('leaderboard_class_settings', {
  classId: text()
    .primaryKey()
    .references(() => classes.id, { onDelete: 'cascade' }),
  enabled: boolean().notNull().default(true),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
