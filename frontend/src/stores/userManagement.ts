import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useRequest } from '@/stores/http'
import type { User } from '@/types/base'

export interface UserManagementUser extends User {
  username: string
  type: 'admin' | 'user' | 'teacher' | 'kid'
  isActivated: boolean
  isVerified: boolean
  isPremium: boolean
  gender: string
  roles: any[]
  permissions: any[]
  lastLogin?: string
}

export interface Class {
  _id: string
  name: string
  description?: string
  thumbnailUrl?: string
  createdBy: {
    _id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export const useUserManagement = defineStore('userManagement', () => {
  const users = ref<UserManagementUser[]>([])
  const classes = ref<Class[]>([])
  const pagination = ref<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const loading = ref(false)
  const selectedUser = ref<UserManagementUser | null>(null)
  const userClasses = ref<Class[]>([])

  const http = useRequest()

  // Fetch all users with pagination and filters
  const fetchUsers = async (params: {
    page?: number
    limit?: number
    search?: string
    type?: string
    isActivated?: boolean
  } = {}) => {
    loading.value = true
    try {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.search) queryParams.append('search', params.search)
      if (params.type) queryParams.append('type', params.type)
      if (params.isActivated !== undefined) queryParams.append('isActivated', params.isActivated.toString())

      const { data } = await http.request(`/v1/user-management?${queryParams.toString()}`, 'GET', {})
      if (data.error) {
        throw new Error(data.error)
      }

      users.value = data.users
      pagination.value = data.pagination
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Fetch single user by ID
  const fetchUserById = async (userId: string) => {
    loading.value = true
    try {
      const resp = await http.request(`/v1/user-management/${userId}`, 'GET', {})
      if (resp.error) {
        throw new Error(resp.error)
      }

      selectedUser.value = resp.user
      return resp.user
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Create new user
  const createUser = async (userData: Omit<UserManagementUser, '_id' | 'createdAt' | 'updatedAt' | 'lastLogin'>) => {
    loading.value = true
    try {
      const resp = await http.request('/v1/user-management', 'POST', {
        body: userData
      })
      if (resp.error) {
        throw new Error(resp.error)
      }

      // Add the new user to the list
      users.value.unshift(resp.user)

      return resp.user
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Update user
  const updateUser = async (userId: string, userData: Partial<UserManagementUser>) => {
    loading.value = true
    try {
      const resp = await http.request(`/v1/user-management/${userId}`, 'PUT', {
        body: userData
      })
      if (resp.error) {
        throw new Error(resp.error)
      }

      // Update the user in the list
      const index = users.value.findIndex(u => u._id === userId)
      if (index !== -1) {
        users.value[index] = resp.user
      }

      // Update selected user if it's the same
      if (selectedUser.value?._id === userId) {
        selectedUser.value = resp.user
      }

      return resp.user
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Delete user
  const deleteUser = async (userId: string) => {
    loading.value = true
    try {
      const resp = await http.request(`/v1/user-management/${userId}`, 'DELETE', {})
      if (resp.error) {
        throw new Error(resp.error)
      }

      // Remove user from the list
      users.value = users.value.filter(u => u._id !== userId)

      // Clear selected user if it's the same
      if (selectedUser.value?._id === userId) {
        selectedUser.value = null
      }

      return resp
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Fetch all classes
  const fetchClasses = async () => {
    loading.value = true
    try {
      const resp = await http.request('/v1/user-management/classes', 'GET', {})
      if (resp.error) {
        throw new Error(resp.error)
      }

      classes.value = resp.classes
      return resp.classes
    } catch (error) {
      console.error('Error fetching classes:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Assign user to class
  const assignUserToClass = async (userId: string, classId: string, action: 'assign' | 'remove') => {
    loading.value = true
    try {
      const resp = await http.request(`/v1/user-management/${userId}/classes`, 'POST', {
        body: {
          userId,
          classId,
          action
        }
      })
      if (resp.error) {
        throw new Error(resp.error)
      }

      return resp
    } catch (error) {
      console.error('Error assigning user to class:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Fetch user's classes
  const fetchUserClasses = async (userId: string) => {
    loading.value = true
    try {
      const resp = await http.request(`/v1/user-management/${userId}/classes`, 'GET', {})
      if (resp.error) {
        throw new Error(resp.error)
      }

      userClasses.value = resp.classes
      return resp.classes
    } catch (error) {
      console.error('Error fetching user classes:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Computed properties
  const activeUsers = computed(() => users.value.filter(u => u.isActivated))
  const inactiveUsers = computed(() => users.value.filter(u => !u.isActivated))
  const adminUsers = computed(() => users.value.filter(u => u.type === 'admin'))
  const regularUsers = computed(() => users.value.filter(u => u.type === 'user'))

  return {
    // State
    users,
    classes,
    pagination,
    loading,
    selectedUser,
    userClasses,

    // Actions
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
    fetchClasses,
    assignUserToClass,
    fetchUserClasses,

    // Computed
    activeUsers,
    inactiveUsers,
    adminUsers,
    regularUsers
  }
}) 