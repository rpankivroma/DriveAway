
import { apiClient } from "../../../shared/api/client";
import { LoginResponse, RegisterResponse } from "../types";

export const authService = {
  login: async (credentials: any): Promise<LoginResponse> => {
    return apiClient<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData: any): Promise<RegisterResponse> => {
    return apiClient<RegisterResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  verifyEmail: async (email: string, code: string): Promise<any> => {
    return apiClient("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
  },

  forgotPassword: async (email: string): Promise<any> => {
    return apiClient("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (data: any): Promise<any> => {
    return apiClient("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
