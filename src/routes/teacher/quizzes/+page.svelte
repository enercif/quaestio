<script lang="ts">
	import { resolve } from '$app/paths';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import PlayIcon from '@lucide/svelte/icons/play';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import SquarePenIcon from '@lucide/svelte/icons/square-pen';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const quizzes = $derived(data.quizzes);
</script>

<div class="mx-5 mt-14 flex w-full max-w-7xl flex-col gap-10">
	<div class="flex flex-row items-center justify-between">
		<h1 class="text-2xl font-semibold">Deine Quizze</h1>

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
						<DropdownMenu.Item>Importiere CSV</DropdownMenu.Item>
						<DropdownMenu.Item>Importiere XLSX</DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</ButtonGroup.Root>
	</div>

	<div class="rounded-lg border">
		{#if quizzes.length === 0}
			<table class="size-full">
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

			<div class="my-6 flex w-full flex-col items-center justify-center gap-4">
				<p class="text-xl font-semibold">Du hast noch keine Quizze erstellt</p>

				<ButtonGroup.Root>
					<Button href={resolve('/teacher/quizzes/new')}>
						<PlusIcon />
						Erstelle dein erstes Quiz
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
								<DropdownMenu.Item>Importiere CSV</DropdownMenu.Item>
								<DropdownMenu.Item>Importiere XLSX</DropdownMenu.Item>
							</DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</ButtonGroup.Root>
			</div>
		{:else}
			<table class="size-full">
				<thead>
					<tr class="border-b text-sm text-secondary-foreground/75">
						<th class="w-2/5 py-2 pl-4 text-left font-semibold">Titel</th>
						<th class="py-2 text-left font-semibold">Tags</th>
						<th class="py-2 text-left font-semibold">Fragen</th>
						<th class="py-2 text-left font-semibold">Letzter Lauf</th>
						<th class="py-2 font-semibold"></th>
					</tr>
				</thead>
				<tbody>
					{#each quizzes as quiz (quiz.id)}
						<tr class="border-b transition-colors duration-200 hover:bg-secondary">
							<td class="py-2 pl-4">{quiz.title}</td>
							<td class="py-2">
								{#if quiz.tags.length > 0}
									{#each quiz.tags as tag, i (i)}
										<Badge variant="secondary">{tag}</Badge>
									{/each}
								{:else}
									<p>Keine Tags</p>
								{/if}
							</td>
							<td class="py-2">{quiz.questions.length}</td>
							<td class="py-2">{quiz.last_run ?? 'Noch nicht gestartet'}</td>
							<td class="flex flex-row items-center justify-end gap-1 py-2 pr-4">
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

								<Button>
									<PlayIcon />
									Starten
								</Button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>
