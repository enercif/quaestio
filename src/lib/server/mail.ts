import { env } from '$env/dynamic/private';
import nodemailer from 'nodemailer';
import { db } from './db';
import { smtpSettingsTable } from './db/schema';

export type SmtpConfig = {
	host: string;
	port: number;
	user?: string | null;
	pass?: string | null;
	from?: string | null;
};

export async function getSmtpConfig(): Promise<SmtpConfig | undefined> {
	const [row] = await db.select().from(smtpSettingsTable).limit(1);
	if (row) return row;
	if (!env.SMTP_HOST) return undefined;
	return {
		host: env.SMTP_HOST,
		port: Number(env.SMTP_PORT ?? 587),
		user: env.SMTP_USER,
		pass: env.SMTP_PASS,
		from: env.SMTP_FROM
	};
}

function transportFor(config: SmtpConfig) {
	return nodemailer.createTransport({
		host: config.host,
		port: config.port,
		auth: config.user ? { user: config.user, pass: config.pass ?? undefined } : undefined
	});
}

export async function sendMail({
	to,
	subject,
	html,
	override
}: {
	to: string;
	subject: string;
	html: string;
	override?: SmtpConfig;
}) {
	const config = override ?? (await getSmtpConfig());
	if (!config) {
		return { success: false as const, error: 'E-Mail-Versand ist nicht konfiguriert.' };
	}

	try {
		await transportFor(config).sendMail({
			from: config.from || config.user || undefined,
			to,
			subject,
			html
		});
		return { success: true as const };
	} catch (error) {
		console.error('Fehler beim Versenden der E-Mail:', error);
		return { success: false as const, error: 'E-Mail konnte nicht versendet werden.' };
	}
}
