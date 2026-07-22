<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Field from '$lib/components/ui/field/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { getSmtpSettings, saveSmtpSettings, testSmtpSettings } from '$lib/remote/smtp.remote';
	import { toast } from 'svelte-sonner';

	const settings = $derived(await getSmtpSettings());

	let host = $state('');
	let port = $state(587);
	let user = $state('');
	let pass = $state('');
	let from = $state('');
	let saving = $state(false);
	let testing = $state(false);
	let initialized = false;

	$effect(() => {
		if (initialized || !settings) return;
		initialized = true;
		host = settings.host;
		port = settings.port;
		user = settings.user ?? '';
		from = settings.from ?? '';
	});

	function currentInput() {
		return { host, port, user: user || undefined, pass: pass || undefined, from: from || undefined };
	}

	async function onSave(e: SubmitEvent) {
		e.preventDefault();
		saving = true;
		try {
			await saveSmtpSettings(currentInput());
			pass = '';
			toast.success('SMTP-Einstellungen gespeichert.');
		} catch {
			toast.error('SMTP-Einstellungen konnten nicht gespeichert werden.');
		} finally {
			saving = false;
		}
	}

	async function onTest() {
		testing = true;
		const result = await testSmtpSettings(currentInput());
		testing = false;
		if (result.success) {
			toast.success('Test-E-Mail wurde versendet.');
		} else {
			toast.error(result.error ?? 'Test-E-Mail konnte nicht versendet werden.');
		}
	}
</script>

<form onsubmit={onSave} class="flex max-w-lg flex-col gap-6">
	<Field.Field>
		<Label for="smtp-host">Host</Label>
		<Input id="smtp-host" bind:value={host} required placeholder="smtp.example.com" />
	</Field.Field>
	<Field.Field>
		<Label for="smtp-port">Port</Label>
		<Input id="smtp-port" type="number" bind:value={port} required placeholder="587" />
	</Field.Field>
	<Field.Field>
		<Label for="smtp-user">Benutzername</Label>
		<Input id="smtp-user" bind:value={user} placeholder="user@example.com" />
	</Field.Field>
	<Field.Field>
		<Label for="smtp-pass">Passwort</Label>
		<Input id="smtp-pass" type="password" bind:value={pass} placeholder="•••••••• (unverändert lassen)" />
	</Field.Field>
	<Field.Field>
		<Label for="smtp-from">Absender</Label>
		<Input id="smtp-from" bind:value={from} placeholder="Quaestio <noreply@example.com>" />
	</Field.Field>

	<div class="flex flex-row gap-2">
		<Button type="submit" disabled={saving}>Speichern</Button>
		<Button type="button" variant="secondary" onclick={onTest} disabled={testing}>
			Testen
		</Button>
	</div>
</form>
