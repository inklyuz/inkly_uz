import { apiRequest, uploadFile } from "./client"
import type { UploadResponse } from "@/types/api"

export const uploadsApi = {
  // Avatar yuklash → path + url qaytaradi
  // MUHIM: url emas, path ni PATCH /users/me ga yuborasiz: { avatar: path }
  avatar: (token: string, file: File) =>
    uploadFile<UploadResponse>("/uploads/avatar", file, "file", token),

  cover: (token: string, file: File) =>
    uploadFile<UploadResponse>("/uploads/cover", file, "file", token),

  postImage: (token: string, file: File) =>
    uploadFile<UploadResponse>("/uploads/post-image", file, "file", token),

  temp: (token: string, file: File) =>
    uploadFile<UploadResponse>("/uploads/temp", file, "file", token),

  // path — upload endpointi qaytargan relative path: "avatars/x.webp"
  remove: (token: string, path: string) =>
    apiRequest<void>("/uploads", { method: "DELETE", body: { path }, token }),
}
