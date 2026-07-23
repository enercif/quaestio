import { command, getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { smtpSettingsTable } from '$lib/server/db/schema';
import { getSmtpConfig, sendMail, type SmtpConfig } from '$lib/server/mail';
import { getMemberRole, isOrgAdmin } from '$lib/server/org';
import z from 'zod';

async function requireOrgAdmin() {
	const event = getRequestEvent();
	const userId = event.locals.user?.id;
	const role = userId ? await getMemberRole(userId) : undefined;
	if (!isOrgAdmin(role)) {
		throw new Error('Forbidden');
	}
	return event;
}

const smtpConfigSchema = z.object({
	host: z.string().min(1),
	port: z.coerce.number().int().min(1).max(65535),
	user: z.string().optional(),
	pass: z.string().optional(),
	from: z.string().optional()
});

export const getSmtpSettings = query(async (): Promise<SmtpConfig | undefined> => {
	await requireOrgAdmin();
	const config = await getSmtpConfig();
	return config ? { ...config, pass: config.pass ? '' : undefined } : undefined;
});

export const saveSmtpSettings = command(smtpConfigSchema, async (input) => {
	await requireOrgAdmin();

	const [existing] = await db.select().from(smtpSettingsTable).limit(1);
	const pass = input.pass || existing?.pass;

	await db
		.insert(smtpSettingsTable)
		.values({ id: 'default', ...input, pass })
		.onConflictDoUpdate({
			target: smtpSettingsTable.id,
			set: { ...input, pass, updatedAt: new Date().toISOString() }
		});

	void getSmtpSettings().refresh();
	return { success: true as const };
});

export const testSmtpSettings = command(smtpConfigSchema, async (input) => {
	const event = await requireOrgAdmin();
	const to = event.locals.user!.email;

	const [existing] = await db.select().from(smtpSettingsTable).limit(1);
	const pass = input.pass || existing?.pass;

	return sendMail({
		to,
		subject: 'Test-E-Mail von Quaestio',
		html: `<p>Diese Test-E-Mail bestätigt, dass die SMTP-Einstellungen funktionieren.</p>`,
		override: { ...input, pass }
	});
});
