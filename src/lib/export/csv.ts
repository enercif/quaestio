import Papa from 'papaparse';
import type { Quiz } from '$lib/schemas/quiz.schema';
import { buildExportRows } from './builder';

export function exportQuizAsCsv(quiz: Quiz) {
	const csv = Papa.unparse(
		buildExportRows(quiz),
		{
            header: true
		}
	);

	download(
		csv,
		`${sanitizeFilename(quiz.title)}.csv`,
		'text/csv;charset=utf-8;'
	);
}

function download(
	content: string,
	filename: string,
	type: string
) {
	const blob = new Blob(
		[content],
		{ type }
	);

	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}

function sanitizeFilename(name: string) {
	return name
		.replace(/[^a-z0-9-_]/gi, '_')
		.toLowerCase();
}
