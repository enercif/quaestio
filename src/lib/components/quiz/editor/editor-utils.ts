import { questionPlaceholders } from '$lib/placeholders';
import type { SequenceType } from '$lib/schemas/question.schema';

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

export function getTimeAsString(seconds: number) {
	if (seconds === 0) return 'Keins';
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}s`;
}

export function hashUUID(uuid: string) {
	return parseInt(uuid.replace(/-/g, '').slice(0, 8), 16);
}

export function UUIDToPromptPlaceholder(uuid: string) {
	const hash = hashUUID(uuid);
	return questionPlaceholders[hash % questionPlaceholders.length].prompt;
}

export function UUIDToAnswerPlaceholder(uuid: string) {
	const hash = hashUUID(uuid);
	const answers = questionPlaceholders[hash % questionPlaceholders.length].answers;
	return answers[Math.floor(Math.random() * answers.length)];
}
