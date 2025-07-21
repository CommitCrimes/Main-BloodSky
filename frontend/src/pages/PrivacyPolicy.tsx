import React from "react";
import Footer from '../components/Footer';


const PrivacyPolicy: React.FC = () => {
    return (
        <>
            <div className="max-w-4xl mx-auto p-8 text-gray-800">
                <h1 className="text-3xl font-bold mb-6">Politique de Protection des Données</h1>

                <p className="mb-4">
                    Cette politique de protection des données explique comment notre plateforme
                    de gestion des livraisons de poches de sang par drone collecte, utilise, stocke
                    et protège les données personnelles des utilisateurs. Ce projet est réalisé dans
                    le cadre d’un projet académique à Epitech (Pré-MSC).
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-2">1. Données collectées</h2>
                <ul className="list-disc pl-6 mb-4">
                    <li>Données d’identification : nom, prénom, adresse email, rôle (admin, droniste, hôpital...)</li>
                    <li>Informations de connexion : identifiants, adresse IP, historique de connexions</li>
                    <li>Données liées aux livraisons : requêtes, coordonnées de livraison, suivi GPS</li>
                    <li>Données scannées : identifiants de poches de sang (via QR Code)</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-6 mb-2">2. Finalité de la collecte</h2>
                <p className="mb-4">
                    Les données sont collectées uniquement à des fins de :
                </p>
                <ul className="list-disc pl-6 mb-4">
                    <li>Gestion des comptes utilisateurs</li>
                    <li>Suivi et traçabilité des livraisons médicales</li>
                    <li>Assurer la sécurité et le bon déroulement des trajets de drones</li>
                    <li>Améliorer l'expérience utilisateur et garantir la fiabilité du système</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-6 mb-2">3. Sécurité des données</h2>
                <p className="mb-4">
                    Toutes les données sont stockées de manière sécurisée sur des serveurs protégés.
                    Des protocoles d’authentification, de chiffrement et de gestion des accès sont mis en
                    œuvre pour éviter toute fuite ou usage malveillant.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-2">4. Accès aux données</h2>
                <p className="mb-4">
                    Seuls les utilisateurs autorisés ont accès aux données, selon leur rôle :
                </p>
                <ul className="list-disc pl-6 mb-4">
                    <li>Les centres de santé accèdent aux livraisons les concernant</li>
                    <li>Les administrateurs gèrent les utilisateurs et les trajets</li>
                    <li>Les dronistes consultent uniquement les informations liées aux trajets</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-6 mb-2">5. Conservation des données</h2>
                <p className="mb-4">
                    Les données sont conservées pendant toute la durée du projet. À la fin du projet,
                    elles pourront être supprimées définitivement ou anonymisées à des fins de démonstration.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-2">6. Droits des utilisateurs</h2>
                <p className="mb-4">
                    Conformément au RGPD, tout utilisateur dispose d’un droit d’accès, de rectification et de
                    suppression de ses données. Pour exercer ce droit, il peut contacter l’équipe projet via
                    l’email indiqué sur le tableau de bord.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-2">7. Responsable du traitement</h2>
                <p className="mb-4">
                    Ce projet est réalisé à des fins pédagogiques. Le traitement des données est encadré
                    par les membres de l’équipe projet. Aucune donnée ne sera transmise à des tiers.
                </p>

                <p className="mt-8 text-sm text-gray-600">
                    Dernière mise à jour : Juillet 2025
                </p>
            </div>
            <Footer/></>

);

};

export default PrivacyPolicy;
