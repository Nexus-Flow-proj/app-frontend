export const PROFILE_LIMITS = {
  firstNameMin: 2,
  firstNameMax: 50,
  lastNameMin: 2,
  lastNameMax: 50,
  titleMax: 100,
  bioMax: 500,
  skillMax: 50,
  maxSkills: 20,
} as const;

export const AVATAR_LIMITS = {
  /** Maximum avatar file size in bytes (5 MB). */
  maxFileSize: 5 * 1024 * 1024,
  /** Allowed MIME types for avatar uploads. */
  acceptedTypes: ["image/jpeg", "image/png", "image/webp"] as const,
} as const;
