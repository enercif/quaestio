import type { QuizInsert } from '$lib/schemas/quiz.schema';
import { quizInsertSchema } from '$lib/schemas/quiz.schema';

export type ImportFormat = 'csv' | 'xlsx';

export interface CsvQuestionRow {
	type: 'single' | 'multiple' | 'open' | 'programming';
	question: string;
	code?: string;
	options?: string;
	solution?: string;
	language?: string;
	hint?: string;
	reasons?: string;
	points?: string;
	timelimit?: string;
}

export function buildQuiz(
	rows: CsvQuestionRow[],
	filename?: string,
	format: ImportFormat = 'csv'
): QuizInsert {
	const questions = rows.map((row, index) => buildQuestion(row, index, format));

	return quizInsertSchema.parse({
		title: filename ? removeExtension(filename) : 'Importiertes Quiz',
		last_run: null,
		tags: [],
		questions,
		questions_length: questions.length
	});
}

function removeExtension(filename: string): string {
	return filename.replace(/\.(csv|xlsx?)$/i, '');
}

function buildQuestion(row: CsvQuestionRow, index: number, format: ImportFormat) {
	switch (row.type) {
		case 'single':
			return buildSingleQuestion(row, index);

		case 'multiple':
			return buildMultipleQuestion(row, index);

		case 'open':
			return buildOpenQuestion(row, index);

		case 'programming':
			return buildProgrammingQuestion(row, index, format);

		default:
			throw new Error(`Unbekannter Fragentyp: ${row.type}`);
	}
}

function buildSingleQuestion(row: CsvQuestionRow, index: number) {
	const answers = createAnswers(row.options);

	const correct = Object.fromEntries(
		answers
			.filter((answer) => parseList(row.solution).includes(answer.text))
			.map((answer) => [answer.id, answer.text] as const)
	);

	return {
		id: crypto.randomUUID(),
		position: index,
		type: 'single',
		question: row.question,
		points: parseNumber(row.points, 1),
		timelimit: parseNumber(row.timelimit, 30),
		hint: row.hint,
		sequence_type: 'numeric',
		answers,
		correct,
		reasons: row.reasons ?? ''
	};
}

function buildMultipleQuestion(row: CsvQuestionRow, index: number) {
	const answers = createAnswers(row.options);

	const correct = Object.fromEntries(
		answers
			.filter((answer) => parseList(row.solution).includes(answer.text))
			.map((answer) => [answer.id, answer.text] as const)
	);

	const reasons = parseReasons(row.reasons, answers)

	return {
		id: crypto.randomUUID(),
		position: index,
		type: 'multiple',
		question: row.question,
		points: parseNumber(row.points, 1),
		timelimit: parseNumber(row.timelimit, 30),
		hint: row.hint,
		sequence_type: 'numeric',
		answers,
		correct,
		reasons
	};
}

function buildOpenQuestion(row: CsvQuestionRow, index: number) {
	return {
		id: crypto.randomUUID(),
		position: index,
		type: 'open',
		question: row.question,
		points: parseNumber(row.points, 1),
		timelimit: parseNumber(row.timelimit, 30),
		hint: row.hint,
		correct: parseList(row.solution),
		reasons: row.reasons || undefined
	};
}

function buildProgrammingQuestion(row: CsvQuestionRow, index: number, format: ImportFormat) {
	return {
		id: crypto.randomUUID(),
		position: index,
		type: 'programming',
		question: row.question,
		code: format === 'csv' ? decodeBase64(row.code) : (row.code ?? ''),
		language: row.language ?? '',
		points: parseNumber(row.points, 1),
		timelimit: parseNumber(row.timelimit, 30),
		hint: row.hint,
		correct: parseList(row.solution),
		reasons: parseReasons(row.reasons)
	};
}

function createAnswers(options?: string) {
	return parseList(options).map((text, index) => ({
		id: crypto.randomUUID(),
		position: index,
		text
	}));
}

function parseList(value?: string): string[] {
	if (!value) return [];

	return value
		.split('|')
		.map((v) => v.trim())
		.filter(Boolean);
}

function parseReasons(
	value?: string,
	answers?: Array<{
		id: string;
		position: number;
		text: string;
	}>
): Record<string, string> {
	if (!value) return {};

	const reasons: Record<string, string> = {};

	for (const entry of value.split('|')) {
		const separator = entry.indexOf(':');
		if (separator === -1) continue;

		const key = entry.slice(0, separator).trim();
		const reason = entry.slice(separator + 1).trim();
		
		if (!key || !reason) continue;
		if (answers) {
			const answerNumber = Number(key);
			if (!Number.isInteger(answerNumber) || answerNumber < 1) {
				continue;
			}
			const answer = answers[answerNumber - 1];
			if (answer) {
				reasons[answer.id] = reason;
			}
		} else {
			reasons[key] = reason;
		}
	}
	return reasons;
}

function parseNumber(value: string | undefined, fallback: number): number {
	const trimmed = value?.trim();
	if (!trimmed) return fallback;
	const number = Number(trimmed);
	return Number.isFinite(number) ? number : fallback;
}

function decodeBase64(value?: string): string {
	if (!value) return '';
	return atob(value);
}
