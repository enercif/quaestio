<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { cn } from '$lib/utils.js';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';

	interface Props {
		options: { value: string; label: string }[];
		value?: string;
		placeholder?: string;
		empty?: string;
		id?: string;
	}

	let {
		options,
		value = $bindable(''),
		placeholder = 'Auswählen...',
		empty = 'Nichts gefunden.',
		id
	}: Props = $props();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	const selectedLabel = $derived(options.find((option) => option.value === value)?.label);

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => triggerRef.focus());
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef}>
		{#snippet child({ props })}
			<Button
				{...props}
				{id}
				variant="outline"
				class="w-full justify-between font-normal"
				role="combobox"
				aria-expanded={open}
			>
				{selectedLabel || placeholder}
				<ChevronsUpDownIcon class="opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-(--bits-popover-anchor-width) p-0">
		<Command.Root>
			<Command.Input {placeholder} />
			<Command.List>
				<Command.Empty>{empty}</Command.Empty>
				<Command.Group>
					{#each options as option (option.value)}
						<Command.Item
							value={option.value}
							onSelect={() => {
								value = option.value;
								closeAndFocusTrigger();
							}}
						>
							<CheckIcon class={cn(value !== option.value && 'text-transparent')} />
							{option.label}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
