
import { useState } from "react";
import { useAuthStore } from "../../../store/auth.store";
import { authService } from "../services/auth.service";
import { handleApiError, handleApiSuccess } from "../../../shared/utils/errorHandler";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuth, logout, user, isAuthenticated } = useAuthStore();

  const login = async (credentials: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      setAuth(response.user, response.access_token);
      handleApiSuccess("Welcome back!");
      return true;
    } catch (err: any) {
      setError(handleApiError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    setError(null);
    try {
      await authService.register(userData);
      handleApiSuccess("Registration successful! Please verify your email.");
      return true;
    } catch (err: any) {
      setError(handleApiError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    setLoading(true);
    setError(null);
    try {
      await authService.verifyEmail(email, code);
      handleApiSuccess("Email verified successfully!");
      return true;
    } catch (err: any) {
      setError(handleApiError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(email);
      handleApiSuccess("Reset code sent to your email.");
      return true;
    } catch (err: any) {
      setError(handleApiError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword(data);
      handleApiSuccess("Password reset successful!");
      return true;
    } catch (err: any) {
      setError(handleApiError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    user,
    isAuthenticated,
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
  };
}
