<script>
	import Button from '$lib/components/ui/button/button.svelte';
	import { resolve } from '$app/paths';
	import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
	import PlusIcon from '@lucide/svelte/icons/plus';

	let { data } = $props();
</script>

<div class="m-auto flex w-full max-w-7xl flex-col justify-center gap-10 px-5">
	<div class="flex flex-row items-center justify-between">
		<h1 class="text-2xl font-semibold">Benutzer</h1>

		<ButtonGroup.Root>
			<Button href={resolve('/admin/users/new')}>
				<PlusIcon />
				Neuer Benutzer
			</Button>
		</ButtonGroup.Root>
	</div>
	<div class="rounded-lg border">
		<table class="size-full">
			<thead>
				<tr class="border-b text-sm text-secondary-foreground/75">
					<th class="w-1/3 py-2 pl-4 text-left font-semibold">Name</th>
					<th class="w-1/3 text-left font-semibold">E-Mail</th>
					<th class="w-1/3 text-left font-semibold">Rolle</th>
				</tr>
			</thead>
			<tbody>
				{#each data.users as user (user.id)}
					<tr>
						<td class="py-2 pl-4">{user.name}</td>
						<td class="py-2">{user.email}</td>
						<td class="py-2">{user.role}</td>
						<td class="py-2 pr-4">
							<form method="post" action="?/delete">
								<input type="hidden" name="userId" value={user.id} />
								<Button class="bg-red-500 hover:bg-red-600" type="submit"
									><svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										fill="currentColor"
										class="bi bi-trash"
										viewBox="0 0 16 16"
									>
										<path
											d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"
										/>
										<path
											d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"
										/>
									</svg></Button
								>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
