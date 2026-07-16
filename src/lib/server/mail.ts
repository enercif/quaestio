import { env } from '$env/dynamic/private';
import nodemailer from 'nodemailer';

let transporter: ReturnType<typeof nodemailer.createTransport> | undefined;

function getTransporter() {
	if (!env.SMTP_HOST) return undefined;
	transporter ??= nodemailer.createTransport({
		host: env.SMTP_HOST,
		port: Number(env.SMTP_PORT ?? 587),
		auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined
	});
	return transporter;
}

export async function sendMail({
	to,
	subject,
	html
}: {
	to: string;
	subject: string;
	html: string;
}) {
	const transport = getTransporter();
	if (!transport) {
		return { success: false as const, error: 'E-Mail-Versand ist nicht konfiguriert.' };
	}

	try {
		await transport.sendMail({ from: env.SMTP_FROM || env.SMTP_USER, to, subject, html });
		return { success: true as const };
	} catch (error) {
		console.error('Fehler beim Versenden der E-Mail:', error);
		return { success: false as const, error: 'E-Mail konnte nicht versendet werden.' };
	}
}
