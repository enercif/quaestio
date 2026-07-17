import z from 'zod';
import {
	liveMultipleChoiceQuestionSchema,
	multipleChoiceQuestionSchema
} from './questions/multiple.question.schema';
import {
	liveOpenTextQuestionSchema,
	openTextQuestionSchema
} from './questions/open.question.schema';
import { programmingQuestionSchema } from './questions/programming.question.schema';
import { baseQuestionShape } from './questions/shared.question.schema';
import {
	liveSingleChoiceQuestionSchema,
	singleChoiceQuestionSchema
} from './questions/single.question.schema';

export const questionsSchema = z
	.discriminatedUnion('type', [
		multipleChoiceQuestionSchema,
		singleChoiceQuestionSchema,
		openTextQuestionSchema,
		programmingQuestionSchema
	])
	.array()
	.min(1, 'Es muss mindestens eine Frage vorhanden sein.')
	.default([]);

export const liveQuestionSchema = z.discriminatedUnion('type', [
	liveMultipleChoiceQuestionSchema,
	liveSingleChoiceQuestionSchema,
	liveOpenTextQuestionSchema
]);

export const questionAnswerKeySchema = baseQuestionShape.pick({ id: true, correct: true });

export type Question = z.infer<typeof questionsSchema>[number];
export type QuestionType = Question['type'];
export type LiveQuestion = z.infer<typeof liveQuestionSchema>;
export type QuestionAnswerKey = z.infer<typeof questionAnswerKeySchema>;

export * from './questions/multiple.question.schema';
export * from './questions/open.question.schema';
export * from './questions/programming.question.schema';
export * from './questions/shared.question.schema';
export * from './questions/single.question.schema';
