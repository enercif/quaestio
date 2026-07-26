import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { deleteQuizById, insertQuiz, updateQuiz } from '$lib/remote/quiz.remote';
import type {
	MultipleChoiceQuestion,
	Question,
	QuestionType,
	SingleChoiceQuestion
} from '$lib/schemas/question.schema';
import { quizInsertSchema, type QuizInsert } from '$lib/schemas/quiz.schema';
import { Context } from 'runed';
import { toast } from 'svelte-sonner';
import type { ZodError } from 'zod';
import { getQuestionMaxPoints } from '../quiz.utils';
import { getTimeAsString } from './editor-utils';

const quizEditorContext = new Context<EditorState>('quiz-editor');

export class EditorState {
	quiz: QuizInsert = $state()!;
	initialQuiz: QuizInsert = $state.raw()!;
	quizId: string | undefined = $state();
	zodErrors: ZodError | undefined = $state();
	selectedId: string | null = $state(null);

	estTime = $derived(getTimeAsString(this.quiz.questions.reduce((acc, q) => acc + q.timelimit, 0)));
	totalPoints = $derived(this.quiz.questions.reduce((acc, q) => acc + getQuestionMaxPoints(q), 0));
	hasChanges = $derived(JSON.stringify(this.initialQuiz) !== JSON.stringify(this.quiz));
	selectedIndex = $derived(this.quiz.questions.findIndex((q) => q.id === this.selectedId));

	constructor(quiz: QuizInsert, quizId: string | undefined) {
		this.quiz = quiz;
		this.initialQuiz = $state.snapshot(this.quiz);
		this.quizId = quizId;
		this.selectedId = quiz.questions[0]?.id ?? null;
	}

	get selectedQuestion(): Question | null {
		return this.quiz.questions.find((q) => q.id === this.selectedId) ?? null;
	}

	set selectedQuestion(question: Question | null) {
		this.selectedId = question?.id ?? null;
	}

	addQuestion = (type: QuestionType) => {
		const base = {
			id: crypto.randomUUID(),
			timelimit: 30,
			points: 1,
			question: '',
			position: this.quiz.questions.length,
			resources: []
		};

		let question: Question;

		switch (type) {
			case 'open':
				question = { ...base, type, correct: [] };
				break;

			case 'multiple':
				question = {
					...base,
					type,
					correct: {},
					answers: [],
					sequence_type: 'numeric',
					reasons: {},
					scoring: 'binary',
					partial_points: {}
				};
				break;

			case 'single':
				question = {
					...base,
					type,
					correct: {},
					answers: [],
					sequence_type: 'numeric',
					reasons: ''
				};
				break;

			case 'programming':
				question = {
					...base,
					type,
					code: '',
					language: '',
					correct: [],
					reasons: {},
					hint: '',
					scoring: 'binary',
					partial_points: {}
				};
				break;

			default:
				throw new Error(`Unsupported question type: ${type}`);
		}

		this.quiz.questions.push(question);
		this.selectedId = question.id;
	};

	addAnswer = () => {
		const question = this.selectedQuestion;
		if (!question || question.type === 'open' || question.type === 'programming') return;
		question.answers.push({ id: crypto.randomUUID(), text: '' });
	};

	toggleCorrectAnswer = (
		question: MultipleChoiceQuestion | SingleChoiceQuestion,
		id: string,
		text: string
	) => {
		if (question.type === 'single') {
			question.correct = { [id]: text };
			return;
		}
		if (question.correct[id]) {
			delete question.reasons[id];
			delete question.correct[id];
			delete question.partial_points[id];
		} else {
			question.correct[id] = text;
			question.partial_points[id] = 1;
		}
	};

	removeAnswer = (question: MultipleChoiceQuestion | SingleChoiceQuestion, answerId: string) => {
		question.answers = question.answers.filter((a) => a.id !== answerId);
		delete question.correct[answerId];
		if (question.type === 'multiple') delete question.partial_points[answerId];
	};

	addResource = () => {
		const question = this.selectedQuestion;
		if (!question) return;
		question.resources.push({ id: crypto.randomUUID(), label: '', href: '' });
	};

	removeResource = (resourceId: string) => {
		const question = this.selectedQuestion;
		if (!question) return;
		question.resources = question.resources.filter((r) => r.id !== resourceId);
	};

	removeQuestion = (questionId: string) => {
		this.quiz.questions = this.quiz.questions.filter((q) => q.id !== questionId);
		this.quiz.questions.forEach((q, index) => (q.position = index));
		if (this.selectedId === questionId) {
			this.selectedId = this.quiz.questions[0]?.id ?? null;
		}
	};

	save = async () => {
		const isNew = !this.quizId;
		if (!(await this.upsert())) {
			if (!this.zodErrors) toast.error('Fehler beim Speichern des Quiz.');
			return;
		}
		toast.success(isNew ? 'Quiz erfolgreich erstellt!' : 'Quiz erfolgreich aktualisiert!');
		if (isNew) goto(resolve(`/teacher/quizzes/${this.quizId}`));
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

	upsert = async (): Promise<boolean> => {
		this.quiz.questions_length = this.quiz.questions.length;

		this.quiz.questions.forEach((q) => {
			if (q.type === 'single' || q.type === 'open') return;

			Object.entries(q.reasons).forEach(([key, value]) => {
				if (value.trim() === '') delete q.reasons[key];
			});
		});

		const parsed = quizInsertSchema.safeParse(this.quiz);
		if (!parsed.success) {
			this.zodErrors = parsed.error;
			toast.warning('Bitte überprüfe deine Eingaben. Einige Felder sind ungültig oder fehlen.');
			return false;
		}
		this.zodErrors = undefined;

		const result = this.quizId
			? await updateQuiz({ id: this.quizId, ...this.quiz })
			: await insertQuiz(this.quiz);
		if (!result.success) return false;

		this.quizId = result.quiz?.id ?? this.quizId;
		this.initialQuiz = $state.snapshot(this.quiz);
		return true;
	};

	getQuizError = (path: string) => {
		const messages = this.zodErrors?.issues
			.filter((issue) => issue.path.join('.') === path)
			.map((issue) => issue.message);
		return messages?.length ? messages : undefined;
	};

	getSelectedQuestionError = (path: string) => {
		return this.getQuizError(`questions.${this.selectedIndex}.${path}`);
	};

	hasQuestionError = (index: number) => {
		return !!this.zodErrors?.issues.some((issue) =>
			issue.path.join('.').startsWith(`questions.${index}.`)
		);
	};

	static init(quiz: QuizInsert, quizId: string | undefined) {
		return quizEditorContext.set(new EditorState(quiz, quizId));
	}

	static get() {
		return quizEditorContext.get();
	}
}
