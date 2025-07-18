<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserManagement, type UserManagementUser, type Class } from '@/stores/userManagement'
import { useUser } from '@/stores/user'
import { useToast } from 'vue-toastification'
import SkillRatingComponent from '@/components/SkillRatingComponent.vue'
import { 
  ArrowBackOutline,
  PersonOutline,
  MailOutline,
  CalendarOutline,
  ShieldCheckmarkOutline,
  BookOutline,
  CreateOutline,
  TrashOutline,
  TimeOutline,
  GlobeOutline,
  TrophyOutline,
  TrendingUpOutline,
  AddOutline,
  CloseOutline,
  SaveOutline
} from '@vicons/ionicons5'
import { getSrc } from '@/utils'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const route = useRoute()
const router = useRouter()
const userManagement = useUserManagement()
const userStore = useUser()
const toast = useToast()

// State
const loading = ref(true)
const user = ref<UserManagementUser | null>(null)
const userClasses = ref<Class[]>([])
const availableClasses = ref<Class[]>([])
const selectedClassId = ref('')
const isEditing = ref(false)
const showClassModal = ref(false)
const showDeleteModal = ref(false)

// Edit form
const editForm = ref({
  name: '',
  username: '',
  email: '',
  type: 'user',
  language: 'en',
  gender: '',
  isActivated: true
})

// Computed
const userStats = computed(() => {
  if (!user.value) return null
  
  return {
    totalClasses: userClasses.value.length,
    activeClasses: userClasses.value.filter(c => c.status === 'active').length,
    completedClasses: userClasses.value.filter(c => c.status === 'completed').length,
    daysSinceJoined: dayjs().diff(dayjs(user.value.createdAt), 'day'),
    isOnline: user.value.isOnline || false,
    lastSeen: user.value.lastLogin ? dayjs(user.value.lastLogin).fromNow() : 'Never'
  }
})

const userTypeColor = computed(() => {
  if (!user.value) return 'gray'
  
  switch (user.value.type) {
    case 'admin': return 'purple'
    case 'teacher': return 'blue'
    case 'kid': return 'orange'
    default: return 'gray'
  }
})

const userStatusColor = computed(() => {
  if (!user.value) return 'gray'
  return user.value.isActivated ? 'green' : 'red'
})

// Methods
const loadUser = async () => {
  const userId = route.params.id as string
  if (!userId) {
    toast.error('User ID is required')
    router.push('/user-management')
    return
  }

  try {
    loading.value = true
    const userData = await userManagement.fetchUserById(userId)
    user.value = userData
    
    // Load user classes
    await userManagement.fetchUserClasses(userId)
    userClasses.value = userManagement.userClasses
    
    // Load available classes for assignment
    await userManagement.fetchClasses()
    availableClasses.value = userManagement.classes
    
    // Initialize edit form
    editForm.value = {
      name: userData.name,
      username: userData.username,
      email: userData.email,
      type: userData.type,
      language: userData.language,
      gender: userData.gender || '',
      isActivated: userData.isActivated
    }
  } catch (error) {
    toast.error('Failed to load user details')
    router.push('/user-management')
  } finally {
    loading.value = false
  }
}

const saveUser = async () => {
  if (!user.value) return
  
  try {
    await userManagement.updateUser(user.value._id, editForm.value)
    user.value = { ...user.value, ...editForm.value }
    isEditing.value = false
    toast.success('User updated successfully')
  } catch (error) {
    toast.error('Failed to update user')
  }
}

const cancelEdit = () => {
  if (!user.value) return
  
  editForm.value = {
    name: user.value.name,
    username: user.value.username,
    email: user.value.email,
    type: user.value.type,
    language: user.value.language,
    gender: user.value.gender || '',
    isActivated: user.value.isActivated
  }
  isEditing.value = false
}

const deleteUser = async () => {
  if (!user.value) return
  
  try {
    await userManagement.deleteUser(user.value._id)
    toast.success('User deleted successfully')
    router.push('/user-management')
  } catch (error) {
    toast.error('Failed to delete user')
  }
}

const openClassModal = () => {
  showClassModal.value = true
}

const assignClass = async () => {
  if (!selectedClassId.value || !user.value) return
  
  try {
    await userManagement.assignUserToClass(user.value._id, selectedClassId.value, 'assign')
    toast.success('User assigned to class successfully')
    await userManagement.fetchUserClasses(user.value._id)
    userClasses.value = userManagement.userClasses
    selectedClassId.value = ''
    showClassModal.value = false
  } catch (error) {
    toast.error('Failed to assign user to class')
  }
}

