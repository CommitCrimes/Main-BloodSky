import React from "react";
import Footer from "@/components/Footer.tsx";

const LegalNotice: React.FC = () => {
    return (
        <>
            <div className="max-w-5xl mx-auto p-8 text-gray-900">
                <h1 className="text-3xl font-bold mb-6">Mentions Légales</h1>

                <section className="mb-6">
                    <h2 className="text-2xl font-semibold mb-2">1. Informations légales</h2>
                    <p>
                        Conformément aux dispositions des articles 6-III et 19 de la Loi n°2004-575 du 21 juin 2004 pour
                        la confiance dans l'économie numérique, il est porté à la connaissance des utilisateurs du site
                        les présentes mentions légales.
                    </p>
                    <p>
                        Le site présenté a été réalisé dans le cadre d'un projet pédagogique au sein d'Epitech, par une
                        équipe d'étudiants.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-2xl font-semibold mb-2">2. Éditeur du site</h2>
                    <p>Nom du projet : Livraison de poches de sang par drone</p>
                    <p>Responsables de publication : l'équipe projet (Aurélien Maury, Armand Braud, Arnaud Meron,
                        Andreea Rauta, Alex Fraiol, Bellinna Uong)</p>
                    <p>Adresse : 24 rue Pasteur, 94270 Le Kremlin-Bicêtre, France</p>
                    <p>Contact : projet.drone@epitech.eu</p>
                </section>

                <section className="mb-6">
                    <h2 className="text-2xl font-semibold mb-2">3. Hébergement</h2>
                    <p>
                        Ce site est hébergé via les serveurs d’Epitech ou sur les machines locales de développement.
                        L’hébergement est exclusivement destiné à un usage interne et pédagogique.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-2xl font-semibold mb-2">4. Propriété intellectuelle</h2>
                    <p>
                        L'ensemble du contenu présent sur le site (textes, images, graphismes, logo, icônes, sons,
                        logiciels, code source) est la propriété exclusive des membres du projet, sauf mention contraire
                        explicite.
                    </p>
                    <p>
                        Toute reproduction, distribution, modification, adaptation, retransmission ou publication, même
                        partielle, de ces différents éléments est strictement interdite sans l'accord préalable écrit du
                        groupe projet.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-2xl font-semibold mb-2">5. Limite de responsabilité</h2>
                    <p>
                        Ce site est un prototype à visée pédagogique. Il peut contenir des erreurs ou des
                        fonctionnalités incomplètes. L'équipe projet ne saurait être tenue responsable des dommages
                        directs ou indirects causés par l'utilisation du site ou des données présentées.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-2xl font-semibold mb-2">6. Loi applicable</h2>
                    <p>
                        Le présent site est régi par la loi française. Tout litige relatif à son usage sera soumis à la
                        compétence des tribunaux français.
                    </p>
                </section>

                <p className="text-sm text-gray-500">Dernière mise à jour : Juillet 2025</p>
            </div>
            <Footer/></>
    );
};

export default LegalNotice;