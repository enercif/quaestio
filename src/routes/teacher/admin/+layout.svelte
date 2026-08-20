<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const activeTab = $derived(page.route.id?.includes('/admin/settings') ? 'settings' : 'users');
</script>

<div class="mt-6 flex w-full max-w-7xl flex-col gap-6 sm:mt-14 sm:mx-5">
	<h1 class="text-2xl font-semibold">Admin</h1>

	<Tabs.Root value={activeTab}>
		<Tabs.List>
			<Tabs.Trigger value="users" onclick={() => goto(resolve('/teacher/admin/users'))}>
				Benutzer
			</Tabs.Trigger>
			<Tabs.Trigger value="settings" onclick={() => goto(resolve('/teacher/admin/settings'))}>
				Einstellungen
			</Tabs.Trigger>
		</Tabs.List>
	</Tabs.Root>

	{@render children()}
</div>
