// services/email.supportIT.ts
import nodemailer from 'nodemailer';

type UserRoleCode = 'dronist' | 'hospital_admin' | 'donation_center_admin' | 'super_admin' | 'user';

type SupportPayload = {
  name?: string;
  email?: string;
  message: string;
  subject?: string;
  userId?: number;
  userRole?: UserRoleCode;
  hospitalId?: number;
  centerId?: number;
  meta?: Record<string, unknown>;
};

// petite fonction d’échappement HTML
const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export async function sendSupportEmail(payload: SupportPayload) {
  const {
    name,
    email,
    message,
    subject,
    userId,
    userRole,
    hospitalId,
    centerId,
    meta,
  } = payload;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true', // true si 465
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASSWORD!,
    },
  });

  // Objet : "Sujet — role • #id • Name"
  const subjectParts = [
    subject || 'Nouveau message de support',
    userRole,
    userId ? `#${userId}` : undefined,
    name,
  ].filter(Boolean);
  const subjectLine = subjectParts.join(' • ').replace(' — ', ' — '); // juste pour lisibilité

  // Lignes texte (version plain-text)
  const textLines: string[] = [];
  if (name) textLines.push(`Nom : ${name}`);
  if (email) textLines.push(`Email : ${email}`);
  if (subject) textLines.push(`Sujet : ${subject}`);
  if (userRole) textLines.push(`Rôle : ${userRole}`);
  if (userId) textLines.push(`UserId : ${userId}`);
  if (hospitalId) textLines.push(`Hôpital : ${hospitalId}`);
  if (centerId) textLines.push(`Centre : ${centerId}`);
  textLines.push('', 'Message :', message);

  // Meta supplémentaire (sans doublons)
  const duplicatedKeys = new Set(['name', 'email', 'userId', 'userRole', 'hospitalId', 'centerId', 'subject', 'message']);
  const extraMetaEntries = Object.entries(meta ?? {}).filter(([k]) => !duplicatedKeys.has(k));

  // HTML propre (table de détails + message)
  const detailRow = (label: string, value?: unknown) =>
    value !== undefined && value !== null && String(value) !== ''
      ? `<tr><td style="padding:6px 8px;color:#374151;"><b>${esc(label)}</b></td><td style="padding:6px 8px;color:#111827;">${esc(value)}</td></tr>`
      : '';

  const html = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.45;">
    <h3 style="margin:0 0 12px 0;color:#111827;">Nouveau message de support</h3>

    <table style="border-collapse:collapse;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;width:100%;max-width:640px;">
      ${detailRow('Nom', name)}
      ${detailRow('Email', email)}
      ${detailRow('Sujet', subject)}
      ${detailRow('Rôle', userRole)}
      ${detailRow('UserId', userId)}
      ${detailRow('Hôpital', hospitalId)}
      ${detailRow('Centre', centerId)}
      <tr>
        <td style="padding:6px 8px;color:#374151;vertical-align:top;"><b>Message</b></td>
        <td style="padding:6px 8px;color:#111827;white-space:pre-wrap;">${esc(message)}</td>
      </tr>
      ${
        extraMetaEntries.length
          ? `<tr>
              <td style="padding:6px 8px;color:#374151;vertical-align:top;"><b>Contexte</b></td>
              <td style="padding:6px 8px;color:#111827;">
                <ul style="margin:6px 0 0 16px;padding:0;">
                  ${extraMetaEntries
                    .map(([k, v]) => `<li><b>${esc(k)}:</b> ${esc(typeof v === 'object' ? JSON.stringify(v) : v)}</li>`)
                    .join('')}
                </ul>
              </td>
            </tr>`
          : ''
      }
    </table>

    <div style="margin-top:12px;color:#6b7280;font-size:12px;">
      Envoyé le ${esc(new Date().toLocaleString())}
    </div>
  </div>
  `;

  await transporter.sendMail({
    from: `"BloodSky Support" <${process.env.EMAIL_USER}>`,
    replyTo: email && name ? `"${name}" <${email}>` : email ? email : undefined,
    to: process.env.SUPPORT_EMAIL || 'admin@bloodsky.fr',
    subject: subjectLine,
    text: textLines.join('\n'),
    html,
    // en option : headers techniques exploitables côté helpdesk
    headers: {
      ...(userRole ? { 'X-User-Role': userRole } : {}),
      ...(userId ? { 'X-User-Id': String(userId) } : {}),
      ...(hospitalId ? { 'X-Hospital-Id': String(hospitalId) } : {}),
      ...(centerId ? { 'X-Center-Id': String(centerId) } : {}),
    },
  });
}
