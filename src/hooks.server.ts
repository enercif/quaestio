import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { ensureAdminFromEnv } from '$lib/server/setup';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { loadLocales, runWithLocale } from 'wuchale/load-utils/server';
import { locales } from './locales/data.js';
import * as js from './locales/js.loader.server.js';
import * as main from './locales/main.loader.server.svelte.js';

if (!building) {
	await ensureAdminFromEnv();
}

loadLocales(main.key, main.loadCount, main.loadCatalog, locales);
loadLocales(js.key, js.loadCount, js.loadCatalog, locales);

const handleAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	event.locals.session = session?.session ?? null;
	event.locals.user = session?.user ?? null;

	return svelteKitHandler({ event, resolve, auth, building });
};

const handleLocale: Handle = async ({ event, resolve }) => {
	const locale = event.cookies.get('locale') ?? 'de';
	return await runWithLocale(locale, () => resolve(event));
};

export const handle: Handle = sequence(handleAuth, handleLocale);
