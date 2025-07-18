<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSkillRating, type SkillRating } from '@/stores/skillRating'
import { useSkillStore } from '@/stores/skill'
import { useUserManagement } from '@/stores/userManagement'
import { useToast } from 'vue-toastification'
import { 
  StarOutline,
  Star,
  TrendingUpOutline,
  ArchiveOutline,
  AddOutline,
  CreateOutline,
  TrashOutline,
  CheckmarkOutline,
  CloseCircleOutline,
  TimeOutline,
  TrophyOutline,
  BookOutline,
  FilterOutline,
  RefreshOutline,
  CloseOutline,
  SaveOutline,
  ChatbubbleOutline,
  DocumentTextOutline,
  SchoolOutline,
  StatsChartOutline
} from '@vicons/ionicons5'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

interface Props {
  userId: string
  userName: string
  userType: 'admin' | 'user' | 'teacher' | 'kid'
}

const props = defineProps<Props>()

const skillRating = useSkillRating()
const skillStore = useSkillStore()
const userManagement = useUserManagement()
const toast = useToast()

// State
const currentTab = ref('active')
const showRatingModal = ref(false)
const showArchiveModal = ref(false)
const showAssessmentModal = ref(false)
const showNoteModal = ref(false)
const showClassSelectionModal = ref(false)
const selectedRating = ref<SkillRating | null>(null)
const isEditing = ref(false)
const userClasses = ref<any[]>([])
const availableSkills = ref<any[]>([])
const loadingClasses = ref(false)
const selectedClass = ref<any>(null)
const skillsFromSelectedClass = ref<any[]>([])

// Rating form
const ratingForm = ref({
  skillId: '',
  rating: 5,
  progress: 0,
  status: 'active',
  notes: ''
})

// Archive form
const archiveForm = ref({
  reason: 'not_interested' as 'not_interested' | 'too_difficult' | 'not_relevant' | 'completed_elsewhere' | 'other',
  notes: ''
})

// Assessment form
const assessmentForm = ref({
  title: '',
  score: 0,
  maxScore: 100,
  type: 'quiz' as 'quiz' | 'project' | 'assignment' | 'certification' | 'practice',
  feedback: ''
})

// Note form
const noteForm = ref({
  content: '',
  isPrivate: false
})

// Computed
const filteredRatings = computed(() => {
  switch (currentTab.value) {
    case 'active':
      return skillRating.activeRatings
    case 'completed':
      return skillRating.completedRatings
    case 'archived':
      return skillRating.archivedRatings
    case 'in_progress':
      return skillRating.inProgressRatings
    case 'assessments':
      return [] // Assessments are handled separately
    default:
      return skillRating.ratings
  }
})

const getAllAssessments = () => {
  const allAssessments: any[] = []
  skillRating.ratings.forEach(rating => {
    if (rating.assessments && rating.assessments.length > 0) {
      rating.assessments.forEach(assessment => {
        allAssessments.push({
          ...assessment,
          skillName: rating.skill.name,
          skillId: rating.skill._id,
          ratingId: rating._id
        })
      })
    }
  })
  return allAssessments
}

const userStats = computed(() => {
  if (!skillRating.stats) return null
  
  return {
    totalSkills: skillRating.stats.totalSkills,
    activeSkills: skillRating.stats.activeSkills,
    completedSkills: skillRating.stats.completedSkills,
    archivedSkills: skillRating.stats.archivedSkills,
    averageRating: Math.round(skillRating.stats.averageRating * 10) / 10,
    averageProgress: Math.round(skillRating.stats.averageProgress),
    totalTimeSpent: skillRating.stats.totalTimeSpent
  }
})

const masteryLevelColor = (level: string) => {
  switch (level) {
    case 'expert': return 'text-purple-600 bg-purple-100'
    case 'advanced': return 'text-blue-600 bg-blue-100'
    case 'intermediate': return 'text-green-600 bg-green-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}

const statusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'text-green-600 bg-green-100'
    case 'in_progress': return 'text-blue-600 bg-blue-100'
    case 'archived': return 'text-gray-600 bg-gray-100'
    case 'paused': return 'text-yellow-600 bg-yellow-100'
    default: return 'text-green-600 bg-green-100'
  }
}

