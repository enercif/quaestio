import z from 'zod';
import { choiceQuestionShape } from './shared.question.schema';

const type = 'single';
const singleChoiceQuestionShape = choiceQuestionShape.extend({ type: z.literal(type) });

export const singleChoiceQuestionSchema = singleChoiceQuestionShape
	.refine((question) => question.correct.length === 1, {
		message: 'Es darf nur genau eine richtige Antwort geben.',
		path: ['correct']
	})
	.refine((question) => question.answers.some((a) => a.id === question.correct[0]), {
		message: 'Die korrekte Antwort muss eine gültige Antwort-ID sein.',
		path: ['correct']
	});

export const liveSingleChoiceQuestionSchema = singleChoiceQuestionShape.omit({ correct: true });

export type SingleChoiceQuestionType = typeof type;
export type SingleChoiceQuestion = z.infer<typeof singleChoiceQuestionSchema>;
export type LiveSingleChoiceQuestion = z.infer<typeof liveSingleChoiceQuestionSchema>;
