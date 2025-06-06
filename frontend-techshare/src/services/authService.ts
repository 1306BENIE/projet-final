import type { RegisterFormValues, LoginFormValues } from "@/interfaces/auth";
import api from "./api";
import { AxiosError } from "axios";

export async function register(data: RegisterFormValues) {
  try {
    const response = await api.post("/users/register", data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw error;
    }
    throw error;
  }
}

export async function login(data: LoginFormValues) {
  try {
    const response = await api.post("/users/login", data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Erreur lors de la connexion");
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
