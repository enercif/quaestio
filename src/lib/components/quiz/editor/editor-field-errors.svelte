<script lang="ts">
	import * as Field from '$lib/components/ui/field/index.js';

	let { errors }: { errors?: string[] } = $props();
</script>

{#each errors ?? [] as error, i (i)}
	<Field.Error>{error}</Field.Error>
{/each}
