<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserManagement, type UserManagementUser, type Class } from '@/stores/userManagement'
import { useUser } from '@/stores/user'
import { useToast } from 'vue-toastification'
import { 
  PeopleOutline, 
  SearchOutline, 
  AddOutline, 
  CreateOutline, 
  TrashOutline,
  PersonOutline,
  MailOutline,
  CalendarOutline,
  ShieldCheckmarkOutline,
  BookOutline,
  FilterOutline,
  RefreshOutline,
  CloseOutline,
  CheckmarkOutline,
  CloseCircleOutline
} from '@vicons/ionicons5'
import { getSrc } from '@/utils'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const router = useRouter()
const userManagement = useUserManagement()
const userStore = useUser()
const toast = useToast()

// State
const searchQuery = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const showUserModal = ref(false)
const showClassModal = ref(false)
const selectedUser = ref<UserManagementUser | null>(null)
const editingUser = ref<Partial<UserManagementUser>>({})
const isEditing = ref(false)

// Form data for editing user
const editForm = ref({
  name: '',
  username: '',
  email: '',
  password: '',
  type: 'user',
  language: 'en',
  gender: '',
  isActivated: true
})

// Class assignment
const availableClasses = ref<Class[]>([])
const userClasses = ref<Class[]>([])
const selectedClassId = ref('')

// Computed
const filteredUsers = computed(() => {
  let filtered = userManagement.users

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query)
    )
  }

  if (selectedType.value) {
    filtered = filtered.filter(user => user.type === selectedType.value)
  }

  if (selectedStatus.value) {
    const isActive = selectedStatus.value === 'active'
    filtered = filtered.filter(user => user.isActivated === isActive)
  }

  return filtered
})

const userStats = computed(() => ({
  total: userManagement.users.length,
  active: userManagement.activeUsers.length,
  inactive: userManagement.inactiveUsers.length,
  admin: userManagement.adminUsers.length,
  regular: userManagement.regularUsers.length
}))

// Methods
const loadUsers = async () => {
  try {
    await userManagement.fetchUsers({
      page: currentPage.value,
      limit: 10,
      search: searchQuery.value,
      type: selectedType.value || undefined,
      isActivated: selectedStatus.value === 'active' ? true : selectedStatus.value === 'inactive' ? false : undefined
    })
  } catch (error) {
    toast.error('Failed to load users')
  }
}

const loadClasses = async () => {
  try {
    await userManagement.fetchClasses()
    availableClasses.value = userManagement.classes
  } catch (error) {
    toast.error('Failed to load classes')
  }
}

const openUserModal = (user?: UserManagementUser) => {
  if (user) {
    selectedUser.value = user
    isEditing.value = true
    editForm.value = {
      name: user.name,
      username: user.username,
      email: user.email,
      password: '',
      type: user.type,
      language: user.language,
      gender: user.gender || '',
      isActivated: user.isActivated
    }
  } else {
    selectedUser.value = null
    isEditing.value = false
    editForm.value = {
      name: '',
      username: '',
      email: '',
      password: '',
      type: 'user',
      language: 'en',
      gender: '',
      isActivated: true
    }
  }
  showUserModal.value = true
}

// Add debounced search
let searchTimeout: ReturnType<typeof setTimeout> | null = null
const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadUsers()
  }, 300)
}

const saveUser = async () => {
  try {
    if (isEditing.value && selectedUser.value) {
      await userManagement.updateUser(selectedUser.value._id, editForm.value)
      toast.success('User updated successfully')
    } else {
      // Create new user
      const newUserData = {
        name: editForm.value.name,
        username: editForm.value.username,
        email: editForm.value.email,
        password: editForm.value.password,
        type: editForm.value.type,
        language: editForm.value.language,
        gender: editForm.value.gender,
        isActivated: editForm.value.isActivated,
        isVerified: false, // Default to false for new users
        isPremium: false, // Default to false for new users
        photoUrl: '',
        platform: 'web',
        timezone: 0,
        deviceId: '',
        memoryDate: new Date().toISOString(),
        isOnline: false,
        roles: [],
        permissions: []
      }
      
      await userManagement.createUser(newUserData)
      toast.success('User created successfully')
    }
    showUserModal.value = false
    await loadUsers()
  } catch (error) {
    toast.error('Failed to save user')
  }
}

