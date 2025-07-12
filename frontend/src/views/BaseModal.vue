<template>
  <div class="modal" :class="{'modal-open': show}" v-if="show">
    <div class="modal-box">
      <button :disabled="loading" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              @click="$emit('close')">✕
      </button>
      <h3 class="text-lg font-bold mb-2">{{ title }}</h3>
      <slot></slot>
      <slot name="action"></slot>
      <div class="mt-4 flex justify-end gap-4" v-if="!$slots.action">
        <button
          class="btn btn-outline-secondary"
          @click="$emit('close')"
          :disabled="loading"
        >
          {{ cancelLabel }}
        </button>
        <button
          v-if="ok"
          class="btn btn-primary"
          @click="() => {
            ok().then(() => {
              $emit('close')
            })
          }"
          :disabled="loading"
        >
          <span v-if="loading" class="loading loading-spinner"></span>
          <span v-else>{{ okLabel }}</span>
        </button>
      </div>
    </div>
    <div class="modal-backdrop">
      <button @click="$emit('close')"></button>
    </div>
  </div>
</template>
<script setup>
import { defineProps } from 'vue'
defineProps({
  show: Boolean,
  title: String,
  ok: Function,
  loading: {
    type: Boolean,
    default: false
  },
  okLabel: {
    type: String,
    default: 'OK'
  },
  cancelLabel: {
    type: String,
    default: 'Cancel'
  }
})
</script>
