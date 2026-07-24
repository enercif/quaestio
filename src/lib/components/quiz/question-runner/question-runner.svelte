<script lang="ts">
	import LiveQuestionHeader from '$lib/components/quiz/live/live-question-header.svelte';
	import { typeToBadge, typeToDescription } from '$lib/components/quiz/quiz.utils';
	import { Badge } from '$lib/components/ui/badge';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import LinkIcon from '@lucide/svelte/icons/link';
	import PauseIcon from '@lucide/svelte/icons/pause';
	import { fade } from 'svelte/transition';
	import QuestionRunnerChoice from './question-runner-choice.svelte';
	import QuestionRunnerOpen from './question-runner-open.svelte';
	import QuestionRunnerProgramming from './question-runner-programming.svelte';
	import QuestionRunnerResult from './question-runner-result.svelte';
	import { deriveRunner, questionRunnerContext } from './question-runner.state.svelte';

	const runner = $derived(deriveRunner(questionRunnerContext.get()));
</script>

<div class="px-10 mt-5 flex flex-col size-full max-w-6xl justify-start pb-24">
	<LiveQuestionHeader room={runner.room} />

	<div class="flex flex-row items-center gap-4">
		<Tooltip.Root>
			<Tooltip.Trigger class="w-fit mt-10 cursor-help">
				<Badge variant="default">{typeToBadge(runner.currentQuestion.type)}</Badge>
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p>{typeToDescription(runner.currentQuestion.type)}</p>
			</Tooltip.Content>
		</Tooltip.Root>

		{#if runner.currentQuestion.hint}
			<Tooltip.Root>
				<Tooltip.Trigger class="w-fit mt-10 cursor-help">
					<Badge variant="secondary">Hinweis</Badge>
				</Tooltip.Trigger>
				<Tooltip.Content>
					<p>{runner.currentQuestion.hint}</p>
				</Tooltip.Content>
			</Tooltip.Root>
		{/if}
	</div>

	<h1 class="text-3xl font-semibold mt-2">{runner.currentQuestion.question}</h1>

	{#if runner.showResources && runner.currentQuestion.resources.length > 0}
		<div class="flex flex-row flex-wrap gap-2 mt-4">
			{#each runner.currentQuestion.resources as resource (resource.id)}
				<!-- eslint-disable svelte/no-navigation-without-resolve -->
				<Button variant="outline" href={resource.href} target="_blank" rel="noopener noreferrer">
					<LinkIcon class="size-3.5" />
					{resource.label}
				</Button>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			{/each}
		</div>
	{/if}

	<div class="flex flex-col mt-5 justify-start relative">
		{#if !runner.revealed && (runner.paused || runner.timeUp)}
			<div
				transition:fade={{ duration: 50 }}
				class="absolute -inset-5 z-10 grid place-items-center backdrop-blur-xs font-medium"
			>
				<div class="flex flex-row items-center gap-2 w-fit bg-background/50 p-2 rounded-lg">
					{#if runner.paused}
						<PauseIcon class="size-4" />
						Pausiert
					{:else}
						<ClockIcon class="size-4" />
						Zeit abgelaufen
					{/if}
				</div>
			</div>
		{/if}

		{#if runner.currentQuestion.type === 'open'}
			<QuestionRunnerOpen />
		{:else if runner.currentQuestion.type === 'programming'}
			<QuestionRunnerProgramming />
		{:else}
			<QuestionRunnerChoice />
		{/if}

		{#if runner.revealed}
			<QuestionRunnerResult />
		{/if}
	</div>
</div>
