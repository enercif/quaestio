import Papa from 'papaparse';
import type { Quiz } from '$lib/schemas/quiz.schema';
import { buildExportRows } from './builder';

export function exportQuizAsCsv(quiz: Quiz) {
	downloadCsv(buildExportRows(quiz), `${sanitizeFilename(quiz.title)}.csv`);
}

export function downloadCsv<T extends object>(rows: T[], filename: string) {
	const csv = Papa.unparse(rows, { header: true });
	const type = 'text/csv;charset=utf-8;';
	const blob = new Blob([csv], { type });

	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}

export function sanitizeFilename(name: string) {
	return name.replace(/[^a-z0-9-_]/gi, '_').toLowerCase();
}
