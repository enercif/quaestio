<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
	import Label from '$lib/components/ui/label/label.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { authClient } from '$lib/auth-client';
	import { createFirstAdmin } from '$lib/remote/setup.remote';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let error = $state('');

	async function login(e: SubmitEvent) {
		e.preventDefault();
		error = '';

		try {
			const { error: signInError } = await authClient.signIn.email({ email, password });

			if (signInError) {
				error = signInError.message ?? 'Ungültige E-Mail oder Passwort.';
				return;
			}

			goto(resolve('/teacher/quizzes'));
		} catch (err) {
			console.error(err);
			error = 'Verbindung zum Server fehlgeschlagen. Bitte versuchen Sie es erneut.';
		}
	}

	async function signup(e: SubmitEvent) {
		e.preventDefault();
		error = '';

		try {
			const result = await createFirstAdmin({ name, email, password });
			if (!result.success) {
				error = result.error;
				return;
			}
			goto(resolve('/teacher/settings/users'));
		} catch (err) {
			console.error(err);
			error = 'Verbindung zum Server fehlgeschlagen. Bitte versuchen Sie es erneut.';
		}
	}
</script>

<div class="flex size-full flex-col items-center justify-center gap-8">
	<Card.Root class="w-1/2 max-w-90">
		<Card.Header class="text-center">
			<div
				class="mx-auto mt-3 mb-5 flex w-fit flex-row items-center gap-1 rounded-xl bg-primary/10 px-3 py-1 text-base text-primary"
			>
				<GraduationCapIcon />
				<p>Quaestio</p>
			</div>
			{#if data.needsSetup}
				<Card.Title class="text-2xl font-bold">Admin-Konto erstellen</Card.Title>
				<Card.Description>Es existiert noch kein Konto. Lege den ersten Admin an.</Card.Description>
			{:else}
				<Card.Title class="text-2xl font-bold">Login</Card.Title>
				<Card.Description>E-Mail und Passwort eingeben</Card.Description>
			{/if}
		</Card.Header>
		<Card.Content class="mt-4">
			{#if data.needsSetup}
				<form onsubmit={signup} class="flex flex-col gap-2">
					<div>
						<Label for="name" class="mb-2 text-sm font-medium">Name</Label>
						<Input id="name" bind:value={name} required placeholder="Name"></Input>
					</div>
					<div>
						<Label for="email" class="mb-2 text-sm font-medium">E-Mail</Label>
						<Input id="email" type="email" bind:value={email} required placeholder="Email"></Input>
					</div>
					<div>
						<Label for="password" class="mb-2 text-sm font-medium">Password</Label>
						<Input
							id="password"
							type="password"
							bind:value={password}
							placeholder="Password"
							minlength={8}
							required
						></Input>
						{#if error}<p class="text-sm text-red-500">
								{error}
							</p>{/if}
					</div>
					<Button class="size-lg w-full" type="submit">Admin-Konto erstellen</Button>
				</form>
			{:else}
				<form onsubmit={login} class="flex flex-col gap-2">
					<div>
						<Label for="email" class="mb-2 text-sm font-medium">E-Mail</Label>
						<Input id="email" type="email" bind:value={email} required placeholder="Email"></Input>
					</div>
					<div>
						<Label for="password" class="mb-2 text-sm font-medium">Password</Label>
						<Input
							id="password"
							type="password"
							bind:value={password}
							placeholder="Password"
							required
						></Input>
						{#if error}<p class="text-sm text-red-500">
								{error}
							</p>{/if}
					</div>
					<Button class="size-lg w-full" type="submit">Login</Button>
				</form>
			{/if}
		</Card.Content>
	</Card.Root>

	<Button href="/" class="hover:underline" variant="link">Zurück</Button>
</div>
