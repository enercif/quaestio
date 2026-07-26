import type { AnalyticsQuiz } from '$lib/schemas/analytics.schema';

export type AnalyticsQuestion = {
	id: string;
	achievedPoints: number;
	maxPoints: number;
	selected: string[];
	answerId: string;
	overridden: boolean;
};

export type AnalyticsStudentStateRoom = {
	id: string;
	code: string;
	created_at: string;
	quiz: AnalyticsQuiz;
	questions: AnalyticsQuestion[];
};

export type AnalyticsRoomStateStudent = {
	id: string;
	name: string;
	totalPoints: number;
	questions: AnalyticsQuestion[];
};