const skillsFromClasses = computed(() => {
  return availableSkills.value.filter(skill => skill.status === 'active')
})

// Methods
const loadUserRatings = async () => {
  try {
    await skillRating.fetchUserRatings(props.userId, {
      page: 1,
      limit: 50
    })
  } catch (error: any) {
    toast.error('Failed to load skill ratings')
  }
}

const loadUserClasses = async () => {
  try {
    loadingClasses.value = true
    await userManagement.fetchUserClasses(props.userId)
    userClasses.value = userManagement.userClasses
    await extractSkillsFromClasses()
  } catch (error: any) {
    console.error('Error loading user classes:', error)
    toast.error('Failed to load user classes')
  } finally {
    loadingClasses.value = false
  }
}

const extractSkillsFromClasses = async () => {
  try {
    const skillsSet = new Set<any>()
    
    // Extract skills from all user classes
    for (const cls of userClasses.value) {
      
      if (cls.skillTrees && Array.isArray(cls.skillTrees)) {
        for (const skillTreeRef of cls.skillTrees) {
          
          // If skillTree is populated, extract skills from it
          if (skillTreeRef.skillTree && skillTreeRef.skillTree.structure) {
            extractSkillsFromSkillTree(skillTreeRef.skillTree.structure, skillsSet)
          }
        }
      }
    }
    
    
    // Convert skill IDs to actual skill objects
    const skillIds = Array.from(skillsSet).map(skill => skill._id?.toString() || skill.toString())
    
    if (skillIds.length > 0) {
      await skillStore.fetchSkills()

      availableSkills.value = skillStore.skills.map(skill => {
        return {
          ...skill,
          _id: skill._id.toString()
        }
      }).filter(skill => skillIds.includes(skill._id))
    } else {
      availableSkills.value = []
    }
  } catch (error: any) {
    availableSkills.value = []
  }
}

const extractSkillsFromSkillTree = (structure: any, skillsSet: Set<string>) => {
  if (!structure || !structure.roots) return
  
  const extractFromNodes = (nodes: any[]) => {
    for (const node of nodes) {
      if (node.skillId) {
        skillsSet.add(node.skillId)
      }
      if (node.children && Array.isArray(node.children)) {
        extractFromNodes(node.children)
      }
    }
  }
  
  extractFromNodes(structure.roots)
}

const loadSkills = async () => {
  try {
    await skillStore.fetchSkills()
  } catch (error: any) {
    toast.error('Failed to load skills: ' + (error.message || 'Unknown error'))
  }
}

const openClassSelectionModal = () => {
  showClassSelectionModal.value = true
}

const selectClass = async (cls: any) => {
  selectedClass.value = cls
  await extractSkillsFromClass(cls)
  showClassSelectionModal.value = false
  showRatingModal.value = true
}

const extractSkillsFromClass = async (cls: any) => {
  try {
    const skillsFromSkillTree: any[] = []
    
    if (cls.skillTrees && Array.isArray(cls.skillTrees)) {
      for (const skillTreeRef of cls.skillTrees) {
        
        if (skillTreeRef.skillTree && skillTreeRef.skillTree.structure) {
          extractSkillsFromSkillTreeStructure(skillTreeRef.skillTree.structure, skillsFromSkillTree)
        }
      }
    }
    
    skillsFromSelectedClass.value = skillsFromSkillTree
  } catch (error: any) {
    skillsFromSelectedClass.value = []
  }
}

