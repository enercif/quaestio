import * as XLSX from 'xlsx';
import type { Quiz } from '$lib/schemas/quiz.schema';
import { buildExportRows } from './builder';

export function exportQuizAsXlsx(quiz: Quiz) {
	const rows = buildExportRows(quiz, 'xlsx');

	const worksheet = XLSX.utils.json_to_sheet(rows);

	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Quiz');

	XLSX.writeFile(workbook, `${quiz.title}.xlsx`);
}