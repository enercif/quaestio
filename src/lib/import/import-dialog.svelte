<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Tabs from '$lib/components/ui/tabs';
	import Button from '$lib/components/ui/button/button.svelte';

	let open = $state(false);

	let onImport = $state<() => void>(() => {});

	let format = $state<'csv' | 'xlsx'>('csv');

	export function showImportDialog(callback: () => void, type: 'csv' | 'xlsx' = 'csv') {
		onImport = callback;
		format = type;
		open = true;
	}

	function continueImport() {
		open = false;
		onImport();
	}

	function downloadExample() {
		const file = format === 'xlsx' ? '/example.xlsx' : '/example.csv';

		const link = document.createElement('a');

		link.href = file;
		link.download = file.split('/').pop() ?? 'example';

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="flex max-h-[85vh] w-[90vw] overflow-x-auto flex-col">
		<Dialog.Header>
			<Dialog.Title>Quiz importieren</Dialog.Title>

			<Dialog.Description>
				Du kannst eine oder mehrere {format.toUpperCase()}-Dateien auswählen. Alle enthaltenen
				Fragen werden zu einem gemeinsamen Quiz zusammengeführt. Die erste Zeile muss die
				Spaltennamen enthalten.
			</Dialog.Description>
		</Dialog.Header>

		<div class="flex-1 overflow-y-auto pr-2">
			<div class="space-y-8 text-sm">
				<section class="space-y-3">
					<p>
						<b>Allgemein:</b> Jede Zeile entspricht genau einer Frage. Die Spalten heißen:
					</p>

					<div class="rounded-lg border bg-muted/30 p-4 font-mono text-xs overflow-x-auto">
						type, question, code, options, solution, language, hint, reasons, points, timelimit
					</div>

					<p>
						Je nach <b>Fragentyp</b> müssen unterschiedliche Spalten ausgefüllt werden. Wähle unten den
						gewünschten Fragentyp aus.
					</p>
				</section>

				<Tabs.Root value="single">
					<Tabs.List class="grid w-full grid-cols-4">
						<Tabs.Trigger value="single">Single</Tabs.Trigger>

						<Tabs.Trigger value="multiple">Multiple</Tabs.Trigger>

						<Tabs.Trigger value="open">Open</Tabs.Trigger>

						<Tabs.Trigger value="programming">Programming</Tabs.Trigger>
					</Tabs.List>

					<Tabs.Content value="single" class="mt-6">
						<div class="rounded-lg border">
							<table class="w-full text-sm">
								<thead class="border-b bg-muted/40">
									<tr>
										<th class="px-4 py-2 text-left">Spalte</th>

										<th class="px-4 py-2 text-left">Inhalt</th>
									</tr>
								</thead>

								<tbody>
									<tr class="border-b">
										<td class="px-4 py-2 font-mono">type</td>

										<td class="px-4 py-2">single</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">question</td>

										<td class="px-4 py-2">Fragestellung <b>(Pflicht)</b></td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">code</td>

										<td class="px-4 py-2">(Nicht verwendet) leer lassen</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">options</td>

										<td class="px-4 py-2">
											Antworten mit <code>|</code> trennen <b>(Pflicht)</b>
										</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">solution</td>

										<td class="px-4 py-2">
											Genau eine richtige Antwort <b>(Pflicht)</b>
										</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">language</td>

										<td class="px-4 py-2">leer lassen</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">hint</td>

										<td class="px-4 py-2">optional</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">reasons</td>

										<td class="px-4 py-2">optional</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">points</td>

										<td class="px-4 py-2">optional (Standard: 1)</td>
									</tr>

									<tr>
										<td class="px-4 py-2 font-mono">timelimit</td>

										<td class="px-4 py-2">optional (Standard: 30)</td>
									</tr>
								</tbody>
							</table>
						</div>
					</Tabs.Content>

					<Tabs.Content value="multiple" class="mt-6">
						<div class="rounded-lg border">
							<table class="w-full text-sm">
								<thead class="border-b bg-muted/40">
									<tr>
										<th class="px-4 py-2 text-left">Spalte</th>

										<th class="px-4 py-2 text-left">Inhalt</th>
									</tr>
								</thead>

								<tbody>
									<tr class="border-b">
										<td class="px-4 py-2 font-mono">type</td>

										<td class="px-4 py-2">multiple</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">question</td>

										<td class="px-4 py-2">Fragestellung <b>(Pflicht)</b></td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">code</td>

										<td class="px-4 py-2">leer lassen</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">options</td>

										<td class="px-4 py-2">
											Antworten mit <code>|</code> trennen <b>(Pflicht)</b>
										</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">solution</td>

										<td class="px-4 py-2">
											Mehrere richtige Antworten mit <code>|</code> trennen

											<b>(Pflicht)</b>
										</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">language</td>

										<td class="px-4 py-2">leer lassen</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">hint</td>

										<td class="px-4 py-2">optional</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">reasons</td>

										<td class="px-4 py-2">optional</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">points</td>

										<td class="px-4 py-2">optional</td>
									</tr>

									<tr>
										<td class="px-4 py-2 font-mono">timelimit</td>

										<td class="px-4 py-2">optional</td>
									</tr>
								</tbody>
							</table>
						</div>
					</Tabs.Content>

					<Tabs.Content value="open" class="mt-6">
						<div class="rounded-lg border">
							<table class="w-full text-sm">
								<thead class="border-b bg-muted/40">
									<tr>
										<th class="px-4 py-2 text-left">Spalte</th>

										<th class="px-4 py-2 text-left">Inhalt</th>
									</tr>
								</thead>

								<tbody>
									<tr class="border-b">
										<td class="px-4 py-2 font-mono">type</td>

										<td class="px-4 py-2">open</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">question</td>

										<td class="px-4 py-2">Fragestellung <b>(Pflicht)</b></td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">code</td>

										<td class="px-4 py-2">leer lassen</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">options</td>

										<td class="px-4 py-2">leer lassen</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">solution</td>

										<td class="px-4 py-2">
											Mögliche Antworten mit <code>|</code> trennen

											<b>(Pflicht)</b>
										</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">language</td>

										<td class="px-4 py-2">leer lassen</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">hint</td>

										<td class="px-4 py-2">optional</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">reasons</td>

										<td class="px-4 py-2">optional</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">points</td>

										<td class="px-4 py-2">optional</td>
									</tr>

									<tr>
										<td class="px-4 py-2 font-mono">timelimit</td>

										<td class="px-4 py-2">optional</td>
									</tr>
								</tbody>
							</table>
						</div>
					</Tabs.Content>

					<Tabs.Content value="programming" class="mt-6">
						<div class="rounded-lg border">
							<table class="w-full text-sm">
								<thead class="border-b bg-muted/40">
									<tr>
										<th class="px-4 py-2 text-left">Spalte</th>

										<th class="px-4 py-2 text-left">Inhalt</th>
									</tr>
								</thead>

								<tbody>
									<tr class="border-b">
										<td class="px-4 py-2 font-mono">type</td>

										<td class="px-4 py-2">programming</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">question</td>

										<td class="px-4 py-2">Fragestellung <b>(Pflicht)</b></td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">code</td>

										<td class="px-4 py-2">
											{#if format === 'csv'}
												Base64-kodierter Quellcode <b>(Pflicht)</b>
											{:else}
												Quellcode als normaler Text <b>(Pflicht)</b>
											{/if}
										</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">options</td>

										<td class="px-4 py-2">leer lassen</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">solution</td>

										<td class="px-4 py-2">
											Zeilennummern aller fehlerhaften Codezeilen, getrennt mit <code>|</code> <b>(Pflicht)</b>
										</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">language</td>

										<td class="px-4 py-2">
											Programmiersprache <b>(Pflicht)</b>
										</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">hint</td>

										<td class="px-4 py-2">optional</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">reasons</td>

										<td class="px-4 py-2">
											Nutze das Format: Codezeilennummer:Fehlerbeschreibung <b>(Pflicht)</b>
										</td>
									</tr>

									<tr class="border-b">
										<td class="px-4 py-2 font-mono">points</td>

										<td class="px-4 py-2">optional</td>
									</tr>

									<tr>
										<td class="px-4 py-2 font-mono">timelimit</td>

										<td class="px-4 py-2">optional</td>
									</tr>
								</tbody>
							</table>
						</div>
					</Tabs.Content>
				</Tabs.Root>
			</div>
		</div>

		<Dialog.Footer class="flex justify-center gap-4 pt-4">
			<Button variant="outline" onclick={downloadExample}>
				{format === 'xlsx' ? 'Beispiel-XLSX herunterladen' : 'Beispiel-CSV herunterladen'}
			</Button>

			<Button onclick={continueImport}>Datei(en) auswählen</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
