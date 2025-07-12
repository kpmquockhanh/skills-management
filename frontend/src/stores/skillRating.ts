import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useRequest } from '@/stores/http'

export interface SkillRating {
  _id: string
  user: {
    _id: string
    name: string
    username: string
    email: string
    type: string
  }
  skill: {
    _id: string
    name: string
    description: string
    category: string
    level: string
    color: string
    icon: string
  }
  skillTree?: {
    _id: string
    name: string
    description: string
  }
  class?: {
    _id: string
    name: string
    code: string
  }
  ratedBy: {
    _id: string
    name: string
    username: string
  }
  rating: number
  progress: number
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  status: 'active' | 'in_progress' | 'completed' | 'archived' | 'paused'
  isArchived: boolean
  archiveReason?: 'not_interested' | 'too_difficult' | 'not_relevant' | 'completed_elsewhere' | 'other'
  archiveNotes?: string
  archivedAt?: string
  completedAt?: string
  startedAt: string
  lastPracticedAt?: string
  timeSpent: number
  assessments: Array<{
    title: string
    score: number
    maxScore: number
    type: 'quiz' | 'project' | 'assignment' | 'certification' | 'practice'
    completedAt: string
    feedback?: string
  }>
  notes: Array<{
    content: string
    author: {
      _id: string
      name: string
      username: string
    }
    createdAt: string
    isPrivate: boolean
  }>
  resourcesUsed: Array<{
    title: string
    type: 'video' | 'article' | 'book' | 'course' | 'tutorial' | 'documentation' | 'practice'
    url?: string
    completedAt: string
    rating?: number
  }>
  goals: Array<{
    description: string
    targetDate?: string
    isCompleted: boolean
    completedAt?: string
  }>
  userDifficultyRating?: number
  userInterestRating?: number
  confidenceLevel?: number
  tags: string[]
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface SkillStats {
  totalSkills: number
  activeSkills: number
  completedSkills: number
  archivedSkills: number
  averageRating: number
  averageProgress: number
  totalTimeSpent: number
}

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export const useSkillRating = defineStore('skillRating', () => {
  const ratings = ref<SkillRating[]>([])
  const archivedSkills = ref<SkillRating[]>([])
  const stats = ref<SkillStats | null>(null)
  const pagination = ref<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const loading = ref(false)
  const selectedRating = ref<SkillRating | null>(null)

  const http = useRequest()

  // Create or update skill rating
  const createOrUpdateRating = async (ratingData: {
    userId: string
    skillId: string
    classId: string
    rating: number
    progress?: number
    status?: string
    skillTreeId?: string
    notes?: string
  }) => {
    loading.value = true
    try {
      const { data } = await http.request('/v1/skill-ratings/rate', 'POST', {
        body: ratingData
      })
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Update the ratings list - now based on user, skill, and class combination
      const index = ratings.value.findIndex((r: SkillRating) => 
        r.user._id === ratingData.userId && 
        r.skill._id === ratingData.skillId &&
        r.class?._id === ratingData.classId
      )
      
      if (index !== -1) {
        ratings.value[index] = data.skillRating
      } else {
        ratings.value.unshift(data.skillRating)
      }

      return data.skillRating
    } catch (error) {
      console.error('Error creating/updating skill rating:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Get user skill ratings
  const fetchUserRatings = async (userId: string, options: {
    status?: string
    isArchived?: boolean
    skillTreeId?: string
    classId?: string
    page?: number
    limit?: number
  } = {}) => {
    loading.value = true
    try {
      const queryParams = new URLSearchParams()
      if (options.status) queryParams.append('status', options.status)
      if (options.isArchived !== undefined) queryParams.append('isArchived', options.isArchived.toString())
      if (options.skillTreeId) queryParams.append('skillTreeId', options.skillTreeId)
      if (options.classId) queryParams.append('classId', options.classId)
      if (options.page) queryParams.append('page', options.page.toString())
      if (options.limit) queryParams.append('limit', options.limit.toString())

      const { data } = await http.request(`/v1/skill-ratings/user/${userId}?${queryParams.toString()}`, 'GET', {})
      
      if (data.error) {
        throw new Error(data.error)
      }

      ratings.value = data.ratings
      stats.value = data.stats
      pagination.value = data.pagination

      return data
    } catch (error) {
      console.error('Error fetching user ratings:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Get skill ratings for a specific skill
  const fetchSkillRatings = async (skillId: string, options: {
    status?: string
    isArchived?: boolean
    page?: number
    limit?: number
  } = {}) => {
    loading.value = true
    try {
      const queryParams = new URLSearchParams()
      if (options.status) queryParams.append('status', options.status)
      if (options.isArchived !== undefined) queryParams.append('isArchived', options.isArchived.toString())
      if (options.page) queryParams.append('page', options.page.toString())
      if (options.limit) queryParams.append('limit', options.limit.toString())

      const { data } = await http.request(`/v1/skill-ratings/skill/${skillId}?${queryParams.toString()}`, 'GET', {})
      
      if (data.error) {
        throw new Error(data.error)
      }

      ratings.value = data.ratings
      stats.value = data.stats
      pagination.value = data.pagination

      return data
    } catch (error) {
      console.error('Error fetching skill ratings:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Archive a skill for a user in a specific class
  const archiveSkill = async (userId: string, skillId: string, classId: string, reason: string, notes?: string) => {
    loading.value = true
    try {
      const { data } = await http.request(`/v1/skill-ratings/user/${userId}/skill/${skillId}/class/${classId}/archive`, 'POST', {
        body: { reason, notes }
      })
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Update the rating in the list - based on user, skill, and class combination
      const index = ratings.value.findIndex((r: SkillRating) => 
        r.user._id === userId && 
        r.skill._id === skillId &&
        r.class?._id === classId
      )
      
      if (index !== -1) {
        ratings.value[index] = data.skillRating
      }

      return data.skillRating
    } catch (error) {
      console.error('Error archiving skill:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Unarchive a skill for a user in a specific class
  const unarchiveSkill = async (userId: string, skillId: string, classId: string) => {
    loading.value = true
    try {
      const { data } = await http.request(`/v1/skill-ratings/user/${userId}/skill/${skillId}/class/${classId}/unarchive`, 'POST', {})
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Update the rating in the list - based on user, skill, and class combination
      const index = ratings.value.findIndex((r: SkillRating) => 
        r.user._id === userId && 
        r.skill._id === skillId &&
        r.class?._id === classId
      )
      
      if (index !== -1) {
        ratings.value[index] = data.skillRating
      }

      return data.skillRating
    } catch (error) {
      console.error('Error unarchiving skill:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Get archived skills for a user
  const fetchArchivedSkills = async (userId: string, options: {
    page?: number
    limit?: number
  } = {}) => {
    loading.value = true
    try {
      const queryParams = new URLSearchParams()
      if (options.page) queryParams.append('page', options.page.toString())
      if (options.limit) queryParams.append('limit', options.limit.toString())

      const { data } = await http.request(`/v1/skill-ratings/user/${userId}/archived?${queryParams.toString()}`, 'GET', {})
      
      if (data.error) {
        throw new Error(data.error)
      }

      archivedSkills.value = data.archivedSkills
      pagination.value = data.pagination

      return data
    } catch (error) {
      console.error('Error fetching archived skills:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Add assessment to a skill rating
  const addAssessment = async (ratingId: string, assessmentData: {
    title: string
    score: number
    maxScore?: number
    type: 'quiz' | 'project' | 'assignment' | 'certification' | 'practice'
    feedback?: string
  }) => {
    loading.value = true
    try {
      const { data } = await http.request(`/v1/skill-ratings/rating/${ratingId}/assessment`, 'POST', {
        body: assessmentData
      })
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Update the rating in the list by ID
      const index = ratings.value.findIndex((r: SkillRating) => r._id === ratingId)
      
      if (index !== -1) {
        ratings.value[index] = data.skillRating
      }

      return data.skillRating
    } catch (error) {
      console.error('Error adding assessment:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Add note to a skill rating in a specific class
  const addNote = async (userId: string, skillId: string, classId: string, noteData: {
    content: string
    isPrivate?: boolean
  }) => {
    loading.value = true
    try {
      const { data } = await http.request(`/v1/skill-ratings/user/${userId}/skill/${skillId}/class/${classId}/note`, 'POST', {
        body: noteData
      })
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Update the rating in the list - based on user, skill, and class combination
      const index = ratings.value.findIndex((r: SkillRating) => 
        r.user._id === userId && 
        r.skill._id === skillId &&
        r.class?._id === classId
      )
      
      if (index !== -1) {
        ratings.value[index] = data.skillRating
      }

      return data.skillRating
    } catch (error) {
      console.error('Error adding note:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Update skill progress in a specific class
  const updateProgress = async (userId: string, skillId: string, classId: string, progress: number, timeSpent?: number) => {
    loading.value = true
    try {
      const { data } = await http.request(`/v1/skill-ratings/user/${userId}/skill/${skillId}/class/${classId}/progress`, 'PUT', {
        body: { progress, timeSpent }
      })
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Update the rating in the list - based on user, skill, and class combination
      const index = ratings.value.findIndex((r: SkillRating) => 
        r.user._id === userId && 
        r.skill._id === skillId &&
        r.class?._id === classId
      )
      
      if (index !== -1) {
        ratings.value[index] = data.skillRating
      }

      return data.skillRating
    } catch (error) {
      console.error('Error updating progress:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Computed properties
  const activeRatings = computed(() => 
    ratings.value.filter((r: SkillRating) => !r.isArchived && r.status !== 'archived')
  )

  const completedRatings = computed(() => 
    ratings.value.filter((r: SkillRating) => r.status === 'completed')
  )

  const archivedRatings = computed(() => 
    ratings.value.filter((r: SkillRating) => r.isArchived || r.status === 'archived')
  )

  const inProgressRatings = computed(() => 
    ratings.value.filter((r: SkillRating) => r.status === 'in_progress')
  )

  const averageRating = computed(() => {
    if (ratings.value.length === 0) return 0
    const total = ratings.value.reduce((sum: number, r: SkillRating) => sum + r.rating, 0)
    return Math.round((total / ratings.value.length) * 10) / 10
  })

  const averageProgress = computed(() => {
    if (ratings.value.length === 0) return 0
    const total = ratings.value.reduce((sum: number, r: SkillRating) => sum + r.progress, 0)
    return Math.round(total / ratings.value.length)
  })

  // Clear store data
  const clearData = () => {
    ratings.value = []
    archivedSkills.value = []
    stats.value = null
    pagination.value = {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    }
    selectedRating.value = null
  }

  return {
    // State
    ratings,
    archivedSkills,
    stats,
    pagination,
    loading,
    selectedRating,

    // Actions
    createOrUpdateRating,
    fetchUserRatings,
    fetchSkillRatings,
    archiveSkill,
    unarchiveSkill,
    fetchArchivedSkills,
    addAssessment,
    addNote,
    updateProgress,
    clearData,

    // Computed
    activeRatings,
    completedRatings,
    archivedRatings,
    inProgressRatings,
    averageRating,
    averageProgress
  }
}) 