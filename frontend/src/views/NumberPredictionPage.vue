<script setup lang="ts">
import { ref } from 'vue'
import { useRequest } from '@/stores/http'

const drawing = ref(false)
const prediction = ref<{result?: { digit?: number}}>()
const request = useRequest()
const canvas = ref<HTMLCanvasElement>()

const startDrawing = (e: MouseEvent) => {
  drawing.value = true
  draw(e)
}

const draw = (e: MouseEvent) => {
  if (!drawing.value || !canvas.value) return
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  ctx.lineWidth = 30
  ctx.lineCap = 'round'
  ctx.strokeStyle = 'black'

  ctx.lineTo(e.clientX - canvas.value.offsetLeft, e.clientY - canvas.value.offsetTop)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(e.clientX - canvas.value.offsetLeft, e.clientY - canvas.value.offsetTop)
}

const stopDrawing = () => {
  drawing.value = false
  canvas.value?.getContext('2d')?.beginPath()
}

const  dataURLToBlob = (dataURL: string) => {
  const parts = dataURL.split(',');
  if (parts.length !== 2) return new Blob();
  const match = parts[0].match(/:(.*?);/);
  if (!match || match.length < 2) return new Blob();
  let mime = match[1];
  let bstr = atob(parts[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {type:mime});
}

const predictDigit = async () => {
  if (!canvas.value) return

  const dataURL = canvas.value.toDataURL('image/png');
  const blob = dataURLToBlob(dataURL);
  const formData = new FormData();
  formData.append('image', blob, 'digit.png')

  const resp = await request.request('/v1/ai', 'POST', {
    body: formData
  })
  prediction.value = resp
}

const clearCanvas = () => {
  if (!canvas.value) return
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
  prediction.value = undefined
}
</script>

<template>
  <div class="flex gap-2 flex-col w-full items-center">
    <div class="flex gap-2">
      <h1 class="text-2xl font-bold">Number prediction</h1>
<!--      <router-link to="/" class="btn btn-secondary btn-xs"> Back to home page</router-link>-->
    </div>

    <div class="flex flex-col gap-2 items-center">
      <canvas class="border rounded" ref="canvas" width="400" height="400" style="width: 400px; height: 400px" @mousedown="startDrawing"
              @mouseup="stopDrawing" @mousemove="draw"></canvas>
      <div class="my-2 flex gap-2">
        <button class="btn btn-info" @click="predictDigit">Predict</button>
        <button class="btn btn-warning" @click="clearCanvas">Clear</button>
      </div>
      <p v-if="prediction !== null" class="text-xl font-bold">Predicted Digit: {{ prediction?.result?.digit }}</p>
    </div>
  </div>
</template>

<style scoped>

</style>
