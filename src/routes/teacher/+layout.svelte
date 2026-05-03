<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';

	import { ModeWatcher } from 'mode-watcher';

	import { toggleMode } from 'mode-watcher';

	let { children } = $props();
</script>

<ModeWatcher />
<Toaster richColors position="top-center" />

<nav class="flex w-full items-center justify-center border-b py-4">
	<div class="mx-5 flex w-full max-w-7xl items-center justify-start gap-14">
		<div class="flex flex-row items-center gap-2">
			<GraduationCapIcon class="size-6 text-primary" />
			<span class="text-lg font-semibold">Quaestio</span>
		</div>

		<div class="flex flex-row items-center gap-2">
			<Button variant="ghost" class="font-semibold text-primary hover:text-primary">Quizzes</Button>
			<Button variant="ghost">Analyse</Button>
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
