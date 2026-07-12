import type { Room } from '$lib/schemas/room.schema';
import type { Presence } from '$lib/types/presence.type';
import { room } from '$live/rooms';
import { Context, PersistedState } from 'runed';
import { fromStore } from 'svelte/store';

const liveStudentContext = new Context<LiveStudentState>('live-student');

export class LiveStudentState {
	readonly roomId: string;
	readonly name: string;
	readonly id: string;

	_room: { readonly current: Room | undefined };
	_presence: { readonly current: Presence[] | undefined };

	constructor(data: { roomId: string; name: string; id: string }) {
		this.roomId = data.roomId;
		this.name = data.name;
		this.id = data.id;
		this._room = fromStore(room.data(data.roomId));
		this._presence = fromStore(room.presence!(data.roomId));
	}

	get roomData() {
		return this._room.current;
	}

	get studentPresence() {
		return (this._presence.current ?? []).filter((p) => p.data.type === 'student');
	}

	static init(data: { roomId: string; name: string; id: string }) {
		return liveStudentContext.set(new LiveStudentState(data));
	}

	static get() {
		return liveStudentContext.get();
	}
}

interface McAnswersState {
	questionId: string;
	selected: string[];
}
export const mcAnswersPersistedState = new PersistedState<McAnswersState>(
	'selected-mc-answers',
	{
		questionId: '',
		selected: []
	},
	{
		storage: 'session'
	}
);
