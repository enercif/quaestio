<script module lang="ts">
	export type LineState = 'correct' | 'wrong' | 'selected';

	const LINE_STATES: LineState[] = ['correct', 'wrong', 'selected'];
</script>

<script lang="ts">
	import { highlightCode } from '$lib/shiki';
	import type { Snippet } from 'svelte';

	interface Props {
		code: string;
		language: string;
		lineState?: (line: string) => LineState | undefined;
		votes?: Map<string, number>;
		onLineClick?: (line: string) => void;
		empty?: Snippet;
		class?: string;
	}

	let { code, language, lineState, votes, onLineClick, empty, class: className }: Props = $props();

	const html = $derived(code && language ? await highlightCode(code, language) : '');

	let container: HTMLDivElement | undefined = $state();

	$effect(() => {
		const rendered = html;
		if (!container || !rendered) return;
		for (const line of container.querySelectorAll<HTMLElement>('.line')) {
			const number = line.dataset.line;
			if (!number) continue;

			const state = lineState?.(number);
			for (const candidate of LINE_STATES) {
				line.classList.toggle(`${candidate}-line`, candidate === state);
			}

			if (votes) {
				const count = votes.get(number);
				line.dataset.votes = count ? `${count}×` : '';
			}
		}
	});

	function handleClick(event: MouseEvent) {
		const line = (event.target as HTMLElement).closest<HTMLElement>('.line');
		if (line?.dataset.line) onLineClick?.(line.dataset.line);
	}
</script>

<div
	bind:this={container}
	onclick={onLineClick && handleClick}
	role="presentation"
	class={[
		'programming-code-preview overflow-x-auto rounded-md border text-sm [&_code]:py-3',
		onLineClick && '[&_.line]:cursor-pointer',
		className
	]}
>
	{#if html}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html html}
	{:else}
		{@render empty?.()}
	{/if}
</div>

<style>
	.programming-code-preview :global(.line.selected-line) {
		box-shadow: inset 0 0 0 999px color-mix(in oklab, var(--primary) 12%, transparent);
	}

	.programming-code-preview :global(.line.wrong-line) {
		box-shadow: inset 0 0 0 999px color-mix(in oklab, var(--destructive) 15%, transparent);
	}

	.programming-code-preview :global(.line::after) {
		content: attr(data-votes);
		color: var(--muted-foreground);
		padding-inline: 0.75rem;
		font-size: 0.75rem;
	}
</style>
