<script setup lang="ts">
import { defineEmits, defineProps, onMounted, onUnmounted, ref } from 'vue'
import type { FullscreenImageProps } from '../types'
import 'zoomist/css'
import Zoomist from 'zoomist'
import { useCommentStore } from '@/stores/comment'
const props = withDefaults(defineProps<FullscreenImageProps>(), {
  animation: 'fade',
  imageAlt: '',
  withDownload: true,
  withClose: true,
  withFocusOnClose: true,
  withCloseOnEscape: true,
  closeOnClikOutside: true,
  maxHeight: '80vh',
  maxWidth: '80vw',
  backdropColor: 'rgba(0, 0, 0, 0.7)',
  details: () => ({})
})

const commentStore = useCommentStore()
const comment = ref('')

// Format date helper function
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInDays < 7) return `${diffInDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

const fetchComments = async () => {
  if (props.details?.itemId) {
    await commentStore.fetchComments(props.details.itemId)
  }
}

const onCreateComment = async () => {
  if (props.details?.itemId && comment.value.trim()) {
    await commentStore.createComment(props.details.itemId, comment.value.trim())
    comment.value = ''
  }
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) {
    target.style.display = 'none'
  }
}

const showDeleteConfirm = ref(false)
const commentToDelete = ref<string | null>(null)
const isDeleting = ref(false)

const onDeleteComment = async (commentId: string) => {
  commentToDelete.value = commentId
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (!commentToDelete.value) return

  isDeleting.value = true
  try {
    await commentStore.deleteComment(commentToDelete.value)
    showDeleteConfirm.value = false
    commentToDelete.value = null
  } catch (error) {
    console.error('Failed to delete comment:', error)
  } finally {
    isDeleting.value = false
  }
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  commentToDelete.value = null
}

// Add loading state
const isLoading = ref(true)

const onImageLoad = () => {
  isLoading.value = false
}

const emits = defineEmits(['close'])

const panoramaCurrentIndex = ref(0)

const disappear = ref(false)

const onClose = () => {
  disappear.value = true

  setTimeout(() => {
    emits('close')
  }, 500)
}

const onDownload = async (e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  try {
    const imageToDownload = Array.isArray(props.imageUrl)
      ? props.imageUrl[panoramaCurrentIndex.value]
      : props.imageUrl
    const response = await fetch(imageToDownload)
    const blob = await response.blob()

    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = 'image'
    link.style.display = 'none'

    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    window.URL.revokeObjectURL(link.href) // Clean up
  } catch (error) {
    console.error('Error downloading image:', error)
  }
}

const onKeydown = (event: KeyboardEvent) => {
  if (props.withCloseOnEscape && event.key === 'Escape') {
    if (!showDeleteConfirm.value) {
      onClose()
    } else {
      cancelDelete()
    }
  }
}

const onBackdropClick = () => {
  if (props.closeOnClikOutside) {
    onClose()
  }
}

const closeButtonRef = ref()

onMounted(() => {
  // Calculate scrollbar width to prevent layout shift
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

  // Block body scroll when modal is open
  document.body.style.overflow = 'hidden'
  document.body.style.paddingRight = `${scrollbarWidth}px` // Compensate for hidden scrollbar

  // Focus the modal for keyboard events
  const modalElement = document.querySelector('.fullscreen-image') as HTMLElement
  if (modalElement) {
    modalElement.focus()
  }

  if (props.withFocusOnClose && closeButtonRef.value) {
    closeButtonRef.value.focus()
  }

  new Zoomist('.zoomist-container', {
    // Optional parameters
    maxScale: 4,
    bounds: true,
    // if you need slider
    // slider: true,
    // if you need zoomer
    zoomer: true
  })

  fetchComments()
})

onUnmounted(() => {
  // Restore body scroll when modal is closed
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
})
</script>

<template>
  <Transition :name="animation" appear>
    <div
      class="fullscreen-image"
      v-if="imageUrl && !disappear"
      @keydown="onKeydown"
      tabindex="0"
      role="dialog"
      aria-modal="true"
      aria-label="Fullscreen Image"
    >
      <div class="backdrop" @click="onBackdropClick">
        <div class="icons">
          <button
            tabindex="0"
            class="icon download-icon"
            @click="onDownload"
            v-if="withDownload"
            title="Download"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </button>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-4 w-full h-full p-2 sm:p-4">
        <!-- Image Section -->
        <div
          class="zoomist-container mx-0 sm:mx-2 rounded-lg w-full lg:w-2/3 bg-base-100 shadow-xl flex items-center justify-center relative"
        >
          <!-- Loading Spinner -->
          <Transition name="fade">
            <div
              v-if="isLoading"
              class="absolute inset-0 flex items-center justify-center bg-base-100/80 backdrop-blur-sm z-10"
            >
              <div class="loading-container">
                <div class="loading-spinner"></div>
                <div class="loading-spinner-inner"></div>
                <div class="loading-pulse"></div>
              </div>
            </div>
          </Transition>

          <div class="zoomist-wrapper rounded-lg w-full h-full">
            <div class="zoomist-image flex items-center justify-center">
              <img
                :src="imageUrl"
                :alt="imageAlt"
                class="max-h-full max-w-full"
                @load="onImageLoad"
              />
            </div>
          </div>
        </div>

        <!-- Details Section -->
        <div class="w-full lg:w-1/3 bg-base-100 rounded-lg p-3 sm:p-6 flex flex-col shadow-xl">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4 sm:mb-6">
            <div class="flex items-center gap-2 sm:gap-3">
              <button
                class="btn btn-ghost btn-circle btn-sm sm:btn-md"
                @click="onClose"
                title="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 sm:h-6 sm:w-6"
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
              <h3 class="text-lg sm:text-xl font-semibold">Image Details</h3>
            </div>
            <div
              class="badge text-xs sm:text-sm"
              :class="{ 'badge-primary': details?.public, 'badge-error': !details?.public }"
            >
              <Icon v-if="details?.public" name="mdi:eye" />
              <Icon v-else name="mdi:eye-off" />
              {{ details?.public ? 'Public' : 'Private' }}
            </div>
          </div>

          <!-- Description -->
          <div class="mb-4 sm:mb-6">
            <h4 class="text-xs sm:text-sm font-medium text-base-content/70 mb-1 sm:mb-2">
              Description
            </h4>
            <p class="text-xs text-base-content/80">
              {{ details?.description || 'No description provided' }}
            </p>
          </div>

          <!-- Metadata -->
          <div class="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <div>
              <h4 class="text-xs sm:text-sm font-medium text-base-content/70 mb-1 sm:mb-2">
                Uploaded by
              </h4>
              <div class="flex items-center gap-2 sm:gap-3">
                <div class="avatar">
                  <div
                    class="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-2 border-base-300/30 shadow-sm"
                  >
                    <template
                      v-if="details?.createdBy?.photoUrl && details?.createdBy?.photoUrl !== ''"
                    >
                      <img
                        :src="details?.createdBy?.photoUrl"
                        :alt="details?.createdBy?.name"
                        class="w-full h-full rounded-full object-cover"
                        @error="handleImageError"
                      />
                    </template>
                    <template v-else>
                      <div
                        class="w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-primary font-semibold text-xs"
                      >
                        {{ details?.createdBy?.name?.charAt(0).toUpperCase() || 'U' }}
                      </div>
                    </template>
                  </div>
                </div>
                <div>
                  <p class="text-sm sm:text-base font-medium">
                    {{ details?.createdBy?.name || 'User Name' }}
                  </p>
                  <p class="text-xs sm:text-sm text-base-content/50">
                    {{ formatDate(details?.createdAt || '') }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Comments Section -->
          <div class="flex-grow flex flex-col h-full overflow-hidden">
            <div class="flex items-center justify-between mb-3 sm:mb-4">
              <h4 class="text-xs sm:text-sm font-medium text-base-content/70">Comments</h4>
              <div class="badge badge-outline badge-sm">{{ commentStore.comments.length }}</div>
            </div>

            <!-- Comments List -->
            <div class="flex-grow overflow-y-auto mb-3 sm:mb-4 rounded-lg">
              <!-- Loading State -->
              <div v-if="commentStore.isLoading" class="flex items-center justify-center py-8">
                <div class="loading-container">
                  <div class="loading-spinner"></div>
                  <div class="loading-spinner-inner"></div>
                </div>
                <span class="ml-3 text-sm text-base-content/60">Loading comments...</span>
              </div>

              <!-- Comments Content -->
              <div v-else-if="commentStore.comments.length > 0" class="space-y-2 sm:space-y-3">
                <div
                  v-for="item in commentStore.comments"
                  :key="item.uuid"
                  class="comment-item group bg-base-200/50 rounded-lg p-2 sm:p-3 transition-all duration-200 hover:bg-base-200/70"
                >
                  <!-- Comment Header -->
                  <div class="flex items-start justify-between mb-1.5">
                    <div class="flex items-center gap-2">
                      <!-- User Avatar -->
                      <div class="avatar">
                        <div
                          class="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-2 border-base-300/30 shadow-sm"
                        >
                          <template v-if="item.user.photoUrl && item.user.photoUrl !== ''">
                            <img
                              :src="item.user.photoUrl"
                              :alt="item.user.name"
                              class="w-full h-full rounded-full object-cover"
                              @error="handleImageError"
                            />
                          </template>
                          <template v-else>
                            <div
                              class="w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-primary font-semibold text-xs"
                            >
                              {{ item.user.name?.charAt(0).toUpperCase() || 'U' }}
                            </div>
                          </template>
                        </div>
                      </div>

                      <!-- User Info -->
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                          <p class="text-xs sm:text-sm font-medium text-base-content truncate">
                            {{ item.user.name }}
                          </p>
                        </div>
                        <p class="text-xs text-base-content/50">
                          {{ formatDate(item.created_at) }}
                        </p>
                      </div>
                    </div>

                    <!-- Comment Actions -->
                    <div class="dropdown dropdown-end">
                      <button
                        class="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity"
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
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </button>
                      <ul
                        class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32 text-xs"
                      >
                        <li v-if="item.can_delete">
                          <button
                            @click="onDeleteComment(item.uuid)"
                            class="w-full text-left text-error hover:bg-error/10 p-2 rounded flex items-center gap-2"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </button>
                        </li>
                        <li v-else>
                          <button
                            class="w-full text-left text-warning hover:bg-warning/10 p-2 rounded flex items-center gap-2"
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
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                              />
                            </svg>
                            Report
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <!-- Comment Content -->
                  <div class="comment-content">
                    <p class="text-xs sm:text-sm text-base-content/90 leading-relaxed">
                      {{ item.comment }}
                    </p>
                  </div>

                  <!-- Comment Footer -->
                  <div class="flex items-center gap-3 mt-2 pt-1.5 border-t border-base-300/30">
                    <button
                      class="btn btn-ghost btn-xs gap-1 text-base-content/60 hover:text-primary transition-colors"
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
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                        />
                      </svg>
                      Like
                    </button>
                    <button
                      class="btn btn-ghost btn-xs gap-1 text-base-content/60 hover:text-secondary transition-colors"
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
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      Reply
                    </button>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else class="text-center text-base-content/70 py-8 sm:py-12">
                <div class="flex flex-col items-center gap-3 sm:gap-4">
                  <div class="relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-12 w-12 sm:h-16 sm:w-16 text-base-content/30"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <div
                      class="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-primary/20 rounded-full flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-2 w-2 sm:h-3 sm:w-3 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm sm:text-base font-medium mb-1">No comments yet</p>
                    <p class="text-xs sm:text-sm">Be the first to share your thoughts!</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Comment Input -->
            <div class="comment-input-section bg-base-200/30 rounded-lg p-3 sm:p-4">
              <div class="flex items-end gap-2 sm:gap-3">
                <div class="flex-1">
                  <textarea
                    v-model="comment"
                    placeholder="Share your thoughts..."
                    class="textarea textarea-bordered w-full resize-none text-sm sm:text-base"
                    rows="2"
                    maxlength="500"
                    @keydown.ctrl.enter="onCreateComment"
                    @keydown.enter.exact.prevent="onCreateComment"
                  ></textarea>
                  <div class="flex items-center justify-between mt-2">
                    <p class="text-xs text-base-content/50">Press Ctrl+Enter to send</p>
                    <p class="text-xs text-base-content/50">{{ comment.length }}/500</p>
                  </div>
                </div>
                <button
                  class="btn btn-primary btn-xs sm:btn-sm gap-2"
                  :disabled="!comment.trim() || commentStore.isLoading"
                  @click.prevent="onCreateComment"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Delete Confirmation Modal -->
  <Transition name="fade" appear>
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 z-[10000] flex items-center justify-center"
      @keydown.escape="cancelDelete"
      tabindex="0"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cancelDelete"></div>

      <!-- Modal -->
      <div class="relative bg-base-100 rounded-lg shadow-2xl max-w-sm w-full mx-4 p-6">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-error"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-base-content">Delete Comment</h3>
            <p class="text-sm text-base-content/70">This action cannot be undone</p>
          </div>
        </div>

        <!-- Content -->
        <div class="mb-6">
          <p class="text-base-content/80">
            Are you sure you want to delete this comment? This action will permanently remove the
            comment and cannot be undone.
          </p>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 justify-end">
          <button @click="cancelDelete" class="btn btn-ghost btn-sm" :disabled="isDeleting">
            Cancel
          </button>
          <button
            @click="confirmDelete"
            class="btn btn-error btn-sm gap-2"
            :disabled="isDeleting"
            :class="{ loading: isDeleting }"
          >
            <svg
              v-if="!isDeleting"
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            {{ isDeleting ? 'Deleting...' : 'Delete Comment' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.icons {
  position: absolute;
  right: 10px;
  top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.icon {
  border: none;
  background-color: transparent;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.icon:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.icon > svg {
  cursor: pointer;
  transition: transform ease 0.3s, color ease 0.3s;
  color: white;
  height: 24px;
  width: 24px;
}

.icon:hover:not(.icon--disabled) > svg {
  transform: translateY(2px);
  color: #babfb7;
}

.icon--disabled > svg {
  cursor: not-allowed;
  color: #a3a8a2;
}

.fullscreen-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: v-bind(backdropColor);
  z-index: -1;
}

.zoomist-container {
  height: calc(100vh - 1rem);
  overflow: hidden;
}

@media (min-width: 640px) {
  .zoomist-container {
    height: calc(100vh - 2rem);
  }
}

@media (min-width: 1024px) {
  .zoomist-container {
    height: calc(100vh - 2rem);
  }
}

.zoomist-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoomist-image {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoomist-image img {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
}

/* Custom scrollbar for comments */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--bc) / 0.3) hsl(var(--bc) / 0.1);
}

.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: hsl(var(--bc) / 0.1);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: hsl(var(--bc) / 0.3);
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: hsl(var(--bc) / 0.5);
}

/* Comment section styles */
.comment-item {
  position: relative;
}

.comment-item:hover {
  transform: translateY(-1px);
}

.comment-item .dropdown {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.comment-item:hover .dropdown {
  opacity: 1;
}

.comment-content {
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.comment-input-section {
  border: 1px solid hsl(var(--bc) / 0.1);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.comment-input-section:focus-within {
  border-color: hsl(var(--p));
  box-shadow: 0 0 0 2px hsl(var(--p) / 0.1);
}

.textarea {
  border: none;
  background: transparent;
  outline: none;
  transition: all 0.2s ease;
}

.textarea:focus {
  outline: none;
  box-shadow: none;
}

/* Avatar styles */
.avatar > div {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.avatar > div:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px hsl(var(--p) / 0.3);
}

.avatar img {
  transition: all 0.3s ease;
}

.avatar img:hover {
  transform: scale(1.1);
}

/* Fallback avatar with initials */
.avatar > div > div {
  background: linear-gradient(135deg, hsl(var(--p) / 0.4) 0%, hsl(var(--s) / 0.4) 100%);
  color: hsl(var(--p));
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.avatar > div > div:hover {
  background: linear-gradient(135deg, hsl(var(--p) / 0.6) 0%, hsl(var(--s) / 0.6) 100%);
  transform: scale(1.05);
}

/* Transitions */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter {
  opacity: 1;
}

.blur-enter-from,
.blur-leave-to {
  filter: blur(5px);
  opacity: 0;
}

.blur-enter-active,
.blur-leave-active {
  transition: filter 0.5s, opacity 0.5s;
}

.blur-enter {
  filter: blur(0px);
  opacity: 1;
}

.btn-circle {
  @apply transition-all duration-300;
}

.btn-circle:hover {
  @apply bg-base-200;
}

/* Loading Animation */
.loading-container {
  position: relative;
  width: 60px;
  height: 60px;
}

.loading-spinner {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid hsl(var(--bc) / 0.1);
  border-radius: 50%;
  border-top-color: hsl(var(--p));
  animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
}

.loading-spinner-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  height: 70%;
  border: 3px solid hsl(var(--bc) / 0.1);
  border-radius: 50%;
  border-top-color: hsl(var(--s));
  animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite reverse;
}

.loading-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, hsl(var(--p) / 0.2) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.2;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.5;
  }
}

/* Smooth transitions */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Modal animations */
.fade-enter-active .relative {
  animation: modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-leave-active .relative {
  animation: modalSlideOut 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes modalSlideOut {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
}

/* Loading button styles */
.btn.loading {
  pointer-events: none;
}

.btn.loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  margin: auto;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
</style>
