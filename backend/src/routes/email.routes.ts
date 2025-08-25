import { Hono } from 'hono';
import { z } from 'zod';
import { sendSupportEmail } from '@/services/email.supportIT';
import { sendInvitationEmail, generateToken, generateTempPassword } from '@/services/email.service';

export const emailRouter = new Hono();

/**
 * Support message
 * - Tous les champs additionnels sont OPTIONNELS
 * - Les IDs sont "coercés" en number (acceptent string "42")
 * - L’email n’est pas obligatoire (on peut écrire en anonyme), mais
 *   s’il est fourni il doit être valide
 */
const supportSchema = z.object({
  name: z.string().trim().min(1).optional(),
  email: z.string().email().optional(),
  message: z.string().trim().min(1, 'Le message est requis'),

  subject: z.string().trim().optional(),

  userId: z.coerce.number().int().positive().optional(),
  userRole: z
    .enum(['dronist', 'hospital_admin', 'donation_center_admin', 'super_admin', 'user'])
    .optional(),
  hospitalId: z.coerce.number().int().positive().optional(),
  centerId: z.coerce.number().int().positive().optional(),

  // meta libre: ex. { locale, userAgent, ... }
  meta: z.record(z.unknown()).optional(),
});

emailRouter.post('/support', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = supportSchema.safeParse(body);
    if (!parsed.success) {
      return c.json(
        {
          error: 'Champs invalides',
          issues: parsed.error.flatten(),
        },
        422
      );
    }

    await sendSupportEmail(parsed.data);
    return c.json({ success: true, message: 'Message envoyé avec succès !' });
  } catch (e) {
    console.error('Erreur envoi message:', e);
    return c.json({ error: "Erreur lors de l'envoi du message." }, 500);
  }
});

/**
 * Invitation
 * - inchangé, on garde email obligatoire, userName optionnel
 */
const inviteSchema = z.object({
  email: z.string().email(),
  userName: z.string().optional(),
});

emailRouter.post('/invite', async (c) => {
  try {
    const body = await c.req.json();
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) {
      return c.json(
        { error: 'Email invalide', issues: parsed.error.flatten() },
        422
      );
    }

    const token = generateToken();
    const tempPassword = generateTempPassword();

    await sendInvitationEmail(parsed.data.email, token, tempPassword, parsed.data.userName);

    // En prod, ne pas renvoyer token/mot de passe.
    return c.json({ success: true, message: 'Invitation envoyée' });
  } catch (e) {
    console.error('Erreur invitation:', e);
    return c.json({ error: "Impossible d'envoyer l’invitation" }, 500);
  }
});
