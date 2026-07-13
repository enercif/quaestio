<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import CircleQuestionMarkIcon from '@lucide/svelte/icons/circle-question-mark';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import AddQuestionDropdown from './editor-question-dropdown.svelte';
</script>

<div class="col-span-3">
	<Card.Root>
		<Card.Content>
			<Empty.Root>
				<Empty.Header>
					<Empty.Media variant="icon">
						<CircleQuestionMarkIcon />
					</Empty.Media>
					<Empty.Title>Noch keine Fragen hinzugefügt</Empty.Title>
					<Empty.Description>Füge eine neue Frage hinzu, um zu beginnen.</Empty.Description>
				</Empty.Header>
				<Empty.Content>
					<AddQuestionDropdown>
						{#snippet trigger({ props })}
							<Button variant="default" {...props}>
								<PlusIcon />
								Frage hinzufügen
							</Button>
						{/snippet}
					</AddQuestionDropdown>
				</Empty.Content>
			</Empty.Root>
		</Card.Content>
	</Card.Root>
</div>
