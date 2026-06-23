import { UserRole } from "../enums";

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: UserRole;
  avatar?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}
