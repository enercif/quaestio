<script lang="ts">
	import { resolve } from '$app/paths';
	import LaunchDialog from '$lib/components/quiz/launch-dialog.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { localePersistedState } from '$lib/state/locale.state.svelte';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import CircleOffIcon from '@lucide/svelte/icons/circle-off';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import SquarePenIcon from '@lucide/svelte/icons/square-pen';
	import type { PageProps } from './$types';
	import QuizImporter from '$lib/import/quiz-importer.svelte';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import { exportQuizAsCsv } from '$lib/export/csv';
	import { exportQuizAsXlsx } from '$lib/export/xlsx';
	let { data }: PageProps = $props();

	const quizzes = $derived(data.quizzes);
	let quizImporter = $state<QuizImporter>();
</script>

<QuizImporter bind:this={quizImporter} />

<div class="mt-8 flex w-full max-w-7xl flex-col gap-6 sm:mt-14 sm:gap-10">
	<div class="flex flex-row items-center justify-between">
		<h1 class="text-lg font-semibold sm:text-2xl">Deine Quizze</h1>

		<ButtonGroup.Root>
			<Button href={resolve('/teacher/quizzes/new')}>
				<PlusIcon />
				Neues Quiz
			</Button>

			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button {...props}>
							<ChevronDown />
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content side="bottom" align="end" class="w-full">
					<DropdownMenu.Group>
						<DropdownMenu.Item onSelect={() => quizImporter?.openCsv()}
							>Importiere CSV</DropdownMenu.Item
						>
						<DropdownMenu.Item onSelect={() => quizImporter?.openXlsx()}
							>Importiere XLSX</DropdownMenu.Item
						>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</ButtonGroup.Root>
	</div>

	<div class="rounded-lg border">
		{#if quizzes.length === 0}
			<table class="size-full h-fit">
				<thead>
					<tr class="border-b text-sm text-secondary-foreground/75">
						<th class="w-2/5 py-2 pl-4 text-left font-semibold">Titel</th>
						<th class="py-2 text-left font-semibold">Tags</th>
						<th class="py-2 text-left font-semibold">Fragen</th>
						<th class="py-2 text-left font-semibold">Letzter Lauf</th>
						<th class="py-2 font-semibold"></th>
					</tr>
				</thead>
			</table>

			<Empty.Root>
				<Empty.Header>
					<Empty.Media variant="icon">
						<CircleOffIcon />
					</Empty.Media>
					<Empty.Title>Noch keine Quizze</Empty.Title>
					<Empty.Description>
						Es sind aktuell keine Quizze vorhanden. Erstelle dein erstes Quiz, um loszulegen.
					</Empty.Description>
				</Empty.Header>
				<Empty.Content>
					<div class="flex gap-2">
						<Button href={resolve('/teacher/quizzes/new')}>
							<PlusIcon />
							Quiz erstellen
						</Button>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								{#snippet child({ props })}
									<Button {...props} variant="outline">
										<ChevronDown />

										Quiz importieren
									</Button>
								{/snippet}
							</DropdownMenu.Trigger>
							<DropdownMenu.Content side="bottom" align="end" class="w-full">
								<DropdownMenu.Group>
									<DropdownMenu.Item onSelect={() => quizImporter?.openCsv()}
										>Importiere CSV</DropdownMenu.Item
									>
									<DropdownMenu.Item onSelect={() => quizImporter?.openXlsx()}
										>Importiere XLSX</DropdownMenu.Item
									>
								</DropdownMenu.Group>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
				</Empty.Content>
			</Empty.Root>
		{:else}
			<table class="size-full">
				<thead>
					<tr class="border-b text-sm text-secondary-foreground/75">
						<th class="w-2/5 py-2 pl-4 text-left font-semibold">Titel</th>
						<th class="w-1/7 py-2 text-left font-semibold hidden sm:table-cell">Tags</th>
						<th class="w-1/7 py-2 text-left font-semibold hidden sm:table-cell">Fragen</th>
						<th class="w-1/7 py-2 text-left font-semibold hidden sm:table-cell">Letzter Lauf</th>
						<th class="py-2 font-semibold"></th>
					</tr>
				</thead>
				<tbody>
					{#each quizzes as quiz (quiz.id)}
						<tr class="border-b transition-colors duration-200 hover:bg-secondary">
							<td class="py-2 pl-4 break-all">{quiz.title}</td>
							<td class="py-2 hidden sm:table-cell">
								{#if quiz.tags.length > 0}
									{#each quiz.tags.slice(0,4) as tag, i (i)}
										<Badge variant="secondary">{tag}</Badge>
									{/each}
									{#if quiz.tags.length > 4}
										<Badge variant="outline">+{quiz.tags.length - 4}</Badge>
									{/if}
								{:else}
									<p>Keine Tags</p>
								{/if}
							</td>
							<td class="py-2 hidden sm:table-cell">{quiz.questions.length}</td>
							<td class="py-2 hidden sm:table-cell"
								>{quiz.last_run
									? new Date(quiz.last_run).toLocaleString(localePersistedState.current, {
											dateStyle: 'full',
											timeStyle: 'short'
										})
									: 'Noch nicht gestartet'}</td
							>
							<td class="flex flex-row items-center justify-end gap-1 py-2 pr-2 sm:pr-4">
								<Tooltip.Root>
									<Tooltip.Trigger>
										{#snippet child({ props })}
											<Button
												size="icon"
												variant="ghost"
												{...props}
												href={resolve(`/teacher/quizzes/${quiz.id}`)}
											>
												<SquarePenIcon />
											</Button>
										{/snippet}
										<Button size="icon" variant="ghost">
											<SquarePenIcon />
										</Button>
									</Tooltip.Trigger>
									<Tooltip.Content>
										<p>Bearbeiten</p>
									</Tooltip.Content>
								</Tooltip.Root>

								<LaunchDialog {quiz} label="Starten" />
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										<Button size="icon" variant="ghost">
											<EllipsisIcon />
										</Button>
									</DropdownMenu.Trigger>

									<DropdownMenu.Content side="bottom" align="end">
										<DropdownMenu.Group>
											<DropdownMenu.Item onclick={() => exportQuizAsCsv(quiz)}>
												Exportiere als CSV
											</DropdownMenu.Item>

											<DropdownMenu.Item onclick={() => exportQuizAsXlsx(quiz)}>
												Exportiere als XLSX
											</DropdownMenu.Item>
										</DropdownMenu.Group>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>
