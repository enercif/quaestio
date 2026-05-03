import z from 'zod';

const typeEnum = z.enum(['multiple', 'single', 'open']);
const sequenceTypeEnum = z.enum(['numeric', 'roman', 'alphabetic']);
const baseQuestionSettingsSchema = z.object({
	timelimit: z.number(),
	points: z.number(),
	type: typeEnum,
	prompt: z.string().min(1),
	position: z.number(),
	id: z.uuid()
});

const choiceQuestionSettingsSchema = baseQuestionSettingsSchema.extend({
	sequence_type: sequenceTypeEnum
});

export const questionAnswerSchema = z.object({
	text: z.string().min(1),
	position: z.number(),
	is_correct: z.boolean(),
	id: z.uuid()
});
export const multipleChoiceQuestionSchema = choiceQuestionSettingsSchema.extend({
	answers: z
		.array(questionAnswerSchema)
		.min(2)
		.refine((answers) => answers.filter((a) => a.is_correct).length >= 1, {
			message: 'Es muss mindestens eine richtige Antwort geben.'
		})
});
export const singleChoiceQuestionSchema = choiceQuestionSettingsSchema.extend({
	answers: z
		.array(questionAnswerSchema)
		.min(2)
		.refine((answers) => answers.filter((a) => a.is_correct).length === 1, {
			message: 'Es muss genau eine richtige Antwort geben.'
		})
});
export const openTextQuestionSchema = baseQuestionSettingsSchema.extend({
	keywords: z.array(z.string().min(1))
});
export const questionsSchema = z
	.array(
		z.union([multipleChoiceQuestionSchema, singleChoiceQuestionSchema, openTextQuestionSchema])
	)
	.min(1)
	.default([]);

export type QuestionType = z.infer<typeof typeEnum>;
export type SequenceType = z.infer<typeof sequenceTypeEnum>;
export type QuestionAnswer = z.infer<typeof questionAnswerSchema>;
export type MultipleChoiceQuestion = z.infer<typeof multipleChoiceQuestionSchema>;
export type SingleChoiceQuestion = z.infer<typeof singleChoiceQuestionSchema>;
export type OpenTextQuestion = z.infer<typeof openTextQuestionSchema>;
