import nodemailer from 'nodemailer';
import type Transporter from 'nodemailer/lib/mailer';

export type GmailSendResult = { messageId: string };

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
};

function getSmtpConfig(): SmtpConfig | null {
  const user = process.env.GMAIL_SMTP_USER || process.env.GMAIL_FROM_EMAIL;
  const pass = process.env.GMAIL_SMTP_APP_PASSWORD;
  if (!user || !pass) return null;

  const port = Number(process.env.GMAIL_SMTP_PORT || 587);
  const secure = process.env.GMAIL_SMTP_SECURE === 'true' || port === 465;

  return {
    host: process.env.GMAIL_SMTP_HOST || 'smtp.gmail.com',
    port,
    secure,
    user: user.trim(),
    pass: pass.replace(/\s/g, ''), // App passwords are often copied with spaces
    fromEmail: (process.env.GMAIL_FROM_EMAIL || user).trim(),
    fromName: process.env.GMAIL_FROM_NAME || 'Nacho Tsvetkov',
  };
}

export function isGmailConfigured(): boolean {
  return getSmtpConfig() !== null;
}

let cachedTransport: Transporter | null = null;

function getTransport(config: SmtpConfig): Transporter {
  if (!cachedTransport) {
    cachedTransport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
    });
  }
  return cachedTransport;
}

/** Send an HTML email via Gmail SMTP (App Password). */
export async function sendGmailHtml(
  toEmail: string,
  subject: string,
  html: string,
): Promise<GmailSendResult> {
  const config = getSmtpConfig();
  if (!config) {
    throw new Error(
      'Gmail SMTP is not configured. Set GMAIL_SMTP_USER and GMAIL_SMTP_APP_PASSWORD in .env.local (see .env.example).',
    );
  }

  const transport = getTransport(config);
  const to = toEmail.trim().toLowerCase();

  const info = await transport.sendMail({
    from: `${config.fromName} <${config.fromEmail}>`,
    to,
    subject: subject.replace(/\r?\n/g, ' '),
    html,
  });

  return { messageId: info.messageId || 'unknown' };
}
