<script lang="ts">
	import { resolve } from '$app/paths';
	import { Badge } from '$lib/components/ui/badge';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CircleOffIcon from '@lucide/svelte/icons/circle-off';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="mt-8 flex w-full max-w-7xl flex-col gap-8 sm:gap-10 sm:mx-5 sm:mt-10">
	<h1 class="text-xl sm:text-2xl font-semibold">Übungsräume</h1>

	<div class="rounded-lg border">
		{#if data.quizzes.length === 0}
			<table class="size-full h-fit">
				<thead>
					<tr class="border-b text-sm text-secondary-foreground/75">
						<th class="w-2/5 py-2 pl-4 text-left font-semibold">Titel</th>
						<th class="py-2 text-left font-semibold">Tags</th>
						<th class="py-2 text-left font-semibold">Fragen</th>
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
				</Empty.Header>
			</Empty.Root>
		{:else}
			<div class="flex flex-col divide-y sm:hidden">
				{#each data.quizzes as quiz (quiz.id)}
					<div class="flex flex-col gap-3 p-4">
						<div class="flex items-start justify-between gap-3">
							<h2 class="font-medium break-words">{quiz.title}</h2>
							<span class="shrink-0 text-sm whitespace-nowrap text-secondary-foreground/75">
								{quiz.questions.length} Fragen
							</span>
						</div>

						{#if quiz.tags.length > 0}
							<div class="flex flex-row flex-wrap gap-1">
								{#each quiz.tags as tag, i (i)}
									<Badge variant="secondary">{tag}</Badge>
								{/each}
							</div>
						{:else}
							<p class="text-sm text-muted-foreground">Keine Tags</p>
						{/if}

						<Button href={resolve('/student/practice/[id]', { id: quiz.id })} class="mt-1 w-full">
							Starten
							<ArrowRightIcon />
						</Button>
					</div>
				{/each}
			</div>
			<table class="hidden sm:table size-full">
				<thead>
					<tr class="border-b text-sm text-secondary-foreground/75">
						<th class="w-2/5 py-2 pl-4 text-left font-semibold">Quiz</th>
						<th class="py-2 text-left font-semibold">Tags</th>
						<th class="py-2 text-left font-semibold">Fragen</th>
						<th class="py-2 font-semibold"></th>
					</tr>
				</thead>
				<tbody>
					{#each data.quizzes as quiz (quiz.id)}
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
							<td class="py-2 pr-4 flex justify-end">
								<Button href={resolve('/student/practice/[id]', { id: quiz.id })}>
									Starten
									<ArrowRightIcon />
								</Button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>
