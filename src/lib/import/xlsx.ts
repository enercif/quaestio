import * as XLSX from 'xlsx';

import { buildQuiz, type CsvQuestionRow } from './builder';
import type { QuizInsert } from '$lib/schemas/quiz.schema';

export async function parseXlsx(file: File): Promise<QuizInsert> {
	const buffer = await file.arrayBuffer();

	const workbook = XLSX.read(buffer, {
		type: 'array'
	});

	const sheetName = workbook.SheetNames[0];

	if (!sheetName) {
		throw new Error('Die XLSX-Datei enthält kein Tabellenblatt.');
	}

	const worksheet = workbook.Sheets[sheetName];

	const rows = XLSX.utils.sheet_to_json<CsvQuestionRow>(worksheet, {
		header: 0,
		defval: '',
		raw: false
	});

	if (rows.length === 0) {
		throw new Error('Die XLSX-Datei enthält keine Fragen.');
	}

	return buildQuiz(rows, file.name, 'xlsx');
}
