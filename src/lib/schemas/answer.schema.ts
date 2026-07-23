import * as z from 'zod';

export const answerSelectSchema = z.object({
	id: z.uuid(),
	room_id: z.uuid(),
	quiz_id: z.uuid(),
	question_id: z.uuid(),
	student_id: z.string(),
	student_name: z.string(),
	selected: z.array(z.string()),
	points_override: z.number().nullable()
});

export const answerSubmitSchema = z.array(z.string().min(1)).max(50);

export type Answer = z.infer<typeof answerSelectSchema>;
