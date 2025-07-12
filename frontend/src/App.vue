<script setup lang="ts">
import { computed } from 'vue'
import DashboardLayout from './components/DashboardLayout.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const layout = computed(() => {
  if (route.meta.layout === 'auth') {
    return 'div'
  }
  return (DashboardLayout)
})

const classes = computed(() => {
  return {
    'h-screen': route.meta.layout === 'auth',
    'min-h-screen': route.meta.layout !== 'auth',
    'bg-gradient-to-br from-slate-50 to-blue-50': route.meta.layout !== 'auth'
  }
})

</script>

<template>
  <component :is="layout" :class="classes">
    <router-view />
  </component>
</template>
