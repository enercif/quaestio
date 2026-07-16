import { getInviteByToken } from '$lib/remote/register.remote';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	return {
		token: params.token,
		invite: await getInviteByToken(params.token)
	};
};
