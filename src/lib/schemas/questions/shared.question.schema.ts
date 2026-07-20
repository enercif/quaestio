import z from 'zod';

export const sequenceTypeEnum = z.enum(['numeric', 'roman', 'alphabetic']);

export const questionBaseSchema = z.object({
	id: z.uuid(),
	position: z.number(),
	timelimit: z.number().min(0, 'Das Zeitlimit muss größer gleich 0 sein.'),
	points: z
		.number('Punkte dürfen nicht leer sein.')
		.min(0, 'Punkte müssen größer oder gleich 0 sein.'),
	question: z.string().min(1, 'Die Fragenstellung darf nicht leer sein.'),
	hint: z.string().optional()
});

export const choiceQuestionAnswerBaseSchema = z.object({
	id: z.uuid(),
	text: z.string().min(1, 'Die Antwort darf nicht leer sein.')
});

export const choiceQuestionBaseSchema = questionBaseSchema.extend({
	sequence_type: sequenceTypeEnum,
	answers: z
		.array(choiceQuestionAnswerBaseSchema)
		.min(2, 'Es müssen mindestens zwei Antwortmöglichkeiten vorhanden sein.'),
	correct: z.record(z.string(), z.string()).refine((correct) => Object.keys(correct).length > 0, {
		message: 'Es muss mindestens eine korrekte Antwort markiert sein.'
	})
});

export function allOrNothingReasons(keys: string[], reasons: Record<string, string>) {
	return Object.keys(reasons).length > 0 ? keys.every((key) => reasons[key]?.trim()) : true;
}

export type SequenceType = z.infer<typeof sequenceTypeEnum>;
export type ChoiceQuestionAnswer = z.infer<typeof choiceQuestionAnswerBaseSchema>;
