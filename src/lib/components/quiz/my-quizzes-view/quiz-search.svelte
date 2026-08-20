<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import SearchIcon from '@lucide/svelte/icons/search';

	import type { SearchType } from './quiz-search.utils';

	interface Props {
		value?: string;
		type?: SearchType;
	}

	let { value = $bindable(''), type = $bindable<SearchType>('default') }: Props = $props();

	const placeholders: Record<SearchType, string> = {
		default: 'Alles durchsuchen ...',
		title: 'Nach Titel suchen ...',
		tag: 'Nach Tags suchen ...',
		question: 'Nach Fragen suchen ...'
	};

	const options: { value: SearchType; label: string }[] = [
		{ value: 'default', label: 'Alles' },
		{ value: 'title', label: 'Titel' },
		{ value: 'tag', label: 'Tags' },
		{ value: 'question', label: 'Fragen' }
	];
</script>

<div class="flex gap-2">
	<Select.Root
		type="single"
		value={type}
		onValueChange={(value) => {
			type = value as SearchType;
		}}
	>
		<Select.Trigger class="w-36">
			{options.find((option) => option.value === type)?.label}
		</Select.Trigger>

		<Select.Content>
			{#each options as option (option.value)}
				<Select.Item value={option.value}>
					{option.label}
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>

	<div class="relative flex-1">
		<SearchIcon class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

		<Input bind:value type="search" placeholder={placeholders[type]} class="pl-9" />
	</div>
</div>
