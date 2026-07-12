import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { deleteQuizById, insertQuiz, updateQuiz } from '$lib/remote/quiz.remote';
import type {
	MultipleChoiceQuestion,
	OpenTextQuestion,
	QuestionAnswer,
	SingleChoiceQuestion
} from '$lib/schemas/question.schema';
import { quizInsertSchema, type QuizInsert, type QuizUpdate } from '$lib/schemas/quiz.schema';
import { getContext, setContext } from 'svelte';
import { toast } from 'svelte-sonner';
import type { ZodError } from 'zod';
import { getTimeAsString } from './quiz-editor-utils';

type SelectedQuestion = MultipleChoiceQuestion | SingleChoiceQuestion | OpenTextQuestion;

const QUIZ_EDITOR_STATE_KEY = Symbol('quiz-editor-state');

export class QuizEditorState {
	quiz: QuizInsert = $state()!;
	initialQuiz!: QuizInsert;
	quizId: string | undefined = $state();
	zodErrors: ZodError | undefined = $state(undefined);
	selectedQuestion: SelectedQuestion | null = $state(null);
	keywordInputValue = $state('');

	estTime = $derived(
		getTimeAsString(this.quiz.questions.reduce((acc, q) => acc + q.timelimit, 0))
	);
	totalPoints = $derived(this.quiz.questions.reduce((acc, q) => acc + q.points, 0));
	hasChanges = $derived(JSON.stringify(this.initialQuiz) !== JSON.stringify(this.quiz));

	constructor(quiz: QuizInsert, quizId: string | undefined) {
		this.initialQuiz = quiz;
		this.quiz = quiz;
		this.quizId = quizId;
		this.selectedQuestion = quiz.questions[0] ?? null;
	}

	addMultipleChoiceQuestion = () => {
		const newMCQuestion: MultipleChoiceQuestion = {
			id: crypto.randomUUID(),
			type: 'multiple',
			timelimit: 30,
			points: 1,
			question: '',
			answers: [],
			correct: [],
			sequence_type: 'numeric',
			position: this.quiz.questions.length
		};
		this.quiz.questions.push(newMCQuestion);
		this.selectedQuestion = this.quiz.questions[this.quiz.questions.length - 1];
	};

	addSingleChoiceQuestion = () => {
		const newSCQuestion: SingleChoiceQuestion = {
			id: crypto.randomUUID(),
			type: 'single',
			timelimit: 30,
			points: 1,
			question: '',
			answers: [],
			correct: [],
			sequence_type: 'numeric',
			position: this.quiz.questions.length
		};
		this.quiz.questions.push(newSCQuestion);
		this.selectedQuestion = this.quiz.questions[this.quiz.questions.length - 1];
	};

	addOpenTextQuestion = () => {
		const newOTQuestion: OpenTextQuestion = {
			id: crypto.randomUUID(),
			type: 'open',
			timelimit: 30,
			points: 1,
			question: '',
			correct: [],
			position: this.quiz.questions.length
		};
		this.quiz.questions.push(newOTQuestion);
		this.selectedQuestion = this.quiz.questions[this.quiz.questions.length - 1];
	};

	addAnswerToSelectedQuestion = () => {
		if (!this.selectedQuestion || this.selectedQuestion.type === 'open') return;
		const newAnswer: QuestionAnswer = {
			id: crypto.randomUUID(),
			text: '',
			position: (this.selectedQuestion as MultipleChoiceQuestion | SingleChoiceQuestion).answers
				.length
		};
		(this.selectedQuestion as MultipleChoiceQuestion | SingleChoiceQuestion).answers.push(
			newAnswer
		);
	};

	isCorrectAnswer = (question: MultipleChoiceQuestion | SingleChoiceQuestion, answerId: string) => {
		return question.correct.includes(answerId);
	};

	toggleMultipleCorrectAnswer = (question: MultipleChoiceQuestion, answerId: string) => {
		question.correct = question.correct.includes(answerId)
			? question.correct.filter((id) => id !== answerId)
			: [...question.correct, answerId];
	};

	setSingleCorrectAnswer = (question: SingleChoiceQuestion, answerId: string) => {
		question.correct = [answerId];
	};

	removeAnswer = (
		question: MultipleChoiceQuestion | SingleChoiceQuestion,
		answerId: string
	) => {
		question.answers = question.answers.filter((a) => a.id !== answerId);
		question.correct = question.correct.filter((id) => id !== answerId);
	};

