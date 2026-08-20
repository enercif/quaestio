import z from 'zod';
import {
	allOrNothingReasons,
	choiceQuestionBaseSchema,
	liveChoiceQuestionAnswerSchema,
	partialPointsSchema,
	scoringModeEnum
} from './shared.question.schema';

const type = 'multiple';
const multipleChoiceQuestionBaseSchema = choiceQuestionBaseSchema.extend({
	type: z.literal(type),
	reasons: z.record(z.string(), z.string()),
	scoring: scoringModeEnum.default('binary'),
	partial_points: partialPointsSchema.default({})
});

export const multipleChoiceQuestionSchema = multipleChoiceQuestionBaseSchema
	.refine((question) => allOrNothingReasons(Object.keys(question.correct), question.reasons), {
		message: 'Begründungen müssen für jede korrekte Antwort angegeben werden oder für gar keine',
		path: ['reasons']
	})
	.refine(
		(question) =>
			Object.keys(question.correct).every((key) =>
				question.answers.some((answer) => answer.id === key)
			),
		{ message: 'Jede korrekte Antwort muss eine gültige Antwort-ID sein.', path: ['correct'] }
	)
	.refine(
		(question) =>
			question.scoring !== 'partial' ||
			Object.keys(question.correct).every(
				(key) => typeof question.partial_points[key] === 'number'
			),
		{
			message: 'Jede korrekte Antwort benötigt eine Punktzahl.',
			path: ['partial_points']
		}
	);

export const liveMultipleChoiceQuestionSchema = multipleChoiceQuestionBaseSchema
	.omit({ correct: true, reasons: true, scoring: true, partial_points: true })
	.extend({ answers: z.array(liveChoiceQuestionAnswerSchema) });

export type MultipleChoiceQuestionType = typeof type;
export type MultipleChoiceQuestion = z.infer<typeof multipleChoiceQuestionSchema>;
export type LiveMultipleChoiceQuestion = z.infer<typeof liveMultipleChoiceQuestionSchema>;
