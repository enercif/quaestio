import { remainingMs } from '$lib/components/quiz/quiz.utils';
import type { QuestionRoomView } from '$lib/types/practice-room.type';
import { Context } from 'runed';
import type { LiveStudentState } from '../live/student/live-student.state.svelte';
import type { PracticeState } from '../practice/practice.state.svelte';

export type QuestionRunnerState =
	| { type: 'practice'; practice: PracticeState; showResources: boolean }
	| {
			type: 'live';
			live: LiveStudentState;
			selected: string[];
			submit: (selected: string[]) => void;
	  };

export const questionRunnerContext = new Context<QuestionRunnerState>('question-runner');

export function deriveRunner(ctx: QuestionRunnerState) {
	const room: QuestionRoomView =
		ctx.type === 'practice' ? ctx.practice.roomView : ctx.live.roomData!;
	const selected = ctx.type === 'practice' ? ctx.practice.selected : ctx.selected;
	const submit = ctx.type === 'practice' ? ctx.practice.submit : ctx.submit;
	const showResources = ctx.type === 'practice' ? ctx.showResources : false;
	const currentQuestion = room.current_question!;
	const revealed = room.state === 'answer';
	const correct = room.current_answers ?? [];
	const reasons = room.current_reasons ?? [];
	const paused = room.paused_remaining != null;
	const timeUp = remainingMs(room) === 0;
	const locked = revealed || paused || timeUp;

	return {
		room,
		selected,
		submit,
		showResources,
		currentQuestion,
		revealed,
		correct,
		reasons,
		paused,
		timeUp,
		locked
	};
}
