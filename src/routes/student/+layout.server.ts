import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	cookies.set('type', 'student', { path: '/' });
};
