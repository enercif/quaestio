import { createPresence } from 'svelte-adapter-uws/plugins/presence';

export const presence = createPresence({
	key: 'id',
	select: (userData) => ({ id: userData.id, name: userData.name })
});
