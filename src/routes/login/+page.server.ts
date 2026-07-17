import { hasAnyUser } from '$lib/server/setup';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { needsSetup: !(await hasAnyUser()) };
};
