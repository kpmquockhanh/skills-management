<script setup lang="ts">
import { watch, nextTick, onMounted, ref, type Ref, computed } from 'vue'
import Add from '@vicons/fluent/Add16Filled'
import Camera from '@vicons/fluent/Camera20Filled'
import { Icon } from '@vicons/utils'
import { useAttachment } from '@/stores/attachment'
import DynamicImage from '@components/DynamicImage.vue'
import type { Attachment } from '@/types/base'
import { useAuthStore } from '@/stores/auth'
import CountdownComponent from '@/views/CountdownComponent.vue'
import DropzoneComponent from '@components/DropzoneComponent.vue'
import WelcomeApp from '@/views/WelcomeApp.vue'
import { storeToRefs } from 'pinia'
import BaseModal from '@/views/BaseModal.vue'
import CameraComponent from '@/views/CameraComponent.vue'
import FriendsComponent from '@/views/FriendsComponent.vue'
import UserIcon from '@vicons/ionicons5/PersonSharp'
import { useRouter } from 'vue-router'
import MoreVertical from '@vicons/ionicons5/EllipsisVertical'
import InfoCircleOutline from '@vicons/ionicons5/InformationCircleOutline'
import TrashOutline from '@vicons/ionicons5/TrashOutline'
import LockClosedOutline from '@vicons/ionicons5/LockClosedOutline'
import GlobeOutline from '@vicons/ionicons5/GlobeOutline'
import { useUser } from '@/stores/user'
import Masonry from 'masonry-layout'
import { getSrc } from '@/utils'

const attachmentStore = useAttachment()
const { items, isLastPage, isLoading } = storeToRefs(attachmentStore)
const { doFetch, doRemove, nextPage, toggleVisibility } = attachmentStore
const deleting = ref(false)
const deletingItem: Ref<Attachment | null> = ref(null)
const isLoadingMore = ref(false)
const updatingVisibility = ref<string | null>(null)
const auth = useAuthStore()
const isShowModal = ref(false)
const isShowDeleteModal = ref(false)
const isShowCamera = ref(false)
const isShowVisibilityModal = ref(false)
const updatingItem: Ref<Attachment | null> = ref(null)
const dropzoneRef = ref<HTMLElement | null>(null)
const masonryRef = ref<HTMLElement | null>(null)
const router = useRouter()
const userStore = useUser()
const m = ref<Masonry>()
const loadMoreRef = ref<HTMLElement | null>(null)

const initMasonry = () => {
  if (!masonryRef.value) return
  m.value = new Masonry(masonryRef.value, {
    itemSelector: '.grid-item',
    initLayout: false,
    columnWidth: 300,
    horizontalOrder: true,
    gutter: 10,
    fitWidth: true
  })
}

const doMasonry = () => {
  nextTick(() => {
    if (!m.value?.layout || !m.value?.reloadItems) return
    m.value?.reloadItems()
    m.value.layout()
  })
}

onMounted(async () => {
  await doFetch()
  await nextTick(() => {
    initMasonry()
    items.value = [...items.value]
    if (!loadMoreRef.value) return
    observer.observe(loadMoreRef.value)
  })
})
watch(items, doMasonry)

const onShow = () => {
  if (auth.isAuth) {
    isShowModal.value = true
    return
  }
  router.push({ name: 'login' })
}

const onRemove = async () => {
  if (!deletingItem.value) {
    return
  }
  deleting.value = true
  await doRemove(deletingItem.value._id)
  deleting.value = false
}

const onClickRemove = (item: Attachment) => {
  deletingItem.value = item
  isShowDeleteModal.value = true
}

const observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) {
      onLoadMore()
    }
  },
  { rootMargin: '100px' }
)


const onLoadMore = async () => {
  if (isLoadingMore.value) {
    return
  }
  isLoadingMore.value = true
  await nextPage()
  isLoadingMore.value = false
  initMasonry()
  doMasonry()
}

