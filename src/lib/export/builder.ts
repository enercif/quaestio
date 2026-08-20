import type { Quiz } from '$lib/schemas/quiz.schema';

export type ExportFormat = 'csv' | 'xlsx';

export interface ExportQuestionRow {
	type: string;
	question: string;
	code: string;
	options: string;
	solution: string;
	language: string;
	hint: string;
	reasons: string;
	points: number;
	timelimit: number;
}

export function buildExportRows(
	quiz: Quiz,
	format: ExportFormat = 'csv'
): ExportQuestionRow[] {
	return quiz.questions.map((question) => {
		switch (question.type) {
			case 'single':
				return {
					type: 'single',
					question: question.question,
					code: '',
					options: question.answers.map((a) => a.text).join('|'),
					solution: getCorrectAnswers(
						question.answers,
						question.correct
					).join('|'),
					language: '',
					hint: question.hint ?? '',
					reasons: question.reasons ?? '',
					points: question.points,
					timelimit: question.timelimit
				};

			case 'multiple':
				return {
					type: 'multiple',
					question: question.question,
					code: '',
					options: question.answers.map((a) => a.text).join('|'),
					solution: getCorrectAnswers(
						question.answers,
						question.correct
					).join('|'),
					language: '',
					hint: question.hint ?? '',
					reasons: buildReasons(question.answers, question.reasons),
					points: question.points,
					timelimit: question.timelimit
				};

			case 'open':
				return {
					type: 'open',
					question: question.question,
					code: '',
					options: '',
					solution: question.correct.join('|'),
					language: '',
					hint: question.hint ?? '',
					reasons: question.reasons ?? '',
					points: question.points,
					timelimit: question.timelimit
				};

			case 'programming':
				return {
					type: 'programming',
					question: question.question,
					code:
						format === 'csv'
							? btoa(question.code)
							: question.code,
					options: '',
					solution: question.correct.join('|'),
					language: question.language,
					hint: question.hint ?? '',
					reasons: Object.entries(question.reasons)
						.map(([key, value]) => `${key}:${value}`)
						.join('|'),
					points: question.points,
					timelimit: question.timelimit
				};
		}
	});
}

function getCorrectAnswers(
	answers: { id: string; text: string }[],
	correct: Record<string, string>
) {
	return answers
		.filter((answer) => answer.id in correct)
		.map((answer) => answer.text);
}

function buildReasons(
	answers: { id: string; text: string }[],
	reasons: Record<string, string>
): string {
	return Object.entries(reasons)
		.map(([answerId, reason]) => {
			const answerIndex = answers.findIndex(
				(answer) => answer.id === answerId
			);
			if (answerIndex === -1) {
				return null;
			}
			return `${answerIndex + 1}:${reason}`;
		})
		.filter((entry): entry is string => entry !== null)
		.join('|');
}