import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Permission, ResponseUpdateUser, Role, UpdateUser, User } from '@/types/base'
import { useRequest } from '@/stores/http'
import get from 'lodash/get'

export const useUser = defineStore('user', () => {
  const user = ref<User>()
  const users = ref<User[]>([])

  const images = ref<{ [key: string]: string }>()

  const http = useRequest()

  const fetchImages = async () => {
    const resp = await http.request('/user/image', 'GET', {})
    console.log(resp)
  }

  const fetchUser = async (opts?: {
    ignoreAuth?: boolean,
    trace?: string,
  }) => {
    const resp = await http.request('/user', 'GET', {}, opts)
    if (resp.error) {
      return
    }
    user.value = resp.user
  }

  const updateUser = async (data: UpdateUser): Promise<ResponseUpdateUser> => {
    const formData = new FormData()
    if (data.image) {
      formData.append('image', data.image)
    }
    if (data.name) {
      formData.append('name', data.name)
    }
    if (data.language) {
      formData.append('language', data.language)
    }
    if (data.date) {
      formData.append('date', data.date)
    }
    return await http.request('/user', 'PUT', {
      body: formData
    })
  }

  const resetUser = () => {
    user.value = undefined
  }

  const permissions = computed(() => {
    const rolePermissions = (get(user.value, 'roles', []) || []).map((r: Role) => r.permissions).flat().map((p: Permission) => p.name)
    const permissions = (get(user.value, 'permissions', []) || []).map((p: Permission) => p.name)
    return [...rolePermissions, ...permissions]
  })

  const roles = computed(() => {
    return (get(user.value, 'roles', []) || []).map((r: Role) => r.name)
  })

  const can = computed(() => {
    return (name: string) => {
      // Supper User can do any action
      if (roles.value.includes('SAdmin')) {
        return true
      }
      return permissions.value.includes(name)
    }
  })

  const fetchUsers = async () => {
    const resp = await http.request('/v1/user-management', 'GET', {})
    if (resp.error) {
      return
    }
    users.value = resp.users;
  }

  const getUserById = async (userId: string) => {
    const resp = await http.request(`/v1/user-management/${userId}`, 'GET', {})
    if (resp.error) {
      return
    }
    return resp.user;
  }

  const updateUserManagement = async (userId: string, data: any) => {
    const resp = await http.request(`/v1/user-management/${userId}`, 'PUT', {
      body: data
    })
    if (resp.error) {
      return
    }
    return resp.user;
  }

  const deleteUserManagement = async (userId: string) => {
    const resp = await http.request(`/v1/user-management/${userId}`, 'DELETE', {})
    if (resp.error) {
      return
    }
    return resp;
  }

  const getAllClasses = async () => {
    const resp = await http.request('/v1/user-management/classes', 'GET', {})
    if (resp.error) {
      return
    }
    return resp.classes;
  }

  const assignUserToClass = async (userId: string, classId: string) => {
    const resp = await http.request(`/v1/user-management/${userId}/classes`, 'POST', {
      body: { classId }
    })
    if (resp.error) {
      return
    }
    return resp;
  }

  const getUserClasses = async (userId: string) => {
    const resp = await http.request(`/v1/user-management/${userId}/classes`, 'GET', {})
    if (resp.error) {
      return
    }
    return resp.classes;
  }

  return {
    user,
    images,
    fetchUser,
    updateUser,
    resetUser,
    fetchImages,
    can,
    fetchUsers,
    getUserById,
    updateUserManagement,
    deleteUserManagement,
    getAllClasses,
    assignUserToClass,
    getUserClasses,
    permissions,
    roles,
  }
})
