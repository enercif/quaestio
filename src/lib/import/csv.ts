import Papa from 'papaparse';

import { buildQuiz, type CsvQuestionRow } from './builder';
import type { QuizInsert } from '$lib/schemas/quiz.schema';

export async function parseCsv(file: File, filename: string): Promise<QuizInsert> {
	return new Promise((resolve, reject) => {
		Papa.parse<CsvQuestionRow>(file, {
			header: true,
			skipEmptyLines: true,
			complete(result) {
				try {
					if (result.errors.length > 0) {
						console.error(result.errors);
						reject(new Error('Die CSV enthält ungültige Zeilen'));
						return;
					}
					const quiz = buildQuiz(result.data, filename, 'csv');
					resolve(quiz);
				} catch (error) {
					reject(error);
				}
			},

			error(error) {
				reject(error);
			}
		});
	});
}
