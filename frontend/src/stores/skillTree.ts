import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRequest } from './http'

export interface SkillTreeNode {
  skillId: {
    _id: string
    name: string
    description: string
    category: string
    level: string
    type: string
    icon: string
    color: string
    createdBy?: {
      _id: string
      name: string
      email: string
      photoUrl?: string
    }
    thumbnail?: {
      url: string
    }
  }
  position: {
    x: number
    y: number
  }
  properties: {
    required: boolean
    estimatedTime?: number
    priority: 'low' | 'medium' | 'high' | 'critical'
    notes?: string
  }
  children: SkillTreeNode[]
}

export interface LearningPath {
  name: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  estimatedDuration: number
  sequence: Array<{
    skillId: {
      _id: string
      name: string
      description: string
      category: string
      level: string
      type: string
      icon: string
      color: string
    }
    order: number
    isOptional: boolean
    estimatedTime: number
    notes?: string
  }>
  prerequisites: string[]
  outcomes: string[]
  status: 'active' | 'inactive' | 'draft'
}

export interface SkillTree {
  _id: string
  name: string
  description: string
  shortDescription: string
  type: 'career' | 'domain' | 'technology' | 'role' | 'certification' | 'custom'
  status: 'active' | 'inactive' | 'draft' | 'archived'
  icon: string
  color: string
  thumbnail?: {
    _id: string
    url: string
  }
  thumbnailUrl?: string
  createdBy: {
    _id: string
    name: string
    email: string
    photoUrl?: string
  }
  tags: string[]
  structure: {
    roots: SkillTreeNode[]
  }
  learningPaths: LearningPath[]
  settings: {
    allowCustomPaths: boolean
    requireSequentialLearning: boolean
    allowSkillSkipping: boolean
    enableProgressTracking: boolean
    enableCertification: boolean
    isPublic: boolean
    allowForking: boolean
  }
  stats: {
    totalSkills: number
    totalPaths: number
    averageCompletionTime: number
    totalUsers: number
    averageRating: number
    completionRate: number
  }
  createdAt: string
  updatedAt: string
}

export interface CreateSkillTreeData {
  name: string
  description: string
  shortDescription?: string
  type: 'career' | 'domain' | 'technology' | 'role' | 'certification' | 'custom'
  icon?: string
  color?: string
  tags?: string[]
  settings?: Partial<SkillTree['settings']>
}

export interface UpdateSkillTreeData extends Partial<CreateSkillTreeData> {
  status?: 'active' | 'inactive' | 'draft' | 'archived'
}

