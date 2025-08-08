import React, { useState } from "react";
import axios from "axios"

const ContactWidget: React.FC = () => {
    const [name; setName] = useState("");
    const [email, setEmail] = useStrate("");
    const [message; setMessage] = useState("");
    const [status, setStatus] = useStrate("");
    const handleSubmit = async (e:React.FormEvent) => {
        e.preventDefault();
        setStatus("Envoi en cours...");
        
        try {
            const res = await axios.post("https://locahost:5000/send-email", { name, email, message});
            if (res.date.sucess) {
                setStatus("Message envoyé avec succès");
                setName("")
                setEmail("")
                setMessage("")
            }
            catch (error) {
                setStatus("Erreur lors de l'envoi.");
            }
        };

        return (
            <div>
                <h3></h3>
                <form on Submit={handleSubmit}>
                    <input type ="text" placeholder="Votre nom et prénom" value={name} onChange={(e) => setName(e.target.value)} required />
                    <input type ="text" placeholder="Votre email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <textarea placeholder="Votre message" value={message} onChange={(e) => setMessage(e.target.value)} required />
                    <button type ="Submit">Envoyer</button>
                </form>
                {status && <p>{status}</p>}
            </div>
        );
    };

    export default ContactWidget;