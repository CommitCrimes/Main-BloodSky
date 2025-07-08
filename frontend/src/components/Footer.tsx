import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer style={{ background: '#f1f1f1', padding: '2rem 1rem 1rem 1rem', marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: 900, margin: '0 auto', flexWrap: 'wrap' }}>
        {/* Colonne gauche */}
        <div style={{ minWidth: 120, marginBottom: '1rem' }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>BloodSky</div>
        </div>
        {/* Colonne centre */}
        <div style={{ minWidth: 120, marginBottom: '1rem' }}>
          <div>Accueil</div>
          <div style={{ marginTop: 8 }}>FAQ</div>
        </div>
        {/* Colonne droite */}
        <div style={{ minWidth: 120, textAlign: 'right', marginBottom: '1rem' }}>
          <div>Contact</div>
          <div style={{ marginTop: 8 }}>Mention légale</div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #ddd', margin: '1rem 0 0.5rem 0', paddingTop: '1rem', textAlign: 'center', fontSize: '0.95rem' }}>
        Politique de protection des données – Politique de gestion des cookies
      </div>
      <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#888', marginTop: 4 }}>
        © 2025 BloodSky. Tous droits réservés.
      </div>
    </footer>
  );
};

export default Footer;
