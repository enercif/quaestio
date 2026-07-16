import { auth } from '$lib/server/auth';
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
		const role = session?.user.role;
		if (session && !session.user.banned && (role === 'teacher' || role === 'admin')) {
			return { id: session.user.id, name: session.user.name, type: 'teacher' };
		}
	}

	return { id: cookies.id, name: cookies.name, type: 'student' };
}
