// src/api/deliveries.ts
import { api } from './api';

// src/api/deliveries.ts
import type {
    Delivery,
    DeliveryWithParticipants,
    CreateDeliveryRequest,
    UpdateDeliveryRequest,
} from '@/types/delivery';


export const deliveryApi = {
    // GET /deliveries
    getAll: async (): Promise<Delivery[]> => {
        const res = await api.get('/deliveries');
        return res.data;
    },

    // GET /deliveries/:id
    getById: async (id: number): Promise<DeliveryWithParticipants> => {
        const res = await api.get(`/deliveries/${id}`);
        return res.data;
    },

    getByCenterId: async (centerId: number): Promise<DeliveryWithParticipants[]> => {
        const res = await api.get<DeliveryWithParticipants[]>(`/deliveries/center/${centerId}`);
            const data = res.data.map(d => ({
            ...d,
            isUrgent: (d as unknown as { deliveryUrgent?: boolean }).deliveryUrgent ?? (d as unknown as { isUrgent?: boolean }).isUrgent ?? false,
            }));
            return data;

    },


    // GET /deliveries/drone/:droneId
    getByDroneId: async (droneId: number): Promise<DeliveryWithParticipants[]> => {
        const res = await api.get(`/deliveries/drone/${droneId}`);
        return res.data;
    },

    // POST /deliveries
    create: async (payload: CreateDeliveryRequest): Promise<string> => {
        const res = await api.post('/deliveries', payload);
        return res.data as string;
    },

    // POST /deliveries/participation
    addParticipant: async (deliveryId: number, userId: number): Promise<string> => {
        const res = await api.post('/deliveries/participation', { deliveryId, userId });
        return res.data as string;
    },

    // DELETE /deliveries/participation
    removeParticipant: async (deliveryId: number, userId: number): Promise<string> => {
        const res = await api.delete('/deliveries/participation', {
            data: { deliveryId, userId },
        });
        return res.data as string;
    },

    // PUT /deliveries/:id
    update: async (id: number, patch: UpdateDeliveryRequest): Promise<string> => {
        const res = await api.put(`/deliveries/${id}`, patch);
        return res.data as string;
    },

    // DELETE /deliveries/:id
    remove: async (id: number): Promise<string> => {
        const res = await api.delete(`/deliveries/${id}`);
        return res.data as string;
    },
};