const removeClass = async (classId: string) => {
  if (!user.value) return
  
  try {
    await userManagement.assignUserToClass(user.value._id, classId, 'remove')
    toast.success('User removed from class successfully')
    await userManagement.fetchUserClasses(user.value._id)
    userClasses.value = userManagement.userClasses
  } catch (error) {
    toast.error('Failed to remove user from class')
  }
}

const formatDate = (date: string) => {
  return dayjs(date).format('MMM DD, YYYY')
}

const formatDateTime = (date: string) => {
  return dayjs(date).format('MMM DD, YYYY HH:mm')
}

// Lifecycle
onMounted(() => {
  loadUser()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>

    <!-- Main Content -->
    <div v-else-if="user" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-sm rounded-2xl p-6 mb-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button
              @click="router.go(-1)"
              class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <ArrowBackOutline class="w-6 h-6" />
            </button>
            <div class="flex items-center gap-4">
              <div class="relative">
                <div class="w-16 h-16 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                  <img 
                    :src="getSrc(user.photoUrl || '', true) || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'" 
                    :alt="user.name"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div 
                  class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full ring-4 ring-white"
                  :class="{
                    'bg-green-500': user.isOnline,
                    'bg-gray-400': !user.isOnline
                  }"
                ></div>
              </div>
              <div>
                <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {{ user.name }}
                </h1>
                <p class="text-gray-600 text-lg">@{{ user.username }}</p>
                <div class="flex items-center gap-2 mt-2">
                  <span 
                    :class="{
                      'badge badge-primary': user.type === 'admin',
                      'badge badge-secondary': user.type === 'user',
                      'badge badge-accent': user.type === 'teacher',
                      'badge badge-outline': user.type === 'kid'
                    }"
                  >
                    {{ user.type }}
                  </span>
                  <div class="flex items-center gap-1">
                    <div 
                      :class="{
                        'w-2 h-2 rounded-full': true,
                        'bg-green-500': user.isActivated,
                        'bg-red-500': !user.isActivated
                      }"
                    ></div>
                    <span :class="{
                      'text-green-600': user.isActivated,
                      'text-red-600': !user.isActivated
                    }">
                      {{ user.isActivated ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button
              v-if="!isEditing"
              @click="isEditing = true"
              class="btn bg-gradient-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              <CreateOutline class="w-4 h-4 mr-2" />
              Edit User
            </button>
            <div v-else class="flex gap-2">
              <button
                @click="saveUser"
                class="btn bg-gradient-to-r from-green-500 to-blue-500 border-0 hover:from-green-600 hover:to-blue-600 text-white"
                :disabled="userManagement.loading"
              >
                <SaveOutline class="w-4 h-4 mr-2" />
                <span v-if="userManagement.loading" class="loading loading-spinner loading-sm"></span>
                <span v-else>Save</span>
              </button>
              <button
                @click="cancelEdit"
                class="btn btn-outline"
              >
                Cancel
              </button>
            </div>
            <button
              @click="showDeleteModal = true"
              class="btn btn-outline btn-error"
              :disabled="user.type === 'admin'"
            >
              <TrashOutline class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div v-if="userStats" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
              <BookOutline class="w-6 h-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Classes</p>
              <p class="text-2xl font-bold text-gray-900">{{ userStats.totalClasses }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
              <TrendingUpOutline class="w-6 h-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Active Classes</p>
              <p class="text-2xl font-bold text-gray-900">{{ userStats.activeClasses }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
              <TrophyOutline class="w-6 h-6 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Completed</p>
              <p class="text-2xl font-bold text-gray-900">{{ userStats.completedClasses }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
              <TimeOutline class="w-6 h-6 text-orange-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Days Member</p>
              <p class="text-2xl font-bold text-gray-900">{{ userStats.daysSinceJoined }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column - User Information -->
        <div class="lg:col-span-2 space-y-8">
          <!-- User Information -->
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
            <div class="p-6 border-b border-gray-200/50">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-xl font-bold text-gray-900">User Information</h2>
                  <p class="text-gray-600 mt-1">Complete details about this user</p>
                </div>
                <div class="flex items-center gap-2">
                  <span 
                    :class="{
                      'inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full shadow-sm': true,
                      'bg-gradient-to-r from-green-100 to-green-200 text-green-800': user.isActivated,
                      'bg-gradient-to-r from-red-100 to-red-200 text-red-800': !user.isActivated
                    }"
                  >
                    <div 
                      :class="{
                        'w-2 h-2 rounded-full mr-2': true,
                        'bg-green-500': user.isActivated,
                        'bg-red-500': !user.isActivated
                      }"
                    ></div>
                    {{ user.isActivated ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="p-6">
              <template v-if="isEditing">
                <form @submit.prevent="saveUser" class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium text-gray-700">Name</span>
                      </label>
                      <input
                        v-model="editForm.name"
                        type="text"
                        class="input input-bordered w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium text-gray-700">Username</span>
                      </label>
                      <input
                        v-model="editForm.username"
                        type="text"
                        class="input input-bordered w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium text-gray-700">Email</span>
                      </label>
                      <input
                        v-model="editForm.email"
                        type="email"
                        class="input input-bordered w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        disabled
                      />
                    </div>
                    
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium text-gray-700">Type</span>
                      </label>
                      <select
                        v-model="editForm.type"
                        class="select select-bordered w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="teacher">Teacher</option>
                        <option value="kid">Kid</option>
                      </select>
                    </div>
                    
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium text-gray-700">Language</span>
                      </label>
                      <select
                        v-model="editForm.language"
                        class="select select-bordered w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="tr">Turkish</option>
                      </select>
                    </div>
                    
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium text-gray-700">Gender</span>
                      </label>
                      <select
                        v-model="editForm.gender"
                        class="select select-bordered w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Not specified</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-4">
                    <label class="label cursor-pointer">
                      <input
                        v-model="editForm.isActivated"
                        type="checkbox"
                        class="checkbox checkbox-primary"
                      />
                      <span class="label-text ml-2">Active Account</span>
                    </label>
                  </div>
                </form>
              </template>
              <template v-else>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-4">
                    <div class="flex items-center gap-3">
                      <PersonOutline class="w-5 h-5 text-gray-400" />
                      <div>
                        <p class="text-sm font-medium text-gray-600">Full Name</p>
                        <p class="text-gray-900">{{ user.name }}</p>
                      </div>
                    </div>
                    
                    <div class="flex items-center gap-3">
                      <MailOutline class="w-5 h-5 text-gray-400" />
                      <div>
                        <p class="text-sm font-medium text-gray-600">Email</p>
                        <p class="text-gray-900">{{ user.email }}</p>
                      </div>
                    </div>
                    
                    <div class="flex items-center gap-3">
                      <GlobeOutline class="w-5 h-5 text-gray-400" />
                      <div>
                        <p class="text-sm font-medium text-gray-600">Language</p>
                        <p class="text-gray-900">{{ user.language === 'en' ? 'English' : 'Turkish' }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="space-y-4">
                    <div class="flex items-center gap-3">
                      <ShieldCheckmarkOutline class="w-5 h-5 text-gray-400" />
                      <div>
                        <p class="text-sm font-medium text-gray-600">Account Type</p>
                        <p class="text-gray-900 capitalize">{{ user.type }}</p>
                      </div>
                    </div>
                    
                    <div class="flex items-center gap-3">
                      <CalendarOutline class="w-5 h-5 text-gray-400" />
                      <div>
                        <p class="text-sm font-medium text-gray-600">Joined</p>
                        <p class="text-gray-900">{{ formatDate(user.createdAt) }}</p>
                      </div>
                    </div>
                    
                    <div class="flex items-center gap-3">
                      <TimeOutline class="w-5 h-5 text-gray-400" />
                      <div>
                        <p class="text-sm font-medium text-gray-600">Last Login</p>
                        <p class="text-gray-900">{{ user.lastLogin ? formatDateTime(user.lastLogin) : 'Never' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- Class Assignments -->
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden" v-if="user.type === 'user' || user.type === 'kid'">
            <div class="p-6 border-b border-gray-200/50">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-xl font-bold text-gray-900">Class Assignments</h2>
                  <p class="text-gray-600 mt-1">{{ userClasses.length }} classes assigned</p>
                </div>
                <button 
                  @click="openClassModal"
                  class="btn bg-gradient-to-r from-green-500 to-blue-500 border-0 hover:from-green-600 hover:to-blue-600 text-white"
                >
                  <AddOutline class="w-4 h-4 mr-2" />
                  Assign Class
                </button>
              </div>
            </div>
            <div class="p-6">
              <div v-if="userClasses.length > 0" class="space-y-4">
                <div
                  v-for="cls in userClasses"
                  :key="cls._id"
                  class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                      <BookOutline class="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900">{{ cls.name }}</h3>
                      <p class="text-sm text-gray-600">{{ cls.description || 'No description' }}</p>
                      <p class="text-xs text-gray-500">Created {{ formatDate(cls.createdAt) }}</p>
                    </div>
                  </div>
                  <button
                    @click="removeClass(cls._id)"
                    class="btn btn-sm btn-ghost text-red-600 hover:bg-red-50"
                    title="Remove from class"
                  >
                    <CloseOutline class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div v-else class="text-center py-12">
                <div class="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOutline class="w-8 h-8 text-gray-400" />
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No classes assigned</h3>
                <p class="text-gray-600 mb-4">This user hasn't been assigned to any classes yet</p>
                <button 
                  @click="openClassModal"
                  class="btn bg-gradient-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 text-white"
                >
                  <AddOutline class="w-4 h-4 mr-2" />
                  Assign First Class
                </button>
              </div>
            </div>
          </div>

          <!-- Skill Ratings -->
          <div v-if="user.type === 'user' || user.type === 'kid'" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
            <div class="p-6 border-b border-gray-200/50">
              <SkillRatingComponent 
                :user-id="user._id"
                :user-name="user.name"
                :user-type="user.type"
              />
            </div>
          </div>
        </div>

        <!-- Right Column - Sidebar -->
        <div class="space-y-8">
          <!-- Account Status -->
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
            <div class="p-6 border-b border-gray-200/50">
              <h2 class="text-xl font-bold text-gray-900">Account Status</h2>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-600">Status</span>
                  <span :class="{
                    'text-green-600': user.isActivated,
                    'text-red-600': !user.isActivated
                  }">
                    {{ user.isActivated ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-600">Verified</span>
                  <span :class="{
                    'text-green-600': user.isVerified,
                    'text-red-600': !user.isVerified
                  }">
                    {{ user.isVerified ? 'Yes' : 'No' }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-600">Premium</span>
                  <span :class="{
                    'text-green-600': user.isPremium,
                    'text-gray-600': !user.isPremium
                  }">
                    {{ user.isPremium ? 'Yes' : 'No' }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-600">Online Status</span>
                  <span :class="{
                    'text-green-600': user.isOnline,
                    'text-gray-600': !user.isOnline
                  }">
                    {{ user.isOnline ? 'Online' : 'Offline' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Activity Summary -->
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
            <div class="p-6 border-b border-gray-200/50">
              <h2 class="text-xl font-bold text-gray-900">Activity Summary</h2>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <span class="text-sm font-medium text-gray-700">Member Since</span>
                  <p class="text-blue-800 font-semibold">{{ formatDate(user.createdAt) }}</p>
                </div>
                <div class="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                  <span class="text-sm font-medium text-gray-700">Last Updated</span>
                  <p class="text-green-800 font-semibold">{{ formatDate(user.updatedAt) }}</p>
                </div>
                <div class="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                  <span class="text-sm font-medium text-gray-700">Last Login</span>
                  <p class="text-purple-800 font-semibold">{{ user.lastLogin ? formatDateTime(user.lastLogin) : 'Never' }}</p>
                </div>
                <div class="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                  <span class="text-sm font-medium text-gray-700">Days Active</span>
                  <p class="text-orange-800 font-semibold">{{ userStats?.daysSinceJoined || 0 }} days</p>
                </div>
              </div>
            </div>
          </div>

      
        </div>
      </div>
    </div>

    <!-- Class Assignment Modal -->
    <div v-if="showClassModal" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-lg mb-4">
          Assign Class to {{ user?.name }}
        </h3>
        
        <div class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Select Class</span>
            </label>
            <select
              v-model="selectedClassId"
              class="select select-bordered w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a class...</option>
              <option
                v-for="cls in availableClasses.filter(c => !userClasses.find(uc => uc._id === c._id))"
                :key="cls._id"
                :value="cls._id"
              >
                {{ cls.name }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="modal-action">
          <button
            @click="showClassModal = false"
            class="btn btn-outline"
          >
            Cancel
          </button>
          <button
            @click="assignClass"
            class="btn bg-gradient-to-r from-green-500 to-blue-500 border-0 hover:from-green-600 hover:to-blue-600 text-white"
            :disabled="!selectedClassId || userManagement.loading"
          >
            <span v-if="userManagement.loading" class="loading loading-spinner loading-sm"></span>
            <span v-else>Assign</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal modal-open">
      <div class="modal-box max-w-md">
        <h3 class="font-bold text-lg mb-4 text-red-600">
          Delete User
        </h3>
        
        <p class="text-gray-700 mb-6">
          Are you sure you want to delete <strong>{{ user?.name }}</strong>? This action cannot be undone.
        </p>
        
        <div class="modal-action">
          <button
            @click="showDeleteModal = false"
            class="btn btn-outline"
          >
            Cancel
          </button>
          <button
            @click="deleteUser"
            class="btn btn-error"
            :disabled="userManagement.loading"
          >
            <span v-if="userManagement.loading" class="loading loading-spinner loading-sm"></span>
            <span v-else>Delete User</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  @apply z-50;
}

.modal-box {
  @apply max-h-[90vh] overflow-y-auto;
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style> 