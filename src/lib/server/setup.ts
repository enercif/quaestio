import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { account, member, organization, user } from '$lib/server/db/auth.schema';
import { ORG_SLUG } from '$lib/server/org';
import { hashPassword } from 'better-auth/crypto';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

export async function hasAnyUser() {
	const [row] = await db.select({ id: user.id }).from(user).limit(1);
	return !!row;
}

async function ensureQuaestioOrg() {
	const [existing] = await db
		.select({ id: organization.id })
		.from(organization)
		.where(eq(organization.slug, ORG_SLUG))
		.limit(1);
	if (existing) return existing.id;

	const id = randomUUID();
	await db
		.insert(organization)
		.values({ id, name: 'Quaestio', slug: ORG_SLUG, createdAt: new Date() });
	return id;
}

export async function createAdminAccount(name: string, email: string, password: string) {
	const id = randomUUID();
	await db.insert(user).values({
		id,
		name,
		email: email.toLowerCase(),
		emailVerified: false
	});
	await db.insert(account).values({
		id: randomUUID(),
		userId: id,
		accountId: id,
		providerId: 'credential',
		password: await hashPassword(password)
	});

	const organizationId = await ensureQuaestioOrg();
	await db.insert(member).values({
		id: randomUUID(),
		organizationId,
		userId: id,
		role: 'owner',
		createdAt: new Date()
	});

	return id;
}

export async function ensureAdminFromEnv() {
	if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) return;
	if (await hasAnyUser()) return;
	await createAdminAccount(env.ADMIN_NAME || 'Admin', env.ADMIN_EMAIL, env.ADMIN_PASSWORD);
}
