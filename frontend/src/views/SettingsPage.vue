<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import DynamicImage from '@/components/DynamicImage.vue'
import { usePreviewImage } from '@/stores/previewImage'
import { useUser } from '@/stores/user'
import type { UpdateUser } from '@/types/base'
import { useToast } from 'vue-toastification'
import CountdownComponent from '@/views/CountdownComponent.vue'
import dayjs from 'dayjs'
import RoleSettings from './RoleSettings.vue'
import RemoveDuplicates from '@/views/RemoveDuplicates.vue'
import { useRoute } from 'vue-router'
import { useAttachment } from '@/stores/attachment'
import { getSrc } from '@/utils'
import { 
  SaveOutline, 
  PersonOutline, 
  SettingsOutline,
  ImageOutline,
  GlobeOutline,
  TimeOutline,
  ShieldCheckmarkOutline,
  TrashOutline
} from '@vicons/ionicons5'

const preview = usePreviewImage()
const user = useUser()
const toast = useToast()
const route = useRoute()

const inputFile = ref<HTMLInputElement | null>(null)
const name = ref('')
const language = ref('')
const date = ref(user.user?.memoryDate ? new Date(user.user?.memoryDate) : new Date())
const isLoading = ref(false)
const isFetching = ref(true)

const isChanged = computed(() => {
  return name.value !== user.user?.name ||
    language.value !== user.user?.language ||
    preview.file || dayjs(date.value).format('YYYY-MM-DD') !== dayjs(user.user?.memoryDate).format('YYYY-MM-DD')
})

const onUpdate = async () => {
  const userReq: UpdateUser = {
    name: name.value,
    language: language.value,
    date: dayjs(date.value).format('YYYY-MM-DD')
  }
  if (preview.file) {
    userReq.image = preview.file
  }
  isLoading.value = true
  const resp = await user.updateUser(userReq)
  if (resp.resultCode !== '00086') {
    isLoading.value = false
    toast.error(resp.data?.en)
    return
  }
  isLoading.value = false
  preview.file = null
  user.fetchUser().then()
  toast.success('User updated')
}

onMounted(async () => {
  await user.fetchUser()
  name.value = user.user?.name || ''
  language.value = user.user?.language || ''
  isFetching.value = false
})

// Get current tab from route
const currentTab = computed(() => route.query.tab as string || 'general')
</script>

