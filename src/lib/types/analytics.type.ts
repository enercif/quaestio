import type { QuestionType } from '$lib/schemas/question.schema';

export type QuestionResult = {
	answerId: string | undefined;
	questionId: string;
	question: string;
	type: QuestionType;
	correct: string[];
	maxPoints: number;
	selected: string[];
	points: number;
	overridden: boolean;
	accuracy: number;
};
