import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { ensureAdminFromEnv } from '$lib/server/setup';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { svelteKitHandler } from 'better-auth/svelte-kit';

if (!building) {
	await ensureAdminFromEnv();
}

const handleAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	event.locals.session = session?.session ?? null;
	event.locals.user = session?.user ?? null;

	return svelteKitHandler({ event, resolve, auth, building });
};

const handleAnonymousId: Handle = async ({ event, resolve }) => {
	if (!event.cookies.get('id')) {
		event.cookies.set('id', crypto.randomUUID(), { path: '/' });
	}
	return resolve(event);
};

export const handle: Handle = sequence(handleAuth, handleAnonymousId);
