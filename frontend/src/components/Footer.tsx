import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer style={{ background: '#E0CBBF', padding: '2rem 1rem 1rem 1rem', marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: 900, margin: '0 auto', flexWrap: 'wrap' }}>
        {/* Colonne gauche */}
        <div style={{ minWidth: 120, marginBottom: '1rem' }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>BloodSky</div>
        </div>
        {/* Colonne centre */}
        <div style={{ minWidth: 120, marginBottom: '1rem' }}>
          <div>        <Link to="/" style={{ color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}>
              Accueil
          </Link></div>
          <div style={{ marginTop: 8 }}><Link to="/faq" style={{ color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}>
              FAQ
          </Link></div>
        </div>
        {/* Colonne droite */}
        <div style={{ minWidth: 120, textAlign: 'right', marginBottom: '1rem' }}>
          <div><Link to="/contact" style={{ color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}>
              Contact
          </Link></div>
          <div style={{ marginTop: 8 }}><Link to="/legal-notice" style={{ color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}>
              Mention Légale
          </Link></div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #ddd', margin: '1rem 0 0.5rem 0', paddingTop: '1rem', textAlign: 'center', fontSize: '0.95rem' }}>
        <Link to="/privacy-policy" style={{ color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}>
          Politique de protection des données
        </Link> – <Link to="/terms-condition" style={{ color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}>
          Conditions Générales d'Utilisation
      </Link>
      </div>
      <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#888', marginTop: 4 }}>
        © 2025 BloodSky. Tous droits réservés.
      </div>
    </footer>
  );
};

export default Footer;
