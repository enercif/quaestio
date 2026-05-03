import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const quizTable = pgTable('quiz', {
	id: uuid('id').defaultRandom().primaryKey(),
	title: text('title').notNull(),
	last_run: timestamp('last_run'),
	tags: text('tags').array().notNull(),
	questions: jsonb('questions').notNull()
});
