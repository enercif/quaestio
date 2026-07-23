import type { Answer } from '$lib/schemas/answer.schema';
import { roomAnswers } from '$live/rooms';
import { Context } from 'runed';
import { fromStore } from 'svelte/store';
import { RoomState } from '../room.state.svelte';

const liveTeacherContext = new Context<LiveTeacherState>('live-teacher');

export class LiveTeacherState extends RoomState {
	readonly roomId: string;
	readonly userId: string;

	private _answers: { readonly current: Answer[] | undefined };

	constructor(roomId: string, userId: string) {
		super(roomId);
		this.roomId = roomId;
		this.userId = userId;
		this._answers = fromStore(roomAnswers(roomId));
	}

	get isRoomOwner() {
		return this.roomData?.teacherId === this.userId;
	}

	get answers() {
		return this._answers.current ?? [];
	}

	static init(roomId: string, userId: string) {
		return liveTeacherContext.set(new LiveTeacherState(roomId, userId));
	}

	static get() {
		return liveTeacherContext.get();
	}
}