const extractSkillsFromSkillTreeStructure = (structure: any, skillsArray: any[]) => {
  if (!structure || !structure.roots) {
    return
  }
  
  const extractFromNodes = (nodes: any[]) => {
    for (const node of nodes) {
      if (node.skillId) {
        // Add the skill object from the skill tree
        skillsArray.push({
          ...node.skillId,
          _id: node.skillId._id.toString(),
          skillId: node.skillId._id.toString()
        })
      }
      
      if (node.children && Array.isArray(node.children)) {
        extractFromNodes(node.children)
      }
    }
  }
  
  extractFromNodes(structure.roots)
}

const openRatingModal = (rating?: SkillRating, skill?: any) => {
  if (rating) {
    selectedRating.value = rating
    isEditing.value = true
    ratingForm.value = {
      skillId: rating.skill._id,
      rating: rating.rating,
      progress: rating.progress,
      status: rating.status,
      notes: ''
    }
    // Set the selected class from the rating if available
    if (rating.class) {
      selectedClass.value = rating.class
    }
    showRatingModal.value = true
  } else if (skill) {
    selectedRating.value = null
    isEditing.value = false
    ratingForm.value = {
      skillId: skill._id,
      rating: 5,
      progress: 0,
      status: 'active',
      notes: ''
    }
    showRatingModal.value = true
  } else {
    // Open class selection modal instead
    openClassSelectionModal()
  }
}

const validateRatingForm = () => {
  if (!ratingForm.value.skillId) {
    toast.error('Please select a skill')
    return false
  }
  if (!selectedClass.value?._id) {
    toast.error('Please select a class')
    return false
  }
  if (!ratingForm.value.rating || ratingForm.value.rating < 1) {
    toast.error('Please provide a valid rating (1-10)')
    return false
  }
  return true
}

const saveRating = async () => {
  if (!validateRatingForm()) {
    return
  }
  
  try {
    const result = await skillRating.createOrUpdateRating({
      userId: props.userId,
      skillId: ratingForm.value.skillId,
      classId: selectedClass.value._id,
      rating: ratingForm.value.rating,
      progress: ratingForm.value.progress,
      status: ratingForm.value.status,
      notes: ratingForm.value.notes
    })
    
    toast.success('Skill rating saved successfully')
    showRatingModal.value = false
    await loadUserRatings()
  } catch (error: any) {
    toast.error('Failed to save skill rating: ' + (error.message || 'Unknown error'))
  }
}

const openArchiveModal = (rating: SkillRating) => {
  selectedRating.value = rating
  archiveForm.value = {
    reason: 'not_interested',
    notes: ''
  }
  showArchiveModal.value = true
}

const archiveSkill = async () => {
  if (!selectedRating.value) return
  
  try {
    await skillRating.archiveSkill(
      props.userId,
      selectedRating.value.skill._id,
      selectedRating.value.class?._id || '',
      archiveForm.value.reason,
      archiveForm.value.notes
    )
    
    toast.success('Skill archived successfully')
    showArchiveModal.value = false
    await loadUserRatings()
  } catch (error: any) {
    toast.error('Failed to archive skill')
  }
}

const unarchiveSkill = async (rating: SkillRating) => {
  try {
    await skillRating.unarchiveSkill(props.userId, rating.skill._id, rating.class?._id || '')
    toast.success('Skill unarchived successfully')
    await loadUserRatings()
  } catch (error: any) {
    toast.error('Failed to unarchive skill')
  }
}

const openAssessmentModal = (rating: SkillRating) => {
  selectedRating.value = rating
  console.log({...selectedRating.value})
  assessmentForm.value = {
    title: '',
    score: 0,
    maxScore: 100,
    type: 'quiz',
    feedback: ''
  }
  showAssessmentModal.value = true
}

const addAssessment = async () => {
  if (!selectedRating.value) return
  
  try {
    await skillRating.addAssessment(
      selectedRating.value._id,
      assessmentForm.value
    )
    
    toast.success('Assessment added successfully')
    showAssessmentModal.value = false
    await loadUserRatings()
  } catch (error: any) {
    toast.error('Failed to add assessment')
  }
}

const openNoteModal = (rating: SkillRating) => {
  selectedRating.value = rating
  noteForm.value = {
    content: '',
    isPrivate: false
  }
  showNoteModal.value = true
}

