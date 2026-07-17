<script lang="ts">
	import type { Presence } from '$lib/types/presence.type.js';
	import { fade } from 'svelte/transition';

	interface Props {
		presence: Presence[];
		selfId: string;
		baseSize?: number;
		gap?: number;
		ringScales?: number[];
	}

	let {
		presence,
		selfId,
		baseSize = 64,
		gap = 10,
		ringScales = [1, 0.8, 0.62, 0.46]
	}: Props = $props();

	const maxRing = $derived(ringScales.length - 1);
	const dist = $derived(baseSize + gap);

	const HEX_DIRS = [
		[1, 0],
		[1, -1],
		[0, -1],
		[-1, 0],
		[-1, 1],
		[0, 1]
	] as const;

	type Cell = { x: number; y: number; ring: number; scale: number };

	function ringShrink(ring: number): number {
		if (ring === 0) return 1;
		let cum = 0;
		for (let i = 1; i <= ring; i++) cum += (ringScales[i - 1] + ringScales[i]) / 2;
		return cum / ring;
	}

	function honeycomb(count: number): Cell[] {
		if (count <= 0) return [];
		const cells: Cell[] = [{ x: 0, y: 0, ring: 0, scale: ringScales[0] }];
		for (let ring = 1; ring <= maxRing && cells.length < count; ring++) {
			const shrink = ringShrink(ring);
			const scale = ringScales[ring];
			let q = HEX_DIRS[4][0] * ring;
			let r = HEX_DIRS[4][1] * ring;
			for (let side = 0; side < 6 && cells.length < count; side++) {
				for (let step = 0; step < ring && cells.length < count; step++) {
					cells.push({
						x: dist * (q + r / 2) * shrink,
						y: dist * (Math.sqrt(3) / 2) * r * shrink,
						ring,
						scale
					});
					q += HEX_DIRS[side][0];
					r += HEX_DIRS[side][1];
				}
			}
		}
		return cells;
	}

	const sortedPresence = $derived([
		...presence.filter((p) => p.key === selfId),
		...presence.filter((p) => p.key !== selfId)
	]);

	const cells = $derived(honeycomb(sortedPresence.length));
	const placed = $derived(
		sortedPresence.slice(0, cells.length).map((entry, i) => ({ entry, cell: cells[i] }))
	);
	const hiddenCount = $derived(sortedPresence.length - placed.length);

	const containerHeight = $derived(
		cells.length
			? Math.max(baseSize, ...cells.map((c) => Math.abs(c.y) * 2 + baseSize * c.scale)) + 8
			: 0
	);
</script>

<div class="flex w-full flex-col items-center gap-2">
	<div class="relative w-full" style:height="{containerHeight}px">
		{#each placed as { entry, cell } (entry.key)}
			{@const student = entry.data}
			{@const isSelf = entry.key === selfId}
			<div
				transition:fade
				class={[
					'absolute top-1/2 left-1/2 flex items-center justify-center rounded-full border bg-secondary transition-all duration-500 ease-out',
					isSelf ? 'z-10 border-primary shadow-sm' : 'z-0'
				]}
				style:width="{baseSize * cell.scale}px"
				style:height="{baseSize * cell.scale}px"
				style:transform="translate(calc(-50% + {cell.x}px), calc(-50% + {cell.y}px))"
				style:opacity={isSelf ? 1 : 0.9 - cell.ring * 0.15}
				title={student.name}
			>
				<span class="font-semibold select-none" style:font-size="{Math.round(16 * cell.scale)}px">
					{student.name.slice(0, 2).toUpperCase()}
				</span>
			</div>
		{/each}
	</div>
	{#if hiddenCount > 0}
		<p class="text-sm text-muted-foreground">+{hiddenCount} weitere</p>
	{/if}
</div>
