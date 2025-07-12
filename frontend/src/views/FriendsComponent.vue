<script setup lang="ts">
import { useFriendStore } from '@/stores/friend'
import { onMounted, ref, computed } from 'vue'
import DynamicImage from '@components/DynamicImage.vue'
import UserIcon from '@vicons/ionicons5/PersonSharp'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { Icon } from '@vicons/utils'
import AddCircleOutline from '@vicons/ionicons5/AddCircleOutline'
import CloseOutline from '@vicons/ionicons5/CloseOutline'
import MailOutline from '@vicons/ionicons5/MailOutline'
import CalendarOutline from '@vicons/ionicons5/CalendarOutline'
import { getSrc } from '@/utils'

// Types
interface Friend {
  _id: string
  username: string
  email: string
  photoUrl?: string
  createdAt: string
  isOnline?: boolean
}

interface UserModalState {
  isOpen: boolean
  selectedFriend: Friend | null
}

// Composable for modal management
const useUserModal = () => {
  const modalState = ref<UserModalState>({
    isOpen: false,
    selectedFriend: null
  })

  const openModal = (friend: Friend) => {
    modalState.value.selectedFriend = friend
    modalState.value.isOpen = true
  }

  const closeModal = () => {
    modalState.value.isOpen = false
    modalState.value.selectedFriend = null
  }

  return {
    modalState,
    openModal,
    closeModal
  }
}

// Store and router setup
const friendStore = useFriendStore()
const authStore = useAuthStore()
const router = useRouter()

// Modal management
const { modalState, openModal, closeModal } = useUserModal()

// Computed properties
const isAuthenticated = computed(() => authStore.isAuth)
const friends = computed(() => friendStore.items)
const isLoading = computed(() => friendStore.isLoading)
const hasFriends = computed(() => friends.value.length > 0)

// Methods
const routeToFriendSearch = () => {
  router.push({
    name: 'friends',
  })
}

// Lifecycle hooks
onMounted(async () => {
  if (isAuthenticated.value) {
    await friendStore.fetch()
  }
})
</script>

