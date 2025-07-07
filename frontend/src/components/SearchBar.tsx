import { use, useEffect, useState } from 'react';
import api from '../api/api';
import Modal from './Modal';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allData, setAllData] = useState([]);
  const [categories, setCategories] = useState('centre'); // utilisateur | centre | livraison
  const [sortOption, setSortOption] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [modalEdit, setModalEdit] = useState(false)

  useEffect(() => {
    refreshData("/donation-centers"); // chargement initial
  }, []);

  useEffect(() => {
    let sorted = [...filteredResults];

    if (categories === 'centre') {
      if (sortOption === 'az') sorted.sort((a, b) => a.centerAdress?.localeCompare(b.centerAdress));
      if (sortOption === 'za') sorted.sort((a, b) => b.centerAdress?.localeCompare(a.centerAdress));
    }

    if (categories === 'utilisateur') {
      if (sortOption === 'az') sorted.sort((a, b) => a.user?.firstname?.localeCompare(b.user?.firstname));
      if (sortOption === 'za') sorted.sort((a, b) => b.user?.firstname?.localeCompare(a.user?.firstname));
    }

    if (categories === 'livraison') {
      if (sortOption === 'livraison-asc') sorted.sort((a, b) => a.deliveryId - b.deliveryId);
      if (sortOption === 'livraison-desc') sorted.sort((a, b) => b.deliveryId - a.deliveryId);
      if (sortOption === 'date-crois') sorted.sort((a, b) => new Date(a.dteDelivery).getTime() - new Date(b.dteDelivery).getTime());
      if (sortOption === 'date-decrois') sorted.sort((a, b) => new Date(b.dteDelivery).getTime() - new Date(a.dteDelivery).getTime());
    }

    setFilteredResults(sorted);
  }, [sortOption, categories]);

  const refreshData = (path: string) => {
    api.get(path)
      .then((res) => {
        setAllData(res.data);
        setFilteredResults(res.data);
        console.log(res.data)
        setError('');
      })
      .catch((err) => {
        setError("Erreur lors du chargement des données.");
        setFilteredResults([]);
        console.error(err);
      });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const term = searchTerm.toLowerCase();

    const filtered = allData.filter((item: any) => {
      if (categories === "centre") {
        return item.centerCity?.toLowerCase().includes(term) ||
          item.centerAdress?.toLowerCase().includes(term) ||
          item.centerPostal?.toString().includes(term);
      }
      if (categories === "utilisateur") {
        return item.user?.firstname?.toLowerCase().includes(term) ||
          item.user?.lastname?.toLowerCase().includes(term) ||
          item.user?.email?.toLowerCase().includes(term);
      }
      if (categories === "livraison") {
        return item.bloodId?.toString().includes(term) ||
          item.deliveryStatus?.toLowerCase().includes(term);
      }
      return false;
    });

    if (filtered.length === 0) setError('Aucun résultat trouvé.');
    setFilteredResults(filtered);
  };

  const editInfo = (e, item) => {
    e.stopPropagation();
    setModalEdit(true);
    setSelectedItem(item);
    console.log(item);
    for(let i=0; i < selectedItem.length; i++){
     //add one input avec ses infos      
  }
  }

  const deleteInfo = () => {
    //requete delete avec un id et un champs (pour savoir dans quel table supp)
  }

  let formulaire = selectedItem.map((champ) => {
    console.log(champ);

  })

  return (
    <div className="page-container relative">
      <div className="w-full max-w-lg px-4 mx-auto">
        <div className="mb-12 flex flex-col items-center">
          <img src="/blood-drop.svg" alt="BloodSky Logo" className="w-16 h-16 mb-4 logo-animation" />
          <h1 className="text-3xl font-bold text-red-600 mb-2">
            Rechercher {categories === "livraison" ? "une" : "un"} {categories}
          </h1>
          <p className="text-center text-gray-600 share-tech-font mb-8">
            {categories === "utilisateur" ? "Entrez un nom ou prénom" :
              categories === "centre" ? "Entrez une ville, un code postal ou une adresse" :
                "Entrez un ID ou un statut de livraison"}
          </p>
        </div>

        {/* Formulaire de recherche */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Information à chercher"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />

          <select
            className="px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-700 bg-white"
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="">Trier par</option>
            {categories === "centre" && (
              <>
                <option value="az">Adresse (A → Z)</option>
                <option value="za">Adresse (Z → A)</option>
              </>
            )}
            {categories === "utilisateur" && (
              <>
                <option value="az">Prénom (A → Z)</option>
                <option value="za">Prénom (Z → A)</option>
              </>
            )}
            {categories === "livraison" && (
              <>
                <option value="livraison-asc">N° Livraison ↑</option>
                <option value="livraison-desc">N° Livraison ↓</option>
                <option value="date-crois">Date ↑</option>
                <option value="date-decrois">Date ↓</option>
              </>
            )}
          </select>

          <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all">
            Chercher
          </button>
        </form>

        {/* Message d'erreur */}
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        {/* Affichage des résultats */}
        {filteredResults.length > 0 && (
          <div className="mt-8 space-y-4">
            {filteredResults.map((item: any, index: number) => (
              <div key={index}
                onClick={() => { setSelectedItem(item); setModalOpen(true) }}
                className="relative p-4 border rounded-xl shadow-sm bg-white hover:shadow-md transition-all">
                {categories === "utilisateur" && (
                  <>
                    <h3 className="text-lg font-semibold text-red-700">
                      {item.user?.userFirstname} {item.user?.userName}
                    </h3>
                    <p className="text-sm text-gray-500">Email : {item.user?.email}</p>
                  </>
                )}
                {categories === "centre" && (
                  <>
                    <h3 className="text-lg font-semibold text-red-700">{item.centerAdress}</h3>
                    <p className="text-sm text-gray-500">{item.centerCity}, {item.centerPostal}</p>
                  </>
                )}
                {categories === "livraison" && (
                  <>
                    <h3 className="text-lg font-semibold text-red-700">Livraison #{item.deliveryId}</h3>
                    <p className="text-sm text-gray-500">Status : {item.deliveryStatus}</p>
                    <p className='text-sm text-red-600'>
                      Date : {new Date(selectedItem.dteDelivery).toLocaleDateString()}</p>
                  </>
                )}
                <div className='absolute -top-4 right-0 flex gap-2'>
                  <div className='bg-gray-400 p-1 rounded-xl'>
                    <button className='text-white' onClick={(e) => { editInfo(e, item) }}>Edit</button> {/* ON click modal en mode edition*/}
                  </div>
                  <div className='bg-red-950 p-1 rounded-xl'>
                    <button className='text-white' onClick={() => { setShowConfirm(true) }}>Supp</button> {/* ON click confirmation de la supp + supp si oui*/}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Boutons de catégorie */}
      <div className="flex flex-col gap-2 absolute right-0 top-10">
        <button className="btn-primary" onClick={() => { setCategories("utilisateur"); refreshData("/users-donation-centers"); }}>
          Utilisateurs
        </button>
        <button className="btn-primary" onClick={() => { setCategories("centre"); refreshData("/donation-centers"); }}>
          Centres
        </button>
        <button className="btn-primary" onClick={() => { setCategories("livraison"); refreshData("/delivery"); }}>
          Livraisons
        </button>
      </div>

      {/* Modal Edition d'information (creation & edition) */}
      <Modal isOpen={modalEdit} onClose={() => setModalEdit(false)}>
        {isEditing ? <>

        </> : 
        <></>}
      </Modal>

      {/* Modal suppression d'information*/}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)}>
        <p>Etes vous sur de vouloir supprimer ces informations</p>
        <button type="button" onClick={() => deleteInfo()}>Oui</button>
        <button type="button" onClick={() => setShowConfirm(false)}>Non</button>
      </Modal>

      {/* Modal lecture d'information*/}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {selectedItem && (
          <div className='relative'>
            {categories === "utilisateur" && (
              <>
                <p className='absolute bg-red-500 p-2 text-white rounded-xl -left-10 -top-10'>Id du user : {selectedItem.user?.userId}</p>
                <h2 className="text-xl font-semibold text-red-700">
                  {selectedItem.user?.userFirstname} {selectedItem.user?.userName}
                </h2>
                <p>Email : {selectedItem.user?.email}</p>
                <p>Role : {selectedItem.user?.admin == true ? <>Admin</> : <>User</>}</p>
                <p>Tel : {selectedItem.user?.telNumber}</p>
                <p>Date de creation : {new Date(selectedItem.user?.dteCreate).toLocaleDateString()}</p>
                <p>Status du user : {selectedItem.user?.userStatus}</p>

              </>
            )}
            {categories === "centre" && (
              <>
                <p className='absolute bg-red-500 p-2 text-white rounded-xl -left-10 -top-10'>Id du centre : {selectedItem.centerId}</p>
                <h2 className="text-xl font-semibold text-red-700">{selectedItem.centerAdress}</h2>
                <p>{selectedItem.centerCity}, {selectedItem.centerPostal}</p>
              </>
            )}
            {categories === "livraison" && (
              <>
                <h2 className="text-xl font-semibold text-red-700">Livraison #{selectedItem.deliveryId}</h2>
                <p>Status : {selectedItem.deliveryStatus}</p>
                <p>
                  Date : {new Date(selectedItem.dteDelivery).toLocaleDateString()}
                </p>
              </>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
};

export default SearchBar;