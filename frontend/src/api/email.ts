import api from "./api";

export interface EmailSupportRequest {
  name: string;
  email: string;
  message: string;
}
export interface EmailInviteRequest {
  email: string;
  userName?: string;
}

export const emailApi = {
  sendSupportEmail: async (data: EmailSupportRequest) => {
    const response = await api.post("/email/support", data);
    return response.data;
  },

  sendInvitationEmail: async (data: EmailInviteRequest) => {
    const response = await api.post("/email/invite", data);
    return response.data;
  }
};