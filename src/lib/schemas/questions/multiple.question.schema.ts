import z from 'zod';
import { choiceQuestionShape } from './shared.question.schema';

const type = 'multiple';
const multipleChoiceQuestionShape = choiceQuestionShape.extend({ type: z.literal(type) });

export const multipleChoiceQuestionSchema = multipleChoiceQuestionShape.refine(
	(question) => question.correct.every((id) => question.answers.some((a) => a.id === id)),
	{ message: 'Jede korrekte Antwort muss eine gültige Antwort-ID sein.', path: ['correct'] }
);

export const liveMultipleChoiceQuestionSchema = multipleChoiceQuestionShape.omit({ correct: true });

export type MultipleChoiceQuestionType = typeof type;
export type MultipleChoiceQuestion = z.infer<typeof multipleChoiceQuestionSchema>;
export type LiveMultipleChoiceQuestion = z.infer<typeof liveMultipleChoiceQuestionSchema>;
