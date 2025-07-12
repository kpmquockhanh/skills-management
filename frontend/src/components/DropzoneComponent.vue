<script setup lang="ts">
import { ref } from 'vue'
import { useDropzone } from 'vue3-dropzone'
import Checkmark16Filled from '@vicons/fluent/Checkmark16Filled'
import { useAttachment } from '@/stores/attachment'
import SCheckbox from '../views/SCheckbox.vue'

const files = ref<Array<File>>([])
const filePreview = ref<string[]>([])
const uploading = ref(false)
const { doUpload } = useAttachment()
const loadingFile = ref<{ [key: string]: boolean }>({})
const doneFile = ref<{ [key: string]: boolean }>({})
const descriptions = ref<{ [key: number]: string }>({})

const publicOpt = ref<{ [key: number]: boolean }>({})

const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop,
  accept: 'image/*',
  multiple: true
})

function onDrop(acceptFiles: any[]) {
  files.value = [...files.value, ...acceptFiles]
  filePreview.value = files.value.map((file) => URL.createObjectURL(file))
}

function handleClickDeleteFile(index: number) {
  files.value = files.value.filter((_, i) => i !== index)
  filePreview.value = filePreview.value.filter((_, i) => i !== index)
  delete descriptions.value[index]
  delete publicOpt.value[index]
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const onSubmit = async () => {
  uploading.value = true
  for (const i in files.value) {
    const f = files.value[i]
    loadingFile.value[`${f.name}_${f.size}`] = true
    doUpload(f, descriptions.value[i], publicOpt.value[i])
      .then((resp) => {
        loadingFile.value[`${f.name}_${f.size}`] = false
        if (resp) {
          doneFile.value[`${f.name}_${f.size}`] = true
        }

        if (Object.keys(doneFile.value).length === files.value.length) {
          setTimeout(() => {
            uploading.value = false
            files.value = []
            filePreview.value = []
            doneFile.value = {}
            descriptions.value = {}
          }, 2000)
        }
      })
      .catch(() => {
        console.log('On error uploading')
      })
  }
}
</script>

<template>
  <div class="flex items-center justify-center w-full">
    <div class="w-full">
      <div
        class="cursor-pointer bg-gray-100 p-4 text-center rounded-lg border-dashed border-2 border-gray-300 hover:border-blue-500 transition duration-300 ease-in-out transform hover:scale-105"
        :class="{
          'border-blue-500 scale-105 shadow-md': isDragActive
        }"
        id="dropzone"
        v-bind="getRootProps()"
      >
        <label for="fileInput" class="flex flex-col items-center space-y-2">
          <svg
            class="w-16 h-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          <span class="text-gray-600" v-if="!isDragActive">Drag and drop your files here</span>
          <span class="text-blue-500" v-if="isDragActive">Drop it like it's hot!</span>
          <span class="text-gray-500 text-sm">(or click to select)</span>
        </label>
        <input v-bind="getInputProps()" />
      </div>
      <transition>
        <div v-if="files.length" class="mt-6">
          <div class="flex flex-wrap gap-2 justify-center mb-4">
            <div class="gap-2 w-40" v-for="(file, index) in files" :key="index">
              <div class="relative border rounded">
                <img :src="filePreview[index]" alt="" class="rounded object-cover" />
                <div class="absolute top-1.5 right-1.5">
                  <button
                    class="btn btn-xs btn-square btn-outline text-xs"
                    @click="handleClickDeleteFile(index)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <span
                  class="overflow-ellipsis overflow-hidden absolute left-0 bottom-0 w-full text-xs glass rounded-b text-gray-200 p-1"
                  >{{ file.name }}</span
                >
                <div class="badge badge-accent absolute left-2 top-2 text-xs">
                  {{ formatBytes(file.size) }}
                </div>

                <div
                  v-if="
                    loadingFile[`${file.name}_${file.size}`] ||
                    doneFile[`${file.name}_${file.size}`]
                  "
                  class="absolute top-0 left-0 text-green-400 w-full h-full flex justify-center items-center"
                >
                  <span
                    v-if="loadingFile[`${file.name}_${file.size}`]"
                    class="loading loading-ring loading-lg"
                  ></span>
                  <Checkmark16Filled
                    v-if="doneFile[`${file.name}_${file.size}`]"
                    class="w-10 h-10"
                  />
                </div>
              </div>
              <div>
                <div class="my-2 flex gap-2 flex-col">
                  <SCheckbox
                    label="Public?"
                    :checked="publicOpt[index]"
                    @change="(ev) => (publicOpt[index] = ev.target.checked)"
                  />
                </div>
                <textarea
                  type="text"
                  class="input input-bordered input-xs w-full mt-1"
                  placeholder="Description"
                  v-model="descriptions[index]"
                />
              </div>
            </div>
          </div>
          <div class="flex justify-center">
            <button class="btn btn-success" @click="onSubmit" :disabled="uploading">Upload</button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>
