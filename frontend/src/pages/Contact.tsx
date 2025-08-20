import React from 'react';
import ContactWidget from '../components/SupportITEmailing';
import Footer from '../components/Footer';
import '../index.css';
const Contact: React.FC = () => {
    return (
        <div className="cyber-grid" style={{
            backgroundColor: '#f9fafb',
            padding: '0px 0',
            gap: '50px',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <div style={{
                    textAlign: 'center',
                    marginBottom: '0px'
                }}>
                    <h1 style={{
                        fontSize: '46px',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        marginBottom: '16px',
                        marginTop: '1rem'
                    }}>
                        Nous contacter
                    </h1>
                    <p style={{
                        fontSize: '18px',
                        color: '#6b7280',
                        maxWidth: '600px',
                        margin: '15px auto',
                        marginBottom: '30px',
                        lineHeight: '1.6'
                    }}>
                        Merci de consulter notre page de FAQ avant de nous contacter, 
                        cette dernière répondant à de multiples questions.
                    </p>
                </div>
                <ContactWidget />
            </div>
            <Footer />
        </div>
    );
};

export default Contact;