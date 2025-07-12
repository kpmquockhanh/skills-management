import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRequest } from './http'

export interface Class {
  _id: string
  name: string
  description: string
  code: string
  type: 'course' | 'workshop' | 'seminar' | 'tutorial' | 'project' | 'other'
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  status: 'active' | 'inactive' | 'archived' | 'draft'
  thumbnailUrl?: string
  thumbnail?: { url: string }
  skillTrees: Array<{
    skillTree: {
      _id: string
      name: string
      description: string
      type: string
      icon: string
      color: string
    }
    level: 'basic' | 'intermediate' | 'advanced'
    order: number
    isRequired: boolean
  }>
  objectives: string[]
  duration?: number
  maxStudents: number
  enrolledStudents: number
  schedule?: {
    startDate?: string
    endDate?: string
    sessions: Array<{
      day: string
      startTime: string
      endTime: string
      duration: number
    }>
  }
  createdBy: {
    _id: string
    name: string
    email: string
    photoUrl?: string
  }
  teachers: Array<{
    _id: string
    name: string
    email: string
    photoUrl?: string
  }>
  students: Array<{
    user: {
      _id: string
      name: string
      email: string
      photoUrl?: string
    }
    enrolledAt: string
    status: 'enrolled' | 'completed' | 'dropped' | 'pending'
    progress: number
    completedSkillTrees: Array<{
      skillTree: {
        _id: string
        name: string
        description: string
        type: string
        icon: string
        color: string
      }
      completedAt: string
      score: number
      feedback?: string
    }>
  }>
  settings: {
    allowSelfEnrollment: boolean
    requireApproval: boolean
    isPublic: boolean
    allowGuestAccess: boolean
  }
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateClassData {
  name: string
  description: string
  code: string
  type: 'course' | 'workshop' | 'seminar' | 'tutorial' | 'project' | 'other'
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  skillTrees: Array<{
    skillTree: string // skill tree ID
    level: 'basic' | 'intermediate' | 'advanced'
    order: number
    isRequired: boolean
  }>
  objectives: string[]
  duration?: number
  maxStudents: number
  schedule?: {
    startDate?: string
    endDate?: string
    sessions: Array<{
      day: string
      startTime: string
      endTime: string
      duration: number
    }>
  }
  teachers?: string[] // user IDs
  settings?: {
    allowSelfEnrollment: boolean
    requireApproval: boolean
    isPublic: boolean
    allowGuestAccess: boolean
  }
  tags?: string[]
}

export interface UpdateClassData extends Partial<CreateClassData> {
  status?: 'active' | 'inactive' | 'archived' | 'draft'
}

export const useClassStore = defineStore('class', () => {
  const request = useRequest()
  const classes = ref<Class[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentClass = ref<Class | null>(null)

  // Computed properties
  const activeClasses = computed(() => classes.value.filter(cls => cls.status === 'active'))
  const draftClasses = computed(() => classes.value.filter(cls => cls.status === 'draft'))
  const archivedClasses = computed(() => classes.value.filter(cls => cls.status === 'archived'))

  // Get all classes
  const fetchClasses = async (params?: {
    page?: number
    limit?: number
    search?: string
    type?: string
    level?: string
    status?: string
    teacherId?: string
    skill?: string
    tag?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request('/v1/classes', 'GET', { params })
      classes.value = response.data?.classes || []
      console.log('classes', classes.value)
      
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch classes'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get class by ID
  const fetchClassById = async (classId: string) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request(`/v1/classes/${classId}`, 'GET', {})
      currentClass.value = response.data?.class || response.class
      
      return currentClass.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch class'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create new class
  const createClass = async (classData: CreateClassData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request('/v1/classes', 'POST', { body: classData })
      const newClass = response.data?.class || response.class
      
      classes.value.unshift(newClass)
      currentClass.value = newClass
      
      return newClass
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create class'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update class
  const updateClass = async (classId: string, updateData: UpdateClassData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request(`/v1/classes/${classId}`, 'PUT', { body: updateData })
      const updatedClass = response.data?.class || response.class
      
      const index = classes.value.findIndex(cls => cls._id === classId)
      if (index !== -1) {
        classes.value[index] = updatedClass
      }
      
      if (currentClass.value?._id === classId) {
        currentClass.value = updatedClass
      }
      
      return updatedClass
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update class'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete class
  const deleteClass = async (classId: string) => {
    try {
      loading.value = true
      error.value = null
      
      await request.request(`/v1/classes/${classId}`, 'DELETE', {})
      
      classes.value = classes.value.filter(cls => cls._id !== classId)
      
      if (currentClass.value?._id === classId) {
        currentClass.value = null
      }
      
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete class'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Enroll student in class
  const enrollStudent = async (classId: string, userId: string, status: 'enrolled' | 'completed' | 'dropped' | 'pending' = 'enrolled') => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request(`/v1/classes/${classId}/enroll`, 'POST', { body: { userId, status } })
      const updatedClass = response.data?.class || response.class
      
      const index = classes.value.findIndex(cls => cls._id === classId)
      if (index !== -1) {
        classes.value[index] = updatedClass
      }
      
      if (currentClass.value?._id === classId) {
        currentClass.value = updatedClass
      }
      
      return updatedClass
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to enroll student'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Remove student from class
  const removeStudent = async (classId: string, userId: string) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request(`/v1/classes/${classId}/students/${userId}`, 'DELETE', {})
      const updatedClass = response.data?.class || response.class
      
      const index = classes.value.findIndex(cls => cls._id === classId)
      if (index !== -1) {
        classes.value[index] = updatedClass
      }
      
      if (currentClass.value?._id === classId) {
        currentClass.value = updatedClass
      }
      
      return updatedClass
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to remove student'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update student progress
  const updateStudentProgress = async (classId: string, userId: string, progress: number, completedSkillTrees: any[] = []) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request(`/v1/classes/${classId}/students/${userId}/progress`, 'PUT', {
        body: { progress, completedSkillTrees }
      })
      const updatedClass = response.data?.class || response.class
      
      const index = classes.value.findIndex(cls => cls._id === classId)
      if (index !== -1) {
        classes.value[index] = updatedClass
      }
      
      if (currentClass.value?._id === classId) {
        currentClass.value = updatedClass
      }
      
      return updatedClass
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update student progress'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get classes by skill tree
  const getClassesBySkillTree = async (skillTreeId: string, params?: { page?: number; limit?: number }) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request(`/v1/classes/skill-tree/${skillTreeId}`, 'GET', { params })
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch classes by skill tree'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get classes by teacher
  const getClassesByTeacher = async (teacherId: string, params?: { page?: number; limit?: number }) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request(`/v1/classes/teacher/${teacherId}`, 'GET', { params })
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch classes by teacher'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get classes by student
  const getClassesByStudent = async (studentId: string, params?: { page?: number; limit?: number }) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await request.request(`/v1/classes/student/${studentId}`, 'GET', { params })
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch classes by student'
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
    classes.value = []
    currentClass.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    classes,
    loading,
    error,
    currentClass,
    
    // Computed
    activeClasses,
    draftClasses,
    archivedClasses,
    
    // Actions
    fetchClasses,
    fetchClassById,
    createClass,
    updateClass,
    deleteClass,
    enrollStudent,
    removeStudent,
    updateStudentProgress,
    getClassesBySkillTree,
    getClassesByTeacher,
    getClassesByStudent,
    clearError,
    reset
  }
}) 