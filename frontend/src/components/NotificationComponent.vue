<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useFriendStore } from '@/stores/friend'
import { onMounted } from 'vue'
import DynamicImage from '@components/DynamicImage.vue'
import AppsAddIn20Regular from '@vicons/fluent/AppsAddIn20Regular'
import { Icon } from '@vicons/utils'

const authStore = useAuthStore()
const friendStore = useFriendStore()

onMounted(() => {
  if (authStore.isAuth) {
    friendStore.fetchInvitations().then()
  }
})

const onAccept = (id: string) => {
  friendStore.acceptInvitation(id)
}

const onDecline = (id: string) => {
  friendStore.declineInvitation(id)
}
</script>

<template>
  <div class="notification-container bg-base-100 rounded-xl p-4">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h1 class="font-semibold text-lg flex items-center gap-2 text-base-content">
        <Icon size="24" class="text-primary">
          <AppsAddIn20Regular/>
        </Icon>
        <span>Friend Requests</span>
      </h1>
      <div class="badge badge-primary" v-if="friendStore.invitations.length > 0">
        {{ friendStore.invitations.length }}
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-col gap-3">
      <!-- Empty State -->
      <Transition name="fade">
        <div v-if="friendStore.invitations.length === 0" 
             class="flex flex-col items-center justify-center py-8 px-4 bg-base-200/50 rounded-lg">
          <div class="w-16 h-16 mb-3 rounded-full bg-base-200 flex items-center justify-center">
            <Icon size="32" class="text-base-content/30">
              <AppsAddIn20Regular/>
            </Icon>
          </div>
          <p class="text-base-content/70 font-medium">No pending requests</p>
          <p class="text-sm text-base-content/50 mt-1">When someone sends you a friend request, it will appear here.</p>
        </div>
      </Transition>

      <!-- Invitations List -->
      <TransitionGroup name="list" tag="div" class="flex flex-col gap-3">
        <div v-for="invitation in friendStore.invitations" 
             :key="invitation._id" 
             class="invitation-card group">
          <div class="flex items-center gap-4 p-3 bg-base-200/30 rounded-lg transition-all duration-300 hover:bg-base-200/50">
            <!-- Avatar -->
            <div class="relative">
              <DynamicImage 
                class="w-14 h-14 rounded-full ring-2 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40" 
                :src="invitation.photoUrl" 
                clickable
              />
              <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full ring-2 ring-base-100"></div>
            </div>

            <!-- User Info -->
            <div class="flex-grow min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-base-content truncate">{{ invitation.origin.email }}</span>
                <span class="text-xs text-base-content/50">wants to be your friend</span>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex gap-2 mt-2">
                <button 
                  :disabled="friendStore.isProcessingInvitation" 
                  class="btn btn-sm btn-primary transition-all duration-300 hover:scale-105" 
                  @click="onAccept(invitation._id)"
                >
                  <span class="loading loading-spinner loading-sm" v-if="friendStore.isProcessingInvitation"></span>
                  <span v-else>Accept</span>
                </button>
                <button 
                  :disabled="friendStore.isProcessingInvitation" 
                  class="btn btn-sm btn-ghost transition-all duration-300 hover:scale-105" 
                  @click="onDecline(invitation._id)"
                >
                  <span class="loading loading-spinner loading-sm" v-if="friendStore.isProcessingInvitation"></span>
                  <span v-else>Decline</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.notification-container {
  @apply transition-all duration-300;
}

.invitation-card {
  @apply transition-all duration-300;
}

/* List Transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Fade Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Loading Spinner */
.loading-spinner {
  @apply text-base-content/50;
}
</style>
