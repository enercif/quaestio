import * as z from 'zod';
import { questionsSchema } from './question.schema';

export const quizBaseSchema = z.object({
	title: z.string().min(1, 'Der Titel darf nicht leer sein.'),
	last_run: z.string().nullish(),
	tags: z.array(z.string()),
	questions: questionsSchema,
	questions_length: z.number().positive('Die Anzahl der Fragen muss größer als 0 sein.'),
	visibility: z.enum(['private', 'public']).default('public'),
	practice_room: z.boolean().default(false)
});

const practiceRequiresPublicVisibility = {
	message: 'Ein Übungsraum-Quiz muss öffentlich sein.',
	path: ['practice_room']
};
function practiceRequiresPublic(quiz: { practice_room: boolean; visibility: string }) {
	return !quiz.practice_room || quiz.visibility === 'public';
}

export const quizSelectSchema = quizBaseSchema.extend({
	id: z.uuid(),
	teacherId: z.string()
});
export const quizInsertSchema = quizBaseSchema.refine(
	practiceRequiresPublic,
	practiceRequiresPublicVisibility
);
export const quizUpdateSchema = quizBaseSchema
	.extend({ id: z.uuid() })
	.refine(practiceRequiresPublic, practiceRequiresPublicVisibility);

export type Quiz = z.infer<typeof quizSelectSchema>;
export type QuizInsert = z.infer<typeof quizInsertSchema>;
export type QuizUpdate = z.infer<typeof quizUpdateSchema>;
