<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="close"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <form @submit.prevent="handleSubmit">
          <!-- Header -->
          <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900">
                {{ skill ? 'Edit Skill' : 'Create New Skill' }}
              </h3>
              <button
                type="button"
                @click="close"
                class="text-gray-400 hover:text-gray-600"
              >
                <CloseOutline class="w-6 h-6" />
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="px-6 py-4 max-h-96 overflow-y-auto">
            <div class="space-y-6">
              <!-- Basic Information -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    v-model="form.name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter skill name"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <input
                    v-model="form.category"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Programming, Design"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter skill description"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Short Description
                </label>
                <textarea
                  v-model="form.shortDescription"
                  rows="2"
                  maxlength="200"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description (max 200 characters)"
                ></textarea>
                <p class="text-xs text-gray-500 mt-1">{{ form.shortDescription?.length || 0 }}/200</p>
              </div>

              <!-- Skill Properties -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Level
                  </label>
                  <select
                    v-model="form.level"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    v-model="form.type"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="technical">Technical</option>
                    <option value="soft">Soft Skills</option>
                    <option value="domain">Domain</option>
                    <option value="tool">Tool</option>
                    <option value="framework">Framework</option>
                    <option value="language">Language</option>
                    <option value="methodology">Methodology</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    v-model="form.status"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="deprecated">Deprecated</option>
                    <option value="emerging">Emerging</option>
                  </select>
                </div>
              </div>

              <!-- Visual Properties -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Icon
                  </label>
                  <input
                    v-model="form.icon"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 🚀, ⚡, 💻"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div class="flex items-center gap-2">
                    <input
                      v-model="form.color"
                      type="color"
                      class="w-12 h-10 border border-gray-300 rounded-lg"
                    />
                    <input
                      v-model="form.color"
                      type="text"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
              </div>

              <!-- Advanced Properties -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty (1-10)
                  </label>
                  <input
                    v-model.number="form.difficulty"
                    type="number"
                    min="1"
                    max="10"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Market Demand (1-10)
                  </label>
                  <input
                    v-model.number="form.marketDemand"
                    type="number"
                    min="1"
                    max="10"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Time (hours)
                  </label>
                  <input
                    v-model.number="form.estimatedTime"
                    type="number"
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <!-- Tags -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  v-model="tagInput"
                  @keydown.enter.prevent="addTag"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Press Enter to add tags"
                />
                <div class="flex flex-wrap gap-2 mt-2">
                  <span
                    v-for="tag in form.tags"
                    :key="tag"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {{ tag }}
                    <button
                      type="button"
                      @click="removeTag(tag)"
                      class="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                </div>
              </div>

              <!-- Learning Objectives -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Learning Objectives
                </label>
                <div class="space-y-2">
                  <div
                    v-for="(objective, index) in form.learningObjectives"
                    :key="index"
                    class="flex items-center gap-2"
                  >
                    <input
                      v-model="form.learningObjectives[index]"
                      type="text"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter learning objective"
                    />
                    <button
                      type="button"
                      @click="removeObjective(index)"
                      class="text-red-600 hover:text-red-800"
                    >
                      <TrashOutline class="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    @click="addObjective"
                    class="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Objective
                  </button>
                </div>
              </div>

              <!-- Key Concepts -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Key Concepts
                </label>
                <div class="space-y-2">
                  <div
                    v-for="(concept, index) in form.keyConcepts"
                    :key="index"
                    class="flex items-center gap-2"
                  >
                    <input
                      v-model="form.keyConcepts[index]"
                      type="text"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter key concept"
                    />
                    <button
                      type="button"
                      @click="removeConcept(index)"
                      class="text-red-600 hover:text-red-800"
                    >
                      <TrashOutline class="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    @click="addConcept"
                    class="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Concept
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              @click="close"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {{ loading ? 'Saving...' : (skill ? 'Update Skill' : 'Create Skill') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CloseOutline, TrashOutline } from '@vicons/ionicons5'
import { useSkillStore, type Skill, type UpdateSkillData, type CreateSkillData } from '../stores/skill'

// Props
interface Props {
  isOpen: boolean
  skill?: Skill | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  saved: [skill: Skill]
}>()

// Store
const skillStore = useSkillStore()

// Form state
const form = ref({
  name: '',
  description: '',
  shortDescription: '',
  category: '',
  subcategory: '',
  level: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
  type: 'technical' as 'technical' | 'soft' | 'domain' | 'tool' | 'framework' | 'language' | 'methodology',
  status: 'active' as 'active' | 'inactive' | 'deprecated' | 'emerging',
  icon: '',
  color: '#3B82F6',
  learningObjectives: [] as string[],
  keyConcepts: [] as string[],
  estimatedTime: 0,
  difficulty: 5,
  marketDemand: 5,
  salaryImpact: 0,
  tags: [] as string[]
})

// UI state
const loading = ref(false)
const tagInput = ref('')

// Methods
const close = () => {
  emit('close')
}

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (tag: string) => {
  form.value.tags = form.value.tags.filter(t => t !== tag)
}

const addObjective = () => {
  form.value.learningObjectives.push('')
}

const removeObjective = (index: number) => {
  form.value.learningObjectives.splice(index, 1)
}

const addConcept = () => {
  form.value.keyConcepts.push('')
}

const removeConcept = (index: number) => {
  form.value.keyConcepts.splice(index, 1)
}

const handleSubmit = async () => {
  try {
    loading.value = true
    
    const skillData = {
      ...form.value,
      learningObjectives: form.value.learningObjectives.filter(obj => obj.trim()),
      keyConcepts: form.value.keyConcepts.filter(concept => concept.trim())
    }
    
    if (props.skill) {
      const updatedSkill = await skillStore.updateSkill(props.skill._id, skillData as unknown as UpdateSkillData)
      emit('saved', updatedSkill)
    } else {
      const newSkill = await skillStore.createSkill(skillData as unknown as CreateSkillData)
      emit('saved', newSkill)
    }
  } catch (error) {
    console.error('Error saving skill:', error)
  } finally {
    loading.value = false
  }
}

// Watch for skill changes and populate form
watch(() => props.skill, (newSkill) => {
  if (newSkill) {
    form.value = {
      name: newSkill.name,
      description: newSkill.description || '',
      shortDescription: (newSkill as any).shortDescription || '',
      category: newSkill.category,
      subcategory: (newSkill as any).subcategory || '',
      level: (newSkill.level === 'basic' ? 'beginner' : newSkill.level) as 'beginner' | 'intermediate' | 'advanced' | 'expert',
      type: newSkill.type as 'technical' | 'soft' | 'domain' | 'tool' | 'framework' | 'language' | 'methodology',
      status: newSkill.status as 'active' | 'inactive' | 'deprecated' | 'emerging',
      icon: newSkill.icon || '',
      color: newSkill.color || '#3B82F6',
      learningObjectives: [...((newSkill as any).learningObjectives || [])],
      keyConcepts: [...((newSkill as any).keyConcepts || [])],
      estimatedTime: (newSkill as any).estimatedTime || 0,
      difficulty: (newSkill as any).difficulty || 5,
      marketDemand: (newSkill as any).marketDemand || 5,
      salaryImpact: (newSkill as any).salaryImpact || 0,
      tags: [...((newSkill as any).tags || [])]
    }
  } else {
    // Reset form for new skill
    form.value = {
      name: '',
      description: '',
      shortDescription: '',
      category: '',
      subcategory: '',
      level: 'beginner',
      type: 'technical',
      status: 'active',
      icon: '',
      color: '#3B82F6',
      learningObjectives: [],
      keyConcepts: [],
      estimatedTime: 0,
      difficulty: 5,
      marketDemand: 5,
      salaryImpact: 0,
      tags: []
    }
  }
}, { immediate: true })
</script> 