<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import { useRoom } from '@/stores/room'
import DynamicImage from '@components/DynamicImage.vue'
import { usePreviewImage } from '@/stores/previewImage'
import { useToast } from 'vue-toastification'
import { 
  ArrowBackOutline, 
  SaveOutline, 
  ImageOutline,
  ChatbubbleEllipsesOutline
} from '@vicons/ionicons5'
import {getSrc} from '@/utils'

const room = useRoom()
const router = useRouter()
const toast = useToast()

const route = useRoute()
const name = ref('')
const description = ref('')
const preview = usePreviewImage()

const currentRoom = computed(() => {
  return room.items.find((item) => item._id === route.params.room_id)
})

const goBack = () => {
  router.push('/chat')
}

const saveChanges = async () => {
  if (!currentRoom.value?._id) return
  
  try {
    await room.updateRoom(currentRoom.value._id, { 
      name: name.value.trim(), 
      description: description.value.trim(), 
      image: preview.file || undefined 
    })
    toast.success('Class group updated successfully!')
    goBack()
  } catch (error) {
    toast.error('Failed to update class group')
  }
}

onMounted(async () => {
  await room.fetchRooms()
  name.value = currentRoom.value?.name || ''
  description.value = currentRoom.value?.description || ''
})
</script>

<template>
  <div>
    <!-- Header Section -->
    <div class="mb-6 sm:mb-8">
      <div class="flex items-center gap-4 mb-4">
        <button 
          @click="goBack"
          class="btn btn-ghost btn-sm hover:bg-gray-100"
        >
          <ArrowBackOutline class="w-4 h-4" />
          Back
        </button>
      </div>
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Edit Class Group</h1>
          <p class="text-gray-600 text-sm sm:text-base">Update your class group information</p>
        </div>
        <button 
          class="btn bg-gradient-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 shadow-lg text-white"
          :disabled="room.updating" 
          @click="saveChanges"
        >
          <SaveOutline class="w-4 h-4" />
          <span v-if="room.updating" class="loading loading-spinner loading-sm"></span>
          <span v-else>Save Changes</span>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="currentRoom?._id" class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
      <!-- Form Section -->
      <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 sm:p-6 border-b border-gray-100">
          <h2 class="text-lg sm:text-xl font-bold text-gray-800">Group Information</h2>
          <p class="text-gray-600 text-sm mt-1">Update your class group details</p>
        </div>
        <div class="p-4 sm:p-6 space-y-6">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium text-gray-700">Group Name</span>
            </label>
            <input 
              type="text" 
              placeholder="e.g., React Advanced Class" 
              class="input input-bordered w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              v-model="name" 
              :disabled="room.updating" 
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium text-gray-700">Description</span>
            </label>
            <textarea 
              placeholder="Describe what this class group is about..." 
              class="textarea textarea-bordered h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              v-model="description" 
              :disabled="room.updating"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Image Section -->
      <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 sm:p-6 border-b border-gray-100">
          <h2 class="text-lg sm:text-xl font-bold text-gray-800">Group Image</h2>
          <p class="text-gray-600 text-sm mt-1">Upload a thumbnail for your class group</p>
        </div>
        <div class="p-4 sm:p-6">
          <div class="flex flex-col items-center gap-6">
            <div class="relative group">
              <div v-if="!preview.previewImage" class="w-48 h-48 rounded-xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
                <DynamicImage
                  v-if="currentRoom.thumbnail"
                  :dummy="false"
                  :src="getSrc(currentRoom.thumbnail, true)"
                  :loading-height="300"
                  :loading-width="300"
                  alt="Group thumbnail"
                  class="w-full h-full object-cover"
                />
                <div v-else class="flex flex-col items-center gap-2">
                  <ChatbubbleEllipsesOutline class="w-12 h-12 text-gray-400" />
                  <span class="text-sm text-gray-500">No image</span>
                </div>
              </div>
              <img 
                v-else 
                :src="preview.previewImage" 
                alt="Preview" 
                class="w-48 h-48 rounded-xl object-cover"
              >
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                <span class="text-white text-sm font-medium">Change Image</span>
              </div>
            </div>

            <label class="form-control w-full max-w-xs">
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
</template>

<style scoped>
/* Custom styles for the edit page */
.btn-outline:hover {
  @apply shadow-md;
}

.rounded-xl {
  @apply transition-all duration-300;
}

.rounded-xl:hover {
  @apply shadow-lg;
}
</style>
