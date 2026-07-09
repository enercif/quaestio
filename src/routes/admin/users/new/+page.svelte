<script>
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	let { form } = $props();
	let copied = $state(false);

	const copyPassword = async () => {
		if (!form?.tempPassword) return;
		await navigator.clipboard.writeText(form.tempPassword);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	};
</script>

<div class="flex size-full flex-col items-center justify-center gap-4 px-3">
	<form method="post" action="?/create" class="flex w-lg flex-col gap-6">
		<div>
			<Label for="name" class="mb-2 text-sm font-medium">Name</Label>
			<Input id="name" type="text" name="name" required placeholder="Name"></Input>
		</div>
		<div>
			<Label for="email" class="mb-2 text-sm font-medium">E-Mail</Label>
			<Input id="email" type="email" name="email" required placeholder="Email"></Input>
			<p class="text-sm text-red-500">{form?.message}</p>
		</div>
		<Button class="size-lg w-full" type="submit">Erstellen</Button>
	</form>
	<Button href="/admin/users" variant="link">Zurück</Button>

	{#if form?.success && form?.tempPassword}
		<div class="flex items-center gap-2 rounded-md border bg-secondary p-4">
			<p>Temporary password: <code>{form.tempPassword}</code></p>
			<Button onclick={copyPassword} class="bg-transparent hover:bg-transparent hover:fill-gray-500"
				><svg
					version="1.1"
					id="Layer_1"
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
					x="0px"
					y="0px"
					viewBox="0 0 115.77 122.88"
					style="enable-background:new 0 0 115.77 122.88"
					xml:space="preserve"
					><style type="text/css">
						.st0 {
							fill-rule: evenodd;
							clip-rule: evenodd;
						}
					</style><g
						><path
							class="st0"
							d="M89.62,13.96v7.73h12.19h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02v0.02 v73.27v0.01h-0.02c-0.01,3.84-1.57,7.33-4.1,9.86c-2.51,2.5-5.98,4.06-9.82,4.07v0.02h-0.02h-61.7H40.1v-0.02 c-3.84-0.01-7.34-1.57-9.86-4.1c-2.5-2.51-4.06-5.98-4.07-9.82h-0.02v-0.02V92.51H13.96h-0.01v-0.02c-3.84-0.01-7.34-1.57-9.86-4.1 c-2.5-2.51-4.06-5.98-4.07-9.82H0v-0.02V13.96v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07V0h0.02h61.7 h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02V13.96L89.62,13.96z M79.04,21.69v-7.73v-0.02h0.02 c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v64.59v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h12.19V35.65 v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07v-0.02h0.02H79.04L79.04,21.69z M105.18,108.92V35.65v-0.02 h0.02c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v73.27v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h61.7h0.02 v0.02c0.91,0,1.75-0.39,2.37-1.01c0.61-0.61,1-1.46,1-2.37h-0.02V108.92L105.18,108.92z"
						/></g
					></svg
				></Button
			>
		</div>
		{#if copied}
			<p class="fixed bottom-10 rounded-md border bg-green-300 p-2 text-green-900">Copied!</p>
		{/if}
	{/if}
</div>
