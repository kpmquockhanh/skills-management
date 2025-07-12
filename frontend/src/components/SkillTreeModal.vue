<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="close"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
        <form @submit.prevent="handleSubmit">
          <!-- Header -->
          <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900">
                {{ skillTree ? 'Edit Skill Tree' : 'Create New Skill Tree' }}
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
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter skill tree name"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    v-model="form.type"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="career">Career</option>
                    <option value="domain">Domain</option>
                    <option value="technology">Technology</option>
                    <option value="role">Role</option>
                    <option value="certification">Certification</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter skill tree description"
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
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Brief description (max 200 characters)"
                ></textarea>
                <p class="text-xs text-gray-500 mt-1">{{ form.shortDescription?.length || 0 }}/200</p>
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
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., 🌳, 🎯, 🚀"
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
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="#10B981"
                    />
                  </div>
                </div>
              </div>

              <!-- Status -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  v-model="form.status"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
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
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Press Enter to add tags"
                />
                <div class="flex flex-wrap gap-2 mt-2">
                  <span
                    v-for="tag in form.tags"
                    :key="tag"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {{ tag }}
                    <button
                      type="button"
                      @click="removeTag(tag)"
                      class="ml-1 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                </div>
              </div>

              <!-- Settings -->
              <div class="border-t border-gray-200 pt-6">
                <h4 class="text-md font-medium text-gray-900 mb-4">Tree Settings</h4>
                <div class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label class="flex items-center">
                      <input
                        v-model="form.settings.allowCustomPaths"
                        type="checkbox"
                        class="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span class="ml-2 text-sm text-gray-700">Allow Custom Paths</span>
                    </label>
                    
                    <label class="flex items-center">
                      <input
                        v-model="form.settings.requireSequentialLearning"
                        type="checkbox"
                        class="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span class="ml-2 text-sm text-gray-700">Require Sequential Learning</span>
                    </label>
                    
                    <label class="flex items-center">
                      <input
                        v-model="form.settings.allowSkillSkipping"
                        type="checkbox"
                        class="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span class="ml-2 text-sm text-gray-700">Allow Skill Skipping</span>
                    </label>
                    
                    <label class="flex items-center">
                      <input
                        v-model="form.settings.enableProgressTracking"
                        type="checkbox"
                        class="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span class="ml-2 text-sm text-gray-700">Enable Progress Tracking</span>
                    </label>
                    
                    <label class="flex items-center">
                      <input
                        v-model="form.settings.enableCertification"
                        type="checkbox"
                        class="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span class="ml-2 text-sm text-gray-700">Enable Certification</span>
                    </label>
                    
                    <label class="flex items-center">
                      <input
                        v-model="form.settings.isPublic"
                        type="checkbox"
                        class="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span class="ml-2 text-sm text-gray-700">Public Tree</span>
                    </label>
                    
                    <label class="flex items-center">
                      <input
                        v-model="form.settings.allowForking"
                        type="checkbox"
                        class="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span class="ml-2 text-sm text-gray-700">Allow Forking</span>
                    </label>
                  </div>
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
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {{ loading ? 'Saving...' : (skillTree ? 'Update Skill Tree' : 'Create Skill Tree') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { CloseOutline } from '@vicons/ionicons5'
import { useSkillTreeStore, type SkillTree } from '../stores/skillTree'

// Props
interface Props {
  isOpen: boolean
  skillTree?: SkillTree | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  saved: [skillTree: SkillTree]
}>()

// Store
const skillTreeStore = useSkillTreeStore()

// Form state
const form = ref({
  name: '',
  description: '',
  shortDescription: '',
  type: 'career' as 'career' | 'domain' | 'technology' | 'role' | 'certification' | 'custom',
  status: 'active' as 'active' | 'inactive' | 'draft' | 'archived',
  icon: '',
  color: '#10B981',
  tags: [] as string[],
  settings: {
    allowCustomPaths: true,
    requireSequentialLearning: false,
    allowSkillSkipping: false,
    enableProgressTracking: true,
    enableCertification: false,
    isPublic: true,
    allowForking: false
  }
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

const handleSubmit = async () => {
  try {
    loading.value = true
    
    const treeData = {
      ...form.value
    }
    
    if (props.skillTree) {
      const updatedSkillTree = await skillTreeStore.updateSkillTree(props.skillTree._id, treeData)
      emit('saved', updatedSkillTree)
    } else {
      const newSkillTree = await skillTreeStore.createSkillTree(treeData)
      emit('saved', newSkillTree)
    }
  } catch (error) {
    console.error('Error saving skill tree:', error)
  } finally {
    loading.value = false
  }
}

// Watch for skill tree changes and populate form
watch(() => props.skillTree, (newSkillTree) => {
  if (newSkillTree) {
    form.value = {
      name: newSkillTree.name,
      description: newSkillTree.description || '',
      shortDescription: newSkillTree.shortDescription || '',
      type: newSkillTree.type,
      status: newSkillTree.status,
      icon: newSkillTree.icon || '',
      color: newSkillTree.color || '#10B981',
      tags: [...(newSkillTree.tags || [])],
      settings: {
        allowCustomPaths: newSkillTree.settings?.allowCustomPaths ?? true,
        requireSequentialLearning: newSkillTree.settings?.requireSequentialLearning ?? false,
        allowSkillSkipping: newSkillTree.settings?.allowSkillSkipping ?? false,
        enableProgressTracking: newSkillTree.settings?.enableProgressTracking ?? true,
        enableCertification: newSkillTree.settings?.enableCertification ?? false,
        isPublic: newSkillTree.settings?.isPublic ?? true,
        allowForking: newSkillTree.settings?.allowForking ?? false
      }
    }
  } else {
    // Reset form for new skill tree
    form.value = {
      name: '',
      description: '',
      shortDescription: '',
      type: 'career',
      status: 'active',
      icon: '',
      color: '#10B981',
      tags: [],
      settings: {
        allowCustomPaths: true,
        requireSequentialLearning: false,
        allowSkillSkipping: false,
        enableProgressTracking: true,
        enableCertification: false,
        isPublic: true,
        allowForking: false
      }
    }
  }
}, { immediate: true })
</script> 