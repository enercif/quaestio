export type OrgRole = 'owner' | 'admin' | 'member';

export const roleLabels: Record<OrgRole, string> = {
	owner: 'Owner',
	admin: 'Admin',
	member: 'Mitglied'
};
