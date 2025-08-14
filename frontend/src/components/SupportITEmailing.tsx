import React, { useState } from "react";

const ContactWidget: React.FC = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState("");
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("Envoi en cours...");
        
        try {
            // Version temporaire - simulation d'envoi
            console.log("Message de contact :", {
                name,
                email,
                message,
                timestamp: new Date().toISOString()
            });
            
            // Simuler un délai d'envoi
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setStatus("Message envoyé avec succès !");
            setName("");
            setEmail("");
            setMessage("");
            
        } catch (error) {
            console.error("Erreur envoi:", error);
            setStatus("Erreur lors de l'envoi.");
        }
    };

    return (
        <div style={{
            maxWidth: '500px',
            margin: '0 auto',
            padding: '30px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
        }}>
            <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '25px',
                color: '#1f2937',
                textAlign: 'center'
            }}>
                Contactez le support IT
            </h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#374151'
                    }}>
                        Nom et prénom
                    </label>
                    <input 
                        type="text" 
                        placeholder="Votre nom et prénom"
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '2px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '16px',
                            transition: 'border-color 0.2s',
                            boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                </div>
                
                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#374151'
                    }}>
                        Email
                    </label>
                    <input 
                        type="email" 
                        placeholder="votre.email@exemple.com"
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '2px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '16px',
                            transition: 'border-color 0.2s',
                            boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                </div>
                
                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#374151'
                    }}>
                        Message
                    </label>
                    <textarea 
                        placeholder="Décrivez votre problème ou question..."
                        value={message} 
                        onChange={(e) => setMessage(e.target.value)} 
                        required 
                        rows={5}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '2px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '16px',
                            transition: 'border-color 0.2s',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                </div>
                
                <div style={{ marginTop: '10px' }}>
                    <input 
                        type="submit" 
                        value="Envoyer le message" 
                        style={{
                            width: '100%',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            padding: '14px 24px',
                            fontSize: '16px',
                            fontWeight: '600',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                    />
                </div>
            </form>
            
            {status && (
                <div style={{ 
                    marginTop: '20px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: status.includes('succès') ? '#dcfce7' : '#fee2e2',
                    border: `1px solid ${status.includes('succès') ? '#22c55e' : '#ef4444'}`,
                    color: status.includes('succès') ? '#166534' : '#dc2626',
                    textAlign: 'center',
                    fontWeight: '500'
                }}>
                    {status}
                </div>
            )}
        </div>
    );
};

export default ContactWidget;