<script lang="ts">
	import { RunnerState } from '$lib/components/quiz/question-runner/question-runner.state.svelte';
	import QuestionRunner from '$lib/components/quiz/question-runner/question-runner.svelte';
	import { submitAnswer } from '$live/rooms';
	import { watch } from 'runed';
	import { toast } from 'svelte-sonner';
	import { liveStudentContext, studentAnswersPersistedState } from './live-student.state.svelte';

	const live = liveStudentContext.get();

	const roomData = $derived(live.roomData!);
	const currentQuestion = $derived(roomData.current_question!);

	watch(
		() => currentQuestion.id,
		(questionId) => {
			if (questionId !== studentAnswersPersistedState.current.questionId) {
				studentAnswersPersistedState.current.questionId = questionId;
				studentAnswersPersistedState.current.selected = [];
			}
		}
	);

	async function submit(selected: string[]) {
		studentAnswersPersistedState.current.selected = selected;
		try {
			await submitAnswer(live.code, selected);
		} catch {
			toast.error('Antwort konnte nicht gesendet werden.');
		}
	}

	RunnerState.init({
		type: 'live',
		live,
		get selected() {
			return studentAnswersPersistedState.current.selected;
		},
		submit
	});
</script>

<QuestionRunner />
