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
  type: 'donation_center' | 'hospital';
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

  const entityLabel = type === 'donation_center' ? 'Centre de donation' : 'Hôpital';
  const entityApiPath = type === 'donation_center' ? 'donation-centers' : 'hospitals';

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        setLoadingEntities(true);
        console.log(`Fetching entities from: /${entityApiPath}`);
        const response = await api.get(`/${entityApiPath}`);
        console.log(`Response received:`, response.data);
        setEntities(response.data);
      } catch (error) {
        console.error(`Erreur lors du chargement des ${entityLabel.toLowerCase()}s:`, error);
        console.error('Error details:', error);
      } finally {
        setLoadingEntities(false);
      }
    };

    fetchEntities();
  }, [entityApiPath, entityLabel]);

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