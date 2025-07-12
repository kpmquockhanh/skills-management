<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { 
  PersonOutline, 
  CheckmarkDoneOutline,
  TimeOutline
} from '@vicons/ionicons5'
import DynamicImage from '@components/DynamicImage.vue'
import { getSrc } from '@/utils'

dayjs.extend(relativeTime)

const props = defineProps({
  side: {
    type: String,
    required: true,
    validator(value: string) {
      return ['left', 'right'].includes(value)
    }
  },
  message: {
    type: Object,
    required: true
  }
})

const isOwnMessage = computed(() => {
  return props.side === 'right'
})

const timeData = computed(() => {
  return dayjs(props.message.createdAt).fromNow()
})

const messageTime = computed(() => {
  return dayjs(props.message.createdAt).format('HH:mm')
})
</script>

<template>
  <div :class="[
    'flex gap-3 mb-4',
    isOwnMessage ? 'flex-row-reverse' : 'flex-row'
  ]">
    <!-- Avatar -->
    <div class="flex-shrink-0">
      <div class="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
        <DynamicImage 
          v-if="props.message.user.photo?.photoUrl" 
          :lazy="false" 
          :src="getSrc(props.message.user.photo?.photoUrl, true)" 
          alt="User avatar"
          class="w-full h-full object-cover"
        />
        <PersonOutline v-else class="w-4 h-4 text-blue-600" />
      </div>
    </div>

    <!-- Message Content -->
    <div :class="[
      'flex flex-col max-w-xs sm:max-w-md lg:max-w-lg',
      isOwnMessage ? 'items-end' : 'items-start'
    ]">
      <!-- User Name (only for other users) -->
      <div v-if="!isOwnMessage" class="flex items-center gap-2 mb-1">
        <span class="text-sm font-medium text-gray-800">{{ props.message.user.name }}</span>
        <span class="text-xs text-gray-500">{{ timeData }}</span>
      </div>

      <!-- Message Bubble -->
      <div :class="[
        'px-4 py-2 rounded-xl text-sm',
        isOwnMessage 
          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-md' 
          : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
      ]">
        <p class="whitespace-pre-wrap">{{ props.message.content }}</p>
      </div>

      <!-- Message Footer -->
      <div :class="[
        'flex items-center gap-1 mt-1',
        isOwnMessage ? 'justify-end' : 'justify-start'
      ]">
        <span class="text-xs text-gray-500">{{ messageTime }}</span>
        <CheckmarkDoneOutline v-if="isOwnMessage" class="w-3 h-3 text-blue-500" />
      </div>
    </div>
  </div>
</template>
