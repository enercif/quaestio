<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	import ImportDialog from './import-dialog.svelte';
	import { parseCsv } from './csv';
	import { parseXlsx } from './xlsx';
	import { insertQuiz } from '$lib/remote/quiz.remote';
	import type { QuizInsert } from '$lib/schemas/quiz.schema';

	let csvInput: HTMLInputElement;
	let xlsxInput: HTMLInputElement;

	let importDialog: ImportDialog;

	let selectedType: 'csv' | 'xlsx' = 'csv';

	export function openCsv() {
	    selectedType = 'csv';

        importDialog?.showImportDialog(() => {
            csvInput?.click();
        }, 'csv');
}

	export function openXlsx() {
		selectedType = 'xlsx';

		importDialog?.showImportDialog(() => {
			xlsxInput?.click();
		}, 'xlsx');
	}

	async function handleImport(event: Event) {
		const input = event.currentTarget as HTMLInputElement;

		if (!input.files?.length) return;

		try {
			const files = Array.from(input.files);

			const quizzes =
				selectedType === 'csv'
					? await Promise.all(
							files.map((file) => parseCsv(file, file.name))
						)
					: await Promise.all(
							files.map((file) => parseXlsx(file))
						);

			await mergeAndInsert(quizzes);

		} catch (error) {
			console.error(error);
			alert('Import fehlgeschlagen.');
		}

		input.value = '';
	}

	async function mergeAndInsert(quizzes: QuizInsert[]) {
		const questions = quizzes.flatMap((quiz) => quiz.questions);

		questions.forEach((question, index) => {
			question.position = index;
		});

		const quiz: QuizInsert = {
			title:
				quizzes.length === 1
					? quizzes[0].title
					: 'Importiertes Quiz',
			last_run: null,
			tags: [],
			questions,
			questions_length: questions.length
		};

		const result = await insertQuiz(quiz);

		if (!result.success || !result.quiz) {
			throw new Error('Quiz konnte nicht gespeichert werden.');
		}

		goto(resolve(`/teacher/quizzes/${result.quiz.id}`));
	}
</script>

<input
	bind:this={csvInput}
	type="file"
	accept=".csv"
	multiple
	class="hidden"
	onchange={handleImport}
/>

<input
	bind:this={xlsxInput}
	type="file"
	accept=".xlsx,.xls"
	multiple
	class="hidden"
	onchange={handleImport}
/>

<ImportDialog bind:this={importDialog} />