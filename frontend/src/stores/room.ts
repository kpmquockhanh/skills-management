import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Room } from '@/types/base'
import { useRequest } from '@/stores/http'
import { useRouter } from 'vue-router'

export const useRoom = defineStore('room', () => {
  const items = ref<Array<Room>>([])
  const router = useRouter()
  const req = useRequest()
  const creating = ref(false)
  const updating = ref(false)
  const fetchRooms = async () => {
    const res = await req.request('/v1/chat', 'GET', {})
    items.value = res.rooms
  }

  const createRoom = async (r: {name: string, description: string}) => {
    creating.value = true
    const resp = await req.request('/v1/chat', 'POST', {
      body: {
        name: r.name,
        description: r.description,
      }
    })
    creating.value = false
    if (resp.room) {
      items.value = [...items.value, resp.room]
    }
    return resp
  }

  const joinRoom = async (roomId: string) => {
    router.push({
      name: 'chat',
      params: {
        room_id: roomId
      }
    }).then()
  }

  const editRoom = async (roomId: string) => {
    router.push({
      name: 'chat:edit',
      params: {
        room_id: roomId
      }
    }).then()
  }

  const updateRoom = async (roomId: string, r: {name: string, description: string, image?: File}) => {
    updating.value = true

    const formData = new FormData()
    if (r.image) {
      formData.append('image', r.image)
    }
    formData.append('name', r.name)
    formData.append('description', r.description)
    const resp = await req.request(`/v1/chat/${roomId}`, 'PUT', {
      body: formData,
    })
    if (resp.error) {
      return
    }
    updating.value = false
    await fetchRooms()
  }

  const deleteRoom = async (roomId: string) => {
    const resp = await req.request(`/v1/chat/${roomId}`, 'DELETE', {})
    if (resp.error) {
      return
    }
    items.value = items.value.filter((room) => room._id !== roomId)
  }
  return { items, creating, updating, fetchRooms, createRoom, joinRoom, deleteRoom, editRoom, updateRoom }
})
