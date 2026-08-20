import { auth } from '$lib/server/auth';
import { getMemberRole } from '$lib/server/org';
import type { User } from '$lib/types/user.type';

export { close, message, unsubscribe } from 'svelte-realtime/server';

export async function upgrade({
	cookies,
	headers
}: {
	cookies: Record<string, string>;
	headers: Record<string, string>;
}): Promise<User> {
	if (headers.cookie) {
		const session = await auth.api.getSession({ headers: new Headers({ cookie: headers.cookie }) });
		if (session && (await getMemberRole(session.user.id))) {
			return { id: session.user.id, name: session.user.name, type: 'teacher' };
		}
	}

	return { id: cookies.id, name: cookies.name, type: 'student' };
}
