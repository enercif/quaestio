import type {
	MultipleChoiceQuestion,
	ProgrammingQuestion,
	Question,
	QuestionType,
	SequenceType
} from '$lib/schemas/question.schema';
import type { Room } from '$lib/schemas/room.schema';
import { createSubscriber } from 'svelte/reactivity';

export function indexToSequence(index: number, type: SequenceType) {
	switch (type) {
		case 'numeric':
			return (index + 1).toString();
		case 'roman':
			return toRoman(index + 1);
		case 'alphabetic':
			return String.fromCharCode(65 + index);
	}

	function toRoman(num: number): string {
		if (num <= 0 || num > 3999) throw new RangeError('Number must be between 1 and 3999');

		const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
		const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];

		let result = '';
		for (let i = 0; i < values.length; i++) {
			while (num >= values[i]) {
				result += symbols[i];
				num -= values[i];
			}
		}
		return result;
	}
}

let now = Date.now();
const subscribeNow = createSubscriber((update) => {
	const interval = setInterval(() => {
		now = Date.now();
		update();
	}, 250);
	return () => clearInterval(interval);
});

function liveNow() {
	subscribeNow();
	return now;
}

export function remainingMs(room: Room): number | null {
	// paused_remaining -1 = pausiert ohne Timelimit
	if (room.paused_remaining != null)
		return room.paused_remaining >= 0 ? room.paused_remaining : null;
	if (room.question_ends_at != null) return Math.max(0, room.question_ends_at - liveNow());
	return null;
}

export function formatRemaining(ms: number) {
	const s = Math.ceil(ms / 1000);
	return s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : `${s}s`;
}

export type AnswerResult = 'correct' | 'partial' | 'wrong';

export const resultClass: Record<AnswerResult, string> = {
	correct: 'border-green-500 bg-green-500/10',
	partial: 'border-yellow-500 bg-yellow-500/10',
	wrong: 'border-destructive bg-destructive/10'
};

export function evaluateAnswer(
	type: QuestionType,
	correct: string[],
	selected: string[]
): AnswerResult {
	if (type === 'open') {
		let matched = false;
		const given = (selected[0] ?? '').trim().toLowerCase();
		correct.forEach((c) => {
			if (given.includes(c.trim().toLowerCase())) matched = true;
		});
		return matched ? 'correct' : 'wrong';
	}
	const hits = selected.filter((answer) => correct.includes(answer)).length;
	if (hits === correct.length && selected.length === correct.length) return 'correct';
	if (hits === 0) return 'wrong';
	return 'partial';
}

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

export function questionMaxPoints(question: Question): number {
	if (hasPartialScoring(question)) {
		return Object.values(question.partial_points).reduce((sum, p) => sum + p, 0);
	}
	return question.points;
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

function hasPartialScoring(
	question: Question
): question is (MultipleChoiceQuestion | ProgrammingQuestion) & { scoring: 'partial' } {
	return (
		(question.type === 'multiple' || question.type === 'programming') &&
		question.scoring === 'partial'
	);
}

export function typeToBadge(type: QuestionType) {
	switch (type) {
		case 'multiple':
			return 'Multiple Choice';
		case 'single':
			return 'Single Choice';
		case 'open':
			return 'Open Text';
		case 'programming':
			return 'Coding';
	}
}

export function typeToDescription(type: QuestionType) {
	switch (type) {
		case 'multiple':
			return 'Wähle eine oder mehrere Antworten aus.';
		case 'single':
			return 'Wähle genau eine Antwort aus.';
		case 'open':
			return 'Gib deine Antwort als Text ein.';
		case 'programming':
			return 'Markiere die fehlerhaften Zeilen im Code.';
	}
}
