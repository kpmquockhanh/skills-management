import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Permission, Role, RoleUpdateRequest } from '@/types/base'
import get from 'lodash/get'
import uniq from 'lodash/uniq'
import { useRequest } from '@/stores/http'
import { useToast } from 'vue-toastification'

export const usePermissionStore = defineStore('permission', () => {
  const toast = useToast()
  const items = ref<string[]>([])
  const allItems = ref<{permissions: Permission[]; roles: Role[]}>({
    permissions: [],
    roles: [],
  })
  const isLoading = ref(false)
  const request = useRequest()
  const fetchPermissions = async () => {
    isLoading.value = true
    const resp = await request.request('/v1/permissions', 'GET', {})
    allItems.value = resp
    isLoading.value = false
  }

  const updatePermission = async (p: Permission) => {
    const resp = await request.request(`/v1/permissions`, 'PUT', {
      body: p
    })
    if (resp.error) {
      return
    }
    toast.success('Permission updated')
    return resp
  };

  const fetchOwnedPermissions = async () => {
    const resp = await request.request('/v1/permissions/owned', 'GET', {})
    items.value = (get(resp, 'permissions', []) || []).map((p : Permission) => p.name)
  }

  const allPermissions = computed<Permission[]>(() => {
    return uniq(Object.values(get(allItems.value, 'permissions', [])).flat())
  })

  const hasPermission = computed(() => {
    return (name: string) => {
      return items.value.includes(name)
    }
  })

  const createPermission = async (name: string, description: string) => {
    const resp = await request.request('/v1/permissions', 'POST', {
      body: {
        name,
        description,
      }
    })
    if (resp.error) {
      return
    }
    toast.success('Permission created')
    return resp
  }

  const createRole = async (name: string, description: string) => {
    const resp = await request.request('/v1/permissions/role', 'POST', {
      body: {
        name,
        description,
      }
    })
    if (resp.error) {
      return resp
    }
    toast.success('Role created')
    return resp
  }

  const deletePermission = async (id: string) => {
    const resp = await request.request(`/v1/permissions/${id}`, 'DELETE', {})
    if (resp.error) {
      return resp
    }
    toast.warning('Permission deleted')
    return resp
  }

  const deleteRole = async (id: string) => {
    const resp = await request.request(`/v1/permissions/role/${id}`, 'DELETE', {})
    if (resp.error) {
      return resp
    }
    toast.warning('Role deleted')
    return resp
  }

  const updateRole = async (role: RoleUpdateRequest) => {
    const resp = await request.request(`/v1/permissions/role/${role._id}`, 'PUT', {
      body: {
        name: role.name,
        description: role.description,
        permissions: role.permissions,
      }
    })
    if (resp.error) {
      return resp
    }
    toast.success('Role updated')
    return resp
  }

  const assignRole = async (userId: string, roleId: string, action: string) => {
    const resp = await request.request(`/v1/permissions/assign`, 'PUT', {
      body: {
        user_id: userId,
        role_id: roleId,
        action,
      }
    })
    if (resp.error) {
      return resp
    }
    if (action === 'assign') {
      toast.success('Assigned role')
    } else {
      toast.info('Removed role')
    }
    return resp
  }

  return {
    items,
    allItems,
    allPermissions,
    hasPermission,
    fetchPermissions,
    updatePermission,
    fetchOwnedPermissions,
    createPermission,
    createRole,
    deletePermission,
    deleteRole,
    updateRole,
    assignRole,
    isLoading,
  }
})
