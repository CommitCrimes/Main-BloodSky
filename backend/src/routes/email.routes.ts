import { Hono } from 'hono';
import { z } from 'zod';
import { sendSupportEmail } from '@/services/email.supportIT';
import { sendInvitationEmail, generateToken, generateTempPassword } from '@/services/email.service'; 
// ^ adapte le chemin si besoin

export const emailRouter = new Hono();

/** Support message */
const supportSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
});

emailRouter.post('/support', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = supportSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: 'Champs invalides: name, email, message' }, 400);

    await sendSupportEmail(parsed.data);
    return c.json({ success: true, message: 'Message envoyé avec succès !' });
  } catch (e) {
    console.error('Erreur envoi message:', e);
    return c.json({ error: "Erreur lors de l'envoi du message." }, 500);
  }
});

/** Invitation */
const inviteSchema = z.object({
  email: z.string().email(),
  userName: z.string().optional(),
});

emailRouter.post('/invite', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: 'Email invalide' }, 400);

    const token = generateToken();
    const tempPassword = generateTempPassword();

    await sendInvitationEmail(parsed.data.email, token, tempPassword, parsed.data.userName);

    // En prod, évite de renvoyer token/tempPassword
    return c.json({ success: true, message: 'Invitation envoyée' });
  } catch (e) {
    console.error('Erreur invitation:', e);
    return c.json({ error: "Impossible d'envoyer l’invitation" }, 500);
  }
});
