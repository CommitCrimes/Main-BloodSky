import React, { useState, useEffect } from 'react';
import { api } from '../api/api';

interface DonationCenter {
  centerId: number;
  centerCity: string;
  centerPostal: number;
  centerAdress: string;
  centerLatitude: number;
  centerLongitude: number;
}

interface Hospital {
  hospitalId: number;
  hospitalName: string;
  hospitalCity: string;
  hospitalPostal: number;
  hospitalAdress: string;
  hospitalLatitude: number;
  hospitalLongitude: number;
}

interface AdminInviteFormProps {
  type: 'donation_center' | 'hospital' | 'add_hospital' | 'add_center';
}

interface FormData {
  email: string;
  userName: string;
  userFirstname: string;
  telNumber: string;
  entityId: string;
  info: string;
}

interface FormErrors {
  email?: string;
  userName?: string;
  userFirstname?: string;
  telNumber?: string;
  entityId?: string;
  general?: string;
}

const getEntityDisplayName = (entity: DonationCenter | Hospital): string => {
  if ('hospitalName' in entity) {
    return `${entity.hospitalName} - ${entity.hospitalCity}`;
  } else {
    return `Centre ${entity.centerCity} - ${entity.centerAdress}`;
  }
};

const getEntityId = (entity: DonationCenter | Hospital): number => {
  return 'hospitalId' in entity ? entity.hospitalId : entity.centerId;
};

