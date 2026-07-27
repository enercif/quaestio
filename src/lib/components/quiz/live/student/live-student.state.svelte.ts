import { Context, PersistedState } from 'runed';
import { RoomState } from '../room.state.svelte';

const liveStudentContext = new Context<LiveStudentState>('live-student');

export class LiveStudentState extends RoomState {
	readonly code: string;
	readonly name: string;
	readonly id: string;

	constructor(data: { code: string; name: string; id: string }) {
		super(data.code);
		this.code = data.code;
		this.name = data.name;
		this.id = data.id;
	}

	static init(data: { code: string; name: string; id: string }) {
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
	'selected-answers',
	{
		questionId: '',
		selected: []
	},
	{
		storage: 'session'
	}
);
