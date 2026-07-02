import * as z from 'zod';
import { questionsSchema } from './question.schema';

const quizBaseSchema = z.object({
	title: z.string().min(1, 'Der Titel darf nicht leer sein.'),
	last_run: z.string().nullish(),
	tags: z.array(z.string()),
	questions: questionsSchema
});

export const quizSelectSchema = quizBaseSchema.extend({
	id: z.uuid()
});
export const quizInsertSchema = quizBaseSchema;
export const quizUpdateSchema = quizBaseSchema.extend({
	id: z.uuid()
});

export type Quiz = z.infer<typeof quizSelectSchema>;
export type QuizInsert = z.infer<typeof quizInsertSchema>;
export type QuizUpdate = z.infer<typeof quizUpdateSchema>;
