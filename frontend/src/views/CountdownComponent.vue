<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, onBeforeUnmount, onMounted, type Ref, ref } from 'vue'

const props = defineProps({
  date: {
    type: Date,
    required: true
  },
  forceSplit: {
    type: Boolean,
    default: false
  }
})
//2022-05-13
const start = computed(() => {
  return dayjs(props.date, 'YYYY-MM-DD')
})

const isShow = computed(() => {
  return dayjs().isAfter(start.value)
})


const years: Ref<number> = ref(0)
const months: Ref<number> = ref(0)
const days: Ref<number> = ref(0)

const hours: Ref<number> = ref(0)
const minutes: Ref<number> = ref(0)
const seconds: Ref<number> = ref(0)
let loop: number;
onMounted(() => {
  loop = setInterval(() => {
    const currentDate = dayjs() // Get the current date
    const diff = dayjs.duration(currentDate.diff(start.value))
    years.value = diff.years()
    months.value = diff.months()
    days.value = diff.days()
    minutes.value = diff.seconds()
    hours.value = diff.hours()
    minutes.value = diff.minutes()
    seconds.value = diff.seconds()
  })
})

onBeforeUnmount(() => {
  clearInterval(loop)
})
</script>

<template>
  <div v-if="isShow" class="flex flex-col gap-5 text-center auto-cols-max" :class="{'md:grid md:grid-flow-col': !forceSplit}">
    <div class="md:flex grid grid-flow-col gap-5 text-center">
      <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
      <span class="countdown font-mono text-5xl">
        <span :style="{
          '--value': years,
        }"></span>
      </span>
        years
      </div>
      <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
      <span class="countdown font-mono text-5xl">
        <span :style="{
          '--value': months,
        }"></span>
      </span>
        months
      </div>
      <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
      <span class="countdown font-mono text-5xl">
        <span :style="{
          '--value': days,
        }"></span>
      </span>
        days
      </div>
    </div>
    <div class="md:flex grid grid-flow-col gap-5 text-center">
      <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
      <span class="countdown font-mono text-5xl">
        <span :style="{
          '--value': hours,
        }"></span>
      </span>
        hours
      </div>

      <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
      <span class="countdown font-mono text-5xl">
        <span :style="{
          '--value': minutes,
        }"></span>
      </span>
        minutes
      </div>

      <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
      <span class="countdown font-mono text-5xl">
        <span :style="{
          '--value': seconds,
        }"></span>
      </span>
        seconds
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
