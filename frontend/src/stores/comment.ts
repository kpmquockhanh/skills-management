import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useRequest } from '@/stores/http'
import type { Comment, Pagination } from '@/types/base'

export const useCommentStore = defineStore('comment', () => {
  const request = useRequest()
  const comments = ref<Comment[]>([])
  const pagination = ref<Pagination>({
    page: 1,
    limit: 10,
    total: 0
  })
  const isLoading = ref(false)
  const addComment = (comment: Comment) => {
    comments.value.push(comment)
  }

  const removeComment = (comment: any) => {
    comments.value = comments.value.filter((c) => c._id !== comment._id)
  }

  const updateComment = (comment: any) => {
    comments.value = comments.value.map((c) => c._id === comment._id ? comment : c)
  }

  const fetchComments = async (itemId: string) => {
    isLoading.value = true
    const {data} = await request.request(`/v1/comments/post/${itemId}`, 'GET', {})
    comments.value = data?.comments || []
    pagination.value = data?.pagination || {
      page: 1,
      limit: 10,
      total: 0
    }
    isLoading.value = false
  }

  const createComment = async (itemId: string, content: string) => {
    const resp = await request.request(`/v1/comments/post/${itemId}`, 'POST', {
      body: {
        comment: content
      }
    })
    if (resp.data) {
      comments.value.push(resp.data)
    }
  }

  const deleteComment = async (commentId: string) => {
    try {
      await request.request(`/v1/comments/${commentId}`, 'DELETE', {})
      console.log('deleteComment', {commentId, comments: comments.value})
      comments.value = comments.value.filter((c) => c.uuid !== commentId)
      return true
    } catch (error) {
      console.error('Error deleting comment:', error)
      return false
    }
  }

  return { comments, pagination, isLoading, addComment, removeComment, updateComment, fetchComments, createComment, deleteComment }
})
