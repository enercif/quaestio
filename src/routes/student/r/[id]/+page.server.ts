import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, cookies }) => {
	return {
		roomId: params.id,
		name: cookies.get('name') ?? 'Unknown',
		id: cookies.get('id') ?? 'Unknown'
	};
};
