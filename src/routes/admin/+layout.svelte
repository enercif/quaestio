<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/ui/button/button.svelte';
	import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';

	import { toggleMode } from 'mode-watcher';
	import { getInitials } from '$lib/utils.js';

	let { data, children } = $props();

	const initials = $derived(getInitials(data.user?.name));

	async function logout() {
		await authClient.signOut();
		goto(resolve('/'));
	}
</script>

<nav class="flex w-full items-center justify-center border-b py-4">
	<div class="mx-5 flex w-full max-w-7xl items-center justify-start gap-14">
		<div class="flex flex-row items-center gap-2">
			<GraduationCapIcon class="size-6 text-primary" />
			<span class="text-lg font-semibold">Quaestio</span>
		</div>
		<div class="ml-auto flex flex-row items-center gap-1">
			<Button onclick={toggleMode} variant="ghost" size="icon">
				<SunIcon
					class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90"
				/>
				<MoonIcon
					class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button {...props} class="bg-transparent text-xs text-black hover:bg-secondary">
							<span
								class="flex size-8 items-center justify-center rounded-full border border-black/25 bg-secondary leading-none dark:bg-gray-400"
								>{initials}</span
							>
							<ChevronDown class="hover:text-red dark:text-white" />
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content side="bottom" align="end" class="w-full">
					<DropdownMenu.Group>
						<DropdownMenu.Item class=" cursor-pointer" onclick={logout}>Logout</DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>
</nav>
<div class="my-4 flex w-full"></div>
<div>
	{@render children()}
</div>
