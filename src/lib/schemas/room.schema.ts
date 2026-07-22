import * as z from 'zod';
import { liveQuestionSchema } from './question.schema';
import { quizSelectSchema } from './quiz.schema';

const roomStateEnum = ['waiting', 'finished', 'question', 'answer'] as const;

const roomBaseSchema = z.object({
	code: z.string().length(6, 'Die Raum-ID muss genau 6 Zeichen lang sein.'),
	limit: z.number().nullish(),
	state: z.enum(roomStateEnum),
	current_question: liveQuestionSchema.nullish(),
	current_answers: z.array(z.string()).nullish(),
	current_reasons: z.array(z.string()).nullish(),
	question_ends_at: z.number().nullish(),
	paused_remaining: z.number().nullish()
});

export const roomSelectSchema = roomBaseSchema.extend({
	quiz: quizSelectSchema.pick({
		title: true,
		questions_length: true,
		id: true
	}),
	id: z.uuid()
});

export const roomInsertSchema = roomBaseSchema.extend({
	quiz: z.uuid('Die Quiz-ID muss eine gültige UUID sein.')
});

export enum RoomState {
	Waiting = 'waiting',
	Finished = 'finished',
	Question = 'question',
	Answer = 'answer'
}
export type Room = z.infer<typeof roomSelectSchema>;
export type RoomInsert = z.infer<typeof roomInsertSchema>;
