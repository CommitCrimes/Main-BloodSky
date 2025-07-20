// src/pages/FAQ.tsx
import React from "react";
import Footer from "@/components/Footer.tsx";

const FAQ: React.FC = () => {
    return (
        <>
            <div className="px-6 py-10 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Foire Aux Questions (FAQ)</h1>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">1. Quel est l’objectif du projet ?</h2>
                    <p>
                        Le projet vise à mettre en place un système de livraison automatisée de poches de sang entre les
                        banques de sang et les hôpitaux via des drones. Il permet d'accélérer les temps de réponse dans
                        les situations d'urgence médicale.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">2. À qui est destinée la plateforme ?</h2>
                    <p>
                        La plateforme est destinée aux gestionnaires des banques de sang, aux établissements de santé,
                        aux opérateurs de drones (dronistes), et aux administrateurs système du service.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">3. Quels sont les composants du système ?</h2>
                    <p>
                        Le système inclut une flotte de drones autonomes, un boîtier sécurisé pour les poches de sang,
                        une application web d'administration, une application mobile de scan de QR codes, une API de
                        communication drone, et une base de données centralisée.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">4. Les drones sont-ils autonomes ?</h2>
                    <p>
                        Oui, les drones suivent un itinéraire défini automatiquement via notre système de commande. Ils
                        sont capables de prendre en compte les conditions météorologiques et de déclencher des
                        protocoles de sécurité si nécessaire.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">5. Quelles mesures de sécurité sont mises en place ?</h2>
                    <p>
                        Les drones sont dotés de systèmes de verrouillage électronique, de caméras embarquées
                        (optionnelles), d’un parachute en cas de défaillance et d’un suivi GPS en temps réel. Les
                        données sont sécurisées via des protocoles de chiffrement conformes au RGPD.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">6. Comment initier une demande de livraison ?</h2>
                    <p>
                        Depuis la plateforme web, les hôpitaux peuvent remplir un formulaire de demande incluant les
                        besoins en sang, l’adresse de livraison et la priorité. Une notification est ensuite envoyée aux
                        responsables de la banque de sang.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">7. Quels langages et technologies ont été utilisés ?</h2>
                    <p>
                        Front-end : React, TypeScript, Tailwind CSS. Back-end : Node.js, Express, PostgreSQL. Système
                        embarqué : ESP32 (C++/Arduino). Communication : WebSocket, MQTT. Documentation : Swagger.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">8. Que faire en cas de panne ou météo défavorable ?</h2>
                    <p>
                        Le système vérifie automatiquement la météo avant chaque mission. En cas de vent fort ou de
                        conditions défavorables, la livraison est reportée ou annulée. Un rapport d’erreur est généré et
                        transmis aux équipes techniques.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">9. Les données des utilisateurs sont-elles protégées
                        ?</h2>
                    <p>
                        Oui, conformément au RGPD. Toutes les données sont stockées de façon chiffrée. Les accès sont
                        sécurisés et surveillés, et chaque utilisateur est responsable de son compte et de ses accès.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">10. Comment les utilisateurs sont-ils formés ?</h2>
                    <p>
                        Un manuel utilisateur, une documentation technique et des vidéos de démonstration sont fournis.
                        Les super administrateurs peuvent également former les nouveaux utilisateurs via la plateforme.
                    </p>
                </section>
                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">
                        11. Et si je souhaite faire partie du projet en tant qu’hôpital ou banque de sang ?
                    </h2>
                    <p>
                        Si vous représentez un établissement de santé ou une banque de sang et que vous souhaitez
                        collaborer avec notre projet, nous serions ravis d’en discuter. Vous pouvez nous contacter
                        directement via le formulaire disponible sur la page <strong><a href="/contact"
                                                                                        className="text-blue-600 underline">Contact</a></strong>.
                        Un membre de notre équipe vous recontactera dans les plus brefs délais.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">
                        12. Que faire si je rencontre un problème informatique en tant qu’utilisateur ?
                    </h2>
                    <p>
                        En cas de problème technique (connexion, affichage, fonctionnalité bloquée, etc.), deux cas de
                        figure peuvent se présenter :
                        <ul className="list-disc list-inside mt-2">
                            <li>
                                Si vous parvenez à accéder à la plateforme, veuillez nous contacter via la page <strong><a
                                href="/contact" className="text-blue-600 underline">Contact</a></strong> ou en appelant
                                notre support technique au <strong>+33 1 23 45 67 89</strong>.
                            </li>
                            <li>
                                Si vous ne pouvez pas accéder à votre compte, veuillez d’abord contacter
                                l’administrateur de votre établissement (banque de sang ou hôpital) qui pourra faire une
                                demande d’assistance en notre nom.
                            </li>
                        </ul>
                    </p>
                </section>
            </div>
            <Footer/></>
    );
};

export default FAQ;
