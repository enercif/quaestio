import z from 'zod';
import { questionBaseSchema } from './shared.question.schema';

const type = 'open';
const openTextQuestionBaseSchema = questionBaseSchema.extend({
	type: z.literal(type),
	correct: z
		.array(z.string().min(1, 'Es muss mindestens eine richtige Antwort geben.'))
		.min(1, 'Es muss mindestens eine richtige Antwort geben.'),
	reasons: z.string().optional()
});

export const openTextQuestionSchema = openTextQuestionBaseSchema;

export const liveOpenTextQuestionSchema = openTextQuestionBaseSchema.omit({
	correct: true,
	reasons: true
});

export type OpenQuestionType = typeof type;
export type OpenTextQuestion = z.infer<typeof openTextQuestionSchema>;
export type LiveOpenTextQuestion = z.infer<typeof liveOpenTextQuestionSchema>;
