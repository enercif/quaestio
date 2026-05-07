import * as z from 'zod';
import { quizSelectSchema } from './quiz.schema';

const roomBaseSchema = z.object({
	id: z
		.string()
		.min(1, 'Die Raum-ID darf nicht leer sein.')
		.max(6, 'Die Raum-ID darf maximal 6 Zeichen lang sein.'),
	limit: z.number().optional()
});

export const roomSelectSchema = roomBaseSchema.extend({
	quiz: quizSelectSchema
});

export const roomInsertSchema = roomBaseSchema.extend({
	quiz: z.uuid('Die Quiz-ID muss eine gültige UUID sein.')
});

export type Room = z.infer<typeof roomSelectSchema>;
export type RoomInsert = z.infer<typeof roomInsertSchema>;
