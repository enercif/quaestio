import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	let id = event.cookies.get('id');

	if (!id) {
		id = crypto.randomUUID();
		event.cookies.set('id', id, { path: '/' });
	}

	event.locals.id = id;

	let name = event.cookies.get('name');

	if (!name) {
		name = `Teacher-${id.slice(0, 4)}`;
		event.cookies.set('name', name, { path: '/' });
	}

	event.locals.name = name;

	const response = await resolve(event);
	return response;
};
