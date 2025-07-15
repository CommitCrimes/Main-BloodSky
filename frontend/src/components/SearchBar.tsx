import { useEffect, useState } from 'react';
import api from '../api/api';
import Modal from './Modal';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

type Centre = {
  centerId: string;
  centerAdress: string;
  centerCity: string;
  centerPostal: number;
};

type Utilisateur = {
  user: {
    userId: string;
    userFirstname: string;
    userName: string;
    email: string;
  };
  email: string;
  telNumber: string;
  dteCreate: string;
  userStatus: string;
  admin: boolean;
};

type Livraison = {
  deliveryId: number;
  deliveryStatus: string;
  dteDelivery: string;
  bloodId: number;
};

type Item = Centre | Utilisateur | Livraison;

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allData, setAllData] = useState<Item[]>([]);
  const [categories, setCategories] = useState('centre'); // utilisateur | centre | livraison
  const [sortOption, setSortOption] = useState('');
  const [filteredResults, setFilteredResults] = useState<Item[]>([]);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [formData, setFormData] = useState<any>({});


  useEffect(() => {
    refreshData("/donation-centers"); // chargement initial
  }, []);

  useEffect(() => {
    if (selectedItem) {
      setFormData(selectedItem); // Cloner les données sélectionnées
    }
  }, [selectedItem]);


  useEffect(() => {
    let sorted = [...filteredResults];

    if (categories === 'centre') {
      if (sortOption === 'az') sorted = (sorted as Centre[]).sort((a, b) => a.centerAdress?.localeCompare(b.centerAdress));
      if (sortOption === 'za') sorted = (sorted as Centre[]).sort((a, b) => b.centerAdress?.localeCompare(a.centerAdress));
    }

    if (categories === 'utilisateur') {
      if (sortOption === 'az') sorted = (sorted as Utilisateur[]).sort((a, b) => a.user.userFirstname?.localeCompare(b.user.userFirstname));
      if (sortOption === 'za') sorted = (sorted as Utilisateur[]).sort((a, b) => b.user.userFirstname?.localeCompare(a.user.userFirstname));
    }

    if (categories === 'livraison') {
      if (sortOption === 'livraison-asc') sorted = (sorted as Livraison[]).sort((a, b) => a.deliveryId - b.deliveryId);
      if (sortOption === 'livraison-desc') sorted = (sorted as Livraison[]).sort((a, b) => b.deliveryId - a.deliveryId);
      if (sortOption === 'date-crois') sorted = (sorted as Livraison[]).sort((a, b) => new Date(a.dteDelivery).getTime() - new Date(b.dteDelivery).getTime());
      if (sortOption === 'date-decrois') sorted = (sorted as Livraison[]).sort((a, b) => new Date(b.dteDelivery).getTime() - new Date(a.dteDelivery).getTime());
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Déterminer le bon endpoint selon la catégorie
    let endpoint = '';
    if (categories === 'utilisateur') endpoint = '/users/' + selectedItem.user?.userId;
    if (categories === 'centre') endpoint = '/donation-centers/' + selectedItem.centerId;
    if (categories === 'livraison') endpoint = '/deliveries/' + selectedItem.deliveryId;

    api.put(endpoint, formData)
      .then(() => {
        setModalEdit(false);
        refreshData(endpoint.split('/')[1]); // recharge les données de la bonne catégorie
      })
      .catch((err) => {
        console.error("Erreur lors de l'édition :", err);
        setError("Erreur lors de l'édition.");
      });
  };


  const editInfo = (e: React.FormEvent, item: []) => {
    e.stopPropagation();
    setModalEdit(true);
    setSelectedItem(item);
    console.log(item);

  }

  const suppInfo = (e: React.FormEvent, item: []) => {
    e.stopPropagation();
    setShowConfirm(true)
    setSelectedItem(item);
  }

  const deleteInfo = (path: string, id: string) => {
    api.delete(path + `/${id}`)
      .then(() => {
        setShowConfirm(false)
        refreshData(path)
        setError('');
      })
      .catch((err) => {
        setError("Erreur lors de la suppression du user.");
        setFilteredResults([]);
        console.error(err);
      });
  }
  let form = null;

  if (selectedItem != null) {
    form = (
      <form
        className="flex flex-col justify-center items-center gap-2"
        onSubmit={(e) => handleSubmit(e)}
      >
        {Object.entries(formData).map(([key, value]) => (
          <div key={key} className="flex gap-2 w-full">
            <label className="flex items-center capitalize">{key}</label>
            {key == 'centerId' || key == 'hospitalId' || key == 'deliveryId' ?
              <input
                type="text"
                value={formData[key] ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, [key]: e.target.value })
                }
                className="input-field w-full border px-2 py-1 rounded-md"
                disabled
              /> :
              <input
                type="text"
                value={formData[key] ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, [key]: e.target.value })
                }
                className="input-field w-full border px-2 py-1 rounded-md"
              />
            }
          </div>
        ))}
        <button type="submit" className="btn-primary mt-4">Modifier</button>
      </form>
    );
  }


  return (
    <div className='relative' >
      <div className="w-full max-w-lg px-4 mx-auto mb-6">
        <div className="mb-12 flex flex-col items-center">
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
                      {item.userFirstname} {item.userName}
                    </h3>
                    <p className="text-sm text-gray-500">Email : {item.email}</p>
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
                      Date : {new Date(item.dteDelivery).toLocaleDateString()}</p>
                  </>
                )}
                <div className='absolute -top-4 right-0 flex gap-2'>
                  <div className='bg-gray-400 p-1 rounded-xl'>
                    <button className='text-white' onClick={(e) => { editInfo(e, item) }}><EditIcon/></button> {/* ON click modal en mode edition*/}
                  </div>
                  <div className='bg-red-950 p-1 rounded-xl'>
                    <button className='text-white' onClick={(e) => { suppInfo(e, item) }}><DeleteIcon/></button> {/* ON click confirmation de la supp + supp si oui*/}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Boutons de catégorie */}
      <div className="flex flex-col gap-2 absolute right-0 top-10">
        <button className="btn-primary" onClick={() => { setCategories("utilisateur"); refreshData("/users"); }}>
          Utilisateurs
        </button>
        <button className="btn-primary" onClick={() => { setCategories("centre"); refreshData("/donation-centers"); }}>
          Centres
        </button>
        <button className="btn-primary" onClick={() => { setCategories("livraison"); refreshData("/deliveries"); }}>
          Livraisons
        </button>
      </div>

      {/* Modal Edition d'information (edition) */}
      <Modal isOpen={modalEdit} onClose={() => setModalEdit(false)}>
        {form}
      </Modal>

      {/* Modal suppression d'information*/}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)}>
        <p className='pb-2'>Etes vous sur de vouloir supprimer ces informations</p>
        <div className='flex gap-2'>
          <button type="button" className='btn-primary' onClick={() => deleteInfo("/donation-centers", selectedItem.centerId)}>Oui</button>
          <button type="button" className='btn-primary' onClick={() => setShowConfirm(false)}>Non</button>
        </div>
      </Modal>

      {/* Modal lecture d'information*/}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {selectedItem && (
          <div className='relative'>
            {categories === "utilisateur" && (
              <>
                <p className='absolute bg-red-500 p-2 text-white rounded-xl -left-10 -top-10'>Id du user : {selectedItem.userId}</p>
                <h2 className="text-xl font-semibold text-red-700">
                  {selectedItem.user?.userFirstname} {selectedItem.user?.userName}
                </h2>
                <p>Email : {selectedItem.email}</p>
                <p>Role : {selectedItem.admin == true ? <>Admin</> : <>User</>}</p>
                <p>Tel : {selectedItem.telNumber}</p>
                <p>Date de creation : {new Date(selectedItem.dteCreate).toLocaleDateString()}</p>
                <p>Status du user : {selectedItem.userStatus}</p>

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