import * as z from 'zod';
import { quizSelectSchema } from './quiz.schema';

const roomBaseSchema = z.object({
	id: z.string().length(6, 'Die Raum-ID muss genau 6 Zeichen lang sein.'),
	limit: z.number().nullish()
});

export const roomSelectSchema = roomBaseSchema.extend({
	teachers: z.record(z.string(), z.string()),
	quiz: quizSelectSchema.pick({
		title: true
	})
});

export const roomInsertSchema = roomBaseSchema.extend({
	quiz: z.uuid('Die Quiz-ID muss eine gültige UUID sein.')
});

export type Room = z.infer<typeof roomSelectSchema>;
export type RoomInsert = z.infer<typeof roomInsertSchema>;
