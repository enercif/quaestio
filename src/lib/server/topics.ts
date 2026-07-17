import { defineTopics } from 'svelte-realtime';

export const TOPICS = defineTopics({
	rooms: 'rooms',
	room: (roomId: string) => `room:${roomId}`,
	roomAnswers: (roomId: string) => `room-answers:${roomId}`
});