const deleteUser = async (user: UserManagementUser) => {
  if (!confirm(`Are you sure you want to delete ${user.name}?`)) return
  
  try {
    await userManagement.deleteUser(user._id)
    toast.success('User deleted successfully')
    await loadUsers()
  } catch (error) {
    toast.error('Failed to delete user')
  }
}

const openClassModal = async (user: UserManagementUser) => {
  selectedUser.value = user
  try {
    await userManagement.fetchUserClasses(user._id)
    userClasses.value = userManagement.userClasses
    await loadClasses()
    showClassModal.value = true
  } catch (error) {
    toast.error('Failed to load user classes')
  }
}

const assignClass = async () => {
  if (!selectedClassId.value || !selectedUser.value) return
  
  try {
    await userManagement.assignUserToClass(selectedUser.value._id, selectedClassId.value, 'assign')
    toast.success('User assigned to class successfully')
    await userManagement.fetchUserClasses(selectedUser.value._id)
    userClasses.value = userManagement.userClasses
    selectedClassId.value = ''
  } catch (error) {
    toast.error('Failed to assign user to class')
  }
}

const removeClass = async (classId: string) => {
  if (!selectedUser.value) return
  
  try {
    await userManagement.assignUserToClass(selectedUser.value._id, classId, 'remove')
    toast.success('User removed from class successfully')
    await userManagement.fetchUserClasses(selectedUser.value._id)
    userClasses.value = userManagement.userClasses
  } catch (error) {
    toast.error('Failed to remove user from class')
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedType.value = ''
  selectedStatus.value = ''
  currentPage.value = 1
  loadUsers()
}

const changePage = (page: number) => {
  currentPage.value = page
  loadUsers()
}

// Lifecycle
onMounted(() => {
  loadUsers()
  loadClasses()
})
</script>

<template>
  <div>
    <!-- Header Section -->
    <div class="mb-6 sm:mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Users</h1>
          <p class="text-gray-600 text-sm sm:text-base">Manage users, roles, and class assignments</p>
        </div>
        <button 
          class="btn bg-gradient-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 shadow-lg text-white"
          @click="openUserModal()"
        >
          <AddOutline class="w-4 h-4" />
          Add User
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Total Users</p>
            <p class="text-2xl font-bold text-gray-800">{{ userStats.total }}</p>
          </div>
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <PeopleOutline class="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Active</p>
            <p class="text-2xl font-bold text-green-600">{{ userStats.active }}</p>
          </div>
          <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckmarkOutline class="w-5 h-5 text-green-600" />
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Inactive</p>
            <p class="text-2xl font-bold text-red-600">{{ userStats.inactive }}</p>
          </div>
          <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <CloseCircleOutline class="w-5 h-5 text-red-600" />
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Admins</p>
            <p class="text-2xl font-bold text-purple-600">{{ userStats.admin }}</p>
          </div>
          <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <ShieldCheckmarkOutline class="w-5 h-5 text-purple-600" />
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Regular</p>
            <p class="text-2xl font-bold text-orange-600">{{ userStats.regular }}</p>
          </div>
          <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <PersonOutline class="w-5 h-5 text-orange-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div class="flex flex-col lg:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1">
          <div class="relative">
            <SearchOutline class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search users by name, email, or username..."
              class="input input-bordered w-full pl-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="debouncedSearch"
            />
          </div>
        </div>
        
        <!-- Type Filter -->
        <div class="w-full lg:w-48">
          <select
            v-model="selectedType"
            class="select select-bordered w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @change="debouncedSearch"
          >
            <option value="">All Types</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="teacher">Teacher</option>
            <option value="kid">Kid</option>
          </select>
        </div>
        
        <!-- Status Filter -->
        <div class="w-full lg:w-48">
          <select
            v-model="selectedStatus"
            class="select select-bordered w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @change="debouncedSearch"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <!-- Clear Filters -->
        <button
          @click="clearFilters"
          class="btn btn-outline border-gray-200 hover:bg-gray-50 hover:border-blue-300"
        >
          <RefreshOutline class="w-4 h-4" />
          Clear
        </button>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="font-semibold text-gray-700">User</th>
              <th class="font-semibold text-gray-700">Type</th>
              <th class="font-semibold text-gray-700">Status</th>
              <th class="font-semibold text-gray-700">Joined</th>
              <th class="font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="userManagement.loading" class="hover:bg-gray-50">
              <td colspan="5" class="text-center py-8">
                <div class="loading loading-spinner loading-md"></div>
                <p class="text-gray-500 mt-2">Loading users...</p>
              </td>
            </tr>
            <tr v-else-if="filteredUsers.length === 0" class="hover:bg-gray-50">
              <td colspan="5" class="text-center py-8">
                <PeopleOutline class="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p class="text-gray-500">No users found</p>
              </td>
            </tr>
            <tr v-for="user in filteredUsers" :key="user._id" class="hover:bg-gray-50">
              <td>
                <div class="flex items-center gap-3">
                  <div class="avatar">
                    <div class="w-10 h-10 rounded-full">
                      <img 
                        :src="getSrc(user.photoUrl || '', true) || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'" 
                        :alt="user.name"
                      />
                    </div>
                  </div>
                  <div>
                    <p class="font-medium text-gray-800">{{ user.name }}</p>
                    <p class="text-sm text-gray-500">{{ user.email }}</p>
                    <p class="text-xs text-gray-400">@{{ user.username }}</p>
                  </div>
                </div>
              </td>
              <td>
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
              </td>
              <td>
                <div class="flex items-center gap-2">
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
              </td>
              <td>
                <p class="text-sm text-gray-600">{{ dayjs(user.createdAt).format('MMM DD, YYYY') }}</p>
                <p class="text-xs text-gray-400">{{ dayjs(user.createdAt).fromNow() }}</p>
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <button
                    @click="$router.push(`/user-management/${user._id}`)"
                    class="btn btn-sm btn-ghost hover:bg-purple-50 hover:text-purple-600"
                    title="View Details"
                  >
                    <PersonOutline class="w-4 h-4" />
                  </button>
                  <button
                    @click="openUserModal(user)"
                    class="btn btn-sm btn-ghost hover:bg-blue-50 hover:text-blue-600"
                    title="Edit User"
                  >
                    <CreateOutline class="w-4 h-4" />
                  </button>
                  <button
                    v-if="user.type === 'user' || user.type === 'kid'"
                    @click="openClassModal(user)"
                    class="btn btn-sm btn-ghost hover:bg-green-50 hover:text-green-600"
                    title="Manage Classes"
                  >
                    <BookOutline class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteUser(user)"
                    class="btn btn-sm btn-ghost hover:bg-red-50 hover:text-red-600"
                    title="Delete User"
                    :disabled="user.type === 'admin'"
                  >
                    <TrashOutline class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div v-if="userManagement.pagination.pages > 1" class="border-t border-gray-100 p-4">
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-600">
            Showing {{ (userManagement.pagination.page - 1) * userManagement.pagination.limit + 1 }} 
            to {{ Math.min(userManagement.pagination.page * userManagement.pagination.limit, userManagement.pagination.total) }} 
            of {{ userManagement.pagination.total }} users
          </p>
          <div class="join">
            <button
              @click="changePage(userManagement.pagination.page - 1)"
              class="join-item btn btn-sm"
              :disabled="userManagement.pagination.page <= 1"
            >
              «
            </button>
            <button
              v-for="page in Math.min(5, userManagement.pagination.pages)"
              :key="page"
              @click="changePage(page)"
              class="join-item btn btn-sm"
              :class="{ 'btn-active': page === userManagement.pagination.page }"
            >
              {{ page }}
            </button>
            <button
              @click="changePage(userManagement.pagination.page + 1)"
              class="join-item btn btn-sm"
              :disabled="userManagement.pagination.page >= userManagement.pagination.pages"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- User Modal -->
    <div v-if="showUserModal" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-lg mb-4">
          {{ isEditing ? 'Edit User' : 'Add New User' }}
        </h3>
        
        <form @submit.prevent="saveUser" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Name</span>
              </label>
              <input
                v-model="editForm.name"
                type="text"
                class="input input-bordered focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Username</span>
              </label>
              <input
                v-model="editForm.username"
                type="text"
                class="input input-bordered focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Email</span>
              </label>
              <input
                v-model="editForm.email"
                type="email"
                class="input input-bordered focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :required="!isEditing"
                :disabled="isEditing"
                placeholder="user@example.com"
              />
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Password</span>
                <span v-if="!isEditing" class="label-text-alt text-red-500">*</span>
              </label>
              <input
                v-model="editForm.password"
                type="password"
                class="input input-bordered focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :required="!isEditing"
                :disabled="isEditing"
                placeholder="Enter password"
                minlength="6"
              />
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Type</span>
              </label>
              <select
                v-model="editForm.type"
                class="select select-bordered focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="kid">Kid</option>
              </select>
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Language</span>
              </label>
              <select
                v-model="editForm.language"
                class="select select-bordered focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="tr">Turkish</option>
              </select>
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">Gender</span>
              </label>
              <select
                v-model="editForm.gender"
                class="select select-bordered focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Not specified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div class="flex flex-wrap gap-4">
            <label class="label cursor-pointer">
              <input
                v-model="editForm.isActivated"
                type="checkbox"
                class="checkbox checkbox-primary"
              />
              <span class="label-text ml-2">Active</span>
            </label>
          </div>
        </form>
        
        <div class="modal-action">
          <button
            @click="showUserModal = false"
            class="btn btn-outline"
          >
            Cancel
          </button>
          <button
            @click="saveUser"
            class="btn bg-gradient-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 text-white"
            :disabled="userManagement.loading"
          >
            <span v-if="userManagement.loading" class="loading loading-spinner loading-sm"></span>
            <span v-else>{{ isEditing ? 'Update' : 'Create' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Class Assignment Modal -->
    <div v-if="showClassModal" class="modal modal-open">
      <div class="modal-box max-w-4xl">
        <h3 class="font-bold text-lg mb-4">
          Manage Classes for {{ selectedUser?.name }}
        </h3>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Current Classes -->
          <div>
            <h4 class="font-semibold text-gray-800 mb-3">Current Classes</h4>
            <div class="space-y-2 max-h-64 overflow-y-auto">
              <div v-if="userClasses.length === 0" class="text-center py-8 text-gray-500">
                <BookOutline class="w-8 h-8 mx-auto mb-2" />
                <p>No classes assigned</p>
              </div>
              <div
                v-for="cls in userClasses"
                :key="cls._id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p class="font-medium text-gray-800">{{ cls.name }}</p>
                  <p class="text-sm text-gray-600">{{ cls.description }}</p>
                </div>
                <button
                  @click="removeClass(cls._id)"
                  class="btn btn-sm btn-ghost text-red-600 hover:bg-red-50"
                >
                  <CloseOutline class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <!-- Assign New Class -->
          <div>
            <h4 class="font-semibold text-gray-800 mb-3">Assign New Class</h4>
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
          </div>
        </div>
        
        <div class="modal-action">
          <button
            @click="showClassModal = false"
            class="btn btn-outline"
          >
            Close
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
  </div>
</template>

<style scoped>
.modal {
  @apply z-50;
}

.modal-box {
  @apply max-h-[90vh] overflow-y-auto;
}

/* Custom scrollbar for class lists */
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