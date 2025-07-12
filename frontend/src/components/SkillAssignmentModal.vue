<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-gray-900">Assign Skills to Skill Trees</h3>
          <button
            @click="handleClose"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <CloseOutline class="w-6 h-6" />
          </button>
        </div>
      </div>
      
      <div class="p-6">
        <!-- Loading indicator -->
        <div v-if="loading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
          <span class="ml-3 text-gray-600">Loading assignments...</span>
        </div>
        
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Skills List -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-semibold text-gray-900">Available Skills</h4>
              <div class="flex items-center gap-2">
                <input
                  v-model="skillSearch"
                  type="text"
                  placeholder="Search skills..."
                  class="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div class="space-y-2 max-h-96 overflow-y-auto">
              <div
                v-for="skill in filteredSkills"
                :key="skill._id"
                draggable="true"
                @dragstart="onDragStart($event, skill)"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-move border-2 border-transparent hover:border-blue-200"
                :class="{ 'border-blue-400 bg-blue-50': selectedSkill?._id === skill._id }"
                @click="selectSkill(skill)"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    :style="{ backgroundColor: skill.color }"
                  >
                    {{ skill.icon || skill.name.charAt(0) }}
                  </div>
                  <div>
                    <div class="font-medium text-gray-900">{{ skill.name }}</div>
                    <div class="text-sm text-gray-600">{{ skill.category }} • {{ skill.level }}</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span
                    v-for="treeId in getSkillTreeIds(skill._id)"
                    :key="treeId"
                    class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800"
                  >
                    {{ getSkillTreeName(treeId) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Skill Trees List -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-semibold text-gray-900">Skill Trees</h4>
              <div class="flex items-center gap-2">
                <input
                  v-model="skillTreeSearch"
                  type="text"
                  placeholder="Search skill trees..."
                  class="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <div class="space-y-2 max-h-96 overflow-y-auto">
              <div
                v-for="skillTree in filteredSkillTrees"
                :key="skillTree._id"
                @dragover="onDragOver($event)"
                @drop="onDrop($event, skillTree)"
                class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-2 border-dashed border-transparent"
                :class="{ 
                  'border-green-400 bg-green-50': isDragOver(skillTree._id),
                  'border-green-200': !isDragOver(skillTree._id)
                }"
              >
                <div class="flex items-center gap-3 mb-2">
                  <div
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    :style="{ backgroundColor: skillTree.color }"
                  >
                    {{ skillTree.icon || skillTree.name.charAt(0) }}
                  </div>
                  <div>
                    <div class="font-medium text-gray-900">{{ skillTree.name }}</div>
                    <div class="text-sm text-gray-600">{{ skillTree.type }}</div>
                  </div>
                </div>
                
                <!-- Assigned Skills -->
                <div class="mb-3">
                  <div class="text-sm text-gray-600 mb-2">
                    {{ getSkillTreeSkillCount(skillTree._id) }} skills assigned
                  </div>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="skillId in getSkillTreeSkillIds(skillTree._id)"
                      :key="skillId"
                      class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                    >
                      {{ getSkillName(skillId) }}
                      <button
                        @click="removeSkillFromTree(skillId, skillTree._id)"
                        class="text-blue-600 hover:text-blue-800"
                      >
                        <CloseOutline class="w-3 h-3" />
                      </button>
                    </span>
                    <span v-if="getSkillTreeSkillIds(skillTree._id).length === 0" class="text-gray-400 text-xs">
                      Drop skills here
                    </span>
                  </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="flex items-center gap-2">
                  <button
                    @click="selectSkillTree(skillTree)"
                    class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                  >
                    Manage Skills
                  </button>
                  <button
                    @click="clearSkillTree(skillTree._id)"
                    class="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Selected Items Management -->
        <div v-if="selectedSkill || selectedSkillTree" class="mt-8 p-4 bg-gray-50 rounded-lg">
          <h5 class="font-semibold text-gray-900 mb-3">Quick Assignment</h5>
          <div class="flex items-center gap-4">
            <div v-if="selectedSkill" class="flex items-center gap-2">
              <span class="text-sm text-gray-600">Selected Skill:</span>
              <span class="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                <div
                  class="w-4 h-4 rounded flex items-center justify-center text-white text-xs"
                  :style="{ backgroundColor: selectedSkill.color }"
                >
                  {{ selectedSkill.icon || selectedSkill.name.charAt(0) }}
                </div>
                {{ selectedSkill.name }}
              </span>
            </div>
            <div v-if="selectedSkillTree" class="flex items-center gap-2">
              <span class="text-sm text-gray-600">Selected Tree:</span>
              <span class="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                <div
                  class="w-4 h-4 rounded flex items-center justify-center text-white text-xs"
                  :style="{ backgroundColor: selectedSkillTree.color }"
                >
                  {{ selectedSkillTree.icon || selectedSkillTree.name.charAt(0) }}
                </div>
                {{ selectedSkillTree.name }}
              </span>
            </div>
            <div v-if="selectedSkill && selectedSkillTree" class="flex items-center gap-2">
              <button
                @click="assignSkillToTree(selectedSkill._id, selectedSkillTree._id)"
                class="px-3 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition-colors text-sm"
              >
                Assign
              </button>
              <button
                @click="removeSkillFromTree(selectedSkill._id, selectedSkillTree._id)"
                class="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="p-6 border-t border-gray-200 bg-gray-50">
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-600">
            {{ totalAssignments }} skill assignments
          </div>
          <div class="flex gap-3">
            <button
              @click="saveAssignments"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              :disabled="loading"
            >
              <span v-if="loading" class="flex items-center gap-2">
                <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Saving...
              </span>
              <span v-else>Save Assignments</span>
            </button>
            <button
              @click="handleClose"
              class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { CloseOutline } from '@vicons/ionicons5'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  skills: {
    type: Array,
    default: () => []
  },
  skillTrees: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['close', 'save'])

