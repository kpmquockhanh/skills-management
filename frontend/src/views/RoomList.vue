<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { 
  SettingsOutline, 
  AddOutline, 
  TrashOutline, 
  ChatbubbleEllipsesOutline
} from '@vicons/ionicons5'
import { useRoom } from '@/stores/room'
import { useToast } from 'vue-toastification'
import { getSrc } from '@/utils'
import { useClassStore } from '@/stores/class'

const room = useRoom()
const toast = useToast()
const loading = ref(true)
const createRoomModal = ref<any>(null)
const deleteRoomModal = ref<any>(null)
const roomToDelete = ref<string | null>(null)
const isDeleting = ref(false)
const name = ref('')
const description = ref('')
const isCreating = ref(false)

const classStore = useClassStore()
const selectedClass = ref<string | null>(null)
const classLoading = ref(false)

const onJoinRoom = (roomId: string) => {
  room.joinRoom(roomId)
}

const onEditRoom = (roomId: string) => {
  room.editRoom(roomId)
}

const fetchClassesForModal = async () => {
  classLoading.value = true
  try {
    await classStore.fetchClasses({ status: 'active', limit: 100 })
  } finally {
    classLoading.value = false
  }
}

const onShowModal = async () => {
  if (!createRoomModal.value) return
  await fetchClassesForModal()
  createRoomModal.value.showModal()
}

const onCloseModal = () => {
  if (!createRoomModal.value) return
  createRoomModal.value.close()
  name.value = ''
  description.value = ''
  selectedClass.value = null
}

const onCreate = async () => {
  if (!isValid.value) return
  try {
    isCreating.value = true
    await room.createRoom({
      name: name.value.trim(),
      description: description.value.trim(),
      class: selectedClass.value || undefined
    })
    toast.success('Room created successfully!')
    onCloseModal()
  } catch (error) {
    toast.error('Failed to create room')
  } finally {
    isCreating.value = false
  }
}

const onRemove = (roomId: string) => {
  roomToDelete.value = roomId
  if (!deleteRoomModal.value) return
  deleteRoomModal.value.showModal()
}

const confirmDelete = async () => {
  if (!roomToDelete.value) return
  try {
    isDeleting.value = true
    const res = await room.deleteRoom(roomToDelete.value)
    if (res && !res.error) {
      toast.success('Room deleted successfully!')
    } else {
      toast.error('Failed to delete room')
    }
    closeDeleteModal()
  } catch (error) {
    toast.error('Failed to delete room')
  } finally {
    isDeleting.value = false
  }
}

const closeDeleteModal = () => {
  if (!deleteRoomModal.value) return
  deleteRoomModal.value.close()
  roomToDelete.value = null
}

const rooms = computed(() => room.items)

const isValid = computed(() => {
  return name.value.trim() !== '' && description.value.trim() !== ''
})