const onToggleVisibility = async (item: Attachment) => {
  if (updatingVisibility.value === item._id) return
  updatingItem.value = item
  isShowVisibilityModal.value = true
}

const confirmToggleVisibility = async () => {
  if (!updatingItem.value) return
  updatingVisibility.value = updatingItem.value._id
  const newVisibility = !updatingItem.value.public
  await toggleVisibility(updatingItem.value._id, newVisibility)
  updatingVisibility.value = null
  isShowVisibilityModal.value = false
  updatingItem.value = null
}
</script>
<template>
  <div class="w-full">
    <div v-if="userStore.user?.memoryDate" class="flex justify-center mb-2">
      <CountdownComponent :date="new Date(userStore.user?.memoryDate)" />
    </div>

    <div v-if="true" class="flex justify-center mb-2">
      <FriendsComponent />
    </div>
    <WelcomeApp v-if="!items.length && !isLoading" @start="onShow" />
    <template v-if="items.length">
      <div class="flex justify-center">
        <div ref="masonryRef">
          <div
            v-for="item in items"
            :key="item._id"
            class="grid-item break-inside-avoid mb-2 relative hover:drop-shadow hover:shadow-base-300 transition-shadow"
          >
            <DynamicImage
              class="crd"
              :src="getSrc(item.src, true)"
              :description="item.description || ''"
              alt="egjs"
              :clickable="true"
              :loading-height="item.height / (item.width / 300)"
              :loading-width="300"
              :item-id="item._id"
              :created-at="item.createdAt"
              :created-by="item.createdBy"
              :public="item.public"
            />

            <div
              class="absolute top-1 left-1 w-5 h-5 avatar-image overflow-hidden ring rounded-full ring-2"
              :class="{ 'ring-green-500': item.public, 'ring-blue-500': !item.public }"
            >
              <DynamicImage
                circle
                :src="item.createdBy?.photoUrl"
                v-if="item.createdBy?.photoUrl"
              />
              <Icon v-else size="20">
                <UserIcon />
              </Icon>
            </div>
            <div class="dropdown dropdown-end absolute top-1 right-1">
              <label
                tabindex="0"
                class="btn btn-xs btn-circle btn-ghost bg-gray-700/50 hover:bg-gray-700"
              >
                <Icon size="16">
                  <MoreVertical />
                </Icon>
              </label>
              <ul
                tabindex="0"
                class="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-52"
              >
                <li v-if="item.can_delete">
                  <a
                    @click="onClickRemove(item)"
                    class="text-xs text-red-500 hover:bg-red-500/10"
                  >
                    <span>Delete</span>
                  </a>
                </li>
                <li>
                  <a
                    @click="onToggleVisibility(item)"
                    class="text-xs text-blue-500 hover:bg-blue-500/10"
                    :class="{ 'opacity-50 cursor-not-allowed': updatingVisibility === item._id }"
                  >
                      <span
                        v-if="updatingVisibility === item._id"
                        class="loading loading-spinner loading-xs"
                      ></span>
                    <span v-else>{{ item.public ? 'Make Private' : 'Make Public' }}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!isLastPage" class="flex justify-center mb-2 mt-2">
        <button class="btn btn-sm btn-outline" ref="loadMoreRef" @click="onLoadMore">
          <span v-if="isLoadingMore" class="loading loading-dots loading-xs"></span>
          <span v-else>Load more</span>
        </button>
      </div>
    </template>

    <div class="fixed right-4 bottom-4 z-40">
      <div
        class="menu-container bg-base-100 rounded-2xl shadow-lg border border-base-300/50 backdrop-blur-sm"
      >
        <ul class="menu menu-horizontal p-2 gap-1">
          <li>
            <a class="tooltip tooltip-left menu-item" data-tip="Home">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </a>
          </li>
          <template v-if="auth.isAuth">
            <li>
              <a class="tooltip tooltip-left menu-item" data-tip="Upload" @click.prevent="onShow">
                <Icon size="20">
                  <Add />
                </Icon>
              </a>
            </li>
            <li v-if="auth.isAdmin">
              <a
                class="tooltip tooltip-left menu-item"
                data-tip="Camera"
                @click.prevent="isShowCamera = true"
              >
                <Icon size="20">
                  <Camera />
                </Icon>
              </a>
            </li>
          </template>
        </ul>
      </div>
    </div>

    <BaseModal :show="isShowModal" @close="isShowModal = false" title="Upload">
      <DropzoneComponent ref="dropzoneRef" />
      <template v-slot:action></template>
    </BaseModal>

    <BaseModal :show="isShowCamera" @close="isShowCamera = false" title="Camera">
      <CameraComponent @uploaded="isShowCamera = false" />
      <template v-slot:action></template>
    </BaseModal>

    <BaseModal
      :loading="deleting"
      :show="isShowDeleteModal"
      @close="isShowDeleteModal = false"
      :ok="onRemove"
      title="Delete Image"
      ok-text="Delete"
      ok-class="btn-error"
    >
      <div class="flex flex-col items-center py-6">
        <div class="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
          <Icon size="32" class="text-error">
            <TrashOutline />
          </Icon>
        </div>
        <p class="text-base-content/80 text-center mb-6 max-w-sm">
          Are you sure you want to delete this image? This action cannot be undone.
        </p>
        <DynamicImage
          v-if="deletingItem"
          class="rounded-xl transition-all duration-300 max-w-md w-full"
          :src="getSrc(deletingItem.src, true)"
          :dummy="false"
          :loading-height="deletingItem.height"
          :loading-width="deletingItem.width"
          :max-height="300"
          :lazy="false"
          alt="Image to delete"
        />
      </div>
    </BaseModal>

    <BaseModal
      :show="isShowVisibilityModal"
      @close="isShowVisibilityModal = false"
      :ok="confirmToggleVisibility"
      :title="updatingItem?.public ? 'Make Image Private' : 'Make Image Public'"
      :ok-text="updatingItem?.public ? 'Make Private' : 'Make Public'"
      :ok-class="updatingItem?.public ? 'btn-warning' : 'btn-success'"
    >
      <div class="flex flex-col items-center py-6">
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors duration-300"
          :class="updatingItem?.public ? 'bg-warning/10' : 'bg-success/10'"
        >
          <Icon size="32" :class="updatingItem?.public ? 'text-warning' : 'text-success'">
            <LockClosedOutline v-if="updatingItem?.public" />
            <GlobeOutline v-else />
          </Icon>
        </div>
        <p class="text-base-content/80 text-center mb-6 max-w-sm">
          {{
            updatingItem?.public
              ? "This image will only be visible to you. Others won't be able to see it anymore."
              : 'This image will be visible to everyone. Others will be able to see it.'
          }}
        </p>
        <DynamicImage
          v-if="updatingItem"
          class="rounded-xl transition-all duration-300 max-w-md w-full"
          :src="getSrc(updatingItem.src, true)"
          :dummy="false"
          :loading-height="updatingItem.height"
          :loading-width="updatingItem.width"
          :max-height="300"
          :lazy="false"
          alt="Image visibility"
        />
        <div class="mt-6 flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-base-200/50">
          <Icon size="16" class="text-base-content/50">
            <InfoCircleOutline />
          </Icon>
          <span class="text-base-content/70">{{
            updatingItem?.public ? 'Current: Public' : 'Current: Private'
          }}</span>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<style scoped>
.menu-container {
  @apply transition-all duration-300;
}

.menu-container:hover {
  @apply shadow-xl border-base-300;
}

.menu-item {
  @apply rounded-xl transition-all duration-300;
}

.menu-item:hover {
  @apply bg-base-200 scale-110;
}

.menu-item:active {
  @apply scale-95;
}

/* Tooltip customization */
.tooltip {
  @apply before:bg-base-300 before:text-base-content before:rounded-lg before:px-3 before:py-1 before:text-sm;
}

/* ... rest of existing styles ... */
</style>

