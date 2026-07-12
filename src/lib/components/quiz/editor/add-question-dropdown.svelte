<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import type { Snippet } from 'svelte';
	import { getQuizEditorState } from './quiz-editor-state.svelte';

	interface Props {
		trigger: Snippet<[{ props: Record<string, unknown> }]>;
	}

	let { trigger }: Props = $props();

	const state = getQuizEditorState();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			{@render trigger({ props })}
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Item onclick={() => state.addMultipleChoiceQuestion()}
				>Multiple Choice</DropdownMenu.Item
			>
			<DropdownMenu.Item onclick={() => state.addSingleChoiceQuestion()}
				>Single Choice</DropdownMenu.Item
			>
			<DropdownMenu.Item onclick={() => state.addOpenTextQuestion()}>Open Text</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
