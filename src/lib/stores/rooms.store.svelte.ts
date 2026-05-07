import type { Quiz } from '$lib/schemas/quiz.schema';

type Room = {
	id: string;
	limit?: number;
	quiz: Quiz;
};

export const roomsStore = $state<Room[]>([]);