const AdminInviteForm: React.FC<AdminInviteFormProps> = ({ type }) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    userName: '',
    userFirstname: '',
    telNumber: '',
    entityId: '',
    info: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [entities, setEntities] = useState<(DonationCenter | Hospital)[]>([]);
  const [loadingEntities, setLoadingEntities] = useState(true);

  // State for add_hospital form
  const [hospitalForm, setHospitalForm] = useState({
    hospitalId: '',
    hospitalName: '',
    hospitalCity: '',
    hospitalPostal: '',
    hospitalAdress: '',
    hospitalLatitude: '',
    hospitalLongitude: '',
  });
  const [hospitalErrors, setHospitalErrors] = useState<{ [key: string]: string }>({});
  const [hospitalSuccess, setHospitalSuccess] = useState('');
  const [hospitalLoading, setHospitalLoading] = useState(false);

  // State for add_center form
  const [centerForm, setCenterForm] = useState({
    centerId: '',
    centerCity: '',
    centerPostal: '',
    centerAdress: '',
    centerLatitude: '',
    centerLongitude: '',
  });
  const [centerErrors, setCenterErrors] = useState<{ [key: string]: string }>({});
  const [centerSuccess, setCenterSuccess] = useState('');
  const [centerLoading, setCenterLoading] = useState(false);

  const entityLabel =
    type === 'donation_center' || type === 'add_center'
      ? 'Centre de donation'
      : 'Hôpital';
  const entityApiPath =
    type === 'donation_center' || type === 'add_center'
      ? 'donation-centers'
      : 'hospitals';

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        setLoadingEntities(true);
        console.log(`Fetching entities from: /${entityApiPath}`);
        const response = await api.get(`/${entityApiPath}`);
        console.log(`Response received:`, response.data);
        setEntities(response.data);
        // Id max + 1
        if (type === 'add_hospital') {
          const hospitals = response.data as Hospital[];
          const maxId = hospitals.reduce((max, h) => Math.max(max, h.hospitalId), 0);
          setHospitalForm(prev => ({ ...prev, hospitalId: String(maxId + 1) }));
        } else if (type === 'add_center') {
          const centers = response.data as DonationCenter[];
          const maxId = centers.reduce((max, c) => Math.max(max, c.centerId), 0);
          setCenterForm(prev => ({ ...prev, centerId: String(maxId + 1) }));
        }
      } catch (error) {
        console.error(`Erreur lors du chargement des ${entityLabel.toLowerCase()}s:`, error);
        console.error('Error details:', error);
      } finally {
        setLoadingEntities(false);
      }
    };

    fetchEntities();
  }, [entityApiPath, entityLabel, type]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    setSuccessMessage('');
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.userName || formData.userName.length < 2) {
      newErrors.userName = 'Le nom d\'utilisateur doit contenir au moins 2 caractères';
    }

    if (!formData.userFirstname || formData.userFirstname.length < 2) {
      newErrors.userFirstname = 'Le prénom doit contenir au moins 2 caractères';
    }

    if (formData.telNumber && !/^\d{10}$/.test(formData.telNumber.replace(/\s/g, ''))) {
      newErrors.telNumber = 'Le numéro de téléphone doit contenir 10 chiffres';
    }

    if (!formData.entityId) {
      newErrors.entityId = `Veuillez sélectionner un ${entityLabel.toLowerCase()}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const payload = {
        email: formData.email,
        userName: formData.userName,
        userFirstname: formData.userFirstname,
        telNumber: formData.telNumber ? parseInt(formData.telNumber.replace(/\s/g, '')) : undefined,
        entityType: type,
        entityId: parseInt(formData.entityId),
        admin: true,
        info: formData.info || '',
      };

      await api.post('/auth/invite-admin', payload);

      setSuccessMessage(`Invitation envoyée avec succès à ${formData.email} pour devenir administrateur du ${entityLabel.toLowerCase()}`);
      
      // Reset form
      setFormData({
        email: '',
        userName: '',
        userFirstname: '',
        telNumber: '',
        entityId: '',
        info: '',
      });

    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
        ? (error.response.data as { message: string }).message
        : 'Une erreur est survenue lors de l\'envoi de l\'invitation';
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for add_hospital form
  const handleHospitalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHospitalForm(prev => ({ ...prev, [name]: value }));
    if (hospitalErrors[name]) {
      setHospitalErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
    setHospitalSuccess('');
  };

  const validateHospitalForm = () => {
    const errors: { [key: string]: string } = {};
    if (!hospitalForm.hospitalName) errors.hospitalName = 'Nom requis';
    if (!hospitalForm.hospitalCity) errors.hospitalCity = 'Ville requise';
    if (!hospitalForm.hospitalPostal || !/^\d{5}$/.test(hospitalForm.hospitalPostal)) errors.hospitalPostal = 'Code postal invalide';
    if (!hospitalForm.hospitalAdress) errors.hospitalAdress = 'Adresse requise';
    if (!hospitalForm.hospitalLatitude || isNaN(Number(hospitalForm.hospitalLatitude))) {
      errors.hospitalLatitude = 'Latitude invalide';
    } else {
      const lat = Number(hospitalForm.hospitalLatitude);
      if (lat < -90 || lat > 90) errors.hospitalLatitude = 'Latitude hors bornes (-90 à 90)';
    }

    if (!hospitalForm.hospitalLongitude || isNaN(Number(hospitalForm.hospitalLongitude))) {
      errors.hospitalLongitude = 'Longitude invalide';
    } else {
      const lon = Number(hospitalForm.hospitalLongitude);
      if (lon < -180 || lon > 180) errors.hospitalLongitude = 'Longitude hors bornes (-180 à 180)';
    }
    setHospitalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleHospitalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateHospitalForm()) return;
    setHospitalLoading(true);
    setHospitalErrors({});
    try {
      const payload = {
        hospitalId: Number(hospitalForm.hospitalId),
        hospitalName: hospitalForm.hospitalName,
        hospitalCity: hospitalForm.hospitalCity,
        hospitalPostal: Number(hospitalForm.hospitalPostal),
        hospitalAdress: hospitalForm.hospitalAdress,
        hospitalLatitude: Number(hospitalForm.hospitalLatitude),
        hospitalLongitude: Number(hospitalForm.hospitalLongitude),
      };
      await api.post('/hospitals', payload);
      setHospitalSuccess('Nouvel hôpital ajouté avec succès !');
      setHospitalForm({
        hospitalId: String(Number(hospitalForm.hospitalId) + 1),
        hospitalName: '',
        hospitalCity: '',
        hospitalPostal: '',
        hospitalAdress: '',
        hospitalLatitude: '',
        hospitalLongitude: '',
      });
    } catch {
      setHospitalErrors({ general: "Erreur lors de l'ajout de l'hôpital." });
    } finally {
      setHospitalLoading(false);
    }
  };

  // Handler for add_center form
  const handleCenterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCenterForm(prev => ({ ...prev, [name]: value }));
    if (centerErrors[name]) {
      setCenterErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
    setCenterSuccess('');
  };

  const validateCenterForm = () => {
    const errors: { [key: string]: string } = {};
    if (!centerForm.centerCity) errors.centerCity = 'Ville requise';
    if (!centerForm.centerPostal || !/^\d{5}$/.test(centerForm.centerPostal)) errors.centerPostal = 'Code postal invalide';
    if (!centerForm.centerAdress) errors.centerAdress = 'Adresse requise';
    if (!centerForm.centerLatitude || isNaN(Number(centerForm.centerLatitude))) {
      errors.centerLatitude = 'Latitude invalide';
    } else {
      const lat = Number(centerForm.centerLatitude);
      if (lat < -90 || lat > 90) errors.centerLatitude = 'Latitude hors bornes (-90 à 90)';
    }
    if (!centerForm.centerLongitude || isNaN(Number(centerForm.centerLongitude))) {
      errors.centerLongitude = 'Longitude invalide';
    } else {
      const lon = Number(centerForm.centerLongitude);
      if (lon < -180 || lon > 180) errors.centerLongitude = 'Longitude hors bornes (-180 à 180)';
    }
    setCenterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCenterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateCenterForm()) return;
    setCenterLoading(true);
    setCenterErrors({});
    try {
      const payload = {
        centerId: Number(centerForm.centerId),
        centerCity: centerForm.centerCity,
        centerPostal: Number(centerForm.centerPostal),
        centerAdress: centerForm.centerAdress,
        centerLatitude: Number(centerForm.centerLatitude),
        centerLongitude: Number(centerForm.centerLongitude),
      };
      await api.post('/donation-centers', payload);
      setCenterSuccess('Nouveau centre ajouté avec succès !');
      setCenterForm({
        centerId: String(Number(centerForm.centerId) + 1),
        centerCity: '',
        centerPostal: '',
        centerAdress: '',
        centerLatitude: '',
        centerLongitude: '',
      });
    } catch {
      setCenterErrors({ general: "Erreur lors de l'ajout du centre." });
    } finally {
      setCenterLoading(false);
    }
  };

  if (type === 'add_hospital') {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ajouter un nouvel hôpital</h3>
        {hospitalSuccess && (
          <div className="mb-4 rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-700">{hospitalSuccess}</div>
          </div>
        )}
        {hospitalErrors.general && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{hospitalErrors.general}</div>
          </div>
        )}
        <form onSubmit={handleHospitalSubmit} className="space-y-4">
          <div>
            <label htmlFor="hospitalId" className="block text-sm font-medium text-gray-700">Identifiant *</label>
            <input
              id="hospitalId"
              name="hospitalId"
              type="text"
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
              value={hospitalForm.hospitalId}
              readOnly
              placeholder={String(Number(hospitalForm.hospitalId) + 1)}
            />
          </div>
          <div>
            <label htmlFor="hospitalName" className="block text-sm font-medium text-gray-700">Nom de l'hôpital *</label>
            <input
              id="hospitalName"
              name="hospitalName"
              type="text"
              required
              className={`mt-1 block w-full px-3 py-2 border ${hospitalErrors.hospitalName ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm`}
              value={hospitalForm.hospitalName}
              onChange={handleHospitalInputChange}
            />
            {hospitalErrors.hospitalName && <p className="mt-1 text-sm text-red-600">{hospitalErrors.hospitalName}</p>}
          </div>
          <div>
            <label htmlFor="hospitalCity" className="block text-sm font-medium text-gray-700">Ville *</label>
            <input
              id="hospitalCity"
              name="hospitalCity"
              type="text"
              required
              className={`mt-1 block w-full px-3 py-2 border ${hospitalErrors.hospitalCity ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm`}
              value={hospitalForm.hospitalCity}
              onChange={handleHospitalInputChange}
            />
            {hospitalErrors.hospitalCity && <p className="mt-1 text-sm text-red-600">{hospitalErrors.hospitalCity}</p>}
          </div>
          <div>
            <label htmlFor="hospitalPostal" className="block text-sm font-medium text-gray-700">Code postal *</label>
            <input
              id="hospitalPostal"
              name="hospitalPostal"
              type="text"
              required
              className={`mt-1 block w-full px-3 py-2 border ${hospitalErrors.hospitalPostal ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm`}
              placeholder='75001'
              value={hospitalForm.hospitalPostal}
              onChange={handleHospitalInputChange}
            />
            {hospitalErrors.hospitalPostal && <p className="mt-1 text-sm text-red-600">{hospitalErrors.hospitalPostal}</p>}
          </div>
          <div>
            <label htmlFor="hospitalAdress" className="block text-sm font-medium text-gray-700">Adresse *</label>
            <input
              id="hospitalAdress"
              name="hospitalAdress"
              type="text"
              required
              className={`mt-1 block w-full px-3 py-2 border ${hospitalErrors.hospitalAdress ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm`}
              placeholder='123 Rue de la Paix'
              value={hospitalForm.hospitalAdress}
              onChange={handleHospitalInputChange}
            />
            {hospitalErrors.hospitalAdress && <p className="mt-1 text-sm text-red-600">{hospitalErrors.hospitalAdress}</p>}
          </div>
          <div>
            <label htmlFor="hospitalLatitude" className="block text-sm font-medium text-gray-700">Latitude *</label>
            <input
              id="hospitalLatitude"
              name="hospitalLatitude"
              type="number"
              step="0.000001"
              required
              className={`mt-1 block w-full px-3 py-2 border ${hospitalErrors.hospitalLatitude ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm`}
              placeholder="48.85"
              min={-90}
              max={90}
              value={hospitalForm.hospitalLatitude}
              onChange={handleHospitalInputChange}
            />
            {hospitalErrors.hospitalLatitude && <p className="mt-1 text-sm text-red-600">{hospitalErrors.hospitalLatitude}</p>}
          </div>
          <div>
            <label htmlFor="hospitalLongitude" className="block text-sm font-medium text-gray-700">Longitude *</label>
            <input
              id="hospitalLongitude"
              name="hospitalLongitude"
              type="number"
              step="0.000001"
              required
              className={`mt-1 block w-full px-3 py-2 border ${hospitalErrors.hospitalLongitude ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm`}
              placeholder="2.35"
              min={-180}
              max={180}
              value={hospitalForm.hospitalLongitude}
              onChange={handleHospitalInputChange}
            />
            {hospitalErrors.hospitalLongitude && <p className="mt-1 text-sm text-red-600">{hospitalErrors.hospitalLongitude}</p>}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={hospitalLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {hospitalLoading ? 'Ajout en cours...' : 'Ajouter l\'hôpital'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (type === 'add_center') {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ajouter un nouveau centre de don</h3>
        {centerSuccess && (
          <div className="mb-4 rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-700">{centerSuccess}</div>
          </div>
        )}
        {centerErrors.general && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{centerErrors.general}</div>
          </div>
        )}
        <form onSubmit={handleCenterSubmit} className="space-y-4">
          <div>
            <label htmlFor="centerId" className="block text-sm font-medium text-gray-700">Identifiant *</label>
            <input
              id="centerId"
              name="centerId"
              type="text"
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
              value={centerForm.centerId}
              readOnly
              placeholder={String(Number(centerForm.centerId) + 1)}
            />
          </div>
          <div>
            <label htmlFor="centerCity" className="block text-sm font-medium text-gray-700">Ville *</label>
            <input
              id="centerCity"
              name="centerCity"
              type="text"
              required
              className={`mt-1 block w-full px-3 py-2 border ${centerErrors.centerCity ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm`}
              value={centerForm.centerCity}
              onChange={handleCenterInputChange}
            />
            {centerErrors.centerCity && <p className="mt-1 text-sm text-red-600">{centerErrors.centerCity}</p>}
          </div>
          <div>
            <label htmlFor="centerPostal" className="block text-sm font-medium text-gray-700">Code postal *</label>
            <input
              id="centerPostal"
              name="centerPostal"
              type="text"
              required
              className={`mt-1 block w-full px-3 py-2 border ${centerErrors.centerPostal ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm`}
              placeholder="75001"
              value={centerForm.centerPostal}
              onChange={handleCenterInputChange}
            />
            {centerErrors.centerPostal && <p className="mt-1 text-sm text-red-600">{centerErrors.centerPostal}</p>}
          </div>
          <div>
            <label htmlFor="centerAdress" className="block text-sm font-medium text-gray-700">Adresse *</label>
            <input
              id="centerAdress"
              name="centerAdress"
              type="text"
              required
              className={`mt-1 block w-full px-3 py-2 border ${centerErrors.centerAdress ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm`}
              placeholder='123 Rue de la Paix'
              value={centerForm.centerAdress}
              onChange={handleCenterInputChange}
            />
            {centerErrors.centerAdress && <p className="mt-1 text-sm text-red-600">{centerErrors.centerAdress}</p>}
          </div>
          <div>
            <label htmlFor="centerLatitude" className="block text-sm font-medium text-gray-700">Latitude *</label>
            <input
              id="centerLatitude"
              name="centerLatitude"
              type="number"
              step="0.000001"
              required
              className={`mt-1 block w-full px-3 py-2 border ${centerErrors.centerLatitude ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm`}
              placeholder="48.85"
              min={-90}
              max={90}
              value={centerForm.centerLatitude}
              onChange={handleCenterInputChange}
            />
            {centerErrors.centerLatitude && <p className="mt-1 text-sm text-red-600">{centerErrors.centerLatitude}</p>}
          </div>
          <div>
            <label htmlFor="centerLongitude" className="block text-sm font-medium text-gray-700">Longitude *</label>
            <input
              id="centerLongitude"
              name="centerLongitude"
              type="number"
              step="0.000001"
              required
              className={`mt-1 block w-full px-3 py-2 border ${centerErrors.centerLongitude ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm`}
              placeholder="2.35"
              min={-180}
              max={180}
              value={centerForm.centerLongitude}
              onChange={handleCenterInputChange}
            />
            {centerErrors.centerLongitude && <p className="mt-1 text-sm text-red-600">{centerErrors.centerLongitude}</p>}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={centerLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {centerLoading ? 'Ajout en cours...' : 'Ajouter le centre'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Inviter un administrateur - {entityLabel}
      </h3>

      {successMessage && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <div className="text-sm text-green-700">{successMessage}</div>
        </div>
      )}

      {errors.general && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{errors.general}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm`}
              placeholder="admin@example.com"
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700">
              Nom d'utilisateur *
            </label>
            <input
              id="userName"
              name="userName"
              type="text"
              required
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.userName ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm`}
              placeholder="Dupont"
              value={formData.userName}
              onChange={handleInputChange}
            />
            {errors.userName && <p className="mt-1 text-sm text-red-600">{errors.userName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="userFirstname" className="block text-sm font-medium text-gray-700">
              Prénom *
            </label>
            <input
              id="userFirstname"
              name="userFirstname"
              type="text"
              required
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.userFirstname ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm`}
              placeholder="Jean"
              value={formData.userFirstname}
              onChange={handleInputChange}
            />
            {errors.userFirstname && <p className="mt-1 text-sm text-red-600">{errors.userFirstname}</p>}
          </div>

          <div>
            <label htmlFor="telNumber" className="block text-sm font-medium text-gray-700">
              Numéro de téléphone
            </label>
            <input
              id="telNumber"
              name="telNumber"
              type="tel"
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.telNumber ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm`}
              placeholder="01 23 45 67 89"
              value={formData.telNumber}
              onChange={handleInputChange}
            />
            {errors.telNumber && <p className="mt-1 text-sm text-red-600">{errors.telNumber}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="entityId" className="block text-sm font-medium text-gray-700">
            {entityLabel} *
          </label>
          {loadingEntities ? (
            <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
              Chargement des {entityLabel.toLowerCase()}s...
            </div>
          ) : (
            <select
              id="entityId"
              name="entityId"
              required
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.entityId ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm`}
              value={formData.entityId}
              onChange={handleInputChange}
            >
              <option value="">Sélectionner un {entityLabel.toLowerCase()}</option>
              {entities.map((entity) => (
                <option key={getEntityId(entity)} value={getEntityId(entity)}>
                  {getEntityDisplayName(entity)}
                </option>
              ))}
            </select>
          )}
          {errors.entityId && <p className="mt-1 text-sm text-red-600">{errors.entityId}</p>}
        </div>

        <div>
          <label htmlFor="info" className="block text-sm font-medium text-gray-700">
            Informations complémentaires
          </label>
          <textarea
            id="info"
            name="info"
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            placeholder="Informations supplémentaires sur l'administrateur..."
            value={formData.info}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || loadingEntities}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Envoi en cours...' : 'Envoyer l\'invitation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminInviteForm;