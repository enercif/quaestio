import { evaluateAnswer, hasPartialScoring } from '$lib/components/quiz/quiz.utils';
import type { AnalyticsQuizQuestion } from '$lib/schemas/analytics.schema';

export function correctToArray(question: AnalyticsQuizQuestion): string[] {
	switch (question.type) {
		case 'open':
		case 'programming':
			return question.correct;
		case 'single':
		case 'multiple':
			return Object.values(question.correct);
	}
}

export function answerAccuracy(question: AnalyticsQuizQuestion, selected: string[]): number {
	const correct = correctToArray(question);
	if (correct.length === 0) return 0;
	if (question.type === 'open') {
		return evaluateAnswer('open', correct, selected) === 'correct' ? 1 : 0;
	}
	const hits = selected.filter((value) => correct.includes(value)).length;
	return hits / correct.length;
}

export function questionAccuracy(question: AnalyticsQuizQuestion, selections: string[][]): number {
	if (selections.length === 0) return 0;
	return (
		(selections.reduce((sum, selected) => sum + answerAccuracy(question, selected), 0) /
			selections.length) *
		100
	);
}

export function getAchievedPoints(question: AnalyticsQuizQuestion, selected: string[]): number {
	if (hasPartialScoring(question)) {
		const keys =
			question.type === 'multiple'
				? question.correct
				: Object.fromEntries(question.correct.map((line) => [line, line]));
		return Object.entries(keys).reduce(
			(sum, [key, value]) =>
				sum + (selected.includes(value) ? (question.partial_points[key] ?? 0) : 0),
			0
		);
	}
	const result = evaluateAnswer(question.type, correctToArray(question), selected);
	return result === 'correct' ? question.points : 0;
}
