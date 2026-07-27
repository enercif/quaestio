import { Context, PersistedState } from 'runed';
import { RoomState } from '../room.state.svelte';

type LiveStudentData = { code: string; name: string; id: string };

export const liveStudentContext = new Context<LiveStudentState>('live-student');

export class LiveStudentState extends RoomState {
	_data: () => LiveStudentData;

	constructor(data: () => LiveStudentData) {
		super(() => data().code);
		this._data = data;
	}

	readonly code = $derived.by(() => this._data().code);
	readonly name = $derived.by(() => this._data().name);
	readonly id = $derived.by(() => this._data().id);
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
