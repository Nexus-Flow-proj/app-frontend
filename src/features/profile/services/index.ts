import { api } from "@/lib/api/axios";
import type { ApiResponse } from "@/types";
import type {
  AvatarUploadResponse,
  PublicUserProfile,
  UpdateProfileDto,
  UserProfile,
} from "../types";

export const profileService = {
  getMyProfile: (): Promise<ApiResponse<UserProfile>> =>
    api.get<ApiResponse<UserProfile>>("/users/me").then((r) => r.data),

  getUserProfile: (userId: string): Promise<ApiResponse<PublicUserProfile>> =>
    api.get<ApiResponse<PublicUserProfile>>(`/users/${userId}`).then((r) => r.data),

  updateMyProfile: (
    dto: UpdateProfileDto,
  ): Promise<ApiResponse<UserProfile>> =>
    api.patch<ApiResponse<UserProfile>>("/users/me", dto).then((r) => r.data),

  uploadAvatar: (file: File): Promise<ApiResponse<AvatarUploadResponse>> => {
    const formData = new FormData();
    formData.append("file", file);

    return api
      .post<ApiResponse<AvatarUploadResponse>>("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  deleteAvatar: (): Promise<ApiResponse<null>> =>
    api.delete<ApiResponse<null>>("/users/me/avatar").then((r) => r.data),
};
