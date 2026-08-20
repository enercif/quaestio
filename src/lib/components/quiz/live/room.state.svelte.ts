import type { Room } from '$lib/schemas/room.schema';
import type { Presence } from '$lib/types/presence.type';
import { room } from '$live/rooms';
import { fromStore } from 'svelte/store';

export class RoomState {
	_code: () => string;

	constructor(code: () => string) {
		this._code = code;
	}

	private readonly _room: { readonly current: Room | undefined } = $derived.by(() =>
		fromStore(room.data(this._code()))
	);
	private readonly _presence: { readonly current: Presence[] | undefined } = $derived.by(() =>
		fromStore(room.presence!(this._code()))
	);

	readonly roomData = $derived(this._room.current);
	readonly studentPresence = $derived(
		(this._presence.current ?? []).filter((p) => p.data.type === 'student')
	);
}
