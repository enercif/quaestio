import type { User } from '$lib/types/user.type';
import { createPresence } from 'svelte-adapter-uws/plugins/presence';

export const presence = createPresence<User>({
	key: 'id',
	select: (userData) => ({ id: userData.id, name: userData.name })
});
