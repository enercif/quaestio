<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const activeTab = $derived(
		page.url.pathname.includes('/analytics/students') ? 'students' : 'rooms'
	);
</script>

<div class="mt-6 flex w-full max-w-7xl flex-col gap-6 sm:mt-14">
	<h1 class="text-2xl font-semibold">Analyse</h1>

	<Tabs.Root value={activeTab}>
		<Tabs.List>
			<Tabs.Trigger value="rooms" onclick={() => goto(resolve('/teacher/analytics/rooms'))}>
				Räume
			</Tabs.Trigger>
			<Tabs.Trigger value="students" onclick={() => goto(resolve('/teacher/analytics/students'))}>
				Studenten
			</Tabs.Trigger>
		</Tabs.List>
	</Tabs.Root>

	{@render children()}
</div>
