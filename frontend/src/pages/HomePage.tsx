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


const Section1 = () => (
  <section className="section1 section1-custom" style={{ maxHeight: '100vh', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
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
const Section2 = () => (
  <section className="section2 section2-custom">
      <h1 className="section2-title">L’avenir de la logistique médicale,<br/>
          c’est maintenant. </h1>
      <div className="section2-content">
      {/* Colonne gauche */}
      <div className="section2-left">
          <div className="section2-text-top">BloodSky révolutionne la livraison médicale <br/>
              en transportant des poches de sang par drone,
              rapidement et en toute sécurité.
          </div>
          <img src={bloodHomeImg} alt="Blood Home" className="section2-img-left" />
      </div>
      {/* Colonne droite */}
        <div className="section2-right">
            <img src={medicalHomeImg} alt="Medical Home" className="section2-img-right"/>
            <div className="section2-text-bottom">Destinée aux centres de santé et aux <br/>
                maisons de sang, notre technologie sauve <br/>
                des vies en réduisant le temps d’attente et <br/> en garantissant la fraîcheur
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
        <div className="section4-features-grid">
          {/* Colonne 1 */}
          <div className="section4-feature-col">
            <div className="section4-feature-card" style={{ height: 181, width: 387, maxWidth: '100%' }}>
              <img src={feature1} alt="Planification de livraisons" className="section4-feature-icon" style={{ width: 70, height: 70 }} />
              <div className="section4-feature-text">Planification de livraisons</div>
            </div>
            <div className="section4-feature-card" style={{ height: 264, width: 293, maxWidth: '100%' }}>
              <img src={feature2} alt="Traçabilité des poches de sang" className="section4-feature-icon" style={{ width: 85, height: 85 }} />
              <div className="section4-feature-text">Traçabilité des poches de sang</div>
            </div>
          </div>
          {/* Colonne 2 */}
          <div className="section4-feature-col">
            <div className="section4-feature-card" style={{ height: 316, width: 422, maxWidth: '100%' }}>
              <img src={feature3} alt="Demande de livraison en ligne" className="section4-feature-icon" style={{ width: 150, height: 150 }} />
              <div className="section4-feature-text">Demande de livraison en ligne</div>
            </div>
            <div className="section4-feature-card" style={{ height: 251, width: 296, maxWidth: '100%' }}>
              <img src={feature4} alt="Livraison rapide par drone" className="section4-feature-icon" style={{ width: 85, height: 85 }} />
              <div className="section4-feature-text">Livraison rapide par drone</div>
            </div>
          </div>
          {/* Colonne 3 */}
          <div className="section4-feature-col">
            <div className="section4-feature-card" style={{ height: 244, width: 355, maxWidth: '100%' }}>
              <img src={feature5} alt="Suivi en temps réel des colis" className="section4-feature-icon" style={{ width: 101, height: 101 }} />
              <div className="section4-feature-text">Suivi en temps réel des colis</div>
            </div>
            <div className="section4-feature-card" style={{ height: 302, width: 355, maxWidth: '100%' }}>
              <img src={feature6} alt="Sécurité et fiabilité des données" className="section4-feature-icon" style={{ width: 119, height: 119 }} />
              <div className="section4-feature-text">Sécurité et fiabilité des données</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
const Section5 = () => <section className="section5" style={{minHeight: '30vh', padding: '2rem'}}>Section 5</section>;

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
