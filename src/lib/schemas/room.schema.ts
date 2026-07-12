import * as z from 'zod';
import { quizSelectSchema } from './quiz.schema';

const roomBaseSchema = z.object({
	id: z.string().length(6, 'Die Raum-ID muss genau 6 Zeichen lang sein.'),
	limit: z.number().nullish(),
	state: z.string()
});

export const roomSelectSchema = roomBaseSchema.extend({
	quiz: quizSelectSchema.pick({
		title: true,
		questions_length: true
	})
});

export const roomInsertSchema = roomBaseSchema.extend({
	quiz: z.uuid('Die Quiz-ID muss eine gültige UUID sein.')
});

export type Room = z.infer<typeof roomSelectSchema>;
export type RoomInsert = z.infer<typeof roomInsertSchema>;
