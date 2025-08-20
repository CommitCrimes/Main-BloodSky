// src/api/hospital.ts
import { api } from './api';

export interface Hospital {
    hospitalId: number;
    hospitalName: string;
    hospitalAdress: string | null;
    hospitalCity: string | null;
    hospitalPostal: number | null;
    // Dans la DB (Drizzle) les décimaux arrivent souvent en string
    hospitalLatitude: string | null;
    hospitalLongitude: string | null;
}

export type CreateHospitalRequest = Omit<Hospital, 'hospitalId'>;
export type UpdateHospitalRequest = Partial<Omit<Hospital, 'hospitalId'>>;

export const hospitalApi = {
    // GET /hospitals
    getAll: async (): Promise<Hospital[]> => {
        const res = await api.get('/hospitals');
        return res.data;
    },

    // GET /hospitals/postal/:postal
    getByPostal: async (postal: number): Promise<Hospital[]> => {
        const res = await api.get(`/hospitals/postal/${postal}`);
        return res.data;
    },
    // GET /hospitals/city/:city
    getByCity: async (city: string): Promise<Hospital[]> => {
        const res = await api.get(`/hospitals/city/${encodeURIComponent(city)}`);
        return res.data;
    },
    
    // GET /hospitals/:id
    getById: async (id: number): Promise<Hospital> => {
        const res = await api.get(`/hospitals/${id}`);
        return res.data;
    },

    // POST /hospitals
    create: async (payload: CreateHospitalRequest): Promise<{ message: string } | string> => {
        const res = await api.post('/hospitals', payload);
        return res.data;
    },

    // PUT /hospitals/:id
    update: async (id: number, patch: UpdateHospitalRequest): Promise<{ message: string } | string> => {
        const res = await api.put(`/hospitals/${id}`, patch);
        return res.data;
    },

    // DELETE /hospitals/:id
    remove: async (id: number): Promise<{ message: string } | string> => {
        const res = await api.delete(`/hospitals/${id}`);
        return res.data;
    },
};
