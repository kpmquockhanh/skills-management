import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AuthRequest, AuthResponse } from '@/types/base'
import dayjs from 'dayjs'
import { useUser } from '@/stores/user'
import { useAttachment } from '@/stores/attachment'
import { useFriendStore } from '@/stores/friend'

export const useAuthStore = defineStore('auth', () => {
  const isAuth = ref(false)
  const token = ref('')
  const lastPath = ref('')

  const userStore = useUser()
  const attachmentStore = useAttachment()
  const friendStore = useFriendStore()

  const processToken = (resJson: AuthResponse) => {
    isAuth.value = true
    const resToken = resJson.accessToken
    token.value = resToken

    localStorage.setItem('token', resToken)
    userStore.fetchUser({trace: 'processToken'}).then()
    return true
  }

  async function login(r: AuthRequest) {
    const domain = import.meta.env.VITE_API_DOMAIN
    const response = await fetch(`${domain}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: r.email,
        password: r.password
      })
    })

    const resJson: AuthResponse = await response.json()

    if (resJson.accessToken) {
      processToken(resJson)
      return true
    }
    return false
  }

  const loginWithGoogle = async (token: string) => {
    const domain = import.meta.env.VITE_API_DOMAIN
    const response = await fetch(`${domain}/user/oauthcallback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: token,
      })
    })
    const resJson: AuthResponse = await response.json()

    if (resJson.accessToken) {
      processToken(resJson)
      return true
    }
    return false
  }

  const register = async (r: AuthRequest) => {
    const domain = import.meta.env.VITE_API_DOMAIN
    const response = await fetch(`${domain}/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: r.name,
        email: r.email,
        password: r.password,
        language: "en",
        platform: "IOS",
        timezone: dayjs().utcOffset() / 60,
        deviceId: "1234"
      })
    })

    const resJson: AuthResponse = await response.json()
    if (resJson.accessToken) {
      processToken(resJson)
      return true
    }
    return false
  }

  const localToken = computed(() => localStorage.getItem('token'))

  const setLastPath = (path: string) => {
    lastPath.value = path
  }

  const initAuth = async () => {
    isAuth.value = false
    lastPath.value = ''
    token.value = ''
    userStore.resetUser()
    // Get auth token from local storage

    // else set isAuth to false
    if (localToken.value) {
      // if token is valid, set isAuth to true
      token.value = localToken.value
      await userStore.fetchUser({
        ignoreAuth: true,
        trace: 'initAuth'
      })
      if (userStore.user?._id) {
        isAuth.value = true
      } else {
        logout()
      }
    }
  }

  const logout = () => {
    isAuth.value = false
    token.value = ''
    userStore.resetUser()
    localStorage.removeItem('token')

    attachmentStore.reset()
    friendStore.reset()
  }

  const isAdmin = computed(() => userStore.user?.type === 'admin')

  return {
    //Properties
    isAuth,
    lastPath,
    token,
    isAdmin,
    //Methods
    setLastPath,
    initAuth,
    logout,
    login,
    register,
    loginWithGoogle,
  }
})
