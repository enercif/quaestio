import { relations } from 'drizzle-orm';
import { integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const quizTable = pgTable('quiz', {
	id: uuid('id').defaultRandom().primaryKey(),
	title: text('title').notNull(),
	last_run: timestamp('last_run', { mode: 'string' }),
	tags: text('tags').array().notNull(),
	questions: jsonb('questions').notNull()
});

export const roomTable = pgTable('room', {
	id: text('id').primaryKey(),
	limit: integer('limit'),
	quiz: uuid('quiz_id')
		.references(() => quizTable.id)
		.notNull(),
	state: text('state').default('waiting').notNull()
});

export const roomRelations = relations(roomTable, ({ one }) => ({
	quiz: one(quizTable, { fields: [roomTable.quiz], references: [quizTable.id] })
}));
