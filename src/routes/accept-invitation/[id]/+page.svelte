<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { completeRegistration } from '$lib/remote/accept-invitation.remote';
	import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const result = $derived(completeRegistration.result);
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

			{#if data.invite}
				<Card.Title class="text-2xl font-bold">Willkommen bei Quaestio</Card.Title>
				<Card.Description>Richte dein Konto für {data.invite.email} ein</Card.Description>
			{:else}
				<Card.Title class="text-2xl font-bold">Link ungültig</Card.Title>
				<Card.Description>Dieser Einladungslink ist ungültig oder abgelaufen.</Card.Description>
			{/if}
		</Card.Header>

		{#if data.invite}
			<Card.Content class="mt-4">
				<form {...completeRegistration} class="flex flex-col gap-2">
					<div>
						<Label for="name" class="mb-2 text-sm font-medium">Name</Label>
						<Input id="name" autofocus {...completeRegistration.fields.name.as('text')} />
						{#each completeRegistration.fields.name.issues() as issue (issue.message)}
							<p class="mt-1 text-sm text-destructive">{issue.message}</p>
						{/each}
					</div>

					<div>
						<Label for="password" class="mb-2 text-sm font-medium">Passwort</Label>
						<Input id="password" {...completeRegistration.fields.password.as('password')} />
						{#each completeRegistration.fields.password.issues() as issue (issue.message)}
							<p class="mt-1 text-sm text-destructive">{issue.message}</p>
						{/each}
					</div>

					<input {...completeRegistration.fields.invitationId.as('hidden', data.invitationId)} />

					{#if result && !result.success}
						<p class="text-sm text-destructive">{result.error}</p>
					{/if}

					<Button class="mt-2 w-full" size="lg" type="submit">Konto erstellen</Button>
				</form>
			</Card.Content>
		{/if}
	</Card.Root>

	<Button href="/login" class="hover:underline" variant="link">Zum Login</Button>
</div>
