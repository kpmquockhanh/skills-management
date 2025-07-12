import { computed, ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import type { Attachment } from '@/types/base'
import { useRequest } from '@/stores/http'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'

export const useAttachment = defineStore('attachment', () => {
  const items: Ref<Array<Attachment>> = ref([])
  const unusedItems: Ref<Array<Attachment>> = ref([])
  const request = useRequest()
  const toast = useToast()
  const page = ref(1)
  const limit = ref(10)
  const authStore = useAuthStore()

  const isLoading = ref(false)

  const total = ref(0)
  const doFetch = async (options?: {
    page?: number,
    limit?: number,
    ignoreLoad?: boolean
  }) => {
    if (!options?.ignoreLoad) {
      isLoading.value = true
    }
    if (options?.limit) {
      limit.value = options?.limit
    }
    if (options?.page) {
      page.value = options?.page
    }
    const params = { limit: limit.value, page: page.value, type: 'default' }
    let url = '/v1/attachments'
    if (!authStore.isAuth) {
      url = '/v1/attachments/public'
      params.type = 'all'
    }

    const resp = await request.request(url, 'GET', {
      params
    })
    if (!options?.page || options?.page === 1) {
      items.value = resp.data?.attachments || []
    } else {
      items.value = [...items.value, ...(resp.data?.attachments || [])]
    }
    isLoading.value = false
    total.value = resp.data?.total
  }

  const isLastPage = computed(() => {
    return items.value.length === total.value
  })

  const nextPage = async () => {
    page.value += 1
    await doFetch({ page: page.value, ignoreLoad: true })
  }

  const doUpload = async (file: File, description?: string, isPublic?: boolean) => {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('name', file.name)
    formData.append('public', isPublic ? 'true' : 'false')
    if (description) {
      formData.append('description', description)
    }
    const resp = await request.request('/v1/attachments', 'POST', {
      body: formData
    })
    if (resp.error) {
      toast.error(resp.message || 'Upload failed')
      return false
    }
    if (resp.data?.attachment) {
      items.value = [...[resp.data?.attachment], ...items.value]
    }
    return true
  }

  const doRemove = async (id: string) => {
    const resp = await request.request(`/v1/attachments/${id}`, 'DELETE', {})
    if (resp.error) {
      toast.error('Delete failed')
      return
    }
    items.value = [...items.value.filter((item) => item._id !== id)]
  }

  const toggleVisibility = async (id: string, isPublic: boolean) => {
    const resp = await request.request(`/v1/attachments/${id}/visibility`, 'PUT', {
      body: {
        public: isPublic
      }
    })
    if (resp.error) {
      toast.error('Failed to update visibility')
      return false
    }
    // Update the item in the list
    const index = items.value.findIndex(item => item._id === id)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], public: isPublic }
    }
    return true
  }


  const reset = () => {
    items.value = []
    page.value = 1
  }


  const fetchUnusedAttachments = async () => {
    if (!authStore.isAuth) {
      return
    }
    isLoading.value = true
    const resp = await request.request('/v1/attachments/unused', 'GET', {
      params: {
        limit: 100
      }
    })
    isLoading.value = false
    if (resp.error) {
      return
    }
    unusedItems.value = resp.attachments || []
  }

  const deleteUnusedAttachment = async (id: string) => {
    return request.request(`/v1/attachments/unused`, 'DELETE', {
      body: {
        ref_id: id,
      }
    })
  }

  return {
    items,
    page,
    doFetch,
    doUpload,
    doRemove,
    toggleVisibility,
    nextPage,
    isLastPage,
    isLoading,
    reset,
    fetchUnusedAttachments,
    deleteUnusedAttachment,
    unusedItems,
  }
})
