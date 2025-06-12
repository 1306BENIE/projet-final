import api from "./api";
import { User } from "@/interfaces/User";

export async function getUserById(id: string): Promise<User> {
  const response = await api.get<{ user: User }>(`/users/${id}`);
  return response.data.user;
}
