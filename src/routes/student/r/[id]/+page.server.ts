import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, cookies }) => {
	return {
		id: params.id,
		name: cookies.get('name') ?? 'Unknown'
	};
};
