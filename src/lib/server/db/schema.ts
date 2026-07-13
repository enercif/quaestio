import { relations } from 'drizzle-orm';
import {
	bigint,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	unique,
	uuid
} from 'drizzle-orm/pg-core';

export const quizTable = pgTable('quiz', {
	id: uuid('id').defaultRandom().primaryKey(),
	title: text('title').notNull(),
	last_run: timestamp('last_run', { mode: 'string' }),
	tags: text('tags').array().notNull(),
	questions: jsonb('questions').notNull(),
	questions_length: integer('questions_length').notNull()
});

export const roomTable = pgTable('room', {
	id: text('id').primaryKey(),
	limit: integer('limit'),
	quiz: uuid('quiz_id')
		.references(() => quizTable.id)
		.notNull(),
	state: text('state').default('waiting').notNull(),
	current_question: jsonb('current_question'),
	current_answers: text('current_answers').array(),
	question_ends_at: bigint('question_ends_at', { mode: 'number' }),
	paused_remaining: integer('paused_remaining')
});

// Bewusst kein FK auf roomTable: Antworten überleben das Löschen des Raums.
export const answerTable = pgTable(
	'answer',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		room_id: text('room_id').notNull(),
		quiz_id: uuid('quiz_id')
			.references(() => quizTable.id)
			.notNull(),
		question_id: uuid('question_id').notNull(),
		student_id: text('student_id').notNull(),
		student_name: text('student_name').notNull(),
		selected: text('selected').array().notNull(),
		answered_at: timestamp('answered_at', { mode: 'string' }).defaultNow().notNull()
	},
	(table) => [unique().on(table.room_id, table.question_id, table.student_id)]
);

export const roomRelations = relations(roomTable, ({ one }) => ({
	quiz: one(quizTable, { fields: [roomTable.quiz], references: [quizTable.id] })
}));
