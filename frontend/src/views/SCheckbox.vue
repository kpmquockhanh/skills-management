<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: 'label'
  },
  checked: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
  }
})
const uniqueId = computed(() => {
  return `${props.id}_${props.label}`
})
</script>

<template>
  <div class="inline-flex items-center">
    <label class="flex items-center cursor-pointer relative" :for="uniqueId">
      <input
        type="checkbox"
        class="toggle toggle-sm toggle-success"
        :checked="checked"
        :id="uniqueId"
      />
    </label>
    <label class="cursor-pointer ml-2 text-slate-600 text-sm" :for="uniqueId">
      {{ label }}
    </label>
  </div>
</template>