// Reactive data
const skillSearch = ref('')
const skillTreeSearch = ref('')
const selectedSkill = ref(null)
const selectedSkillTree = ref(null)
const dragOverTree = ref(null)
const loading = ref(false)

// Skill-tree assignments (this would come from your backend)
const skillAssignments = ref(new Map()) // Map<skillId, Set<treeId>>
const originalAssignments = ref(new Map()) // Map<skillId, Set<treeId>> - to track what was originally assigned

// Computed properties
const filteredSkills = computed(() => {
  return props.skills.filter(skill => {
    return !skillSearch.value || 
      skill.name.toLowerCase().includes(skillSearch.value.toLowerCase()) ||
      skill.category.toLowerCase().includes(skillSearch.value.toLowerCase())
  })
})

const filteredSkillTrees = computed(() => {
  return props.skillTrees.filter(skillTree => {
    return !skillTreeSearch.value || 
      skillTree.name.toLowerCase().includes(skillTreeSearch.value.toLowerCase()) ||
      skillTree.type.toLowerCase().includes(skillTreeSearch.value.toLowerCase())
  })
})

const totalAssignments = computed(() => {
  let total = 0
  skillAssignments.value.forEach(treeIds => {
    total += treeIds.size
  })
  return total
})

// Methods
const selectSkill = (skill) => {
  selectedSkill.value = skill
  selectedSkillTree.value = null
}

const selectSkillTree = (skillTree) => {
  selectedSkillTree.value = skillTree
  selectedSkill.value = null
}

const resetModal = () => {
  selectedSkill.value = null
  selectedSkillTree.value = null
  skillSearch.value = ''
  skillTreeSearch.value = ''
  dragOverTree.value = null
  skillAssignments.value.clear()
  originalAssignments.value.clear()
}

const handleClose = () => {
  resetModal()
  emit('close')
}

const getSkillTreeIds = (skillId) => {
  const treeIds = skillAssignments.value.get(skillId)
  return treeIds ? Array.from(treeIds) : []
}

const getSkillTreeName = (treeId) => {
  const skillTree = props.skillTrees.find(tree => tree._id === treeId)
  return skillTree ? skillTree.name : 'Unknown'
}

const getSkillTreeSkillIds = (treeId) => {
  const skillIds = []
  skillAssignments.value.forEach((treeIds, skillId) => {
    if (treeIds.has(treeId)) {
      skillIds.push(skillId)
    }
  })
  return skillIds
}

const getSkillTreeSkillCount = (treeId) => {
  return getSkillTreeSkillIds(treeId).length
}

