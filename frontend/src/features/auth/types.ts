
import { User } from "../../store/auth.store";

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface AuthError {
  detail: string;
}
