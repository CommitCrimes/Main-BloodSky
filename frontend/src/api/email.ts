// src/api/email.ts
import api from "./api";
import type { AxiosRequestConfig } from "axios";

export type UserRoleCode =
  | "dronist"
  | "hospital_admin"
  | "donation_center_admin"
  | "super_admin"
  | "user";

export interface EmailSupportRequest {
  name: string;
  email: string;
  message: string;

  subject?: string;
  userId?: number;               
  userRole?: UserRoleCode;
  hospitalId?: number;
  centerId?: number;
  meta?: Record<string, string | number | boolean | undefined>;
}

export interface SendSupportEmailResponse {
  messageId: string;
  queued: boolean;
}

export const emailApi = {
  sendSupportEmail: async (
    data: EmailSupportRequest,
    config?: AxiosRequestConfig
  ): Promise<SendSupportEmailResponse> => {
    const res = await api.post<SendSupportEmailResponse>("/email/support", data, config);
    return res.data;
  },
};
