import { UserRole } from "../enums";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}