<template>
  <div v-if="isAuthenticated" class="w-full">
    <div class="card bg-base-100 shadow-md">
      <div class="card-body p-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="card-title text-base font-semibold">Friends</h2>
          <button 
            class="btn btn-primary btn-sm gap-1 shadow-md hover:shadow-primary/20"
            @click="routeToFriendSearch"
          >
            <Icon size="16">
              <AddCircleOutline />
            </Icon>
            Add Friend
          </button>
        </div>

        <div class="relative">
          <!-- Loading State -->
          <div v-if="isLoading" class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <div class="skeleton h-10 w-10 rounded-full"></div>
              <div class="flex-1">
                <div class="skeleton h-3 w-20 mb-1"></div>
                <div class="skeleton h-2 w-24"></div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="skeleton h-10 w-10 rounded-full"></div>
              <div class="flex-1">
                <div class="skeleton h-3 w-20 mb-1"></div>
                <div class="skeleton h-2 w-24"></div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="!hasFriends" class="flex flex-col items-center justify-center py-6">
            <div class="text-3xl mb-3">👥</div>
            <p class="text-sm text-base-content/70 text-center mb-3">You don't have any friends yet.</p>
            <button 
              class="btn btn-primary btn-sm gap-1 shadow-lg hover:shadow-primary/20"
              @click="routeToFriendSearch"
            >
              <Icon size="16">
                <AddCircleOutline />
              </Icon>
              Find Friends
            </button>
          </div>

          <!-- Friends List -->
          <transition-group 
            v-else 
            name="list" 
            tag="div" 
            class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3"
          >
            <div 
              v-for="friend in friends" 
              :key="friend._id"
              class="group relative"
              @click="openModal(friend)"
            >
              <div class="card bg-base-200 hover:bg-base-300 transition-all duration-300 cursor-pointer">
                <div class="card-body p-2">
                  <div class="flex flex-col items-center gap-2">
                    <div class="relative">
                      <div class="w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                        <DynamicImage 
                          v-if="friend.photoUrl" 
                          circle 
                          :src="getSrc(friend.photoUrl, true)"
                          class="w-full h-full object-cover"
                        />
                        <div v-else class="w-full h-full flex items-center justify-center bg-base-300">
                          <Icon size="20" class="text-base-content/50">
                            <UserIcon />
                          </Icon>
                        </div>
                      </div>
                      <div 
                        class="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full ring-2 ring-base-200"
                        :class="{ 'bg-success': friend.isOnline, 'bg-base-content/30': !friend.isOnline }"
                      ></div>
                    </div>
                    <div class="text-center">
                      <h3 class="font-medium text-xs truncate max-w-[80px]">{{ friend.username }}</h3>
                      <p class="text-[10px] text-base-content/70 truncate max-w-[80px]">{{ friend.email }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </div>

    <!-- User Details Modal -->
    <Transition name="modal">
      <div v-if="modalState.isOpen" class="modal modal-open">
        <div class="modal-backdrop" @click="closeModal"></div>
        <div class="modal-box max-w-md p-0 overflow-hidden">
          <!-- Modal Header -->
          <div class="bg-base-200 p-3 flex items-center justify-between">
            <h3 class="text-base font-semibold">User Details</h3>
            <button class="btn btn-ghost btn-circle btn-sm" @click="closeModal">
              <Icon size="18">
                <CloseOutline />
              </Icon>
            </button>
          </div>

          <!-- Modal Content -->
          <div class="p-4">
            <div class="flex flex-col sm:flex-row gap-4">
              <!-- User Avatar -->
              <div class="flex flex-col items-center gap-3">
                <div class="relative">
                  <div class="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/20">
                    <DynamicImage 
                      v-if="modalState.selectedFriend?.photoUrl" 
                      circle 
                      :src="getSrc(modalState.selectedFriend.photoUrl, true)"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center bg-base-300">
                      <Icon size="36" class="text-base-content/50">
                        <UserIcon />
                      </Icon>
                    </div>
                  </div>
                  <div 
                    class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full ring-4 ring-base-100"
                    :class="{ 'bg-success': modalState.selectedFriend?.isOnline, 'bg-base-content/30': !modalState.selectedFriend?.isOnline }"
                  ></div>
                </div>
                <div class="text-center">
                  <h2 class="text-lg font-semibold">{{ modalState.selectedFriend?.username }}</h2>
                  <p class="text-sm text-base-content/70">
                    {{ modalState.selectedFriend?.isOnline ? 'Online' : 'Offline' }}
                  </p>
                </div>
              </div>

              <!-- User Info -->
              <div class="flex-grow space-y-3">
                <div class="flex items-center gap-2">
                  <Icon size="18" class="text-base-content/50">
                    <MailOutline />
                  </Icon>
                  <div>
                    <p class="text-xs text-base-content/50">Email</p>
                    <p class="text-sm font-medium">{{ modalState.selectedFriend?.email }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <Icon size="18" class="text-base-content/50">
                    <CalendarOutline />
                  </Icon>
                  <div>
                    <p class="text-xs text-base-content/50">Member Since</p>
                    <p class="text-sm font-medium">
                      {{ modalState.selectedFriend?.createdAt ? new Date(modalState.selectedFriend.createdAt).toLocaleDateString() : 'N/A' }}
                    </p>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-2 mt-4">
                  <button class="btn btn-primary btn-sm flex-grow">
                    Send Message
                  </button>
                  <button class="btn btn-outline btn-sm flex-grow">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.card {
  @apply transition-all duration-300;
}

.card:hover {
  @apply shadow-lg;
}

/* Add subtle hover effect to friend cards */
.group:hover .card {
  @apply -translate-y-0.5;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-box,
.modal-leave-to .modal-box {
  transform: scale(0.95);
}

.modal-enter-from .modal-backdrop,
.modal-leave-to .modal-backdrop {
  opacity: 0;
}

.modal-backdrop {
  @apply fixed inset-0 bg-black/60;
  backdrop-filter: blur(5px);
  transition: opacity 0.5s ease;
  z-index: 1;
}

/* Modal Styles */
.modal {
  @apply fixed inset-0 z-50 flex items-center justify-center;
}

.modal-box {
  @apply bg-base-100 rounded-xl shadow-2xl;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 2;
}
</style>
