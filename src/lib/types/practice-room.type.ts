export type PracticeRoom = {
	current_question?: { position: number; timelimit: number } | null;
	quiz: { questions_length: number };
	paused_remaining?: number | null;
	question_ends_at?: number | null;
};

export type PracticeRoomState = 'question' | 'answer' | 'finished';
