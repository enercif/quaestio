import { defineTopics } from 'svelte-realtime';

export const TOPICS = defineTopics({
	rooms: 'rooms',
	room: (roomId: string) => `room:${roomId}`
});
