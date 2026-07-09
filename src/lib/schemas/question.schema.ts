import z from 'zod';

const typeEnum = z.enum(['multiple', 'single', 'open', 'programming']);
const sequenceTypeEnum = z.enum(['numeric', 'roman', 'alphabetic']);
const baseQuestionSettingsSchema = z.object({
	timelimit: z.number(),
	points: z
		.number('Punkte dürfen nicht leer sein.')
		.min(0, 'Punkte müssen größer oder gleich 0 sein.'),
	type: typeEnum,
	prompt: z.string().min(1, 'Die Fragenstellung darf nicht leer sein.'),
	position: z.number(),
	id: z.uuid()
});

const choiceQuestionSettingsSchema = baseQuestionSettingsSchema.extend({
	sequence_type: sequenceTypeEnum
});

export const questionAnswerSchema = z.object({
	text: z.string().min(1, 'Die Antwort darf nicht leer sein.'),
	position: z.number(),
	is_correct: z.boolean(),
	id: z.uuid()
});
export const multipleChoiceQuestionSchema = choiceQuestionSettingsSchema.extend({
	answers: z
		.array(questionAnswerSchema)
		.min(2, 'Es müssen mindestens zwei Antwortmöglichkeiten vorhanden sein.')
		.refine((answers) => answers.filter((a) => a.is_correct).length >= 1, {
			message: 'Es muss mindestens eine richtige Antwort geben.'
		})
});
export const singleChoiceQuestionSchema = choiceQuestionSettingsSchema.extend({
	answers: z
		.array(questionAnswerSchema)
		.min(2, 'Es müssen mindestens zwei Antwortmöglichkeiten vorhanden sein.')
		.refine((answers) => answers.filter((a) => a.is_correct).length === 1, {
			message: 'Es muss genau eine richtige Antwort geben.'
		})
});
export const openTextQuestionSchema = baseQuestionSettingsSchema.extend({
	keywords: z.array(z.string()).min(1, 'Keywords dürfen nicht leer sein.')
});

export const programmingQuestionSchema = baseQuestionSettingsSchema.extend({
	description: z.string().min(1, 'Die Beschreibung darf nicht leer sein.'),
	code_snippet: z.string().min(1, 'Der Code darf nicht leer sein.'),
	language: z.string(),
	correct_lines: z.array(z.number())
		.min(1, 'Es muss mindestens eine Zeile als Lösung markiert sein.'),
	reasons: z.record(z.number(), z.string()),
	hint: z.string().optional()
}).refine((data) => {
	return data.correct_lines.every(lineNumber => {
		const reason = data.reasons[lineNumber];
		return reason !== undefined && reason.trim() !== '';
	});
}, {
	message: 'Für jede markierte Fehler-Zeile muss eine Begründung (reason) angegeben werden.',
	path: ['reasons']
});

export const questionsSchema = z
	.array(
		z.union([multipleChoiceQuestionSchema, singleChoiceQuestionSchema, openTextQuestionSchema, programmingQuestionSchema])
	)
	.min(1, 'Es muss mindestens eine Frage vorhanden sein.')
	.default([]);

export type QuestionType = z.infer<typeof typeEnum>;
export type SequenceType = z.infer<typeof sequenceTypeEnum>;
export type QuestionAnswer = z.infer<typeof questionAnswerSchema>;
export type MultipleChoiceQuestion = z.infer<typeof multipleChoiceQuestionSchema>;
export type SingleChoiceQuestion = z.infer<typeof singleChoiceQuestionSchema>;
export type OpenTextQuestion = z.infer<typeof openTextQuestionSchema>;
export type ProgrammingQuestion = z.infer<typeof programmingQuestionSchema>;
