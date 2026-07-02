<script lang="ts">
	import src from '$lib/assets/favicon.svg';
	import Button from '$lib/components/ui/button/button.svelte';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';

	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { selectRoomsCount } from '$lib/remote/room.remote';
	import { toggleMode } from 'mode-watcher';
	let { children } = $props();

	const roomsCount = $derived(await selectRoomsCount());
</script>

<nav class="flex w-full items-center justify-center border-b py-4">
	<div class="mx-5 flex w-full max-w-7xl items-center justify-start gap-14">
		<div class="flex flex-row items-center gap-2">
			<img class="size-6" {src} alt="Icon" />
			<span class="text-lg font-semibold">Quaestio</span>
		</div>

		<div class="flex flex-row items-center gap-2">
			<Button
				data-active={page.route.id?.includes('/teacher/quizzes')}
				class="data-active:font-semibold data-active:text-primary data-active:hover:text-primary"
				variant="ghost"
				href={resolve('/teacher/quizzes')}>Quizzes</Button
			>
			<Button
				data-active={page.route.id?.includes('/teacher/live')}
				class="data-active:font-semibold data-active:text-primary data-active:hover:text-primary"
				variant="ghost"
				href={resolve('/teacher/live')}
			>
				{#if roomsCount > 0}
					<span class="relative flex size-2">
						<span
							class="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"
						></span>
						<span class="relative inline-flex size-2 rounded-full bg-destructive"></span>
					</span>
				{/if}
				Live
			</Button>
			<Button
				data-active={page.route.id?.includes('/teacher/analytics')}
				class="data-active:font-semibold data-active:text-primary data-active:hover:text-primary"
				variant="ghost">Analyse</Button
			>
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

			<span class="rounded-full border border-black/25 bg-secondary p-1.5 text-xs"> EC </span>
		</div>
	</div>
</nav>
<div class="flex w-full flex-col items-center justify-center">
	{@render children()}
</div>