	removeQuestion = (questionId: string) => {
		this.quiz.questions = this.quiz.questions.filter((q) => q.id !== questionId);
		if (this.selectedQuestion?.id === questionId) {
			this.selectedQuestion = null;
		}

		this.quiz.questions.forEach((q, index) => (q.position = index));
		this.selectedQuestion = this.quiz.questions[0] ?? null;
	};

	onKeywordKeydown = (event: KeyboardEvent) => {
		const selectedQuestion = this.selectedQuestion as OpenTextQuestion;
		if (event.key === 'Enter') {
			const trimmed = this.keywordInputValue.trim();
			if (trimmed) {
				selectedQuestion.correct = [...selectedQuestion.correct, trimmed];
				this.keywordInputValue = '';
			}
		}
	};

	save = async () => {
		try {
			this.quiz.questions_length = this.quiz.questions.length;
			quizInsertSchema.parse(this.quiz);
		} catch (e) {
			this.zodErrors = e as ZodError;
			console.error(this.zodErrors.issues);
			toast.warning('Bitte überprüfe deine Eingaben. Einige Felder sind ungültig oder fehlen.');
			return;
		}

		this.zodErrors = undefined;

		if (this.quizId) {
			const update: QuizUpdate = {
				id: this.quizId,
				...this.quiz
			};
			const result = await updateQuiz(update);
			if (result.success) {
				toast.success('Quiz erfolgreich aktualisiert!');
			} else {
				toast.error('Fehler beim Aktualisieren des Quiz.');
			}
		} else {
			const result = await insertQuiz(this.quiz);
			if (result.success) {
				toast.success('Quiz erfolgreich erstellt!');
				this.quizId = result.quiz?.id;
				goto(resolve(`/teacher/quizzes/${result.quiz?.id}`));
			} else {
				toast.error('Fehler beim Erstellen des Quiz.');
			}
		}
	};

	remove = async () => {
		if (!this.quizId) return;
		const result = await deleteQuizById(this.quizId);
		if (result.success) {
			toast.success('Quiz erfolgreich gelöscht!');
			goto(resolve('/teacher/quizzes'));
		} else {
			toast.error('Fehler beim Löschen des Quiz.');
		}
	};

	preOpenCallback = async () => {
		try {
			quizInsertSchema.parse(this.quiz);
		} catch (e) {
			this.zodErrors = e as ZodError;
			console.error(this.zodErrors.issues);
			toast.warning('Bitte überprüfe deine Eingaben. Einige Felder sind ungültig oder fehlen.');
			return false;
		}

		this.zodErrors = undefined;

		if (this.quizId) {
			const update: QuizUpdate = {
				id: this.quizId,
				...this.quiz
			};
			const result = await updateQuiz(update);
			return result.success;
		} else {
			const result = await insertQuiz(this.quiz);
			return result.success;
		}
	};

	getQuizError = (path: string) => {
		if (!this.zodErrors) return;
		const issue = this.zodErrors.issues.filter((issue) => issue.path.join('.') === path);
		return issue.length > 0 ? issue.map((i) => i.message) : undefined;
	};

	getQuizErrorFuzzy = (path: string) => {
		if (!this.zodErrors) return;
		const issue = this.zodErrors.issues.filter((issue) => issue.path.join('.').includes(path));
		return issue.length > 0 ? issue.map((i) => i.message) : undefined;
	};

	getSelectedQuestionError = (path: string) => {
		if (!this.zodErrors || !this.selectedQuestion) return;

		const index = this.getSelectedQuestionIndex();

		const question = this.zodErrors.issues.find(
			(issue) => issue.path.join('.') === `questions.${index}`
		);
		if (!question) return;

		let questionTypeIndex: number;
		switch (this.selectedQuestion.type) {
			case 'multiple':
				questionTypeIndex = 0;
				break;
			case 'single':
				questionTypeIndex = 1;
				break;
			case 'open':
				questionTypeIndex = 2;
				break;
		}

		//@ts-expect-error: der Array errors existiert im Objekt aber nicht in der Typdefinition daher der ignore
		const errors = question.errors[questionTypeIndex] as (typeof question)[];
		const issue = errors.filter((issue) => issue.path.join('.') === path);

		return issue.length > 0 ? issue.map((i) => i.message) : undefined;
	};

	getSelectedQuestionIndex = () => {
		return this.quiz.questions.findIndex((q) => q.id === this.selectedQuestion?.id);
	};
}

export function createQuizEditorState(quiz: QuizInsert, quizId: string | undefined) {
	const state = new QuizEditorState(quiz, quizId);
	setContext(QUIZ_EDITOR_STATE_KEY, state);
	return state;
}

export function getQuizEditorState(): QuizEditorState {
	return getContext(QUIZ_EDITOR_STATE_KEY);
}
