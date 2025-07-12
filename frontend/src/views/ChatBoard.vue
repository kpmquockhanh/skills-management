<script setup lang="ts">
import ChatMessage from '../components/ChatMessage.vue';
import { onMounted, ref, onBeforeUnmount, type Ref, watch, nextTick, computed } from 'vue'
import { Icon } from '@vicons/utils';
import { 
  SendOutline, 
  ArrowBackOutline, 
  SettingsOutline,
  PeopleOutline,
  ChatbubbleEllipsesOutline
} from '@vicons/ionicons5';
import { useToast } from 'vue-toastification'
import { useWebsocket } from '@/stores/websocket';
import { useRoute, useRouter } from 'vue-router';
import { useRequest } from '@/stores/http'
import type { Message } from '@/types/base'
import { useUser } from '@/stores/user'
import { useRoom } from '@/stores/room'

const type = ref();
const mainScreen = ref();
const typeInput = ref();
const messages: Ref<Array<Message>> = ref([]);
const isTyping = ref(false);

const toast = useToast();
const route = useRoute();
const router = useRouter();
const websocket = useWebsocket();
const request = useRequest();
const user = useUser();
const room = useRoom();

const currentRoom = computed(() => {
  return room.items.find((item) => item._id === route.params.room_id)
})

const goBack = () => {
  router.push('/chat')
}

watch(messages, () => {
  nextTick(() => {
    scrollToBottom();
  });
})

const scrollToBottom = () => {
  if (mainScreen.value) {
    mainScreen.value.scrollTo({
      top: mainScreen.value.scrollHeight,
      behavior: 'smooth'
    });
  }
}

const initWs = () => {
  websocket.init(route.params.room_id as string);
}

const fetchMessages = async () => {
  const res = await request.request(`/v1/chat/${route.params.room_id}`, 'GET', {})
  messages.value = res.messages.reverse();
  nextTick(() => {
    scrollToBottom();
  });
}

const onSendMessage = async () => {
  if (!type.value?.trim()) {
    return;
  }
  isTyping.value = true;
  const res = await request.request(
    `/v1/chat/${route.params.room_id}`,
    'POST',
    {
      body: {
        content: type.value.trim(),
      },
    },
    {
      noLoading: true,
    }
  )
  if (res) {
    type.value = '';
    typeInput.value?.focus();
  } else {
    toast.error('Failed to send message');
  }
  isTyping.value = false;
}

onMounted(async () => {
  await room.fetchRooms();
  initWs();
  fetchMessages();
  websocket.socket?.on('new_message', (data: Message) => {
    messages.value = [...messages.value, data];
  });
})

onBeforeUnmount(() => {
  websocket.destroy();
})
</script>

<template>
  <div class="flex flex-col h-full bg-gradient-to-br from-slate-50 to-blue-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-100 px-4 sm:px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button 
            @click="goBack"
            class="btn btn-ghost btn-sm hover:bg-gray-100"
          >
            <ArrowBackOutline class="w-4 h-4" />
            Back
          </button>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
              <ChatbubbleEllipsesOutline class="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 class="text-lg font-semibold text-gray-800">{{ currentRoom?.name || 'Class Group' }}</h2>
              <p class="text-sm text-gray-600">{{ currentRoom?.description || 'Loading...' }}</p>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn btn-ghost btn-sm hover:bg-gray-100">
            <PeopleOutline class="w-4 h-4" />
          </button>
          <button class="btn btn-ghost btn-sm hover:bg-gray-100">
            <SettingsOutline class="w-4 h-4" />
          </button>
          <div class="badge badge-success bg-green-100 text-green-600 border-0">Online</div>
        </div>
      </div>
    </div>

    <!-- Messages Area -->
    <div 
      id="chat-messages" 
      class="flex-grow w-full overflow-auto px-4 sm:px-6 py-6 space-y-4" 
      ref="mainScreen"
    >
      <div v-if="request.loading" class="flex justify-center w-full py-12">
        <div class="flex flex-col items-center gap-4">
          <div class="loading loading-dots loading-lg text-blue-600"></div>
          <span class="text-gray-600">Loading messages...</span>
        </div>
      </div>
      <div v-else-if="!messages.length" class="flex flex-col items-center justify-center h-full py-12">
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <ChatbubbleEllipsesOutline class="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">No Messages Yet</h3>
        <span class="text-gray-600 text-center">Start the conversation in your class group!</span>
      </div>
      <template v-else>
        <div class="flex flex-col gap-4">
          <ChatMessage
            v-for="message in messages"
            :key="message._id"
            :side="message.user._id === user.user?._id ? 'right' : 'left'"
            :message="message"
          />
        </div>
      </template>
    </div>

    <!-- Input Area -->
    <div class="bg-white border-t border-gray-100 p-4 sm:p-6">
      <div class="flex gap-4 max-w-4xl mx-auto">
        <div class="flex-grow relative">
          <input
            v-model="type"
            ref="typeInput"
            type="text"
            placeholder="Type your message..."
            class="input input-bordered w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 pr-12 bg-gray-50 rounded-xl"
            :class="{ 'input-disabled': isTyping }"
            :disabled="isTyping"
            @keyup.enter="onSendMessage"
          >
          <div class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <span v-if="isTyping" class="loading loading-dots loading-xs"></span>
          </div>
        </div>
        <button 
          :disabled="!type?.trim() || isTyping" 
          class="btn bg-gradient-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 shadow-lg text-white transition-all duration-300 rounded-xl"
          :class="{ 'loading': isTyping }"
          @click="onSendMessage" 
          ref="sendButton"
        >
          <SendOutline v-if="!isTyping" class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for messages */
#chat-messages::-webkit-scrollbar {
  width: 6px;
}

#chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

#chat-messages::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}

#chat-messages::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.5);
}

.input {
  @apply transition-all duration-300;
}

.input:focus {
  @apply shadow-lg;
}

.btn {
  @apply transition-all duration-300;
}

.btn:hover {
  @apply scale-105;
}

.btn:active {
  @apply scale-95;
}

/* Message styling */
:deep(.chat-message) {
  @apply rounded-xl;
}

:deep(.chat-message-left) {
  @apply rounded-tl-none;
}

:deep(.chat-message-right) {
  @apply rounded-tr-none;
}
</style>
