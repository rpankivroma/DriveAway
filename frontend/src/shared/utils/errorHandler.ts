
import { ApiError } from "../api/client";
import { toast } from "sonner";

export function handleApiError(error: unknown) {
  const apiError = error as ApiError;
  const message = apiError.message || "An unexpected error occurred";
  
  toast.error(message);
  
  return message;
}

export function handleApiSuccess(message: string) {
  toast.success(message);
}
