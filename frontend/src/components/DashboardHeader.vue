<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUser } from '../stores/user'
import { computed } from 'vue'
import {getSrc} from '../utils'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const userStore = useUser()

const logout = () => {
  authStore.logout()
  router.push('/login')
}

const toggleSidebar = () => {
  // Emit event to parent component
  emit('toggle-sidebar')
}

const emit = defineEmits<{
  'toggle-sidebar': []
}>()

// Computed properties for user data
const userName = computed(() => userStore.user?.name || 'User')
const userEmail = computed(() => userStore.user?.email || '')
const userPhoto = computed(() => getSrc(userStore.user?.photoUrl || '', true) || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face')
const userType = computed(() => {
  if (userStore.user?.type === 'admin') return 'Admin'
  if (userStore.user?.type === 'user') return 'Member'
  return 'User'
})
const isOnline = computed(() => userStore.user?.isOnline || false)
</script>

<template>
  <div class="w-full navbar bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
    <div class="flex-none lg:hidden">
      <label @click="toggleSidebar" class="btn btn-square btn-ghost hover:bg-gray-100 cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-6 h-6 stroke-current">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </label>
    </div>
    <div class="flex-1 px-2 mx-2">
      <h1 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {{ route.meta.title || 'Dashboard' }}
      </h1>
    </div>
    <div class="flex-none">
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar hover:ring-2 hover:ring-blue-200 transition-all">
          <div class="w-10 rounded-full ring-2 ring-blue-100 relative">
            <img :alt="userName" :src="userPhoto" />
            <!-- Online status indicator -->
            <div v-if="isOnline" class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            <div v-else class="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></div>
          </div>
        </div>
        <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-white rounded-xl border border-gray-100 w-52">
          <li class="border-b border-gray-100 py-2">
            <div class="flex flex-col p-">
              <span class="font-semibold text-gray-800">{{ userName }}</span>
              <span class="text-xs text-gray-500">{{ userEmail }}</span>
              <span class="text-xs text-blue-600 font-medium">{{ userType }}</span>
            </div>
          </li>
          <!-- <li><a class="hover:bg-blue-50 rounded-lg">Profile</a></li> -->
          <!-- <li><a class="hover:bg-blue-50 rounded-lg">Settings</a></li> -->
          <li><a @click="logout" class="hover:bg-red-50 text-red-600 rounded-lg mt-2">Logout</a></li>
        </ul>
      </div>
    </div>
  </div>
</template> 