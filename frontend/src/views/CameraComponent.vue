<template>
  <div>
    <div class="flex justify-center w-full">
      <span v-if="loading" class="loading loading-dots loading-lg"></span>
    </div>
    <video
      class="rounded-md scale-x-[-1]"
      v-show="!loading && !image"
      ref="video"
      width="640"
      height="480"
      autoplay
    ></video>
    <canvas ref="canvas" width="640" height="480" style="display: none"></canvas>
    <div v-if="image" class="flex flex-col gap-2">
      <img :src="image" class="rounded-md mt-3" alt="Captured image" />
      <textarea
        :disabled="isUploading"
        type="text"
        class="textarea textarea-info"
        placeholder="Description"
        v-model="description"
      />
    </div>
    <div class="w-full flex justify-center mt-3 gap-2">
      <button v-if="!image" class="btn btn-info btn-lg btn-circle text-white" @click="captureImage">
        <Icon size="40">
          <Camera24Regular />
        </Icon>
      </button>
      <template v-else>
        <button class="btn btn-danger" @click="reset" :disabled="isUploading">Reset</button>
        <button class="btn btn-success" :disabled="isUploading" @click="doSubmit">
          <span v-if="isUploading" class="loading loading-dots loading-sm"></span>
          <span v-else>Upload</span>
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, defineEmits } from 'vue'
import { useAttachment } from '@/stores/attachment'
import Camera24Regular from '@vicons/fluent/Camera24Regular'
import { Icon } from '@vicons/utils'

const emit = defineEmits(['uploaded'])
const video = ref(null)
const canvas = ref(null)
const image = ref(null)
const loading = ref(true)
const isUploading = ref(false)
const description = ref('')

const { doUpload } = useAttachment()

onMounted(() => {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        video.value.srcObject = stream
        video.value.play()
        loading.value = false
      })
      .catch((error) => {
        loading.value = false
        console.error('Error accessing the camera:', error)
      })
  }
})

onBeforeUnmount(() => {
  if (video.value) {
    const stream = video.value.srcObject
    const tracks = stream.getTracks()
    tracks.forEach((track) => {
      track.stop()
    })
    video.value.srcObject = null
  }
})

const captureImage = () => {
  const ctx = canvas.value?.getContext('2d')
  // Move to the center of the canvas
  ctx.save()
  ctx.translate(canvas.value.width / 2, canvas.value.height / 2)

  // Scale the canvas
  ctx.scale(-1, 1)

  // Move back to the top-left corner
  ctx.translate(-canvas.value.width / 2, -canvas.value.height / 2)
  ctx.drawImage(video.value, 0, 0, 640, 480)
  ctx.restore()
  image.value = canvas.value?.toDataURL('image/png')
}

const generateImage = () => {
  const blobBin = atob(image.value?.split(',')[1])
  const array = []
  for (let i = 0; i < blobBin.length; i++) {
    array.push(blobBin.charCodeAt(i))
  }
  return new Blob([new Uint8Array(array)], { type: 'image/png' })
}

const reset = () => {
  image.value = null
}

const doSubmit = () => {
  if (!image.value) return
  isUploading.value = true
  doUpload(generateImage(), description.value)
    .then(() => {
      reset()
      emit('uploaded')
    })
    .finally(() => {
      isUploading.value = false
    })
}
</script>
