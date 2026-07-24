import { relations, sql } from 'drizzle-orm';
import {
	bigint,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	unique,
	uniqueIndex,
	uuid
} from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

// Singleton row (id = 'default'): eine Organisation, eine SMTP-Konfiguration.
export const smtpSettingsTable = pgTable('smtp_settings', {
	id: text('id').primaryKey().default('default'),
	host: text('host').notNull(),
	port: integer('port').notNull(),
	user: text('user'),
	pass: text('pass'),
	from: text('from'),
	updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull()
});

export const quizVisibilityEnum = pgEnum('quiz_visibility', ['private', 'public']);
export const quizTable = pgTable('quiz', {
	id: uuid('id').defaultRandom().primaryKey(),
	teacherId: text('teacher_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	last_run: timestamp('last_run', { mode: 'string', withTimezone: true }),
	tags: text('tags').array().notNull(),
	questions: jsonb('questions').notNull(),
	questions_length: integer('questions_length').notNull(),
	visibility: quizVisibilityEnum('visibility').notNull().default('public'),
	deleted_at: timestamp('deleted_at', { mode: 'string', withTimezone: true })
});

export const roomTable = pgTable(
	'room',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		code: text('code').notNull(),
		limit: integer('limit'),
		quiz: uuid('quiz_id')
			.references(() => quizTable.id)
			.notNull(),
		teacherId: text('teacher_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		state: text('state').default('waiting').notNull(),
		current_question: jsonb('current_question'),
		current_answers: text('current_answers').array(),
		current_reasons: text('current_reasons').array(),
		question_ends_at: bigint('question_ends_at', { mode: 'number' }),
		paused_remaining: integer('paused_remaining'),
		created_at: timestamp('created_at', { mode: 'string', withTimezone: true })
			.defaultNow()
			.notNull(),
		deleted_at: timestamp('deleted_at', { mode: 'string', withTimezone: true })
	},
	(table) => [
		uniqueIndex('room_code_active_unique')
			.on(table.code)
			.where(sql`${table.deleted_at} is null`)
	]
);

export const answerTable = pgTable(
	'answer',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		room_id: uuid('room_id')
			.references(() => roomTable.id)
			.notNull(),
		quiz_id: uuid('quiz_id')
			.references(() => quizTable.id)
			.notNull(),
		question_id: uuid('question_id').notNull(),
		student_id: text('student_id').notNull(),
		student_name: text('student_name').notNull(),
		selected: text('selected').array().notNull(),
		points_override: integer('points_override'),
		answered_at: timestamp('answered_at', { mode: 'string', withTimezone: true })
			.defaultNow()
			.notNull()
	},
	(table) => [unique().on(table.room_id, table.question_id, table.student_id)]
);

export const roomRelations = relations(roomTable, ({ one }) => ({
	quiz: one(quizTable, { fields: [roomTable.quiz], references: [quizTable.id] })
}));

export const answerRelations = relations(answerTable, ({ one }) => ({
	room: one(roomTable, { fields: [answerTable.room_id], references: [roomTable.id] })
}));

export * from './auth.schema';
