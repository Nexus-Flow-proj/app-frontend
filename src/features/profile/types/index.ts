/**
 * A project membership summary as returned inside the user profile payload.
 */
export interface ProfileProjectMembership {
  id: string;
  projectId: string;
  projectName: string;
  role: string;
  joinedAt: string; // ISO date
}

/**
 * A project owned by the current user, returned inside the profile payload.
 */
export interface ProfileOwnedProject {
  id: string;
  name: string;
  description: string;
  status: string;
  color: string;
  createdAt: string; // ISO date
}

/**
 * GET /users/me — full user profile.
 * PATCH /users/me — same shape returned after update.
 */
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  title: string | null;
  bio: string | null;
  avatarUrl: string | null;
  skills: string[];
  projectMemberships: ProfileProjectMembership[];
  ownedProjects: ProfileOwnedProject[];
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

/**
 * GET /users/:id — read-only public view of any user.
 */
export interface PublicUserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  title: string | null;
  bio: string | null;
  avatarUrl: string | null;
  skills: string[];
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

/**
 * PATCH /users/me — request body.
 */
export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  title?: string;
  bio?: string;
  skills?: string[];
}

/**
 * POST /users/me/avatar — response data.
 */
export interface AvatarUploadResponse {
  avatarUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  updatedAt: string; // ISO date
}
