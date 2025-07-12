<script setup lang="ts">
import EmailIcon from '@vicons/ionicons5/Mail'
import KeyIcon from '@vicons/ionicons5/Key'
import { Icon } from '@vicons/utils'
import { useAuthStore } from '@/stores/auth'
import type { AuthRequest } from '@/types/base'
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { GoogleLogin } from 'vue3-google-login'

const store = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const toast = useToast()

const loading = ref(false)
// Use it!
const onLogin = async () => {
  loading.value = true
  try {
    const result = await store.login({
      email: email.value,
      password: password.value
    } as AuthRequest)

    loading.value = false
    if (result) {
      toast('Login success!')

      if (store.lastPath) {
        if (store.lastPath.includes('wedding')) {
          window.location.replace(store.lastPath)
          store.setLastPath('')
        } else {
          router.push(store.lastPath).then(() => {
            store.setLastPath('')
          })
        }
      } else {
        router.push('/').then()
      }

      return
    }
    toast.error('Login failed!')
  } catch (e) {
    loading.value = false
    toast.error('Login failed!')
  }
}

const routeToRegister = () => {
  router.push('/register').then()
}

const onLoginGoogle = async (response: any) => {
  const result = await store.loginWithGoogle(response.credential)
  if (result) {
    toast('Login success!')
    if (store.lastPath) {
      if (store.lastPath.includes('wedding')) {
        console.log('goes here')
        window.location.replace(store.lastPath)
        store.setLastPath('')
      } else {
        router.push(store.lastPath).then(() => {
          store.setLastPath('')
        })
      }
    } else {
      router.push('/').then()
    }
    return
  }
}

onMounted(() => {
  if (store.isAuth) {
    router.push('/').then()
  }

  const { lastPath } = route.query
  if (lastPath) {
    store.setLastPath(String(lastPath))
  }
  // googleOneTap()
  //   .then(onLoginGoogle)
  //   .catch((error) => {
  //     console.log("Handle the error", error)
  //   })
})
</script>
<template>
  <div class="flex flex-col gap-2 items-center w-full justify-center h-full">
    <div class="card lg:card-side bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Login page!</h2>
        <GoogleLogin :callback="onLoginGoogle" class="w-full flex justify-center mt-2" prompt />
        <div class="divider m-0">OR</div>
        <label class="input input-bordered flex items-center gap-2">
          <Icon>
            <EmailIcon />
          </Icon>
          <input
            type="text"
            class="grow"
            placeholder="Email"
            v-model="email"
            @keyup.enter="onLogin"
            :disabled="loading"
          />
        </label>
        <label class="input input-bordered flex items-center gap-2">
          <Icon>
            <KeyIcon />
          </Icon>
          <input
            type="password"
            class="grow"
            value="password"
            placeholder="Password"
            v-model="password"
            @keyup.enter="onLogin"
            :disabled="loading"
          />
        </label>

        <div class="card-actions justify-end mt-4">
          <button class="btn" @click="routeToRegister" :disabled="loading">
            <span v-if="!loading">Go to register</span>
            <span v-else class="loading loading-white"></span>
          </button>

          <button class="btn btn-primary" @click="onLogin" :disabled="loading">
            <span v-if="!loading">Login</span>
            <span v-else class="loading loading-white"></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped></style>
