<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  BookOutline, 
  TrophyOutline, 
  TrendingUpOutline, 
  TimeOutline,
  CheckmarkCircleOutline,
  PlayCircleOutline,
  DocumentTextOutline,
  PeopleOutline,
  AddOutline,
  SearchOutline,
  FilterOutline,
  GridOutline,
  ListOutline,
  StarOutline,
  StarHalfOutline,
  StarOutline as StarEmptyOutline,
  CreateOutline,
  TrashOutline,
  SettingsOutline
} from '@vicons/ionicons5'
import { useClassStore, type Class } from '../stores/class'
import { useSkillTreeStore } from '../stores/skillTree'
import ClassModal from '@components/ClassModal.vue'

// Router
const router = useRouter()

// Stores
const classStore = useClassStore()
const skillTreeStore = useSkillTreeStore()

// Modal state
const showModal = ref(false)
const editingClass = ref<Class | null>(null)

// Filters and search
const searchQuery = ref('')
const selectedCategory = ref('All')
const selectedLevel = ref('All')
const selectedStatus = ref('All')
const viewMode = ref('grid') // 'grid' or 'list'

// Skill tree state
const expandSkillTree = ref(new Set<string>())

// Computed properties
const categories = computed(() => {
  const cats = ['All', ...new Set(classStore.classes.map(c => c.type))]
  return cats
})

const levels = ['All', 'beginner', 'intermediate', 'advanced', 'expert']
const statuses = ['All', 'active', 'inactive', 'draft', 'archived']

const filteredClasses = computed(() => {
  console.log('classStore.classes', classStore.classes)
  return classStore.classes.filter(cls => {
    const matchesSearch = !searchQuery.value || 
      cls.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      cls.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesCategory = selectedCategory.value === 'All' || cls.type === selectedCategory.value
    const matchesLevel = selectedLevel.value === 'All' || cls.level === selectedLevel.value
    const matchesStatus = selectedStatus.value === 'All' || cls.status === selectedStatus.value
    
    return matchesSearch && matchesCategory && matchesLevel && matchesStatus
  })
})

// Skill tree methods
const toggleSkillTree = (category: string) => {
  if (expandSkillTree.value.has(category)) {
    expandSkillTree.value.delete(category)
  } else {
    expandSkillTree.value.add(category)
  }
}

const getSkillProgress = (skillName: string) => {
  // Mock progress calculation - you can implement actual logic here
  return Math.floor(Math.random() * 100)
}

// Get skills count for a skill tree
const getSkillTreeSkillCount = (skillTree: any) => {
  let count = 0
  const countSkills = (nodes: any[]) => {
    nodes.forEach(node => {
      count++
      if (node.children && node.children.length > 0) {
        countSkills(node.children)
      }
    })
  }
  
  if (skillTree.structure?.roots) {
    countSkills(skillTree.structure.roots)
  }
  return count
}

// Check if a skill tree is used in any class
const isSkillTreeUsedInClasses = (skillTreeId: string) => {
  return classStore.classes.some(cls => 
    cls.skillTrees.some(st => st.skillTree._id === skillTreeId)
  )
}

// Get classes that use a specific skill tree
const getClassesUsingSkillTree = (skillTreeId: string) => {
  return classStore.classes.filter(cls => 
    cls.skillTrees.some(st => st.skillTree._id === skillTreeId)
  )
}

// CRUD Operations
const openCreateModal = () => {
  editingClass.value = null
  showModal.value = true
}

const openEditModal = (classData: Class) => {
  editingClass.value = classData
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingClass.value = null
}

const handleClassSaved = (classData: Class) => {
  // The store will automatically update the classes array
  console.log('Class saved:', classData)
}

const deleteClass = async (classId: string) => {
  if (confirm('Are you sure you want to delete this class?')) {
    try {
      await classStore.deleteClass(classId)
    } catch (error) {
      console.error('Error deleting class:', error)
    }
  }
}

