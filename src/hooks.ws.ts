import type { User } from '$lib/types/user.type';
export { close, message, unsubscribe } from 'svelte-realtime/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function upgrade({ cookies }: any): User {
	return {
		id: cookies.id,
		name: cookies.name,
		type: cookies.type
	};
}
