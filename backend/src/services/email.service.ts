import nodemailer from 'nodemailer';
import crypto from 'crypto';

const transporter = nodemailer.createTransport({
  host: 'mail.gandi.net',
  port: 465,
  secure: true,
  auth: {
    user: 'admin@bloodsky.fr',
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateTempPassword = (): string => {
  return crypto.randomBytes(8).toString('hex');
};

export const sendInvitationEmail = async (
  email: string,
  token: string,
  tempPassword: string,
  userName?: string
): Promise<void> => {
  try {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/update-password?token=${token}&temp=${tempPassword}`;
  
  const mailOptions = {
    from: 'admin@bloodsky.fr',
    to: email,
    subject: 'Invitation BloodSky - Première connexion',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d63384;">Bienvenue sur BloodSky</h2>
        
        <p>Bonjour ${userName || ''},</p>
        
        <p>Votre demande a été résolue ! Un administrateur vous a créé un compte sur la plateforme BloodSky.</p>
        
        <p>Pour accéder à votre compte, veuillez cliquer sur le lien ci-dessous pour définir votre mot de passe personnel :</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #d63384; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Définir mon mot de passe
          </a>
        </div>
        
        <p><strong>Important :</strong></p>
        <ul>
          <li>Ce lien est utilisable qu'une seule fois</li>
          <li>Il expire dans 24 heures</li>
          <li>Votre mot de passe temporaire : <code>${tempPassword}</code></li>
        </ul>
        
        <p>Si vous n'arrivez pas à cliquer sur le lien, copiez et collez cette URL dans votre navigateur :</p>
        <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">
          ${resetUrl}
        </p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #6c757d; font-size: 12px;">
          Équipe BloodSky<br>
          Si vous n'avez pas demandé cette invitation, ignorez cet email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw new Error('Impossible d\'envoyer l\'email d\'invitation');
  }
};