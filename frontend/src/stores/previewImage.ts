import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const usePreviewImage = defineStore('previewImage', () => {
  const previewImage = ref<string>()
  const file = ref<File | null>(null)

  const read = () => {
    if (!file.value) return
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImage.value = e.target?.result?.toString()
    }
    reader.readAsDataURL(file.value)
  }

  const onChangeFile = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (!target.files || !target.files.length) {
      return
    }

    file.value = target.files[0]
    read()
  }

  const reset = () => {
    previewImage.value = undefined
    file.value = null
  }

  const process = (f: File) => {
    if (!f) return ''
    file.value = f
    read()
    return previewImage.value || ''
  }

  return { previewImage, file, onChangeFile, reset, process }
})
