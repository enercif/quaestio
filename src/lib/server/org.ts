import { getRequestEvent } from '$app/server';
import type { OrgRole } from '$lib/types/org-role.type';
import { and, eq } from 'drizzle-orm';
import { db } from './db';
import { member, organization } from './db/auth.schema';

export const ORG_SLUG = 'quaestio';

export type { OrgRole };

let cachedOrgId: string | undefined;

export async function getOrgId() {
	if (cachedOrgId) return cachedOrgId;
	const [org] = await db
		.select({ id: organization.id })
		.from(organization)
		.where(eq(organization.slug, ORG_SLUG))
		.limit(1);
	if (!org) throw new Error(`Organization '${ORG_SLUG}' does not exist yet.`);
	cachedOrgId = org.id;
	return org.id;
}

export async function getMemberRole(userId: string): Promise<OrgRole | undefined> {
	const organizationId = await getOrgId();
	const [row] = await db
		.select({ role: member.role })
		.from(member)
		.where(and(eq(member.organizationId, organizationId), eq(member.userId, userId)))
		.limit(1);
	return row?.role as OrgRole | undefined;
}

export async function getMemberRoleById(memberId: string): Promise<OrgRole | undefined> {
	const [row] = await db
		.select({ role: member.role })
		.from(member)
		.where(eq(member.id, memberId))
		.limit(1);
	return row?.role as OrgRole | undefined;
}

export function isOrgAdmin(role: OrgRole | undefined) {
	return role === 'owner' || role === 'admin';
}

export async function requireOrgAdmin() {
	const event = getRequestEvent();
	const userId = event.locals.user?.id;
	const role = userId ? await getMemberRole(userId) : undefined;
	if (!isOrgAdmin(role)) {
		throw new Error('Forbidden');
	}
	return { event, role: role! };
}
