<script lang="ts">
	import QuestionView from '$lib/components/quiz/question-view.svelte';
	import { submitAnswer } from '$live/rooms';
	import { watch } from 'runed';
	import { toast } from 'svelte-sonner';
	import { LiveStudentState, studentAnswersPersistedState } from './live-student.state.svelte';

	const live = LiveStudentState.get();

	const roomData = $derived(live.roomData!);
	const currentQuestion = $derived(roomData.current_question!);
	const selected = $derived(studentAnswersPersistedState.current.selected);

	watch(
		() => currentQuestion.id,
		(questionId) => {
			if (questionId !== studentAnswersPersistedState.current.questionId) {
				studentAnswersPersistedState.current.questionId = questionId;
				studentAnswersPersistedState.current.selected = [];
			}
		}
	);

	async function onSubmit(newSelected: string[]) {
		studentAnswersPersistedState.current.selected = newSelected;
		try {
			await submitAnswer(live.code, newSelected);
		} catch {
			toast.error('Antwort konnte nicht gesendet werden.');
		}
	}
</script>

<QuestionView room={roomData} {selected} {onSubmit} />
