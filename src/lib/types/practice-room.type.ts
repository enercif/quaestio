import type { LiveQuestion } from '$lib/schemas/question.schema';

export type PracticeRoom = {
	current_question?: { position: number; timelimit: number } | null;
	quiz: { questions_length: number };
	paused_remaining?: number | null;
	question_ends_at?: number | null;
};

export type PracticeRoomState = 'question' | 'answer' | 'finished';

export type QuestionRoomView = PracticeRoom & {
	current_question?: LiveQuestion | null;
	state: string;
	current_answers?: string[] | null;
	current_reasons?: string[] | null;
};
