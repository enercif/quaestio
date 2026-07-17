<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import type { Snippet } from 'svelte';
	import { EditorState } from './editor.state.svelte';

	interface Props {
		trigger: Snippet<[{ props: Record<string, unknown> }]>;
	}

	let { trigger }: Props = $props();

	const state = EditorState.get();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			{@render trigger({ props })}
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Item onclick={() => state.addQuestion('multiple')}>
				Multiple Choice
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={() => state.addQuestion('single')}
				>Single Choice</DropdownMenu.Item
			>
			<DropdownMenu.Item onclick={() => state.addQuestion('open')}>Open Text</DropdownMenu.Item>
			<DropdownMenu.Item onclick={() => state.addQuestion('programming')}>
				Programming
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
