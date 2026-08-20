import { remainingMs } from '$lib/components/quiz/quiz.utils';
import type { Answer } from '$lib/schemas/answer.schema';
import type { QuizFlow } from '$lib/types/quiz-flow.type';
import {
	nextQuestion,
	pauseTimer,
	resumeTimer,
	roomAnswers,
	showResults as showResultsAction
} from '$live/rooms';
import { Context } from 'runed';
import { toast } from 'svelte-sonner';
import { fromStore } from 'svelte/store';
import { RoomState } from '../room.state.svelte';

type LiveTeacherData = { roomId: string; userId: string };

export const liveTeacherContext = new Context<LiveTeacherState>('live-teacher');

export class LiveTeacherState extends RoomState implements QuizFlow {
	_data: () => LiveTeacherData;

	constructor(data: () => LiveTeacherData) {
		super(() => data().roomId);
		this._data = data;
	}

	readonly roomId = $derived.by(() => this._data().roomId);
	readonly userId = $derived.by(() => this._data().userId);

	private readonly _answers: { readonly current: Answer[] | undefined } = $derived.by(() =>
		fromStore(roomAnswers(this.roomId))
	);

	readonly answers = $derived(this._answers.current ?? []);
	readonly isRoomOwner = $derived(this.roomData?.teacher_id === this.userId);

	revealed = $derived(this.roomData?.state === 'answer');
	paused = $derived(this.roomData?.paused_remaining != null);
	timeUp = $derived(!!this.roomData && remainingMs(this.roomData) === 0);
	isLast = $derived(
		!!this.roomData?.current_question &&
			this.roomData.current_question.position + 1 >= this.roomData.quiz.questions_length
	);

	next = () => this._run(nextQuestion(this.roomId));
	showResults = () => this._run(showResultsAction(this.roomId));
	pause = () => this._run(pauseTimer(this.roomId));
	resume = () => this._run(resumeTimer(this.roomId));

	_run(action: Promise<unknown>) {
		action.catch(() => toast.error('Aktion fehlgeschlagen.'));
	}
}
