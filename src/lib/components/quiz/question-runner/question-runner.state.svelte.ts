import { remainingMs } from '$lib/components/quiz/quiz.utils';
import type { QuestionRoomView } from '$lib/types/practice-room.type';
import { Context } from 'runed';
import type { LiveStudentState } from '../live/student/live-student.state.svelte';
import type { PracticeState } from '../practice/practice.state.svelte';

/** Woher der Runner Frage, Auswahl und Submit bezieht. */
export type RunnerSource =
	| { type: 'practice'; practice: PracticeState; readonly showResources: boolean }
	| {
			type: 'live';
			live: LiveStudentState;
			readonly selected: string[];
			submit: (selected: string[]) => void;
	  };

const questionRunnerContext = new Context<RunnerState>('question-runner');

export class RunnerState {
	_source!: RunnerSource;

	room: QuestionRoomView = $derived(
		this._source.type === 'practice' ? this._source.practice.roomView : this._source.live.roomData!
	);
	currentQuestion = $derived(this.room.current_question!);
	revealed = $derived(this.room.state === 'answer');
	correct = $derived(this.room.current_answers ?? []);
	reasons = $derived(this.room.current_reasons ?? []);
	paused = $derived(this.room.paused_remaining != null);
	timeUp = $derived(remainingMs(this.room) === 0);
	locked = $derived(this.revealed || this.paused || this.timeUp);

	selected = $derived(
		this._source.type === 'practice' ? this._source.practice.selected : this._source.selected
	);
	showResources = $derived(this._source.type === 'practice' ? this._source.showResources : false);

	constructor(source: RunnerSource) {
		this._source = source;
	}

	submit = (selected: string[]) => {
		if (this._source.type === 'practice') this._source.practice.submit(selected);
		else this._source.submit(selected);
	};

	static init(source: RunnerSource) {
		return questionRunnerContext.set(new RunnerState(source));
	}

	static get() {
		return questionRunnerContext.get();
	}
}
