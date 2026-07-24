<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import { authClient } from '$lib/auth-client';
	import AccountSettingsDialog from '$lib/components/account-settings-dialog.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { localePersistedState } from '$lib/state/locale.state.svelte';
	import { getInitials } from '$lib/utils';
	import { rooms } from '$live/rooms';
	import LanguagesIcon from '@lucide/svelte/icons/languages';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import UserIcon from '@lucide/svelte/icons/user';
	import { ModeWatcher, toggleMode } from 'mode-watcher';
	import { loadLocale } from 'wuchale/load-utils';
	import type { LayoutProps } from './$types';
	import './layout.css';

	let { data, children }: LayoutProps = $props();

	const isTeacherRoute = $derived(page.route.id?.includes('teacher'));
	const isStudentRoute = $derived(
		page.route.id?.includes('student') && !page.route.id?.includes('/r/')
	);

	const isOrgAdmin = $derived(data.role === 'owner' || data.role === 'admin');
	const initials = $derived(getInitials(data.user?.name));

	let accountDialogOpen = $state(false);

	async function logout() {
		await authClient.signOut();
		goto(resolve('/'));
	}

	async function setLocale(locale: string) {
		localePersistedState.current = locale;
		await loadLocale(locale);
	}

	console.log('layout data', page.route.id);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<ModeWatcher />
<Toaster richColors position="top-center" />

<main class="flex h-lvh w-lvw flex-col bg-background">
	<Tooltip.Provider delayDuration={750}>
		<nav class="flex w-full items-center justify-center border-b py-4">
			<div class="mx-5 flex w-full max-w-7xl items-center justify-start gap-14">
				<div class="flex flex-row items-center gap-2">
					<img class="size-6" src={favicon} alt="Logo" />
					<span class="text-lg font-semibold">Quaestio</span>
				</div>

				{#if isStudentRoute}
					<div class="flex flex-row items-center gap-2">
						<Button variant="ghost" href={resolve('/')}>Quiz beitreten</Button>
					</div>
				{/if}

				{#if isTeacherRoute}
					<div class="flex flex-row items-center gap-2">
						<Button
							data-active={page.route.id?.includes('/teacher/quizzes')}
							class="data-active:font-semibold data-active:text-primary data-active:hover:text-primary"
							variant="ghost"
							href={resolve('/teacher/quizzes')}>Quizze</Button
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
							href={resolve('/teacher/analytics')}
							class="data-active:font-semibold data-active:text-primary data-active:hover:text-primary"
							variant="ghost">Analyse</Button
						>
						{#if isOrgAdmin}
							<Button
								data-active={page.route.id?.includes('/teacher/admin')}
								class="data-active:font-semibold data-active:text-primary data-active:hover:text-primary"
								variant="ghost"
								href={resolve('/teacher/admin')}>Admin</Button
							>
						{/if}

						<Button variant="ghost" href={resolve('/')}>Studentenansicht</Button>
					</div>
				{/if}

				<div class="ml-auto flex flex-row items-center gap-1">
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Button {...props} variant="ghost" size="icon">
									<LanguagesIcon />
								</Button>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content side="bottom" align="end">
							<DropdownMenu.Group>
								<DropdownMenu.Item onclick={() => setLocale('de')}>Deutsch</DropdownMenu.Item>
								<DropdownMenu.Item onclick={() => setLocale('en')}>Englisch</DropdownMenu.Item>
							</DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>

					<Button onclick={toggleMode} variant="ghost" size="icon">
						<SunIcon class="scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90" />
						<MoonIcon
							class="absolute scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0"
						/>
						<span class="sr-only">Design wechseln</span>
					</Button>

					{#if isTeacherRoute && data.user}
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								{#snippet child({ props })}
									<button
										{...props}
										class="rounded-full border border-black/25 bg-secondary p-1.5 text-xs cursor-pointer"
									>
										{initials}
									</button>
								{/snippet}
							</DropdownMenu.Trigger>
							<DropdownMenu.Content side="bottom" align="end">
								<DropdownMenu.Group>
									<DropdownMenu.Item onclick={() => (accountDialogOpen = true)}>
										<UserIcon />

										Konto
									</DropdownMenu.Item>
									<DropdownMenu.Separator />
									<DropdownMenu.Item onclick={logout}>
										<LogOutIcon class="text-destructive" />

										Abmelden
									</DropdownMenu.Item>
								</DropdownMenu.Group>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
						<AccountSettingsDialog bind:open={accountDialogOpen} />
					{/if}
				</div>
			</div>
		</nav>
		<div class="flex w-full flex-1 flex-col items-center justify-start">
			{@render children()}
		</div>
	</Tooltip.Provider>
</main>
