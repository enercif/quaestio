export interface QuizFlow {
	readonly revealed: boolean;
	readonly paused: boolean;
	readonly timeUp: boolean;
	readonly isLast: boolean;
	next: () => void;
	showResults: () => void;
	pause: () => void;
	resume: () => void;
}
