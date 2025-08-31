import React from 'react';
import Footer from '../components/Footer';
import '../Home.css';
import droneImg from '../assets/drone.png';
import bloodHomeImg from '../assets/blood-home.png';
import medicalHomeImg from '../assets/medical-home.png';
import feature1 from '../assets/icon-home/cross.png';
import feature2 from '../assets/icon-home/board.png';
import feature3 from '../assets/icon-home/heart.png';
import feature4 from '../assets/icon-home/time.png';
import feature5 from '../assets/icon-home/blood.png';
import feature6 from '../assets/icon-home/center.png';
import boardIcon from '../assets/icon-home/add.svg';
import heartIcon from '../assets/icon-home/validation.svg';
import crossIcon from '../assets/icon-home/box.svg';
import timeIcon from '../assets/icon-home/fly.svg';
import bloodIcon from '../assets/icon-home/heart1.svg';
import { useNavigate } from 'react-router-dom';

const Section1 = () => {
  const navigate = useNavigate();

  return (
    <section className="section1 section1-custom">
      {/* Bouton Se connecter */}
      <button
        className="login-btn"
        onClick={() => navigate('/login')}
        onMouseOver={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)';
        }}
        onMouseOut={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }}
      >
        Se connecter
      </button>
      {/* Texte 1 derrière l'image */}
      <span className="avenir-text">L'AVENIR</span>
      {/* Image du drone */}
      <img src={droneImg} alt="drone" className="drone-img" />
      {/* Texte 2 devant l'image, à gauche */}
      <span className="avec-text">AVEC</span>
      {/* Texte 3 devant l'image, à droite, en rouge */}
      <span className="bloodsky-text">BLOODSKY</span>
    </section>
  );
};
const Section2 = () => (
  <section className="section2 section2-custom">
      <h1 className="section2-title">L'avenir de la logistique médicale,<br className="desktop-br"/>
          c'est maintenant. </h1>
      <div className="section2-content">
      {/* Colonne gauche */}
      <div className="section2-left">
          <div className="section2-text-top">BloodSky révolutionne la livraison médicale <br className="desktop-br"/>
              en transportant des poches de sang par drone,
              rapidement et en toute sécurité.
          </div>
          <img src={bloodHomeImg} alt="Blood Home" className="section2-img-left" />
      </div>
      {/* Colonne droite */}
        <div className="section2-right">
            <img src={medicalHomeImg} alt="Medical Home" className="section2-img-right"/>
            <div className="section2-text-bottom">Destinée aux centres de santé et aux <br className="desktop-br"/>
                maisons de sang, notre technologie sauve <br className="desktop-br"/>
                des vies en réduisant le temps d'attente et <br className="desktop-br"/> en garantissant la fraîcheur
                des transfusions.
            </div>

        </div>
    </div>
  </section>
);
const Section3 = () => (
  <section className="section3 section3-custom">
    <h1 className="section3-title">Chiffres clés</h1>
    <div className="section3-grid">
      <div className="section3-col">
        <div className="section3-col-top">+500</div>
        <div className="section3-col-bottom">Livraisons effectuées</div>
      </div>
      <div className="section3-col">
        <div className="section3-col-top">30</div>
        <div className="section3-col-bottom">Partenaires</div>
      </div>
      <div className="section3-col">
        <div className="section3-col-top">15 min</div>
        <div className="section3-col-bottom">Temps moyen de livraison</div>
      </div>
    </div>
  </section>
);
const Section4 = () => (
  <section className="section4 section4-custom">
    <h1 className="section4-title">Explorez nos fonctionnalités clés</h1>
    <div className="section4-content-blur">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="section4-features-grid" style={{ width: '100%' }}>
          {/* Colonne 1 */}
          <div className="section4-feature-col" style={{ justifyContent: 'flex-end', height: 600 }}>
            <div className="section4-feature-card" style={{ height: 161, width: 337, maxWidth: '100%' }}>
              <img src={feature1} alt="Livraisons en urgence" className="section4-feature-icon" style={{ width: 70, height: 70 }} />
              <div className="section4-feature-text" style={{ fontSize: 28, lineHeight: 1.3 }}>Livraisons en urgence</div>
            </div>
            <div className="section4-feature-card" style={{ height: 254, width: 293, maxWidth: '100%' }}>
              <img src={feature2} alt="Traçabilité des poches de sang" className="section4-feature-icon" style={{ width: 85, height: 85 }} />
              <div className="section4-feature-text" style={{ fontSize: 36, lineHeight: 1.3, marginTop: 15 }}>Traçabilité des poches de sang</div>
            </div>
          </div>
          {/* Colonne 2 */}
          <div className="section4-feature-col" style={{ justifyContent: 'flex-end', height: 600 }}>
            <div className="section4-feature-card" style={{ height: 316, width: 422, maxWidth: '100%' }}>
              <img src={feature3} alt="Demande de livraison en ligne" className="section4-feature-icon" style={{ width: 140, height: 140 }} />
              <div className="section4-feature-text" style={{ fontSize: 48, lineHeight: 1.3 }}>Demande de livraison en ligne</div>
            </div>
            <div className="section4-feature-card" style={{ height: 231, width: 296, maxWidth: '100%' }}>
              <img src={feature4} alt="Livraison rapide par drone" className="section4-feature-icon" style={{ width: 85, height: 85 }} />
              <div className="section4-feature-text" style={{ fontSize: 32, lineHeight: 1.3, marginTop: 15 }}>Livraison rapide par drone</div>
            </div>
          </div>
          {/* Colonne 3 */}
          <div className="section4-feature-col" style={{ justifyContent: 'flex-end', height: 600 }}>
            <div className="section4-feature-card" style={{ height: 244, width: 355, maxWidth: '100%' }}>
              <img src={feature5} alt="Suivi en temps réel des colis" className="section4-feature-icon" style={{ width: 101, height: 101 }} />
              <div className="section4-feature-text" style={{ fontSize: 34, lineHeight: 1.3 }}>Suivi en temps réel des colis</div>
            </div>
            <div className="section4-feature-card" style={{ height: 292, width: 355, maxWidth: '100%' }}>
              <img src={feature6} alt="Sécurité et fiabilité des données" className="section4-feature-icon" style={{ width: 119, height: 119 }} />
              <div className="section4-feature-text" style={{ fontSize: 37, lineHeight: 1.3 }}>Sécurité et fiabilité des données</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
const Section5 = () => (
  <section className="section5-howitworks">
    <h1 className="section5-title">
      Comment ça fonctionne
    </h1>
    <div className="section5-subtitle">
      Un processus sécurisé et efficace pour le transport de produits sanguins par drone
    </div>
    <div className="section5-steps-container">
      {/* Étape 1 */}
      <div className="howitworks-step" style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 16px #e6e6f7', padding: 32, width: 220, position: 'relative', minHeight: 300 }}>
        <div style={{
          position: 'absolute', top: -24, left: 24, background: '#6a8afd', color: '#fff', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, border: '4px solid #e6e6f7'
        }}>1</div>
        <img src={boardIcon} alt="Demande" style={{ width: 54, height: 54, margin: '32px auto 16px', display: 'block', background: '#f1f5ff', borderRadius: 16 }} />
        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8, textAlign: 'center' }}>Demande initiale</div>
        <div style={{ color: '#7b7b93', textAlign: 'center' }}>Le centre de santé ou la banque de sang fait une demande</div>
      </div>
      {/* Flèche */}
      <div style={{ alignSelf: 'center', fontSize: 32, color: '#bdbdf7' }}>→</div>
      {/* Étape 2 */}
      <div className="howitworks-step" style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 16px #e6e6f7', padding: 32, width: 220, position: 'relative', minHeight: 300 }}>
        <div style={{
          position: 'absolute', top: -24, left: 24, background: '#6a8afd', color: '#fff', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, border: '4px solid #e6e6f7'
        }}>2</div>
        <img src={heartIcon} alt="Validation" style={{ width: 54, height: 54, margin: '32px auto 16px', display: 'block', background: '#eaffea', borderRadius: 16 }} />
        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8, textAlign: 'center' }}>Validation</div>
        <div style={{ color: '#7b7b93', textAlign: 'center' }}>Une demande de validation est envoyée à la banque de sang expéditeur et le droniste</div>
      </div>
      {/* Flèche */}
      <div style={{ alignSelf: 'center', fontSize: 32, color: '#bdbdf7' }}>→</div>
      {/* Étape 3 */}
      <div className="howitworks-step" style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 16px #e6e6f7', padding: 32, width: 220, position: 'relative', minHeight: 300 }}>
        <div style={{
          position: 'absolute', top: -24, left: 24, background: '#6a8afd', color: '#fff', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, border: '4px solid #e6e6f7'
        }}>3</div>
        <img src={crossIcon} alt="Préparation" style={{ width: 54, height: 54, margin: '32px auto 16px', display: 'block', background: '#fff0f0', borderRadius: 16 }} />
        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8, textAlign: 'center' }}>Préparation</div>
        <div style={{ color: '#7b7b93', textAlign: 'center' }}>La banque de sang prépare et scanne la poche</div>
      </div>
      {/* Flèche */}
      <div style={{ alignSelf: 'center', fontSize: 32, color: '#bdbdf7' }}>→</div>
      {/* Étape 4 */}
      <div className="howitworks-step" style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 16px #e6e6f7', padding: 32, width: 220, position: 'relative', minHeight: 300 }}>
        <div style={{
          position: 'absolute', top: -24, left: 24, background: '#6a8afd', color: '#fff', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, border: '4px solid #e6e6f7'
        }}>4</div>
        <img src={timeIcon} alt="Décollage" style={{ width: 54, height: 54, margin: '32px auto 16px', display: 'block', background: '#f1f5ff', borderRadius: 16 }} />
        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8, textAlign: 'center' }}>Décollage</div>
        <div style={{ color: '#7b7b93', textAlign: 'center' }}>Un drone est déclenché</div>
      </div>
      {/* Flèche */}
      <div style={{ alignSelf: 'center', fontSize: 32, color: '#bdbdf7' }}>→</div>
      {/* Étape 5 */}
      <div className="howitworks-step" style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 16px #e6e6f7', padding: 32, width: 220, position: 'relative', minHeight: 300 }}>
        <div style={{
          position: 'absolute', top: -24, left: 24, background: '#6a8afd', color: '#fff', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, border: '4px solid #e6e6f7'
        }}>5</div>
        <img src={bloodIcon} alt="Livraison" style={{ width: 54, height: 54, margin: '32px auto 16px', display: 'block', background: '#fff0f0', borderRadius: 16 }} />
        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8, textAlign: 'center' }}>Livraison</div>
        <div style={{ color: '#7b7b93', textAlign: 'center' }}>Plus qu'à récupérer la poche de sang à l'arrivée !</div>
      </div>
    </div>
  </section>
);

const HomePage: React.FC = () => {
    return (
        <div>
            <Section1/>
            <Section2 />
      <Section3 />
      <Section4 />
      <Section5 />
      <Footer />
    </div>
  );
};

export default HomePage;
