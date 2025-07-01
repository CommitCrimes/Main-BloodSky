import { useEffect, useState } from 'react';
import api from '../api/api';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allCenters, setAllCenters] = useState([]); // Tous les centres
  const [categories, setCategories] = useState('centre'); // Choix entre [utilisateurs / centres / livraisons]
  const [sortOption, setSortOption] = useState('');
  const [filteredResults, setFilteredResults] = useState([]); // Résultats filtrés
  const [error, setError] = useState('');

  useEffect(() => {
    api.get("/donation-centers") // Choix selectionner par default a l'ouverture de la page
      .then((response) => {
        setAllCenters(response.data)
        setFilteredResults(response.data)
      })
      .catch((err) => {
        setError("Erreur lors du chargement des centres.");
        console.error(err);
      });
  }, []);

  useEffect(() => {
    let sorted = [...filteredResults]
    if (sortOption === 'az') {
      sorted.sort((a, b) => {
        const nameA = (a.centerAdress || a.name || '').toLowerCase();
        const nameB = (b.centerAdress || b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    }

    else if (sortOption === 'za') {
      sorted.sort((a, b) => {
        const nameA = (a.centerAdress || a.name || '').toLowerCase();
        const nameB = (b.centerAdress || b.name || '').toLowerCase();
        return nameB.localeCompare(nameA);
      });
    }

    else if (sortOption === 'livraison-asc') {
      sorted.sort((a, b) => (a.livraisonId || 0) - (b.livraisonId || 0));
    }

    else if (sortOption === 'livraison-desc') {
      sorted.sort((a, b) => (b.livraisonId || 0) - (a.livraisonId || 0));
    }

    else if (sortOption === 'livraison-desc') {
      sorted.sort((a, b) => (b.livraisonId || 0) - (a.livraisonId || 0));
    }

    else if (sortOption == "date-crois"){
      sorted.sort((a, b) => (b.date || 0) - (a.date || 0))
    }
    // Ajoute d'autres cas comme "date" ici si les objets ont une date

    setFilteredResults(sorted);
  }, [sortOption])

  // Actualise ou change les data recherchées
  const refreshData = (path : string) => {
    api.get(path) // Choix selectionner en changeant de page <-[path]
      .then((response) => {
        setAllCenters(response.data)
        setFilteredResults(response.data)
        console.log('data : ' , response.data)
        setError("")
      })
      .catch((err) => {
        setError("Erreur lors du chargement des données.");
        setFilteredResults([])
        console.error(err);
      });
  }
  // Fonction de recherche (avec filtrage)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const filtered = allCenters.filter((center: any) => {
      const term = searchTerm.toLowerCase();
      return (
        center.centerCity?.toLowerCase().includes(term) ||
        center.centerAdress?.toLowerCase().includes(term) ||
        center.centerPostal?.toString().includes(term)
      );
    });

    if (filtered.length === 0) {
      setError('Aucun résultat trouvé.');
    }

    setFilteredResults(filtered);
  };

  return (
    <div className="page-container relative">
      <div className="w-full max-w-lg px-4 mx-auto">
        <div className="mb-12 flex flex-col items-center">
          <img
            src="/blood-drop.svg"
            alt="BloodSky Logo"
            className="w-16 h-16 mb-4 logo-animation"
          />
          <h1 className="text-3xl font-bold text-red-600 mb-2">Rechercher {categories == "livraison" ? <>une</> : <>un</>} {categories}</h1>
          <p className="text-center text-gray-600 share-tech-font mb-8">
            {categories == "utilisateur" ? <>Entrez un nom ou prenom</> :
              categories == "centre" ? <>Entrez une ville, un code postal ou un nom de centre</> :
                categories == "livraison" ? <>Entrez un id, un hopital ...</> : null
            }
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value) }}
            placeholder="Information a chercher"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />

          <select
            name="filter"
            id="searchFilter"
            className="px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-700 bg-white"
            onChange={(e) => { setSortOption(e.target.value) }}
          >
            <option value="">Trier par</option>
            <option value="az">Nom (A à Z)</option>
            <option value="za">Nom (Z à A)</option>
            <option value="date">Date</option>
            <option value="livraison-asc">N° de Livraison ↑</option>
            <option value="livraison-desc">N° de Livraison ↓</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
          >
            Chercher
          </button>

        </form>

        {error && (
          <p className="text-red-500 mt-4 text-center">{error}</p>
        )}

        {filteredResults.length > 0 && ( // Resultat de la recherche des data en bdd
          <div className="mt-8 space-y-4">
            {filteredResults.map((center: any) => (
              <div
                key={center.centerId}
                className="p-4 border rounded-xl shadow-sm bg-white hover:shadow-md transition-all"
              >
                {categories == "utilisateur" ? <><h3 className="text-lg font-semibold text-red-700">{center.userId}</h3>
                  <p className="text-sm text-gray-500">{center.centerCity}, {center.centerPostal}</p></> :
              categories == "centre" ? <><h3 className="text-lg font-semibold text-red-700">{center.centerAdress}</h3>
                  <p className="text-sm text-gray-500">{center.centerCity}, {center.centerPostal}</p></> :
                categories == "livraison" ? <><h3 className="text-lg font-semibold text-red-700">{center.bloodId}</h3>
                  <p className="text-sm text-gray-500">{center.centerCity}, status : {center.deliveryStatus}</p></> : null
            }
              </div>
            ))}
          </div>
        )}
      </div>
      <div className='flex flex-col gap-2 absolute right-0'>
        <div><button className='btn-primary' onClick={() => { setCategories("utilisateur"); refreshData("/users-donation-centers") }}>Utilisateurs</button></div>
        <div><button className='btn-primary' onClick={() => { setCategories("centre"); refreshData("/donation-centers") }}>Centres</button></div>
        <div><button className='btn-primary' onClick={() => { setCategories("livraison"); refreshData("/delivery") }}>Livraisons</button></div>
      </div>
    </div>
  );
};

export default SearchBar;