const viewClassDetails = (classId: string) => {
  router.push(`/classes/${classId}`)
}

// Load data on mount
onMounted(async () => {
  try {
    await Promise.all([
      classStore.fetchClasses(),
      skillTreeStore.fetchSkillTrees()
    ])
    console.log('classStore.classes', classStore.classes)
  } catch (error) {
    console.error('Error loading data:', error)
  }
})
</script>

<template>
  <div>
    <!-- Header Section -->
    <div class="mb-6 sm:mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Classes</h1>
          <p class="text-gray-600 text-sm sm:text-base">Manage your classes and track skill development</p>
        </div>
        <button 
          @click="openCreateModal"
          class="btn bg-gradient-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 shadow-lg text-white"
        >
          <AddOutline class="w-4 h-4" />
          Create New Class
        </button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8">
      <div class="flex flex-col lg:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1 relative">
          <SearchOutline class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search classes, descriptions, codes..." 
            class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <!-- Filters -->
        <div class="flex gap-3">
          <select 
            v-model="selectedCategory"
            class="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
          
          <select 
            v-model="selectedLevel"
            class="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option v-for="level in levels" :key="level" :value="level">
              {{ level }}
            </option>
          </select>

          <select 
            v-model="selectedStatus"
            class="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option v-for="status in statuses" :key="status" :value="status">
              {{ status }}
            </option>
          </select>
          
          <!-- View Mode Toggle -->
          <div class="flex border border-gray-200 rounded-lg overflow-hidden">
            <button 
              @click="viewMode = 'grid'"
              :class="viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'"
              class="px-3 py-2 transition-colors"
            >
              <GridOutline class="w-4 h-4" />
            </button>
            <button 
              @click="viewMode = 'list'"
              :class="viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'"
              class="px-3 py-2 transition-colors"
            >
              <ListOutline class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="classStore.loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>

    <!-- Main Content Grid -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
      <!-- Classes List -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-4 sm:p-6 border-b border-gray-100">
            <h2 class="text-lg sm:text-xl font-bold text-gray-800">Your Classes</h2>
            <p class="text-gray-600 text-sm mt-1">{{ filteredClasses.length }} classes found</p>
          </div>
          
          <!-- Empty State -->
          <div v-if="filteredClasses.length === 0" class="p-8 text-center">
            <BookOutline class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
            <p class="text-gray-600 mb-4">Create your first class to get started</p>
            <button 
              @click="openCreateModal"
              class="btn bg-blue-500 text-white hover:bg-blue-600"
            >
              <AddOutline class="w-4 h-4" />
              Create Class
            </button>
          </div>
          
          <!-- Grid View -->
          <div v-else-if="viewMode === 'grid'" class="p-4 sm:p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div v-for="cls in filteredClasses" :key="cls._id" 
                   class="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div class="relative">
                  <img :src="cls.thumbnailUrl || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop'" :alt="cls.name" class="w-full h-32 object-cover" />
                  <div class="absolute top-2 right-2">
                    <span class="px-2 py-1 bg-white/90 rounded-full text-xs font-medium text-gray-700">
                      {{ cls.level }}
                    </span>
                  </div>
                  <!-- Status Badge -->
                  <div class="absolute top-2 left-2">
                    <span :class="{
                      'px-2 py-1 rounded-full text-xs font-medium': true,
                      'bg-green-100 text-green-800': cls.status === 'active',
                      'bg-yellow-100 text-yellow-800': cls.status === 'draft',
                      'bg-gray-100 text-gray-800': cls.status === 'inactive',
                      'bg-red-100 text-red-800': cls.status === 'archived'
                    }">
                      {{ cls.status }}
                    </span>
                  </div>
                </div>
                <div class="p-4">
                  <div class="flex items-start justify-between mb-2">
                    <h3 class="font-bold text-gray-800 line-clamp-2 flex-1 cursor-pointer hover:text-blue-600 transition-colors" @click="viewClassDetails(cls._id)">{{ cls.name }}</h3>
                    <div class="flex gap-1 ml-2">
                      <button 
                        @click="openEditModal(cls)"
                        class="p-1 text-gray-400 hover:text-blue-600"
                        title="Edit class"
                      >
                        <CreateOutline class="w-4 h-4" />
                      </button>
                      <button 
                        @click="deleteClass(cls._id)"
                        class="p-1 text-gray-400 hover:text-red-600"
                        title="Delete class"
                      >
                        <TrashOutline class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p class="text-sm text-gray-600 mb-1">Code: {{ cls.code }}</p>
                  <p class="text-sm text-gray-600 mb-3">{{ cls.description }}</p>
                  
                  <!-- Skill Trees -->
                  <div class="flex flex-wrap gap-1 mb-3">
                    <span v-for="skillTree in cls.skillTrees.slice(0, 3)" :key="skillTree.skillTree._id" 
                          class="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs cursor-pointer hover:bg-blue-200 transition-colors"
                          @click="toggleSkillTree(skillTree.skillTree.name)">
                      {{ skillTree.skillTree.name }}
                      <span class="ml-1 text-xs">({{ getSkillTreeSkillCount(skillTreeStore.skillTrees.find(st => st._id === skillTree.skillTree._id)) }})</span>
                    </span>
                    <span v-if="cls.skillTrees.length > 3" class="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      +{{ cls.skillTrees.length - 3 }}
                    </span>
                  </div>
                  
                  <!-- Stats -->
                  <div class="flex items-center justify-between text-sm">
                    <div class="flex items-center gap-4">
                      <span class="flex items-center gap-1">
                        <PeopleOutline class="w-4 h-4 text-gray-400" />
                        {{ cls.enrolledStudents }}/{{ cls.maxStudents }}
                      </span>
                      <span class="flex items-center gap-1">
                        <TimeOutline class="w-4 h-4 text-gray-400" />
                        {{ cls.duration || 'N/A' }}h
                      </span>
                    </div>
                    <div class="text-sm text-gray-600">
                      {{ cls.type }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- List View -->
          <div v-else class="p-4 sm:p-6">
            <div class="space-y-4">
              <div v-for="cls in filteredClasses" :key="cls._id" 
                   class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <img :src="cls.thumbnailUrl || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop'" :alt="cls.name" class="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between mb-1">
                    <h3 class="font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors" @click="viewClassDetails(cls._id)">{{ cls.name }}</h3>
                    <div class="flex gap-1 ml-2">
                      <button 
                        @click="openEditModal(cls)"
                        class="p-1 text-gray-400 hover:text-blue-600"
                        title="Edit class"
                      >
                        <CreateOutline class="w-4 h-4" />
                      </button>
                      <button 
                        @click="deleteClass(cls._id)"
                        class="p-1 text-gray-400 hover:text-red-600"
                        title="Delete class"
                      >
                        <TrashOutline class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p class="text-sm text-gray-600 mb-1">Code: {{ cls.code }}</p>
                  <p class="text-sm text-gray-600 mb-2">{{ cls.description }}</p>
                  <div class="flex flex-wrap gap-1 mb-2">
                    <span v-for="skillTree in cls.skillTrees.slice(0, 3)" :key="skillTree.skillTree._id" 
                          class="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                      {{ skillTree.skillTree.name }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-4 text-sm">
                  <div class="text-center">
                    <div class="font-medium">{{ cls.enrolledStudents }}/{{ cls.maxStudents }}</div>
                    <div class="text-gray-500">Students</div>
                  </div>
                  <div class="text-center">
                    <div class="font-medium">{{ cls.duration || 'N/A' }}h</div>
                    <div class="text-gray-500">Duration</div>
                  </div>
                  <div class="text-center">
                    <div class="font-medium">{{ cls.type }}</div>
                    <div class="text-gray-500">Type</div>
                  </div>
                  <div class="text-center">
                    <div class="font-medium">{{ cls.status }}</div>
                    <div class="text-gray-500">Status</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Skill Tree -->
      <div class="space-y-6">
        <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-4 sm:p-6 border-b border-gray-100">
            <h2 class="text-lg sm:text-xl font-bold text-gray-800">Skill Tree</h2>
            <p class="text-gray-600 text-sm mt-1">Track your skill development</p>
          </div>
          <div class="p-4 sm:p-6">
            <div class="space-y-4">
              <div v-for="skillTree in skillTreeStore.skillTrees" :key="skillTree._id" class="space-y-3">
                <!-- Category Header -->
                <button 
                  @click="toggleSkillTree(skillTree.name)"
                  class="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-gray-800">{{ skillTree.name }}</span>
                    <span v-if="isSkillTreeUsedInClasses(skillTree._id)" class="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">
                      {{ getClassesUsingSkillTree(skillTree._id).length }} class{{ getClassesUsingSkillTree(skillTree._id).length !== 1 ? 'es' : '' }}
                    </span>
                  </div>
                  <TrendingUpOutline class="w-4 h-4 text-gray-500" />
                </button>
                
                <!-- Skill Tree Details -->
                <div v-if="expandSkillTree.has(skillTree.name)" class="ml-4 space-y-3">
                  <div class="space-y-2">
                    <h4 class="font-medium text-gray-700 text-sm">{{ skillTree.description }}</h4>
                    <div class="flex items-center gap-2 mb-3">
                      <span class="text-xs text-gray-500">{{ getSkillTreeSkillCount(skillTree) }} skills</span>
                      <span class="text-xs text-gray-400">•</span>
                      <span class="text-xs text-gray-500">{{ skillTree.type }}</span>
                    </div>
                    
                    <!-- Skills Tree Structure -->
                    <div v-if="skillTree.structure?.roots" class="space-y-2">
                      <div v-for="(rootNode, rootIndex) in skillTree.structure.roots" :key="`root-${rootIndex}`" class="space-y-2">
                        <!-- Root Skill -->
                        <div class="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div class="flex items-center gap-2 flex-1">
                            <div class="w-2 h-2 rounded-full" :style="`background-color: ${rootNode.skillId?.color || '#3B82F6'}`"></div>
                            <span class="text-sm font-medium text-gray-800">{{ rootNode.skillId?.name || 'Unknown Skill' }}</span>
                            <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              {{ rootNode.skillId?.level || 'beginner' }}
                            </span>
                            <span v-if="rootNode.properties?.required" class="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">
                              Required
                            </span>
                          </div>
                          <div class="flex items-center gap-2">
                            <div class="w-16 bg-gray-200 rounded-full h-1.5">
                              <div class="bg-gradient-to-r from-green-400 to-blue-500 h-1.5 rounded-full transition-all duration-300" 
                                   :style="`width: ${getSkillProgress(rootNode.skillId?.name || '')}%`"></div>
                            </div>
                            <span class="text-xs text-gray-500">{{ getSkillProgress(rootNode.skillId?.name || '') }}%</span>
                          </div>
                        </div>
                        
                        <!-- Child Skills -->
                        <div v-if="rootNode.children && rootNode.children.length > 0" class="ml-4 space-y-2">
                          <div v-for="(childNode, childIndex) in rootNode.children" :key="`child-${rootIndex}-${childIndex}`" class="space-y-2">
                            <!-- Child Skill -->
                            <div class="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                              <div class="flex items-center gap-2 flex-1">
                                <div class="w-2 h-2 rounded-full" :style="`background-color: ${childNode.skillId?.color || '#3B82F6'}`"></div>
                                <span class="text-sm font-medium text-gray-800">{{ childNode.skillId?.name || 'Unknown Skill' }}</span>
                                <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                  {{ childNode.skillId?.level || 'beginner' }}
                                </span>
                                <span v-if="childNode.properties?.required" class="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">
                                  Required
                                </span>
                              </div>
                              <div class="flex items-center gap-2">
                                <div class="w-16 bg-gray-200 rounded-full h-1.5">
                                  <div class="bg-gradient-to-r from-green-400 to-blue-500 h-1.5 rounded-full transition-all duration-300" 
                                       :style="`width: ${getSkillProgress(childNode.skillId?.name || '')}%`"></div>
                                </div>
                                <span class="text-xs text-gray-500">{{ getSkillProgress(childNode.skillId?.name || '') }}%</span>
                              </div>
                            </div>
                            
                            <!-- Grandchild Skills -->
                            <div v-if="childNode.children && childNode.children.length > 0" class="ml-4 space-y-2">
                              <div v-for="(grandchildNode, grandchildIndex) in childNode.children" :key="`grandchild-${rootIndex}-${childIndex}-${grandchildIndex}`">
                                <div class="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                  <div class="flex items-center gap-2 flex-1">
                                    <div class="w-2 h-2 rounded-full" :style="`background-color: ${grandchildNode.skillId?.color || '#3B82F6'}`"></div>
                                    <span class="text-sm font-medium text-gray-800">{{ grandchildNode.skillId?.name || 'Unknown Skill' }}</span>
                                    <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                      {{ grandchildNode.skillId?.level || 'beginner' }}
                                    </span>
                                    <span v-if="grandchildNode.properties?.required" class="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">
                                      Required
                                    </span>
                                  </div>
                                  <div class="flex items-center gap-2">
                                    <div class="w-16 bg-gray-200 rounded-full h-1.5">
                                      <div class="bg-gradient-to-r from-green-400 to-blue-500 h-1.5 rounded-full transition-all duration-300" 
                                           :style="`width: ${getSkillProgress(grandchildNode.skillId?.name || '')}%`"></div>
                                    </div>
                                    <span class="text-xs text-gray-500">{{ getSkillProgress(grandchildNode.skillId?.name || '') }}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- No Skills Message -->
                    <div v-else class="text-center py-4 text-gray-500 text-sm">
                      No skills assigned to this tree yet
                    </div>
                    
                    <!-- Classes Using This Skill Tree -->
                    <div v-if="isSkillTreeUsedInClasses(skillTree._id)" class="mt-4 pt-4 border-t border-gray-200">
                      <h5 class="text-sm font-medium text-gray-700 mb-2">Used in Classes:</h5>
                      <div class="space-y-1">
                        <div v-for="cls in getClassesUsingSkillTree(skillTree._id)" :key="cls._id" 
                             class="flex items-center gap-2 p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                             @click="viewClassDetails(cls._id)">
                          <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span class="text-sm text-blue-700">{{ cls.name }}</span>
                          <span class="text-xs text-blue-500">({{ cls.code }})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-4 sm:p-6 border-b border-gray-100">
            <h2 class="text-lg sm:text-xl font-bold text-gray-800">Learning Stats</h2>
          </div>
          <div class="p-4 sm:p-6 space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Total Classes</span>
              <span class="font-bold text-gray-800">{{ classStore.classes.length }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Active Classes</span>
              <span class="font-bold text-blue-600">{{ classStore.activeClasses.length }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Total Students</span>
              <span class="font-bold text-gray-800">{{ classStore.classes.reduce((acc, cls) => acc + cls.enrolledStudents, 0) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Skill Trees Covered</span>
              <span class="font-bold text-green-600">{{ new Set(classStore.classes.flatMap(cls => cls.skillTrees.map(s => s.skillTree._id))).size }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Class Modal -->
    <ClassModal
      :is-open="showModal"
      :class-data="editingClass"
      @close="closeModal"
      @saved="handleClassSaved"
    />
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 