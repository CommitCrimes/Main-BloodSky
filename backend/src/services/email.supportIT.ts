import nodemailer from 'nodemailer';

type SupportPayload = { name: string; email: string; message: string };

export async function sendSupportEmail({ name, email, message }: SupportPayload) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true', // true si 465
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASSWORD!,
    },
  });

  // Pour la délivrabilité: expéditeur = ton domaine, l'utilisateur en replyTo
  await transporter.sendMail({
    from: `"BloodSky Support" <${process.env.EMAIL_USER}>`,
    replyTo: `"${name}" <${email}>`,
    to: process.env.SUPPORT_EMAIL!,
    subject: 'Nouveau message de support BloodSky',
    text: `Nom: ${name}\nEmail: ${email}\nMessage:\n${message}`,
    html: `
      <h3>Nouveau message de support</h3>
      <p><b>Nom :</b> ${name}</p>
      <p><b>Email :</b> ${email}</p>
      <p><b>Message :</b><br/>${message.replace(/\n/g,'<br/>')}</p>
      <hr/>
      <small>Envoyé le ${new Date().toLocaleString()}</small>
    `,
  });
}
