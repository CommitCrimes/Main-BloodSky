import React from 'react';
import Footer from '../components/Footer';
import '../Home.css';
import droneImg from '../assets/drone.png';
import bloodHomeImg from '../assets/blood-home.png';
import medicalHomeImg from '../assets/medical-home.png';

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
const Section4 = () => <section className="section4" style={{minHeight: '100vh', padding: '2rem' }}>Section 4</section>;
const Section5 = () => <section className="section5" style={{ minHeight: '30vh', padding: '2rem' }}>Section 5</section>;

const HomePage: React.FC = () => {
  return (
    <div>
      <Section1 />
      <Section2 />
      <Section3 />
      <Section4 />
      <Section5 />
      <Footer />
    </div>
  );
};

export default HomePage;
