import {
	evaluateAnswer,
	hasPartialScoring,
	questionMaxPoints
} from '$lib/components/quiz/quiz.utils';
import type { Answer } from '$lib/schemas/answer.schema';
import type { Question } from '$lib/schemas/question.schema';
import type { QuestionResult } from '$lib/types/analytics.type';

export function correctAnswersFor(question: Question): string[] {
	switch (question.type) {
		case 'open':
			return question.correct;
		case 'single':
		case 'multiple':
			return Object.values(question.correct);
		case 'programming':
			return question.correct.map(String);
	}
}

export function answerAccuracy(question: Question, selected: string[]): number {
	const correct = correctAnswersFor(question);
	if (correct.length === 0) return 0;
	if (question.type === 'open') {
		return evaluateAnswer('open', correct, selected) === 'correct' ? 1 : 0;
	}
	const hits = selected.filter((value) => correct.includes(value)).length;
	return hits / correct.length;
}

/** Ø `answerAccuracy` über mehrere Selections, in Prozent. */
export function questionAccuracy(question: Question, selections: string[][]): number {
	if (selections.length === 0) return 0;
	return (
		(selections.reduce((sum, selected) => sum + answerAccuracy(question, selected), 0) /
			selections.length) *
		100
	);
}

export function computedPoints(question: Question, selected: string[]): number {
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
	const result = evaluateAnswer(question.type, correctAnswersFor(question), selected);
	return result === 'correct' ? question.points : 0;
}

export function questionResultsFor(questions: Question[], answers: Answer[]): QuestionResult[] {
	return questions.map((question) => {
		const answer = answers.find((a) => a.question_id === question.id);
		const selected = answer?.selected ?? [];
		const auto = answer ? computedPoints(question, selected) : 0;
		return {
			answerId: answer?.id,
			questionId: question.id,
			question: question.question,
			type: question.type,
			correct: correctAnswersFor(question),
			maxPoints: questionMaxPoints(question),
			selected,
			points: answer?.points_override ?? auto,
			overridden: answer?.points_override != null,
			accuracy: answerAccuracy(question, selected) * 100
		};
	});
}
