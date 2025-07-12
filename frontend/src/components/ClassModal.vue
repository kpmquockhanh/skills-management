<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="closeModal"></div>

      <!-- Modal panel -->
      <div class="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-gray-900">
            {{ isEditing ? 'Edit Class' : 'Create New Class' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <CloseOutline class="w-6 h-6" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Basic Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Class Name *</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter class name"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Class Code *</label>
              <input
                v-model="form.code"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., WEB101"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter class description"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Type *</label>
              <select
                v-model="form.type"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="course">Course</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="tutorial">Tutorial</option>
                <option value="project">Project</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Level *</label>
              <select
                v-model="form.level"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Max Students</label>
              <input
                v-model.number="form.maxStudents"
                type="number"
                min="1"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="50"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
              <input
                v-model.number="form.duration"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 40"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                v-model="form.status"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <!-- Learning Objectives -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Learning Objectives</label>
            <div class="space-y-2">
              <div v-for="(objective, index) in form.objectives" :key="index" class="flex gap-2">
                <input
                  v-model="form.objectives[index]"
                  type="text"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter learning objective"
                />
                <button
                  type="button"
                  @click="removeObjective(index)"
                  class="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  <CloseOutline class="w-5 h-5" />
                </button>
              </div>
              <button
                type="button"
                @click="addObjective"
                class="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add Objective
              </button>
            </div>
          </div>

          <!-- Skill Trees -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Skill Trees</label>
            <div class="space-y-3">
              <div v-for="(skill, index) in form.skillTrees" :key="index" class="flex gap-3 items-center">
                <select
                  v-model="skill.skillTree"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a skill tree</option>
                  <option v-for="availableSkillTree in availableSkillTrees" :key="availableSkillTree._id" :value="availableSkillTree._id">
                    {{ availableSkillTree.name }}
                  </option>
                </select>
                <select
                  v-model="skill.level"
                  class="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <input
                  v-model.number="skill.order"
                  type="number"
                  min="0"
                  class="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Order"
                />
                <label class="flex items-center">
                  <input
                    v-model="skill.isRequired"
                    type="checkbox"
                    class="mr-2"
                  />
                  <span class="text-sm">Required</span>
                </label>
                <button
                  type="button"
                  @click="removeSkillTree(index)"
                  class="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  <CloseOutline class="w-5 h-5" />
                </button>
              </div>
              <button
                type="button"
                @click="addSkillTree"
                class="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add Skill Tree
              </button>
            </div>
          </div>

          <!-- Tags -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(tag, index) in form.tags"
                :key="index"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {{ tag }}
                <button
                  type="button"
                  @click="removeTag(index)"
                  class="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <CloseOutline class="w-4 h-4" />
                </button>
              </span>
              <input
                v-model="newTag"
                @keyup.enter="addTag"
                type="text"
                class="px-3 py-1 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add tag..."
              />
            </div>
          </div>

          <!-- Settings -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Class Settings</label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="flex items-center">
                <input
                  v-model="form.settings.allowSelfEnrollment"
                  type="checkbox"
                  class="mr-2"
                />
                <span class="text-sm">Allow Self Enrollment</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="form.settings.requireApproval"
                  type="checkbox"
                  class="mr-2"
                />
                <span class="text-sm">Require Approval</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="form.settings.isPublic"
                  type="checkbox"
                  class="mr-2"
                />
                <span class="text-sm">Public Class</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="form.settings.allowGuestAccess"
                  type="checkbox"
                  class="mr-2"
                />
                <span class="text-sm">Allow Guest Access</span>
              </label>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              @click="closeModal"
              class="px-6 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-6 py-2 text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {{ loading ? 'Saving...' : (isEditing ? 'Update Class' : 'Create Class') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { CloseOutline } from '@vicons/ionicons5'
import { useClassStore, type Class, type CreateClassData } from '@/stores/class'
import { useSkillTreeStore } from '@/stores/skillTree'

interface Props {
  isOpen: boolean
  classData?: Class | null
}

interface Emits {
  (e: 'close'): void
  (e: 'saved', classData: Class): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const classStore = useClassStore()
const skillTreeStore = useSkillTreeStore()

const loading = ref(false)
const newTag = ref('')

const form = reactive<CreateClassData & { status?: 'active' | 'inactive' | 'archived' | 'draft' }>({
  name: '',
  description: '',
  code: '',
  type: 'course',
  level: 'beginner',
  status: 'draft',
  skillTrees: [],
  objectives: [],
  duration: undefined,
  maxStudents: 50,
  settings: {
    allowSelfEnrollment: true,
    requireApproval: false,
    isPublic: true,
    allowGuestAccess: false
  },
  tags: []
})

const isEditing = computed(() => !!props.classData)

const availableSkillTrees = computed(() => skillTreeStore.skillTrees)

const resetForm = () => {
  Object.assign(form, {
    name: '',
    description: '',
    code: '',
    type: 'course',
    level: 'beginner',
    status: 'draft',
    skillTrees: [],
    objectives: [''],
    duration: undefined,
    maxStudents: 50,
    settings: {
      allowSelfEnrollment: true,
      requireApproval: false,
      isPublic: true,
      allowGuestAccess: false
    },
    tags: []
  })
}

// Watch for class data changes
watch(() => props.classData, (newClass) => {
  if (newClass) {
    // Populate form with existing class data
    Object.assign(form, {
      name: newClass.name,
      description: newClass.description,
      code: newClass.code,
      type: newClass.type,
      level: newClass.level,
      status: newClass.status,
      skillTrees: newClass.skillTrees.map(s => ({
        skillTree: s.skillTree._id,
        level: s.level,
        order: s.order,
        isRequired: s.isRequired
      })),
      objectives: [...newClass.objectives],
      duration: newClass.duration,
      maxStudents: newClass.maxStudents,
      settings: { ...newClass.settings },
      tags: [...(newClass.tags || [])]
    })
  } else {
    // Reset form for new class
    resetForm()
  }
}, { immediate: true })

const addObjective = () => {
  form.objectives.push('')
}

const removeObjective = (index: number) => {
  form.objectives.splice(index, 1)
}

const addSkillTree = () => {
  form.skillTrees.push({
    skillTree: '',
    level: 'basic',
    order: form.skillTrees.length,
    isRequired: true
  })
}

const removeSkillTree = (index: number) => {
  form.skillTrees.splice(index, 1)
}

const addTag = () => {
  if (newTag.value.trim() && !form.tags?.includes(newTag.value.trim())) {
    if (!form.tags) form.tags = []
    form.tags.push(newTag.value.trim())
    newTag.value = ''
  }
}

const removeTag = (index: number) => {
  if (form.tags) {
    form.tags.splice(index, 1)
  }
}

const closeModal = () => {
  emit('close')
  resetForm()
}

const handleSubmit = async () => {
  try {
    loading.value = true
    
    // Filter out empty objectives
    const filteredObjectives = form.objectives.filter(obj => obj.trim())
    
    const classData = {
      ...form,
      objectives: filteredObjectives,
      skillTrees: form.skillTrees.filter(s => s.skillTree), // Filter out skill trees without selection
      status: form.status as 'active' | 'inactive' | 'archived' | 'draft' | undefined
    }
    
    let result
    if (isEditing.value && props.classData) {
      result = await classStore.updateClass(props.classData._id, classData)
    } else {
      result = await classStore.createClass(classData)
    }
    
    emit('saved', result)
    closeModal()
  } catch (error) {
    console.error('Error saving class:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // Load available skill trees if not already loaded
  if (skillTreeStore.skillTrees.length === 0) {
    await skillTreeStore.fetchSkillTrees()
  }
})
</script> 