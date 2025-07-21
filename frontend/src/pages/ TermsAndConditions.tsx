import React from "react";
import Footer from "@/components/Footer.tsx";

const TermsAndConditions: React.FC = () => {
    return (
        <>
            <div className="max-w-4xl mx-auto p-8 text-gray-800">
                <h1 className="text-3xl font-bold mb-6">Conditions Générales d’Utilisation (CGU)</h1>

                <p className="mb-4">
                    En accédant à cette plateforme, vous acceptez les présentes Conditions Générales d’Utilisation.
                    Ce projet a été réalisé à des fins pédagogiques et ne représente pas un service réel.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-2">1. Objet</h2>
                <p className="mb-4">
                    La plateforme simule la gestion et le suivi de livraisons médicales par drone dans le cadre d’un
                    projet éducatif.
                    Les utilisateurs peuvent interagir selon leur rôle : super admin, centre de santé, droniste.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-2">2. Accès au service</h2>
                <p className="mb-4">
                    L’accès est restreint aux membres du projet et enseignants encadrants. Aucune ouverture au public
                    n’est prévue.
                    Des comptes utilisateurs sont créés manuellement à des fins de démonstration.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-2">3. Responsabilités</h2>
                <p className="mb-4">
                    L’équipe ne garantit pas l’exactitude ou la fiabilité des données simulées. Aucune responsabilité ne
                    pourra être engagée en cas de bug ou erreur.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-2">4. Données personnelles</h2>
                <p className="mb-4">
                    Les données collectées sont utilisées uniquement dans le cadre pédagogique. Aucune donnée réelle de
                    santé n’est utilisée.
                    Voir la <a href="/privacy-policy" className="underline text-blue-600">politique de protection des
                    données</a>.
                </p>

                <h2 className="text-2xl font-semibold mt-6 mb-2">5. Propriété intellectuelle</h2>
                <p className="mb-4">
                    L’ensemble du contenu est protégé. Toute réutilisation est interdite sans l’accord explicite de
                    l’équipe projet.
                </p>

                <p className="mt-8 text-sm text-gray-600">
                    Dernière mise à jour : Juillet 2025
                </p>
            </div>
            <Footer/></>
    );
};

export default TermsAndConditions;