onMounted(async () => {
  try {
    await room.fetchRooms()
  } catch (error) {
    toast.error('Failed to load rooms')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
      <!-- Messenger Header -->
      <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div class="p-4 sm:p-6 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <ChatbubbleEllipsesOutline class="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 class="text-xl sm:text-2xl font-bold text-gray-800">Class Groups</h1>
                <p class="text-gray-600 text-sm">{{ rooms.length }} active conversations</p>
              </div>
            </div>
            <button 
              class="btn bg-gradient-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 shadow-lg text-white"
              @click="onShowModal"
            >
              <AddOutline class="w-4 h-4" />
              New Group
            </button>
          </div>
        </div>
      </div>

      <!-- Conversations List -->
      <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Empty State -->
        <div v-if="!rooms.length && !loading" class="flex justify-center items-center min-h-[400px]">
          <div class="text-center">
            <div class="flex justify-center mb-4">
              <div class="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <ChatbubbleEllipsesOutline class="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h2 class="text-2xl font-semibold mb-2 text-gray-800">No Class Groups Yet</h2>
            <p class="text-gray-600 mb-4">Create your first class group to start learning together!</p>
            <button class="btn bg-gradient-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 shadow-lg text-white" @click="onShowModal">
              <AddOutline class="w-4 h-4" />
              Create Group
            </button>
          </div>
        </div>

        <!-- Loading Skeleton -->
        <div v-else-if="loading" class="space-y-2">
          <div v-for="i in 6" :key="i" class="flex items-center gap-4 p-4 animate-pulse">
            <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-1/3"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>

        <!-- Conversation Items -->
        <div v-else class="divide-y divide-gray-100">
          <div v-for="r in rooms" :key="r._id" 
               class="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
               @click="onJoinRoom(r._id)">
            <!-- Avatar -->
            <div class="relative flex-shrink-0">
              <div class="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                <img 
                  v-if="r.thumbnail" 
                  :src="getSrc(r.thumbnail)"
                  :alt="r.name"
                  class="w-full h-full object-cover"
                >
                <ChatbubbleEllipsesOutline v-else class="w-6 h-6 text-blue-600" />
              </div>
              <!-- Online indicator -->
              <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            
            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <h3 class="font-semibold text-gray-800 truncate">{{ r.name }}</h3>
              </div>
              <p class="text-sm text-gray-600 truncate">{{ r.description }}</p>
              <div class="flex items-center gap-2 mt-1" v-if="r.class">
                <span class="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Class Group</span>
                <span v-if="r.class" class="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Class: {{ r.class.name }}</span>
                <span class="text-xs text-gray-500">• {{ r.class.enrolledStudents }} member(s)</span>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                class="btn btn-ghost btn-sm hover:bg-gray-200" 
                @click.stop="onEditRoom(r._id)"
              >
                <SettingsOutline class="w-4 h-4" />
              </button>
              <button 
                class="btn btn-sm bg-red-500 hover:bg-red-600 border-0 text-white" 
                @click.stop="onRemove(r._id)"
              >
                <TrashOutline class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Room Modal -->
      <dialog
        id="create_room"
        ref="createRoomModal"
        class="modal"
      >
        <div class="modal-box bg-white relative">
          <!-- Close Button -->
          <button 
            class="btn btn-circle btn-ghost btn-sm absolute right-4 top-4 z-10 hover:bg-gray-100 transition-all duration-300"
            @click="onCloseModal"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>

          <h3 class="font-bold text-lg mb-4 text-gray-800">Create New Class Group</h3>

          <div class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium text-gray-700">Group Name</span>
              </label>
              <input 
                type="text" 
                class="input input-bordered w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="e.g., React Advanced Class"
                v-model="name"
                @keyup.enter="onCreate"
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium text-gray-700">Description</span>
              </label>
              <textarea 
                class="textarea textarea-bordered h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Describe what this class group is about..."
                v-model="description"
              ></textarea>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium text-gray-700">Assign to Class (optional, cannot change later)</span>
              </label>
              <select
                class="select select-bordered w-full"
                v-model="selectedClass"
                :disabled="classLoading"
              >
                <option value="">No class (public room)</option>
                <option v-for="cls in classStore.activeClasses" :key="cls._id" :value="cls._id">
                  {{ cls.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="modal-action">
            <button
              class="btn btn-ghost hover:bg-gray-100"
              @click="onCloseModal"
            >
              Cancel
            </button>
            <button
              class="btn bg-gradient-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 shadow-lg text-white"
              :disabled="!isValid || isCreating"
              @click="onCreate"
            >
              <span v-if="isCreating" class="loading loading-spinner loading-sm"></span>
              <span v-else>Create Group</span>
            </button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop bg-black/50">
          <button>close</button>
        </form>
      </dialog>

      <!-- Delete Room Modal -->
      <dialog
        id="delete_room"
        ref="deleteRoomModal"
        class="modal"
      >
        <div class="modal-box bg-white relative">
          <!-- Close Button -->
          <button 
            class="btn btn-circle btn-ghost btn-sm absolute right-4 top-4 z-10 hover:bg-gray-100 transition-all duration-300"
            @click="closeDeleteModal"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>

          <div class="text-center py-4">
            <div class="text-5xl mb-4">⚠️</div>
            <h3 class="font-bold text-lg mb-2 text-gray-800">Delete Class Group</h3>
            <p class="text-gray-600 mb-6">
              Are you sure you want to delete this class group? This action cannot be undone.
            </p>
          </div>

          <div class="modal-action">
            <button
              class="btn btn-ghost hover:bg-gray-100"
              @click="closeDeleteModal"
              :disabled="isDeleting"
            >
              Cancel
            </button>
            <button
              class="btn bg-red-500 hover:bg-red-600 border-0 shadow-lg text-white"
              :disabled="isDeleting"
              @click="confirmDelete"
            >
              <span v-if="isDeleting" class="loading loading-spinner loading-sm"></span>
              <span v-else>Delete Group</span>
            </button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop bg-black/50">
          <button>close</button>
        </form>
      </dialog>
    </div>
</template>

<style scoped>
.modal-box {
  @apply transition-all duration-300;
}

.btn-circle {
  @apply hover:scale-110 active:scale-95;
}

.modal-backdrop {
  @apply transition-opacity duration-300;
}

.modal-backdrop:hover {
  @apply bg-black/60;
}

/* Add animation for the warning emoji */
@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

.text-5xl {
  animation: shake 0.5s ease-in-out;
}
</style>