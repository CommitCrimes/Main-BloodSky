import React from 'react';
import ContactWidget from '../components/SupportITEmailing';

const Contact: React.FC = () => {
    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f9fafb',
            padding: '40px 20px'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <div style={{
                    textAlign: 'center',
                    marginBottom: '40px'
                }}>
                    <h1 style={{
                        fontSize: '36px',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        marginBottom: '16px'
                    }}>
                        Nous contacter
                    </h1>
                    <p style={{
                        fontSize: '18px',
                        color: '#6b7280',
                        maxWidth: '600px',
                        margin: '0 auto',
                        lineHeight: '1.6'
                    }}>
                        Merci de consulter notre page de FAQ avant de nous contacter, 
                        cette dernière répondant à de multiples questions.
                    </p>
                </div>
                <ContactWidget />
            </div>
        </div>
    );
};

export default Contact;