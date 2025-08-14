import { Request, Response } from 'express';

// Version ultra-simple avec webhook gratuit
export const sendEmail = async (req: Request, res: Response) => {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
        return res.status(400).json({ error: "Tous les champs sont obligatoires." });
    }
    
    try {
        // Option 1: Utiliser un service webhook gratuit (webhook.site)
        const webhookUrl = "https://webhook.site/votre-url-unique";
        
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: name,
                email: email,
                message: message,
                timestamp: new Date().toISOString(),
                subject: "Nouveau message de support BloodSky"
            })
        });

        if (response.ok) {
            res.status(200).json({ success: true, message: "Message envoyé avec succès !" });
        } else {
            throw new Error("Erreur webhook");
        }
        
    } catch (error) {
        console.error("Erreur envoi message:", error);
        
        // Option 2: Fallback - juste logger le message
        console.log("=== NOUVEAU MESSAGE DE SUPPORT ===");
        console.log("Nom:", name);
        console.log("Email:", email);
        console.log("Message:", message);
        console.log("Date:", new Date().toISOString());
        console.log("==================================");
        
        res.status(200).json({ 
            success: true, 
            message: "Message reçu ! Nous vous répondrons bientôt." 
        });
    }
};

