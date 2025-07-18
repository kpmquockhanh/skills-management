export type AuthRequest = {
  name: string,
  email: string,
  password: string
}

export type Pagination = {
  page: number,
  limit: number,
  total: number
}

export type Comment = {
  _id: string,
  uuid: string,
  comment: string,
  user: User,
  created_at: string,
  can_delete?: boolean,
}
export type AuthResponse = {
  accessToken: string,
  user: User,
  // confirmToken: string,
}

export type Message = {
  _id: string,
  content: string,
  user: User,
  createdAt: string,
}

export type Attachment = {
  _id: string,
  name: string,
  src: string,
  createdBy: User,
  refId: string,
  createdAt: string,
  updatedAt: string,
  fullPath: string,
  width: number,
  height: number,
  description: string,
  public: boolean,
  can_delete: boolean,
}

export type User = {
  _id: string,
  name: string,
  email: string,
  type: 'admin' | 'user' | 'teacher' | 'kid',
  createdAt: string,
  updatedAt: string,
  language: string,
  platform: string,
  timezone: number,
  deviceId: string,
  gender: string,
  photoUrl: string,
  username: string,
  memoryDate: string,
  isOnline: boolean,
}

export type UpdateUser = {
  name?: string,
  email?: string,
  language?: string,
  platform?: string,
  timezone?: number,
  deviceId?: string,
  image?: File,
  date?: string,
}

export type ResponseUpdateUser = {
  resultCode: string,
  data?: {
    en: string,
  }
}

export interface Room {
  _id: string
  name: string
  description: string
  thumbnail?: string
  createdBy: {
    _id: string
    name: string
    email: string
    type: 'user' | 'admin' | 'teacher' | 'kid'
    createdAt: string
    updatedAt: string
    // ...other fields
    isOnline: boolean
  }
  createdAt: string
  updatedAt: string
  class?: Class | null // optional class assignment
}

export type Class = {
  _id: string
  name: string
  enrolledStudents: number
}

export type Invitation = {
  _id: string,
  photoUrl: string,
  origin: User,
  createdAt: string,
  updatedAt: string,
}

export type Permission = {
  name: string,
  _id: string,
  id: string,
}

export type Role = {
  name: string,
  description: string,
  _id: string,
  permissions: Permission[],
}

export type RoleUpdateRequest = {
  _id: string,
  name: string,
  description: string,
  permissions: string[],
}
