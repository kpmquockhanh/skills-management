<script setup lang="ts">
import EmailIcon from '@vicons/ionicons5/Mail'
import Tag from '@vicons/fluent/ContactCard24Filled'
import KeyIcon from '@vicons/ionicons5/Key'
import { Icon } from '@vicons/utils'
import { useAuthStore } from '@/stores/auth'
import { computed, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'
import { GoogleLogin } from 'vue3-google-login'

const password = ref('')
const email = ref('')
const name = ref('')

const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()
const onSubmit = async () => {
  const result = await authStore.register({
    name: name.value,
    email: email.value,
    password: password.value,
  })

  if (result) {
    toast('Login success!');
    router.push('/').then()
    return
  }
  toast.error('Register failed!');
}

const routeToLogin = () => {
  router.push('/login').then()
}

const isValid = computed(() => {
  return email.value && password.value && name.value
})

const onLoginGoogle = async (response: any) => {
  const result = await authStore.loginWithGoogle(response.credential)
  if (result) {
    toast('Login success!');
    if (authStore.lastPath) {
      router.push(authStore.lastPath).then(() => {
        authStore.setLastPath('')
      })
    } else {
      router.push('/').then()
    }
    return
  }
}

</script>

<template>
  <div class="flex flex-col gap-2 items-center w-full justify-center">
    <div class="card lg:card-side bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Let's register!</h2>
        <GoogleLogin :callback="onLoginGoogle" class="w-full flex justify-center mt-2" prompt/>
        <div class="divider m-0">OR</div>
        <label class="input input-bordered flex items-center gap-2">
          <Icon>
            <Tag />
          </Icon>
          <input type="text" class="grow" placeholder="Name" v-model="name" autocomplete="off" />
        </label>
        <label class="input input-bordered flex items-center gap-2">
          <Icon>
            <EmailIcon />
          </Icon>
          <input type="text" class="grow" placeholder="Email" v-model="email" autocomplete="off" />
        </label>
        <label class="input input-bordered flex items-center gap-2">
          <Icon>
            <KeyIcon />
          </Icon>
          <input type="password" class="grow" value="password" placeholder="password" v-model="password" autocomplete="off" />
        </label>
        <div class="card-actions justify-end mt-4">
          <button class="btn" @click="routeToLogin">
            <span>Go to login</span>
          </button>

          <button :disabled="!isValid" class="btn btn-primary" @click="onSubmit">Register</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
