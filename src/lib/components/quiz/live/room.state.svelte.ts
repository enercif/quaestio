import type { Room } from '$lib/schemas/room.schema';
import type { Presence } from '$lib/types/presence.type';
import { room } from '$live/rooms';
import { fromStore } from 'svelte/store';

export class RoomState {
	private _room: { readonly current: Room | undefined };
	private _presence: { readonly current: Presence[] | undefined };

	constructor(roomId: string) {
		this._room = fromStore(room.data(roomId));
		this._presence = fromStore(room.presence!(roomId));
	}

	get roomData() {
		return this._room.current;
	}

	get studentPresence() {
		return (this._presence.current ?? []).filter((p) => p.data.type === 'student');
	}
}
