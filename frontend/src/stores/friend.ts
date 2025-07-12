import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useRequest } from '@/stores/http'
import get from 'lodash/get'
import type { Invitation, User } from '@/types/base'

export const useFriendStore = defineStore('friend', () => {
  const items = ref<User[]>([])
  const invitations = ref<Invitation[]>([])
  const isLoading = ref(true)
  const isProcessingInvitation = ref(false)
  const isFinding = ref(false)

  const request = useRequest()

  const fetch = async () => {
    isLoading.value = true
    const resp = await request.request('/v1/friends', 'GET', {})
    items.value = get(resp, 'friends', []) || []
    isLoading.value = false
  }

  const fetchInvitations = async () => {
    const resp = await request.request('/v1/friends/invitations', 'GET', {})
    invitations.value = get(resp, 'invitations', []) || []
  }


  const sendInvitation = async (id: string) => {
    const resp = await request.request(`/v1/friends/invite`, 'POST', {
      body: {
        target: id,
      }
    })
    if (resp.error) {
      return
    }
    await fetchInvitations()
  }
  const acceptInvitation = async (id: string) => {
    isProcessingInvitation.value = true
    const resp = await request.request(`/v1/friends/accept`, 'POST', {
      body: {
        id
      }
    })
    isProcessingInvitation.value = false
    if (resp.error) {
      return
    }

    fetchInvitations().then()
    fetch().then()
  }

  const declineInvitation = async (id: string) => {
    isProcessingInvitation.value = true
    const resp = await request.request(`/v1/friends/decline`, 'POST', {
      body: {
        id
      }
    })
    isProcessingInvitation.value = false
    if (resp.error) {
      return
    }

    await fetchInvitations()
  }

  const findFriends = async (q: string) => {
    isFinding.value = true
    const resp = await request.request('/v1/friends/find', 'GET', {
      params: {
        q
      }
    })
    isFinding.value = false
    return get(resp, 'users', []) as User[] || [] as User[]
  }

  const reset = () => {
    items.value = []
    invitations.value = []
  }
  return {
    items,
    isLoading,
    invitations,
    isProcessingInvitation,
    isFinding,

    fetch,
    fetchInvitations,
    acceptInvitation,
    declineInvitation,
    findFriends,
    sendInvitation,
    reset,
  }
})
