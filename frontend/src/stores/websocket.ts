import { type Ref, ref } from 'vue'
import { defineStore } from 'pinia'
import { Manager, Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/auth'
export const useWebsocket = defineStore('websocket', () => {
  const authStore = useAuthStore()
  const clients = ref([])
  const sk: Ref<Socket | null> = ref(null)
  const manager = ref<Manager>()
  const init = (roomId: string) => {
    manager.value = new Manager(import.meta.env.VITE_WS_DOMAIN, {
      // autoConnect: false
      query: {
        room_id: roomId
      }
    })
    sk.value = manager.value.socket('/chat', {
      auth: {
        token: authStore.token
      }
    })

    const socket = sk.value

    if (!socket) {
      return
    }

    // Event socket
    socket.on('connect', () => {
      console.log('[connect] connected')
      // toast('Connected!');
    })

    socket.on("disconnect", (reason: string) => {
      console.log('[disconnect] disconnected', reason)
    });
    socket.on('connect_error', (e: Error) => {
      console.log('[connect_error] connect error', e)
    })

    socket.on('new_room_user', (data: {
      id: string,
      msg: string,
      clients: never[],
    }) => {
      // console.log('[new_room_user]', data.clients)
      clients.value = data?.clients || []
    })

    socket.on('leave_room_user', (data: {
      id: string,
      msg: string,
      clients: never[],
    }) => {
      console.log('[leave_room_user]', data.clients)
      clients.value = data?.clients || []
    })
  }

  const destroy = () => {
    if (!sk.value) {
      return
    }
    console.log('destroy socket')
    sk.value.disconnect();
  }
  return { clients, init, destroy, socket: sk, manager }
})
