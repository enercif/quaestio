import z from 'zod';
import { baseQuestionShape } from './shared.question.schema';

const type = 'open';
const openTextQuestionShape = baseQuestionShape.extend({ type: z.literal(type) });

export const openTextQuestionSchema = openTextQuestionShape;

export const liveOpenTextQuestionSchema = openTextQuestionShape.omit({ correct: true });

export type OpenQuestionType = typeof type;
export type OpenTextQuestion = z.infer<typeof openTextQuestionSchema>;
export type LiveOpenTextQuestion = z.infer<typeof liveOpenTextQuestionSchema>;