const addNote = async () => {
  if (!selectedRating.value) return
  
  try {
    await skillRating.addNote(
      props.userId,
      selectedRating.value.skill._id,
      selectedRating.value.class?._id || '',
      noteForm.value
    )
    
    toast.success('Note added successfully')
    showNoteModal.value = false
    await loadUserRatings()
  } catch (error: any) {
    toast.error('Failed to add note')
  }
}

const updateProgress = async (rating: SkillRating, progress: number) => {
  try {
    await skillRating.updateProgress(props.userId, rating.skill._id, rating.class?._id || '', progress)
    toast.success('Progress updated successfully')
    await loadUserRatings()
  } catch (error: any) {
    toast.error('Failed to update progress')
  }
}

const formatDate = (date: string) => {
  return dayjs(date).format('MMM DD, YYYY')
}

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

// Lifecycle
onMounted(() => {
  loadUserRatings()
  loadUserClasses()
})
</script>

<template>
  <div>
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-xl  border-b p-6">
        <div class="flex items-center justify-between lg:gap-2 gap-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Skill Ratings</h2>
            <p class="text-gray-600 text-sm mt-1">Manage and track skill ratings for {{ userName }}</p>
          </div>
          <button 
            @click="openClassSelectionModal()"
            class="btn bg-gradient-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            <AddOutline class="w-4 h-4 mr-2" />
            Rate Skill
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div v-if="userStats" class="grid grid-cols-2 gap-3 sm:gap-4">
        <div class="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div class="flex-1 min-w-0">
              <p class="text-xs sm:text-sm text-gray-600 truncate">Total Skills</p>
              <p class="text-xl sm:text-2xl font-bold text-gray-800 leading-tight">{{ userStats.totalSkills }}</p>
            </div>
            <div class="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOutline class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div class="flex-1 min-w-0">
              <p class="text-xs sm:text-sm text-gray-600 truncate">Active Skills</p>
              <p class="text-xl sm:text-2xl font-bold text-green-600 leading-tight">{{ userStats.activeSkills }}</p>
            </div>
            <div class="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUpOutline class="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div class="flex-1 min-w-0">
              <p class="text-xs sm:text-sm text-gray-600 truncate">Completed</p>
              <p class="text-xl sm:text-2xl font-bold text-purple-600 leading-tight">{{ userStats.completedSkills }}</p>
            </div>
            <div class="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrophyOutline class="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div class="flex-1 min-w-0">
              <p class="text-xs sm:text-sm text-gray-600 truncate">Avg Rating</p>
              <p class="text-xl sm:text-2xl font-bold text-orange-600 leading-tight">{{ userStats.averageRating }}/10</p>
            </div>
            <div class="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Star class="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>



      <!-- Tabs -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="border-b border-gray-100">
        <nav class="flex space-x-8 px-6">
          <button
            v-for="tab in [
              { key: 'active', label: 'Active', count: skillRating.activeRatings.length },
              { key: 'in_progress', label: 'In Progress', count: skillRating.inProgressRatings.length },
              { key: 'completed', label: 'Completed', count: skillRating.completedRatings.length },
              { key: 'archived', label: 'Archived', count: skillRating.archivedRatings.length }
            ]"
            :key="tab.key"
            @click="currentTab = tab.key"
            :class="{
              'border-b-2 border-blue-500 text-blue-600': currentTab === tab.key,
              'text-gray-500 hover:text-gray-700': currentTab !== tab.key
            }"
            class="py-4 px-1 border-b-2 border-transparent font-medium text-sm"
          >
            {{ tab.label }}
            <span class="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
              {{ tab.count }}
            </span>
          </button>
        </nav>
      </div>

        <!-- Content -->
        <div class="p-6">
          <div v-if="skillRating.loading" class="text-center py-8">
            <div class="loading loading-spinner loading-md"></div>
            <p class="text-gray-500 mt-2">Loading skill ratings...</p>
          </div>
        
        <div v-else-if="filteredRatings.length === 0" class="text-center py-8">
          <BookOutline class="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p class="text-gray-500">No skills found in this category</p>
        </div>
        
        <div v-else class="space-y-4">
            <div
              v-for="rating in filteredRatings"
              :key="rating._id"
              class="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-start justify-between flex-wrap gap-3 flex-col">
                <div class="flex-1">
                  <!-- Class and Skill Source -->
                  <div class="flex items-center gap-2 mb-3 text-xs text-gray-500">
                    <div class="flex items-center gap-1">
                      <SchoolOutline class="w-3 h-3" />
                      <span class="font-medium">{{ rating.class?.name || 'Unknown Class' }}</span>
                    </div>
                    <span>•</span>
                    <div class="flex items-center gap-1">
                      <BookOutline class="w-3 h-3" />
                      <span class="font-medium">{{ rating.skill.category }}</span>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-3 mb-2">
                    <div 
                      class="w-4 h-4 rounded-full"
                      :style="`background-color: ${rating.skill.color || '#3B82F6'}`"
                    ></div>
                    <h3 class="font-semibold text-gray-900">{{ rating.skill.name }}</h3>
                    <span 
                      :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${masteryLevelColor(rating.masteryLevel)}`"
                    >
                      {{ rating.masteryLevel }}
                    </span>
                    <span 
                      :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(rating.status)}`"
                    >
                      {{ rating.status.replace('_', ' ') }}
                    </span>
                  </div>
                  
                  <p class="text-sm text-gray-600 mb-3">{{ rating.skill.description }}</p>
                  
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div class="flex items-center gap-2">
                      <Star class="w-4 h-4 text-yellow-500" />
                      <span class="text-sm font-medium">{{ rating.rating }}/10</span>
                    </div>
                    
                    <div class="flex items-center gap-2">
                      <TrendingUpOutline class="w-4 h-4 text-blue-500" />
                      <span class="text-sm font-medium">{{ rating.progress }}%</span>
                    </div>
                    
                    <div class="flex items-center gap-2">
                      <TimeOutline class="w-4 h-4 text-green-500" />
                      <span class="text-sm font-medium">{{ formatTime(rating.timeSpent) }}</span>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-2 text-xs text-gray-500">
                    <span>Rated by {{ rating.ratedBy.name }}</span>
                    <span>•</span>
                    <span>{{ formatDate(rating.updatedAt) }}</span>
                    <span v-if="rating.lastPracticedAt">•</span>
                    <span v-if="rating.lastPracticedAt">Last practiced {{ dayjs(rating.lastPracticedAt).fromNow() }}</span>
                  </div>
                </div>
                
                <div class="flex items-center gap-2 justify-center">
                  <button
                    @click="openRatingModal(rating)"
                    class="btn btn-sm btn-ghost hover:bg-blue-50 hover:text-blue-600"
                    title="Edit Rating"
                  >
                    <CreateOutline class="w-4 h-4" />
                  </button>
                  
                  <button
                    @click="openAssessmentModal(rating)"
                    class="btn btn-sm btn-ghost hover:bg-green-50 hover:text-green-600"
                    title="Add Assessment"
                  >
                    <StatsChartOutline class="w-4 h-4" />
                  </button>
                  
                  <button
                    @click="openNoteModal(rating)"
                    class="btn btn-sm btn-ghost hover:bg-purple-50 hover:text-purple-600"
                    title="Add Note"
                  >
                    <ChatbubbleOutline class="w-4 h-4" />
                  </button>
                  
                  <button
                    v-if="!rating.isArchived"
                    @click="openArchiveModal(rating)"
                    class="btn btn-sm btn-ghost hover:bg-red-50 hover:text-red-600"
                    title="Archive Skill"
                  >
                    <ArchiveOutline class="w-4 h-4" />
                  </button>
                  
                  <button
                    v-else
                    @click="unarchiveSkill(rating)"
                    class="btn btn-sm btn-ghost hover:bg-green-50 hover:text-green-600"
                    title="Unarchive Skill"
                  >
                    <RefreshOutline class="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <!-- Progress Bar -->
              <div class="mt-3">
                <div class="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{{ rating.progress }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-300"
                    :class="{
                      'bg-green-500': rating.progress >= 100,
                      'bg-blue-500': rating.progress >= 50 && rating.progress < 100,
                      'bg-yellow-500': rating.progress >= 25 && rating.progress < 50,
                      'bg-red-500': rating.progress < 25
                    }"
                    :style="`width: ${rating.progress}%`"
                  ></div>
                </div>
              </div>

              <!-- Assessments Section -->
              <div v-if="rating.assessments && rating.assessments.length > 0" class="mt-4 pt-4 border-t border-gray-200">
                <div class="flex items-center gap-2 mb-3">
                  <StatsChartOutline class="w-4 h-4 text-green-600" />
                  <h4 class="text-sm font-semibold text-gray-800">Assessments ({{ rating.assessments.length }})</h4>
                </div>
                
                <div class="space-y-2">
                  <div
                    v-for="(assessment, index) in rating.assessments"
                    :key="`assessment-${index}`"
                    class="bg-white rounded-lg p-3 border border-gray-100"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                          <h5 class="text-sm font-medium text-gray-900">{{ assessment.title }}</h5>
                          <span 
                            :class="`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              assessment.type === 'quiz' ? 'bg-blue-100 text-blue-600' :
                              assessment.type === 'project' ? 'bg-green-100 text-green-600' :
                              assessment.type === 'assignment' ? 'bg-purple-100 text-purple-600' :
                              assessment.type === 'certification' ? 'bg-orange-100 text-orange-600' :
                              'bg-gray-100 text-gray-600'
                            }`"
                          >
                            {{ assessment.type }}
                          </span>
                        </div>
                        
                        <div class="flex items-center gap-4 text-xs text-gray-600">
                          <span class="flex items-center gap-1">
                            <StatsChartOutline class="w-3 h-3" />
                            {{ assessment.score }}/{{ assessment.maxScore }}
                          </span>
                          <span class="font-medium">
                            {{ Math.round((assessment.score / assessment.maxScore) * 100) }}%
                          </span>
                          <span class="flex items-center gap-1">
                            <TimeOutline class="w-3 h-3" />
                            {{ formatDate(assessment.completedAt) }}
                          </span>
                        </div>
                        
                        <div v-if="assessment.feedback" class="mt-2 text-xs text-gray-600">
                          <span class="font-medium">Feedback:</span> {{ assessment.feedback }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals - Teleported to body to prevent overflow -->
    <Teleport to="body">
      <!-- Rating Modal -->
      <div v-if="showRatingModal" class="modal modal-open">
        <div class="modal-box max-w-2xl">
          <h3 class="font-bold text-lg mb-4">
            {{ isEditing ? 'Edit Skill Rating' : 'Rate Skill' }}
          </h3>
          
          <form @submit.prevent="saveRating" class="space-y-4">
            <div v-if="selectedClass" class="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <SchoolOutline class="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 class="font-semibold text-blue-900">{{ selectedClass.name }}</h4>
                    <p class="text-xs text-blue-700">{{ selectedClass.code || 'No code' }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-xs text-blue-600 font-medium">Source Class</span>
                </div>
              </div>
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Skill</span>
              </label>
              <select
                v-model="ratingForm.skillId"
                class="select select-bordered w-full"
                :disabled="isEditing"
                required
              >
                <option value="">Select a skill...</option>
                <option
                  v-for="skill in skillsFromSelectedClass"
                  :key="skill._id"
                  :value="skill._id"
                >
                  {{ skill.name }} ({{ skill.category }})
                </option>
              </select>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Rating (1-10)</span>
                </label>
                <input
                  v-model.number="ratingForm.rating"
                  type="range"
                  min="1"
                  max="10"
                  class="range range-primary"
                />
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>{{ ratingForm.rating }}</span>
                  <span>10</span>
                </div>
              </div>
              
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Progress (%)</span>
                </label>
                <input
                  v-model.number="ratingForm.progress"
                  type="range"
                  min="0"
                  max="100"
                  class="range range-secondary"
                />
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>{{ ratingForm.progress }}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Status</span>
              </label>
              <select
                v-model="ratingForm.status"
                class="select select-bordered w-full"
              >
                <option value="active">Active</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Notes (Optional)</span>
              </label>
              <textarea
                v-model="ratingForm.notes"
                class="textarea textarea-bordered w-full"
                rows="3"
                placeholder="Add any notes about this rating..."
              ></textarea>
            </div>
          </form>
          
          <div class="modal-action">
            <button
              @click="showRatingModal = false"
              class="btn btn-outline"
            >
              Cancel
            </button>
            <button
              @click="saveRating"
              class="btn bg-gradient-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 text-white"
              :disabled="skillRating.loading || !ratingForm.skillId || !ratingForm.rating"
            >
              <span v-if="skillRating.loading" class="loading loading-spinner loading-sm"></span>
              <span v-else>{{ isEditing ? 'Update' : 'Save' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Archive Modal -->
      <div v-if="showArchiveModal" class="modal modal-open">
        <div class="modal-box max-w-md">
          <h3 class="font-bold text-lg mb-4">Archive Skill</h3>
          
          <div class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Reason for Archiving</span>
              </label>
              <select
                v-model="archiveForm.reason"
                class="select select-bordered w-full"
              >
                <option value="not_interested">Not Interested</option>
                <option value="too_difficult">Too Difficult</option>
                <option value="not_relevant">Not Relevant</option>
                <option value="completed_elsewhere">Completed Elsewhere</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Notes (Optional)</span>
              </label>
              <textarea
                v-model="archiveForm.notes"
                class="textarea textarea-bordered w-full"
                rows="3"
                placeholder="Add any additional notes..."
              ></textarea>
            </div>
          </div>
          
          <div class="modal-action">
            <button
              @click="showArchiveModal = false"
              class="btn btn-outline"
            >
              Cancel
            </button>
            <button
              @click="archiveSkill"
              class="btn btn-error"
              :disabled="skillRating.loading"
            >
              <span v-if="skillRating.loading" class="loading loading-spinner loading-sm"></span>
              <span v-else>Archive</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Assessment Modal -->
      <div v-if="showAssessmentModal" class="modal modal-open">
        <div class="modal-box max-w-md">
          <h3 class="font-bold text-lg mb-4">Add Assessment</h3>
          
          <form @submit.prevent="addAssessment" class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Assessment Title</span>
              </label>
              <input
                v-model="assessmentForm.title"
                type="text"
                class="input input-bordered w-full"
                required
              />
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Score</span>
                </label>
                <input
                  v-model.number="assessmentForm.score"
                  type="number"
                  min="0"
                  :max="assessmentForm.maxScore"
                  class="input input-bordered w-full"
                  required
                />
              </div>
              
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Max Score</span>
                </label>
                <input
                  v-model.number="assessmentForm.maxScore"
                  type="number"
                  min="1"
                  class="input input-bordered w-full"
                  required
                />
              </div>
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Type</span>
              </label>
              <select
                v-model="assessmentForm.type"
                class="select select-bordered w-full"
              >
                <option value="quiz">Quiz</option>
                <option value="project">Project</option>
                <option value="assignment">Assignment</option>
                <option value="certification">Certification</option>
                <option value="practice">Practice</option>
              </select>
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Feedback (Optional)</span>
              </label>
              <textarea
                v-model="assessmentForm.feedback"
                class="textarea textarea-bordered w-full"
                rows="3"
                placeholder="Add feedback for this assessment..."
              ></textarea>
            </div>
          </form>
          
          <div class="modal-action">
            <button
              @click="showAssessmentModal = false"
              class="btn btn-outline"
            >
              Cancel
            </button>
            <button
              @click="addAssessment"
              class="btn bg-gradient-to-r from-green-500 to-blue-500 border-0 hover:from-green-600 hover:to-blue-600 text-white"
              :disabled="skillRating.loading"
            >
              <span v-if="skillRating.loading" class="loading loading-spinner loading-sm"></span>
              <span v-else>Add Assessment</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Note Modal -->
      <div v-if="showNoteModal" class="modal modal-open">
        <div class="modal-box max-w-md">
          <h3 class="font-bold text-lg mb-4">Add Note</h3>
          
          <form @submit.prevent="addNote" class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Note Content</span>
              </label>
              <textarea
                v-model="noteForm.content"
                class="textarea textarea-bordered w-full"
                rows="4"
                placeholder="Add a note about this skill..."
                required
              ></textarea>
            </div>
            
            <div class="form-control">
              <label class="label cursor-pointer">
                <input
                  v-model="noteForm.isPrivate"
                  type="checkbox"
                  class="checkbox checkbox-primary"
                />
                <span class="label-text ml-2">Private Note (only visible to teachers/admins)</span>
              </label>
            </div>
          </form>
          
          <div class="modal-action">
            <button
              @click="showNoteModal = false"
              class="btn btn-outline"
            >
              Cancel
            </button>
            <button
              @click="addNote"
              class="btn bg-gradient-to-r from-purple-500 to-pink-500 border-0 hover:from-purple-600 hover:to-pink-600 text-white"
              :disabled="skillRating.loading"
            >
              <span v-if="skillRating.loading" class="loading loading-spinner loading-sm"></span>
              <span v-else>Add Note</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Class Selection Modal -->
      <div v-if="showClassSelectionModal" class="modal modal-open">
        <div class="modal-box max-w-2xl">
          <h3 class="font-bold text-lg mb-4">Select Class for Skill Rating</h3>
          
          <div class="space-y-4">
            <p class="text-gray-600">Choose a class to see available skills for rating:</p>
            
            <div v-if="userClasses.length === 0" class="text-center py-8">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SchoolOutline class="w-8 h-8 text-gray-400" />
              </div>
              <h3 class="text-lg font-semibold text-gray-700 mb-2">No Classes Available</h3>
              <p class="text-gray-500 text-sm">This user needs to be enrolled in classes to rate skills</p>
            </div>
            
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              <div
                v-for="cls in userClasses"
                :key="cls._id"
                class="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer border-2 border-transparent hover:border-blue-200"
                @click="selectClass(cls)"
              >
                <div class="flex items-start justify-between mb-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <BookOutline class="w-5 h-5 text-blue-600" />
                  </div>
                  <div class="flex items-center gap-1">
                    <span 
                      :class="`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        cls.status === 'active' ? 'bg-green-100 text-green-600' :
                        cls.status === 'completed' ? 'bg-purple-100 text-purple-600' :
                        'bg-gray-100 text-gray-600'
                      }`"
                    >
                      {{ cls.status }}
                    </span>
                  </div>
                </div>
                
                <h4 class="font-semibold text-gray-900 mb-2">{{ cls.name }}</h4>
                <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ cls.description || 'No description' }}</p>
                
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-500">
                    {{ cls.skillTrees?.length || 0 }} skill trees
                  </span>
                  <button class="btn btn-sm btn-primary bg-gradient-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 text-white">
                    Select Class
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-action">
            <button
              @click="showClassSelectionModal = false"
              class="btn btn-outline"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.modal {
  @apply z-50;
}

.modal-box {
  @apply max-h-[90vh] overflow-y-auto;
}

/* Custom range slider styles */
.range {
  @apply w-full;
}

.range::-webkit-slider-thumb {
  @apply appearance-none w-4 h-4 rounded-full cursor-pointer;
}

.range::-moz-range-thumb {
  @apply appearance-none w-4 h-4 rounded-full cursor-pointer border-0;
}
</style> 