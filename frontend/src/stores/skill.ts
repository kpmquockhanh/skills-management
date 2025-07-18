import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRequest } from './http'

export interface Skill {
  _id: string
  name: string
  description: string
  shortDescription: string
  category: string
  subcategory: string
  level: 'basic' | 'intermediate' | 'advanced' | 'expert'
  type: 'technical' | 'soft' | 'language' | 'tool' | 'framework' | 'other'
  status: 'active' | 'inactive' | 'archived'
  icon: string
  color: string
  prerequisites: string[]
  relatedSkills: string[]
  learningObjectives: string[]
  marketData: {
    demand: 'high' | 'medium' | 'low'
    salary: {
      min: number
      max: number
      currency: string
    }
    growth: number
  }
  content: {
    resources: Array<{
      title: string
      url: string
      type: 'video' | 'article' | 'book' | 'course' | 'other'
    }>
    estimatedTime: number
    difficulty: 'easy' | 'medium' | 'hard'
  }
  stats: {
    totalUsers: number
    averageRating: number
    completionRate: number
  }
  createdAt: string
  updatedAt: string
}

export interface CreateSkillData {
  name: string
  description: string
  category: string
  level: 'basic' | 'intermediate' | 'advanced' | 'expert'
  type: 'technical' | 'soft' | 'language' | 'tool' | 'framework' | 'other'
  icon: string
  color: string
  prerequisites?: string[]
  relatedSkills?: string[]
  learningObjectives?: string[]
  marketData?: {
    demand: 'high' | 'medium' | 'low'
    salary: {
      min: number
      max: number
      currency: string
    }
    growth: number
  }
  content?: {
    resources: Array<{
      title: string
      url: string
      type: 'video' | 'article' | 'book' | 'course' | 'other'
    }>
    estimatedTime: number
    difficulty: 'easy' | 'medium' | 'hard'
  }
}

export interface UpdateSkillData extends Partial<CreateSkillData> {
  status?: 'active' | 'inactive' | 'archived'
}

export const useSkillStore = defineStore('skill', () => {
  const request = useRequest()
  const skills = ref<Skill[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentSkill = ref<Skill | null>(null)

  // Computed properties
  const activeSkills = computed(() => skills.value.filter(skill => skill.status === 'active'))
  const skillsByCategory = computed(() => {
    const grouped: Record<string, Skill[]> = {}
    skills.value.forEach(skill => {
      if (!grouped[skill.category]) {
        grouped[skill.category] = []
      }
      grouped[skill.category].push(skill)
    })
    return grouped
  })

  // Get all skills
  const fetchSkills = async (params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
    level?: string
    type?: string
    status?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request('/v1/skills', 'GET', { params })
      skills.value = response.data?.skills || response.skills || []
      
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch skills'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get skill by ID
  const fetchSkillById = async (skillId: string) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request(`/v1/skills/${skillId}`, 'GET', {})
      currentSkill.value = response.data?.skill || response.skill
      
      return currentSkill.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch skill'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create new skill
  const createSkill = async (skillData: CreateSkillData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request('/v1/skills', 'POST', { body: skillData })
      const newSkill = response.data?.skill || response.skill
      
      skills.value.unshift(newSkill)
      currentSkill.value = newSkill
      
      return newSkill
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create skill'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update skill
  const updateSkill = async (skillId: string, updateData: UpdateSkillData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request(`/v1/skills/${skillId}`, 'PUT', { body: updateData })
      const updatedSkill = response.data?.skill || response.skill
      
      const index = skills.value.findIndex(skill => skill._id === skillId)
      if (index !== -1) {
        skills.value[index] = updatedSkill
      }
      
      if (currentSkill.value?._id === skillId) {
        currentSkill.value = updatedSkill
      }
      
      return updatedSkill
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update skill'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete skill
  const deleteSkill = async (skillId: string) => {
    try {
      loading.value = true
      error.value = null
      
      await request.request(`/v1/skills/${skillId}`, 'DELETE', {})
      
      skills.value = skills.value.filter(skill => skill._id !== skillId)
      
      if (currentSkill.value?._id === skillId) {
        currentSkill.value = null
      }
      
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete skill'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Search skills
  const searchSkills = async (query: string) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request('/v1/skills/search', 'GET', { params: { q: query } })
      return response.data?.skills || response.skills || []
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to search skills'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get skills by category
  const getSkillsByCategory = async (category: string) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request(`/v1/skills/category/${category}`, 'GET', {})
      return response.data?.skills || response.skills || []
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch skills by category'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  // Reset store
  const reset = () => {
    skills.value = []
    currentSkill.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    skills,
    loading,
    error,
    currentSkill,
    
    // Computed
    activeSkills,
    skillsByCategory,
    
    // Actions
    fetchSkills,
    fetchSkillById,
    createSkill,
    updateSkill,
    deleteSkill,
    searchSkills,
    getSkillsByCategory,
    clearError,
    reset
  }
}) 