export const useSkillTreeStore = defineStore('skillTree', () => {
  const request = useRequest()
  const skillTrees = ref<SkillTree[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentSkillTree = ref<SkillTree | null>(null)

  // Computed properties
  const activeSkillTrees = computed(() => skillTrees.value.filter(tree => tree.status === 'active'))
  const draftSkillTrees = computed(() => skillTrees.value.filter(tree => tree.status === 'draft'))
  const archivedSkillTrees = computed(() => skillTrees.value.filter(tree => tree.status === 'archived'))

  // Get all skill trees
  const fetchSkillTrees = async (params?: {
    page?: number
    limit?: number
    search?: string
    type?: string
    status?: string
    creatorId?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request('/v1/skill-trees', 'GET', { params })
      skillTrees.value = response.data?.skillTrees || response.skillTrees || []
      
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch skill trees'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get skill tree by ID
  const fetchSkillTreeById = async (treeId: string) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request(`/v1/skill-trees/${treeId}`, 'GET', {})
      currentSkillTree.value = response.data?.skillTree || response.skillTree
      
      return currentSkillTree.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch skill tree'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create new skill tree
  const createSkillTree = async (treeData: CreateSkillTreeData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request('/v1/skill-trees', 'POST', { body: treeData })
      const newSkillTree = response.data?.skillTree || response.skillTree
      
      skillTrees.value.unshift(newSkillTree)
      currentSkillTree.value = newSkillTree
      
      return newSkillTree
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create skill tree'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update skill tree
  const updateSkillTree = async (treeId: string, updateData: UpdateSkillTreeData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request(`/v1/skill-trees/${treeId}`, 'PUT', { body: updateData })
      const updatedSkillTree = response.data?.skillTree || response.skillTree
      
      const index = skillTrees.value.findIndex(tree => tree._id === treeId)
      if (index !== -1) {
        skillTrees.value[index] = updatedSkillTree
      }
      
      if (currentSkillTree.value?._id === treeId) {
        currentSkillTree.value = updatedSkillTree
      }
      
      return updatedSkillTree
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update skill tree'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete skill tree
  const deleteSkillTree = async (treeId: string) => {
    try {
      loading.value = true
      error.value = null
      
      await request.request(`/v1/skill-trees/${treeId}`, 'DELETE', {})
      
      skillTrees.value = skillTrees.value.filter(tree => tree._id !== treeId)
      
      if (currentSkillTree.value?._id === treeId) {
        currentSkillTree.value = null
      }
      
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete skill tree'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Add skill to tree
  const addSkillToTree = async (treeId: string, skillId: string, parentId?: string, properties?: any) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request(`/v1/skill-trees/${treeId}/skills`, 'POST', {
        body: { skillId, parentId, properties }
      })
      const updatedSkillTree = response.data?.skillTree || response.skillTree
      
      const index = skillTrees.value.findIndex(tree => tree._id === treeId)
      if (index !== -1) {
        skillTrees.value[index] = updatedSkillTree
      }
      
      if (currentSkillTree.value?._id === treeId) {
        currentSkillTree.value = updatedSkillTree
      }
      
      return updatedSkillTree
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to add skill to tree'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Remove skill from tree
  const removeSkillFromTree = async (treeId: string, skillId: string) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request(`/v1/skill-trees/${treeId}/skills/${skillId}`, 'DELETE', {})
      const updatedSkillTree = response.data?.skillTree || response.skillTree
      
      const index = skillTrees.value.findIndex(tree => tree._id === treeId)
      if (index !== -1) {
        skillTrees.value[index] = updatedSkillTree
      }
      
      if (currentSkillTree.value?._id === treeId) {
        currentSkillTree.value = updatedSkillTree
      }
      
      return updatedSkillTree
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to remove skill from tree'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Search skill trees
  const searchSkillTrees = async (query: string) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request('/v1/skill-trees/search', 'GET', { params: { q: query } })
      return response.data?.skillTrees || response.skillTrees || []
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to search skill trees'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get skill trees by type
  const getSkillTreesByType = async (type: string) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request(`/v1/skill-trees/type/${type}`, 'GET', {})
      return response.data?.skillTrees || response.skillTrees || []
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch skill trees by type'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  // Bulk assign skills to skill tree
  const bulkAssignSkills = async (treeId: string, assignments: Array<{
    skillId: string
    parentId?: string
    properties?: any
  }>) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request(`/v1/skill-trees/${treeId}/assign-skills`, 'POST', {
        body: { assignments }
      })
      
      // Update the skill tree in the store
      const updatedTree = response.data?.skillTree || response.skillTree
      const index = skillTrees.value.findIndex(tree => tree._id === treeId)
      if (index !== -1) {
        skillTrees.value[index] = updatedTree
      }
      if (currentSkillTree.value?._id === treeId) {
        currentSkillTree.value = updatedTree
      }
      
      return updatedTree
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to assign skills'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Bulk remove skills from skill tree
  const bulkRemoveSkills = async (treeId: string, skillIds: string[]) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request(`/v1/skill-trees/${treeId}/assign-skills`, 'DELETE', {
        body: { skillIds }
      })
      
      // Update the skill tree in the store
      const updatedTree = response.data?.skillTree || response.skillTree
      const index = skillTrees.value.findIndex(tree => tree._id === treeId)
      if (index !== -1) {
        skillTrees.value[index] = updatedTree
      }
      if (currentSkillTree.value?._id === treeId) {
        currentSkillTree.value = updatedTree
      }
      
      return updatedTree
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to remove skills'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get skill assignments for a skill tree
  const getSkillAssignments = async (treeId: string) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request(`/v1/skill-trees/${treeId}/assignments`, 'GET', {})
      return response.data?.assignments || response.assignments || []
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch skill assignments'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get all skill assignments across all skill trees
  const getAllSkillAssignments = async () => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request('/v1/skill-trees/assignments/all', 'GET', {})
      return response.data || response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch all skill assignments'
      throw err
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    skillTrees.value = []
    currentSkillTree.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    skillTrees,
    loading,
    error,
    currentSkillTree,
    
    // Computed
    activeSkillTrees,
    draftSkillTrees,
    archivedSkillTrees,
    
    // Actions
    fetchSkillTrees,
    fetchSkillTreeById,
    createSkillTree,
    updateSkillTree,
    deleteSkillTree,
    addSkillToTree,
    removeSkillFromTree,
    bulkAssignSkills,
    bulkRemoveSkills,
    getSkillAssignments,
    getAllSkillAssignments,
    searchSkillTrees,
    getSkillTreesByType,
    clearError,
    reset
  }
}) 