import { Context, PersistedState } from 'runed';
import { RoomState } from '../room.state.svelte';

const liveStudentContext = new Context<LiveStudentState>('live-student');

export class LiveStudentState extends RoomState {
	readonly roomId: string;
	readonly name: string;
	readonly id: string;

	constructor(data: { roomId: string; name: string; id: string }) {
		super(data.roomId);
		this.roomId = data.roomId;
		this.name = data.name;
		this.id = data.id;
	}

	static init(data: { roomId: string; name: string; id: string }) {
		return liveStudentContext.set(new LiveStudentState(data));
	}

	static get() {
		return liveStudentContext.get();
	}
}

interface StudentAnswersState {
	questionId: string;
	selected: string[];
}
export const studentAnswersPersistedState = new PersistedState<StudentAnswersState>(
	'selected-mc-answers',
	{
		questionId: '',
		selected: []
	},
	{
		storage: 'session'
	}
);