const getSkillName = (skillId) => {
  const skill = props.skills.find(s => s._id === skillId)
  return skill ? skill.name : 'Unknown'
}

const assignSkillToTree = (skillId, treeId) => {
  if (!skillAssignments.value.has(skillId)) {
    skillAssignments.value.set(skillId, new Set())
  }
  skillAssignments.value.get(skillId).add(treeId)
}

const removeSkillFromTree = (skillId, treeId) => {
  const treeIds = skillAssignments.value.get(skillId)
  if (treeIds) {
    treeIds.delete(treeId)
    if (treeIds.size === 0) {
      skillAssignments.value.delete(skillId)
    }
  }
}

const clearSkillTree = (treeId) => {
  skillAssignments.value.forEach((treeIds, skillId) => {
    treeIds.delete(treeId)
    if (treeIds.size === 0) {
      skillAssignments.value.delete(skillId)
    }
  })
}

// Drag and drop handlers
const onDragStart = (event, skill) => {
  event.dataTransfer.setData('text/plain', skill._id)
  event.dataTransfer.effectAllowed = 'copy'
}

const onDragOver = (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'copy'
}

const onDrop = (event, skillTree) => {
  event.preventDefault()
  const skillId = event.dataTransfer.getData('text/plain')
  assignSkillToTree(skillId, skillTree._id)
  dragOverTree.value = null
}

const isDragOver = (treeId) => {
  return dragOverTree.value === treeId
}

const saveAssignments = async () => {
  loading.value = true
  try {
    // Calculate additions and removals
    const additions = []
    const removals = []
    
    // Find additions (skills in current assignments but not in original)
    skillAssignments.value.forEach((treeIds, skillId) => {
      const originalTreeIds = originalAssignments.value.get(skillId) || new Set()
      treeIds.forEach(treeId => {
        if (!originalTreeIds.has(treeId)) {
          additions.push({ skillId, treeId })
        }
      })
    })
    
    // Find removals (skills in original assignments but not in current)
    originalAssignments.value.forEach((treeIds, skillId) => {
      const currentTreeIds = skillAssignments.value.get(skillId) || new Set()
      treeIds.forEach(treeId => {
        if (!currentTreeIds.has(treeId)) {
          removals.push({ skillId, treeId })
        }
      })
    })
    
    console.log('Saving assignments:', { additions, removals })
    
    // Emit both additions and removals to parent component
    emit('save', { additions, removals })
  } catch (error) {
    console.error('Error saving assignments:', error)
  } finally {
    loading.value = false
  }
}

// Load existing assignments when modal opens
const loadExistingAssignments = async () => {
  loading.value = true
  try {
    // Clear existing assignments
    skillAssignments.value.clear()
    originalAssignments.value.clear()
    
    // Load assignments from skill trees
    props.skillTrees.forEach(skillTree => {
      if (skillTree.structure?.roots) {
        collectSkillIdsFromTree(skillTree.structure.roots, skillTree._id)
      }
    })
    
    // Store original assignments for comparison
    skillAssignments.value.forEach((treeIds, skillId) => {
      originalAssignments.value.set(skillId, new Set(treeIds))
    })
    
    console.log('Loaded assignments:', Array.from(skillAssignments.value.entries()))
  } catch (error) {
    console.error('Error loading existing assignments:', error)
  } finally {
    loading.value = false
  }
}

const collectSkillIdsFromTree = (nodes, treeId) => {
  for (const node of nodes) {
    const skillId = node.skillId?._id || node.skillId
    if (skillId) {
      if (!skillAssignments.value.has(skillId)) {
        skillAssignments.value.set(skillId, new Set())
      }
      skillAssignments.value.get(skillId).add(treeId)
    }
    
    if (node.children && node.children.length > 0) {
      collectSkillIdsFromTree(node.children, treeId)
    }
  }
}

// Watch for modal opening to load assignments
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.skills.length > 0 && props.skillTrees.length > 0) {
    loadExistingAssignments()
  }
}, { immediate: true })

// Load existing assignments on mount
onMounted(() => {
  if (props.isOpen && props.skills.length > 0 && props.skillTrees.length > 0) {
    loadExistingAssignments()
  }
})
</script>

<style scoped>
/* Add any additional styles here */
</style> 