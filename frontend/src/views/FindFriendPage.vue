<script setup lang="ts">
import { useFriendStore } from '@/stores/friend'
import { computed, onMounted, ref } from 'vue'
import DynamicImage from '@components/DynamicImage.vue'
import SendIcon from '@vicons/fluent/Send24Regular'
import Checkmark24Filled from '@vicons/fluent/Checkmark24Filled'
import { Icon } from '@vicons/utils'
import type { User } from '@/types/base'
import Search24Regular from '@vicons/fluent/Search24Regular'
import { useUser } from '@/stores/user'
import UserIcon from '@vicons/ionicons5/PersonSharp'

const friendStore = useFriendStore()
const userStore = useUser()
const q = ref('')
const items = ref<User[]>([])
const isSent = ref<Map<string, boolean>>(new Map())

const onSubmit = () => {
  if (!q.value || q.value.length < 5) return
  friendStore.findFriends(q.value).then(r => {
    items.value = r.filter((user) => userStore.user?._id !== user._id)
  })
}

onMounted(() => {
  friendStore.fetch().then()
})

const isValid = computed(() => {
  return q.value.length >= 5
})

const checkIsFriend = (userId: string) => {
  return friendStore.items.some((user) => user._id === userId)
}

const onInvite = (userId: string) => {
  friendStore.sendInvitation(userId).then(() => {
    isSent.value.set(userId, true)
  })
}
</script>

<template>
  <div class="w-full min-h-[calc(100vh-4rem)] p-4">
    <div class="max-w-3xl mx-auto">
      <div class="card bg-base-100 shadow-md">
        <div class="card-body p-6">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-base-content">Find Friends</h2>
            <div class="badge badge-primary badge-lg">{{ friendStore.items.length }} Friends</div>
          </div>

          <!-- Search Section -->
          <div class="relative">
            <div class="flex gap-4">
              <div class="form-control flex-grow">
                <div class="relative">
                  <input 
                    type="text" 
                    placeholder="Search by username or email..." 
                    class="input input-bordered w-full pl-12 focus:input-primary transition-all duration-300"
                    @keyup.enter="onSubmit" 
                    v-model="q"
                  />
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/50">
                    <Icon size="20">
                      <Search24Regular />
                    </Icon>
                  </div>
                </div>
                <div class="label">
                  <span class="label-text-alt text-base-content/70">Enter at least 5 characters to search</span>
                </div>
              </div>

              <button 
                class="btn btn-primary shadow-lg hover:shadow-primary/20 transition-all duration-300" 
                @click="onSubmit" 
                :disabled="!isValid"
              >
                <span v-if="friendStore.isFinding" class="loading loading-spinner"></span>
                <span v-else>Search</span>
              </button>
            </div>
          </div>

          <!-- Results Section -->
          <div class="mt-8">
            <!-- Empty State -->
            <div 
              v-if="!items.length" 
              class="flex flex-col items-center justify-center py-12"
            >
              <div class="text-6xl mb-4">🔍</div>
              <p class="text-base-content/70 text-lg text-center mb-2">No results found</p>
              <p class="text-base-content/50 text-sm text-center">Try searching with a different username or email</p>
            </div>

            <!-- Results List -->
            <transition-group 
              v-else 
              name="list" 
              tag="div" 
              class="flex flex-col gap-4"
            >
              <div 
                v-for="user in items" 
                :key="user.username" 
                class="card bg-base-200 hover:bg-base-300 transition-all duration-300"
              >
                <div class="card-body p-4">
                  <div class="flex items-center gap-4">
                    <!-- Avatar -->
                    <div class="relative">
                      <div class="w-14 h-14 rounded-full overflow-hidden ring-2 ring-primary/20">
                        <DynamicImage 
                          v-if="user.photoUrl" 
                          circle 
                          :src="user.photoUrl"
                          class="w-full h-full object-cover"
                        />
                        <div v-else class="w-full h-full flex items-center justify-center bg-base-300">
                          <Icon size="28" class="text-base-content/50">
                            <UserIcon />
                          </Icon>
                        </div>
                      </div>
                    </div>

                    <!-- User Info -->
                    <div class="flex-grow">
                      <h3 class="font-semibold text-base-content">{{ user.username }}</h3>
                      <p class="text-sm text-base-content/70">{{ user.email }}</p>
                    </div>

                    <!-- Action Button -->
                    <button 
                      class="btn btn-circle transition-all duration-300"
                      :class="{
                        'btn-primary': !isSent.get(user._id) && !checkIsFriend(user._id),
                        'btn-success': isSent.get(user._id) || checkIsFriend(user._id)
                      }"
                      @click="onInvite(user._id)" 
                      :disabled="isSent.get(user._id) || checkIsFriend(user._id)"
                    >
                      <Icon size="20">
                        <SendIcon v-if="!isSent.get(user._id) && !checkIsFriend(user._id)"/>
                        <Checkmark24Filled v-else/>
                      </Icon>
                    </button>
                  </div>
                </div>
              </div>
            </transition-group>
          </div>
        </div>
      </div>
    </div>
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
  transform: translateY(30px);
}

.card {
  @apply transition-all duration-300;
}


.input {
  @apply transition-all duration-300;
}


.btn {
  @apply transition-all duration-300;
}

.btn:active {
  @apply scale-95;
}
</style>
