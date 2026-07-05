<script lang="ts">
	import { default as favicon, default as src } from '$lib/assets/favicon.svg';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import { ModeWatcher } from 'mode-watcher';
	import './layout.css';

	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { rooms } from '$live/rooms';
	import { toggleMode } from 'mode-watcher';

	let { children } = $props();

	const isTeacherRoute = $derived(page.route.id?.includes('teacher') ?? false);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<ModeWatcher />
<Toaster richColors position="top-center" />

<main class="flex h-lvh w-lvw flex-col bg-background">
	<Tooltip.Provider delayDuration={750}>
		<nav class="flex w-full items-center justify-center border-b py-4">
			<div class="mx-5 flex w-full max-w-7xl items-center justify-start gap-14">
				<div class="flex flex-row items-center gap-2">
					<img class="size-6" {src} alt="Icon" />
					<span class="text-lg font-semibold">Quaestio</span>
				</div>

				{#if isTeacherRoute}
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
							{#if ($rooms ? $rooms.length : 0) > 0}
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
				{/if}

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

					{#if isTeacherRoute}
						<span class="rounded-full border border-black/25 bg-secondary p-1.5 text-xs"> EC </span>
					{/if}
				</div>
			</div>
		</nav>
		<div class="flex w-full flex-1 flex-col items-center justify-start">
			{@render children()}
		</div>
	</Tooltip.Provider>
</main>
