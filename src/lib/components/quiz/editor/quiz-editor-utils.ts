import { placeholders } from '$lib/placeholders';
import type { QuestionType, SequenceType } from '$lib/schemas/question.schema';

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

export function sequenceTypeToString(type: SequenceType) {
	switch (type) {
		case 'numeric':
			return 'Numerisch';
		case 'roman':
			return 'Römisch';
		case 'alphabetic':
			return 'Alphabetisch';
	}
}

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

export function getTimeAsString(seconds: number) {
	if (seconds === 0) return 'Keins';
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}s`;
}

export function hashUUID(uuid: string) {
	return uuid
		.replace(/-/g, '')
		.split('')
		.reduce((acc, char) => {
			return (acc * 31 + char.charCodeAt(0)) >>> 0;
		}, 0);
}

export function UUIDToPromptPlaceholder(uuid: string) {
	const hash = hashUUID(uuid);
	return placeholders[hash % placeholders.length].prompt;
}

export function UUIDToAnswerPlaceholder(uuid: string) {
	const hash = hashUUID(uuid);
	const answers = placeholders[hash % placeholders.length].answers;
	return answers[Math.floor(Math.random() * answers.length)];
}
