import { getQuestionMaxPoints } from '$lib/components/quiz/quiz.utils';
import type { AnalyticsStudent } from '$lib/schemas/analytics.schema';
import type { AnalyticsQuestion, AnalyticsStudentStateRoom } from '$lib/types/analytics.type';
import { Context } from 'runed';
import { SvelteDate, SvelteMap } from 'svelte/reactivity';
import { getAchievedPoints } from '../analytics.utils';

export const analyticsStudentContext = new Context<AnalyticsStudentState>('analytics-student-ctx');

export class AnalyticsStudentState {
	_analytics: () => AnalyticsStudent;

	constructor(analytics: () => AnalyticsStudent) {
		this._analytics = analytics;
	}

	readonly name = $derived.by(() => this._analytics().name);
	readonly rooms = $derived.by(() => {
		const byId = new SvelteMap<string, AnalyticsStudentStateRoom>();

		for (const room of this._analytics().rooms) {
			if (byId.has(room.id)) continue;

			const questions: AnalyticsQuestion[] = room.quiz.questions.map((question) => {
				const answer = room.answers.find((a) => a.question_id === question.id);
				const achievedPoints = answer
					? (answer.points_override ?? getAchievedPoints(question, answer.selected))
					: 0;
				const maxPoints = getQuestionMaxPoints(question);
				return {
					id: question.id,
					achievedPoints,
					maxPoints,
					selected: answer?.selected ?? [],
					answerId: answer?.id ?? undefined,
					overridden: answer?.points_override !== null
				};
			});

			byId.set(room.id, {
				id: room.id,
				code: room.code,
				created_at: room.created_at,
				quiz: room.quiz,
				questions
			});
		}

		return [...byId.values()].toSorted(
			(a, b) => new SvelteDate(b.created_at).getTime() - new SvelteDate(a.created_at).getTime()
		);
	});
}
