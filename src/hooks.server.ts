import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { ensureAdminFromEnv } from '$lib/server/setup';
import { svelteKitHandler } from 'better-auth/svelte-kit';

if (!building) {
	// Auto-create the admin account from ADMIN_EMAIL/ADMIN_PASSWORD before the
	// server accepts any requests, so nobody ever sees the setup screen.
	await ensureAdminFromEnv();
}

const handleAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	event.locals.session = session?.session ?? null;
	event.locals.user = session?.user ?? null;

	return svelteKitHandler({ event, resolve, auth, building });
};

// Anonymous id for unauthenticated students (occupancy dedup / answer
// attribution, see src/live/rooms.ts and src/lib/server/occupancy.ts).
// Teachers are identified via event.locals.user, students set their own
// display name via join.remote.ts.
const handleAnonymousId: Handle = async ({ event, resolve }) => {
	if (!event.cookies.get('id')) {
		event.cookies.set('id', crypto.randomUUID(), { path: '/' });
	}
	return resolve(event);
};

export const handle: Handle = sequence(handleAuth, handleAnonymousId);
