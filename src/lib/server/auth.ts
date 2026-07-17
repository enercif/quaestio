import { getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth } from 'better-auth/minimal';
import { organization } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { db } from './db';
import { getOrgId } from './org';

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: { enabled: true },
	databaseHooks: {
		session: {
			create: {
				before: async (session) => ({
					data: { ...session, activeOrganizationId: await getOrgId() }
				})
			}
		}
	},
	plugins: [
		organization({ invitationExpiresIn: 7 * 24 * 60 * 60 }),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});
