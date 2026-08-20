import type { AnalyticsRoom } from '$lib/schemas/analytics.schema';
import type { AnalyticsRoomStateStudent } from '$lib/types/analytics.type';
import { Context } from 'runed';
import { SvelteMap } from 'svelte/reactivity';
import { getQuestionMaxPoints } from '../../quiz/quiz.utils';
import { getAchievedPoints, questionAccuracy } from '../analytics.utils';

export const analyticsRoomContext = new Context<AnalyticsRoomState>('analytics-room-ctx');

export class AnalyticsRoomState {
	_analytics: () => AnalyticsRoom;

	constructor(analytics: () => AnalyticsRoom) {
		this._analytics = analytics;
	}

	readonly room = $derived.by(() => this._analytics().room);
	readonly quiz = $derived.by(() => this._analytics().quiz);
	readonly answers = $derived.by(() => this._analytics().answers);

	readonly maxPoints = $derived(
		this.quiz.questions.reduce((sum, q) => sum + getQuestionMaxPoints(q), 0)
	);

	readonly questions = $derived(
		this.quiz.questions
			.map((question) => {
				const selected = this.answers
					.filter((a) => a.question_id === question.id)
					.map((a) => a.selected);
				return {
					id: question.id,
					question: question.question,
					position: question.position,
					maxPoints: getQuestionMaxPoints(question),
					selected,
					accuracy: questionAccuracy(question, selected)
				};
			})
			.toSorted((a, b) => a.position - b.position)
	);

	readonly students = $derived.by(() => {
		const byId = new SvelteMap<string, AnalyticsRoomStateStudent>();

		for (const answer of this.answers) {
			const question = this.quiz.questions.find((q) => q.id === answer.question_id);
			if (!question) continue;

			const achievedPoints = answer.points_override ?? getAchievedPoints(question, answer.selected);
			const maxPoints = getQuestionMaxPoints(question);
			const student: AnalyticsRoomStateStudent = byId.get(answer.student_id) ?? {
				id: answer.student_id,
				name: answer.student_name,
				totalPoints: 0,
				questions: []
			};

			student.totalPoints += achievedPoints;
			student.questions.push({
				id: answer.question_id,
				achievedPoints,
				maxPoints,
				selected: answer.selected,
				answerId: answer.id,
				overridden: !!answer.points_override
			});
			byId.set(answer.student_id, student);
		}

		for (const student of byId.values()) {
			const unansweredQuestions = this.quiz.questions.filter(
				(q) => !student.questions.some((a) => a.id === q.id)
			);

			for (const question of unansweredQuestions) {
				student.questions.push({
					id: question.id,
					achievedPoints: 0,
					maxPoints: getQuestionMaxPoints(question),
					selected: [],
					answerId: undefined,
					overridden: false
				});
			}
		}

		return [...byId.values()].toSorted((a, b) => a.name.localeCompare(b.name));
	});
}
