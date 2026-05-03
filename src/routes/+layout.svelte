<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<main class="h-lvh w-lvw bg-background">
	<Tooltip.Provider delayDuration={750}>
		{@render children()}
	</Tooltip.Provider>
</main>
