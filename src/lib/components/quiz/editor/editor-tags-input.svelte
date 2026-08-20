<script lang="ts">
	import TagsInput from '$lib/components/ui/tags-input/tags-input.svelte';
	import * as Field from '$lib/components/ui/field/index.js';

	interface Props {
		tags: string[];
		label?: string;
		placeholder?: string;
		maxTags?: number;
		maxLength?: number;
		suggestions?: string[];
	}

	let {
		tags = $bindable(),
		label = 'Tags',
		placeholder = 'Tag hinzufügen...',
		maxTags = 10,
		maxLength = 30,
		suggestions = [], 
	}: Props = $props();


	function validate(val: string, currentTags: string[]): string | undefined {
		const tag = val.trim();
		
        if (tag.length === 0) return;
		if (tag.length > maxLength) return;
		if (currentTags.length >= maxTags) return;

		if (currentTags.some((existing) => existing.localeCompare(tag, undefined, { sensitivity: 'accent' }) === 0)) {
			return;
		}

		return tag;
	}
</script>

<Field.Field>
	<Field.Label>
		{label}
	</Field.Label>
    <TagsInput 
        bind:value={tags} 
        {placeholder} 
        {suggestions} 
        {validate} 
    />
</Field.Field>
