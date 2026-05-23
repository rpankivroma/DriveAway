
import { useAuthStore } from "@/store/auth.store";

export interface ApiError {
  message: string;
  status?: number;
  detail?: any;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const fullUrl = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

  // Use store token but fallback to localStorage to avoid hydration race conditions
  let token = useAuthStore.getState().token;
  if (!token && typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  const headers: HeadersInit = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Only set Content-Type to application/json if not FormData and not already set
  if (!(options.body instanceof FormData) && !headers["Content-Type" as keyof HeadersInit]) {
    (headers as any)["Content-Type"] = "application/json";
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(fullUrl, config);
    
    // Handle empty responses
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        // Auto logout on 401
        useAuthStore.getState().logout();
        window.dispatchEvent(new Event("auth-change"));
      }
      
      const error = new Error(data.detail || data.message || "Something went wrong") as any;
      error.status = response.status;
      error.detail = data.detail;
      throw error;
    }

    return data as T;
  } catch (error: any) {
    if (error.message === "Failed to fetch") {
      throw { message: "Network error. Please check your connection." } as ApiError;
    }
    throw error as ApiError;
  }
}
