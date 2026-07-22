import { defineTopics } from 'svelte-realtime';

export const TOPICS = defineTopics({
	rooms: 'rooms',
	room: (code: string) => `room:${code}`,
	roomAnswers: (code: string) => `room-answers:${code}`
});
