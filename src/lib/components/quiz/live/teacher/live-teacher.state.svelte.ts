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

const liveTeacherContext = new Context<LiveTeacherState>('live-teacher');

export class LiveTeacherState extends RoomState implements QuizFlow {
	readonly roomId: string;
	readonly userId: string;

	private _answers: { readonly current: Answer[] | undefined };

	revealed = $derived(this.roomData?.state === 'answer');
	paused = $derived(this.roomData?.paused_remaining != null);
	timeUp = $derived(!!this.roomData && remainingMs(this.roomData) === 0);
	isLast = $derived(
		!!this.roomData?.current_question &&
			this.roomData.current_question.position + 1 >= this.roomData.quiz.questions_length
	);

	constructor(roomId: string, userId: string) {
		super(roomId);
		this.roomId = roomId;
		this.userId = userId;
		this._answers = fromStore(roomAnswers(roomId));
	}

	get isRoomOwner() {
		return this.roomData?.teacher_id === this.userId;
	}

	get answers() {
		return this._answers.current ?? [];
	}

	next = () => this._run(nextQuestion(this.roomId));
	showResults = () => this._run(showResultsAction(this.roomId));
	pause = () => this._run(pauseTimer(this.roomId));
	resume = () => this._run(resumeTimer(this.roomId));

	_run(action: Promise<unknown>) {
		action.catch(() => toast.error('Aktion fehlgeschlagen.'));
	}

	static init(roomId: string, userId: string) {
		return liveTeacherContext.set(new LiveTeacherState(roomId, userId));
	}

	static get() {
		return liveTeacherContext.get();
	}
}
