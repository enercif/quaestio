import { remainingMs, revealAnswer } from '$lib/components/quiz/quiz.utils';
import type { Question } from '$lib/schemas/question.schema';
import type { PracticeRoomState, QuestionRoomView } from '$lib/types/practice-room.type';
import type { QuizFlow } from '$lib/types/quiz-flow.type';

export class PracticeState implements QuizFlow {
	questions: Question[] = $state([]);
	index = $state(0);
	roomState: PracticeRoomState = $state('question');
	question_ends_at: number | null = $state(null);
	paused_remaining: number | null = $state(null);
	selected: string[] = $state([]);
	current_answers: string[] = $state([]);
	current_reasons: string[] = $state([]);

	constructor(questions: Question[]) {
		this.questions = questions;
		this.beginQuestion();
	}

	get currentQuestion() {
		return this.questions[this.index];
	}

	get isLast() {
		return this.index + 1 >= this.questions.length;
	}

	revealed = $derived(this.roomState === 'answer');
	paused = $derived(this.paused_remaining != null);
	timeUp = $derived(remainingMs(this.roomView) === 0);

	get roomView(): QuestionRoomView {
		return {
			current_question: this.currentQuestion,
			quiz: { questions_length: this.questions.length },
			question_ends_at: this.question_ends_at,
			paused_remaining: this.paused_remaining,
			state: this.roomState,
			current_answers: this.current_answers,
			current_reasons: this.current_reasons
		};
	}

	private beginQuestion() {
		const question = this.questions[this.index];
		this.roomState = 'question';
		this.question_ends_at = question.timelimit ? Date.now() + question.timelimit * 1000 : null;
		this.paused_remaining = null;
		this.selected = [];
		this.current_answers = [];
		this.current_reasons = [];
	}

	submit = (selected: string[]) => {
		if (this.roomState !== 'question') return;
		this.selected = selected;
	};

	pause = () => {
		if (this.roomState !== 'question' || this.paused_remaining != null) return;
		this.paused_remaining = this.question_ends_at
			? Math.max(0, this.question_ends_at - Date.now())
			: -1;
		this.question_ends_at = null;
	};

	resume = () => {
		if (this.paused_remaining == null) return;
		this.question_ends_at = this.paused_remaining >= 0 ? Date.now() + this.paused_remaining : null;
		this.paused_remaining = null;
	};

	showResults = () => {
		if (this.roomState !== 'question') return;
		const revealed = revealAnswer(this.currentQuestion);
		this.current_answers = revealed.current_answers;
		this.current_reasons = revealed.current_reasons;
		this.roomState = 'answer';
		this.question_ends_at = null;
		this.paused_remaining = null;
	};

	next = () => {
		if (this.index + 1 >= this.questions.length) {
			this.roomState = 'finished';
			return;
		}
		this.index++;
		this.beginQuestion();
	};
}
