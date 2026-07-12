import type { Room } from '$lib/schemas/room.schema';
import type { Presence } from '$lib/types/presence.type';
import { room } from '$live/rooms';
import { Context } from 'runed';
import { fromStore } from 'svelte/store';

const liveTeacherContext = new Context<LiveTeacherState>('live-teacher');

export class LiveTeacherState {
	readonly roomId: string;

	_room: { readonly current: Room | undefined };
	_presence: { readonly current: Presence[] | undefined };

	constructor(roomId: string) {
		this.roomId = roomId;
		this._room = fromStore(room.data(roomId));
		this._presence = fromStore(room.presence!(roomId));
	}

	get roomData() {
		return this._room.current;
	}

	get studentPresence() {
		return (this._presence.current ?? []).filter((p) => p.data.type === 'student');
	}

	static init(roomId: string) {
		return liveTeacherContext.set(new LiveTeacherState(roomId));
	}

	static get() {
		return liveTeacherContext.get();
	}
}
