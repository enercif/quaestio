import type { QuestionType, SequenceType } from '$lib/schemas/question.schema';
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

/** Reaktive aktuelle Zeit — tickt nur, solange sie in einem Effect/Template gelesen wird. */
export function liveNow() {
	subscribeNow();
	return now;
}

/** Restzeit der aktuellen Frage in ms; eingefroren bei Pause, null ohne Timer. */
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
		const given = (selected[0] ?? '').trim().toLowerCase();
		return correct.some((c) => c.trim().toLowerCase() === given) ? 'correct' : 'wrong';
	}
	const hits = selected.filter((id) => correct.includes(id)).length;
	if (hits === correct.length && selected.length === correct.length) return 'correct';
	if (hits === 0) return 'wrong';
	return 'partial';
}

export function typeToBadge(type: QuestionType) {
	switch (type) {
		case 'multiple':
			return 'Multiple Choice';
		case 'single':
			return 'Single Choice';
		case 'open':
			return 'Open Text';
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
	}
}