<template>
  <div>
    <!-- Header Section -->
    <div class="mb-6 sm:mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Settings</h1>
          <p class="text-gray-600 text-sm sm:text-base">Manage your account preferences and settings</p>
        </div>
        <button 
          v-if="currentTab === 'general'"
          class="btn bg-gradient-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 shadow-lg text-white"
          @click="onUpdate" 
          :disabled="!isChanged || isLoading"
        >
          <SaveOutline class="w-4 h-4" />
          <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
          <span v-else>Save Changes</span>
        </button>
      </div>
    </div>

    <!-- Settings Content -->
    <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Tab Content -->
      <div class="">
        <!-- General Settings -->
        <div v-if="currentTab === 'general'">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <!-- Form Section -->
            <div class="lg:col-span-2 space-y-6">
              <div class="bg-gray-50 rounded-xl p-4 sm:p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <PersonOutline class="w-5 h-5" />
                  Profile Information
                </h3>
                
                <template v-if="isFetching">
                  <div class="space-y-4">
                    <div class="skeleton h-12 w-full"></div>
                    <div class="skeleton h-12 w-full"></div>
                    <div class="skeleton h-12 w-full"></div>
                  </div>
                </template>
                <template v-else>
                  <div class="space-y-4">
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium text-gray-700">Email</span>
                      </label>
                      <input 
                        :value="user.user?.email" 
                        type="text" 
                        placeholder="Email" 
                        class="input input-bordered w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        disabled 
                      />
                    </div>
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium text-gray-700">Name</span>
                      </label>
                      <input 
                        v-model="name" 
                        type="text" 
                        placeholder="Your full name" 
                        class="input input-bordered w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      />
                    </div>
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium text-gray-700">Language</span>
                      </label>
                      <select 
                        v-model="language" 
                        class="select select-bordered w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="tr">French</option>
                      </select>
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <!-- Profile Image Section -->
            <div class="flex flex-col items-center">
              <div class="bg-gray-50 rounded-xl p-4 sm:p-6 w-full">
                <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <ImageOutline class="w-5 h-5" />
                  Profile Photo
                </h3>
                
                <div class="flex flex-col items-center gap-4">
                  <div class="relative group">
                    <div v-if="!preview.previewImage" class="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center">
                      <DynamicImage
                        v-if="user.user?.photoUrl"
                        :dummy="false"
                        :src="getSrc(user.user?.photoUrl || '', true) || ''"
                        :loading-height="128"
                        :loading-width="128"
                        alt="Profile"
                        class="w-full h-full object-cover"
                      />
                      <PersonOutline v-else class="w-12 h-12 text-gray-400" />
                    </div>
                    <img 
                      v-else 
                      :src="preview.previewImage" 
                      alt="Preview" 
                      class="w-32 h-32 rounded-xl object-cover"
                    >
                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                      <span class="text-white text-sm font-medium">Change Photo</span>
                    </div>
                  </div>
                  
                  <label class="form-control w-full">
                    <div class="btn btn-outline w-full border-gray-200 hover:bg-gray-50 hover:border-blue-300">
                      <ImageOutline class="w-4 h-4" />
                      Choose Image
                    </div>
                    <input
                      type="file"
                      class="hidden"
                      accept="image/*"
                      ref="inputFile"
                      @change="preview.onChangeFile"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Timer Settings -->
        <div v-else-if="currentTab === 'timer'">
          <div class="bg-gray-50 rounded-xl p-4 sm:p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TimeOutline class="w-5 h-5" />
              Study Timer Settings
            </h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium text-gray-700">Start Date</span>
                    <span class="label-text-alt font-semibold text-blue-600">{{ dayjs(date).format('DD/MM/YYYY') }}</span>
                  </label>
                  <!-- <VueDatePicker 
                    v-model="date" 
                    inline 
                    auto-apply 
                    :enable-time-picker="false" 
                    :max-date="new Date()" 
                  /> -->
                </div>
              </div>
              <div class="flex items-center justify-center">
                <CountdownComponent force-split :date="date" />
              </div>
            </div>
          </div>
        </div>

        <!-- Permissions Settings -->
        <div v-else-if="currentTab === 'permissions'">
          <div v-if="user.can('permissions')" class="bg-gray-50 rounded-xl p-4 sm:p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ShieldCheckmarkOutline class="w-5 h-5" />
              Role & Permissions
            </h3>
            <RoleSettings />
          </div>
          <div v-else class="text-center py-12">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheckmarkOutline class="w-8 h-8 text-red-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Access Denied</h3>
            <p class="text-gray-600">You don't have permission to access this section.</p>
          </div>
        </div>

        <!-- Remove Duplicates Settings -->
        <div v-else-if="currentTab === 'remove-duplicates'">
          <div v-if="user.can('remove-duplicates')" class="bg-gray-50 rounded-xl p-4 sm:p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrashOutline class="w-5 h-5" />
              Remove Duplicates
            </h3>
            <RemoveDuplicates />
          </div>
          <div v-else class="text-center py-12">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrashOutline class="w-8 h-8 text-red-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Access Denied</h3>
            <p class="text-gray-600">You don't have permission to access this section.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles for settings page */
.btn-outline:hover {
  @apply shadow-md;
}

.rounded-xl {
  @apply transition-all duration-300;
}

.rounded-xl:hover {
  @apply shadow-lg;
}

/* Tab navigation styles */
.tab-button {
  @apply transition-all duration-300;
}

.tab-button:hover {
  @apply transform scale-105;
}

/* Form focus states */
.input:focus,
.select:focus {
  @apply ring-2 ring-blue-500 border-transparent;
}

/* Skeleton loading */
.skeleton {
  @apply animate-pulse bg-gray-200 rounded;
}
</style>
