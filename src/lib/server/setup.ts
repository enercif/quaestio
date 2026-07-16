import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { account, user } from '$lib/server/db/auth.schema';
import { hashPassword } from 'better-auth/crypto';
import { randomUUID } from 'node:crypto';

export async function hasAnyUser() {
	const [row] = await db.select({ id: user.id }).from(user).limit(1);
	return !!row;
}

export async function createAdminAccount(name: string, email: string, password: string) {
	const id = randomUUID();
	await db.insert(user).values({
		id,
		name,
		email: email.toLowerCase(),
		emailVerified: false,
		role: 'admin'
	});
	await db.insert(account).values({
		id: randomUUID(),
		userId: id,
		accountId: id,
		providerId: 'credential',
		password: await hashPassword(password)
	});
	return id;
}

export async function ensureAdminFromEnv() {
	if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) return;
	if (await hasAnyUser()) return;
	await createAdminAccount(env.ADMIN_NAME || 'Admin', env.ADMIN_EMAIL, env.ADMIN_PASSWORD);
}
