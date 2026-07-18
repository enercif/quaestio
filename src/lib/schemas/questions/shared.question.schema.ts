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
	correct: z
		.array(z.string().min(1, 'Die Antwort darf nicht leer sein.'))
		.min(1, 'Es muss mindestens eine richtige Antwort geben.')
});

export const choiceQuestionAnswerBaseSchema = z.object({
	id: z.uuid(),
	text: z.string().min(1, 'Die Antwort darf nicht leer sein.'),
	position: z.number()
});

export const choiceQuestionBaseSchema = questionBaseSchema.extend({
	sequence_type: sequenceTypeEnum,
	answers: z
		.array(choiceQuestionAnswerBaseSchema)
		.min(2, 'Es müssen mindestens zwei Antwortmöglichkeiten vorhanden sein.')
});

export type SequenceType = z.infer<typeof sequenceTypeEnum>;
export type ChoiceQuestionAnswer = z.infer<typeof choiceQuestionAnswerBaseSchema>;
