import type { Quiz } from '$lib/schemas/quiz.schema';

export type Room = {
	id: string;
	limit?: number;
	quiz: Quiz;
};
