import z from 'zod';
import { questionBaseSchema } from './shared.question.schema';

const type = 'open';
const openTextQuestionBaseSchema = questionBaseSchema.extend({ type: z.literal(type) });

export const openTextQuestionSchema = openTextQuestionBaseSchema;

export const liveOpenTextQuestionSchema = openTextQuestionBaseSchema.omit({ correct: true });

export type OpenQuestionType = typeof type;
export type OpenTextQuestion = z.infer<typeof openTextQuestionSchema>;
export type LiveOpenTextQuestion = z.infer<typeof liveOpenTextQuestionSchema>;
