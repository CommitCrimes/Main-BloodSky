import React from 'react';
import Footer from '../components/Footer';

const Section1 = () => <section style={{ minHeight: '30vh', padding: '2rem' }}>Section 1</section>;
const Section2 = () => <section style={{ minHeight: '30vh', padding: '2rem' }}>Section 2</section>;
const Section3 = () => <section style={{ minHeight: '30vh', padding: '2rem' }}>Section 3</section>;
const Section4 = () => <section style={{ minHeight: '30vh', padding: '2rem' }}>Section 4</section>;
const Section5 = () => <section style={{ minHeight: '30vh', padding: '2rem' }}>Section 5</section>;

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
