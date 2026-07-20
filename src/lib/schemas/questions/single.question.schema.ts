import z from 'zod';
import { choiceQuestionBaseSchema } from './shared.question.schema';

const type = 'single';
const singleChoiceQuestionBaseSchema = choiceQuestionBaseSchema.extend({
	type: z.literal(type),
	reasons: z.string()
});

export const singleChoiceQuestionSchema = singleChoiceQuestionBaseSchema
	.refine((question) => Object.entries(question.correct).length === 1, {
		message: 'Es darf nur genau eine richtige Antwort geben.',
		path: ['correct']
	})
	.refine(
		(question) =>
			Object.keys(question.correct).every((key) =>
				question.answers.some((answer) => answer.id === key)
			),
		{ message: 'Jede korrekte Antwort muss eine gültige Antwort-ID sein.', path: ['correct'] }
	);

export const liveSingleChoiceQuestionSchema = singleChoiceQuestionBaseSchema.omit({
	correct: true,
	reasons: true
});

export type SingleChoiceQuestionType = typeof type;
export type SingleChoiceQuestion = z.infer<typeof singleChoiceQuestionSchema>;
export type LiveSingleChoiceQuestion = z.infer<typeof liveSingleChoiceQuestionSchema>;
