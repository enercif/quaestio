import { getInvitationPreview } from '$lib/remote/accept-invitation.remote';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	return {
		invitationId: params.id,
		invite: await getInvitationPreview(params.id)
	};
};
