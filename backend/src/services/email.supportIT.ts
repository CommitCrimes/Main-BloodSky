import nodemailer from 'nodemailer';
import crypto from 'crypto';

//Trnasport Outlook
const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: process.env.EMAIL_IT_USER,
    pass: process.env.EMAIL_IT_PASSWORD,
  },
});

app.post("/send-email", async (req, res) => {
    const { name, mail, message} = req.body;
    if (!name || !email || !message) {
        return

    res.status(400).json({error : "Tous les champs sont obligatoires."});
       }
    try {
        await transporter.sendMail({
            from: `"Support IT" <${process.env.EMAIL_USER}>`,
            to: "bellinna.uong@outlook.com" //Test pour l'instant
            subject: `Nouvevau message de ${name}`,
            text: `Email: ${email}\n\nMessage:\n${message}`
            replyTo:email
        });
    
    res.status(200).json({sucess:true, message: "Email envoyé avec succès !"});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de l'envoi de l'email."});
    }
    });

