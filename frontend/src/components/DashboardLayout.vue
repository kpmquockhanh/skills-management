<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUser } from '../stores/user'
import DashboardHeader from './DashboardHeader.vue'
import { 
  BarChartOutline, 
  BookOutline,
  ChatbubbleEllipsesOutline, 
  PeopleOutline, 
  SettingsOutline, 
  PersonOutline,
  AddOutline,
  EyeOutline,
  TimeOutline,
  ShieldCheckmarkOutline,
  TrashOutline,
  TrendingUpOutline
} from '@vicons/ionicons5'
import {getSrc} from '../utils'

const route = useRoute()
const authStore = useAuthStore()
const userStore = useUser()

const sidebarOpen = ref(false)
const expandedItems = ref<string[]>([])

// Computed properties for user data
const userName = computed(() => userStore.user?.name || 'User')
const userEmail = computed(() => userStore.user?.email || '')
const userPhoto = computed(() => getSrc(userStore.user?.photoUrl, true))
const userType = computed(() => {
  if (userStore.user?.type === 'admin') return 'Admin'
  if (userStore.user?.type === 'user') return 'Member'
  return 'User'
})
const isOnline = computed(() => userStore.user?.isOnline || false)

const navigationItems = computed(() => {
  return [
  {
    name: 'Dashboard',
    icon: BarChartOutline,
    path: '/',
    badge: null,
    subItems: []
  },
  {
    name: 'Classes',
    icon: BookOutline,
    path: '/classes',
    badge: null,
    subItems: []
  },
  {
    name: 'Skills',
    icon: TrendingUpOutline,
    path: '/skills',
    badge: null,
    subItems: []
  },
  {
    name: 'Messages',
    icon: ChatbubbleEllipsesOutline,
    path: '/chat',
    badge: null,
    subItems: []
  },
  {
    name: 'Friends',
    icon: PeopleOutline,
    path: '/friends',
    badge: computed(() => authStore.isAuth ? 'New' : null),
    subItems: []
  },
  {
    name: 'Settings',
    icon: SettingsOutline,
    path: '/settings',
    badge: null,
    subItems: [
      {
        name: 'General',
        path: '/settings?tab=general',
        icon: SettingsOutline
      },
      {
        name: 'Timer',
        path: '/settings?tab=timer',
        icon: TimeOutline
      },
      {
        name: 'Permissions',
        path: '/settings?tab=permissions',
        icon: ShieldCheckmarkOutline,
        disabled: !userStore.can('permissions')
      },
      {
        name: 'Duplicates',
        path: '/settings?tab=remove-duplicates',
        icon: TrashOutline,
        disabled: !userStore.can('remove-duplicates')
      }
    ]
  },
  {
    name: 'Users',
    icon: PeopleOutline,
    path: '/user-management',
    badge: null,
    subItems: []
  }
]})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const toggleExpanded = (itemName: string) => {
  const index = expandedItems.value.indexOf(itemName)
  if (index > -1) {
    expandedItems.value.splice(index, 1)
  } else {
    expandedItems.value.push(itemName)
  }
}

const isExpanded = (itemName: string) => {
  return expandedItems.value.includes(itemName)
}

/**
 * Check if a navigation item should be highlighted as active
 * Handles both exact matches and nested routes (e.g., /classes/123 should highlight /classes)
 */
const isActiveRoute = (itemPath: string) => {
  // Handle query parameters (e.g., /settings?tab=general)
  if (itemPath.includes('?')) {
    const [path, query] = itemPath.split('?')
    return route.path === path && route.query.tab === query.split('=')[1]
  }
  
  // Handle nested routes - check if current path starts with the item path
  // This ensures /classes/123 highlights the "Classes" navigation item
  const nestedRoutes = ['/classes', '/skills', '/chat', '/friends', '/settings', '/user-management']
  if (nestedRoutes.includes(itemPath)) {
    return route.path.startsWith(itemPath)
  }
  
  // Exact path match for other routes
  return route.path === itemPath
}

// Auto-expand Settings if on settings page
if (route.path === '/settings') {
  expandedItems.value.push('Settings')
}
</script>

<template>
  <div class="drawer lg:drawer-open bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
    <input id="dashboard-drawer" type="checkbox" class="drawer-toggle" v-model="sidebarOpen" />
    
    <!-- Page content here -->
    <div class="drawer-content flex flex-col">
      <!-- Header -->
      <DashboardHeader @toggle-sidebar="toggleSidebar" />
      
      <!-- Page content -->
      <div class="flex-1 p-3">
        <slot />
      </div>
    </div>
    
    <!-- Sidebar -->
    <div class="drawer-side">
      <label for="dashboard-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
      <aside class="min-h-full w-80 bg-white shadow-xl border-r border-gray-100">
        <!-- Sidebar content -->
        <div class="p-6">
          <!-- Logo/Brand -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Skills
            </h2>
            <p class="text-sm text-gray-500 mt-1">Manage your skills efficiently</p>
          </div>
          
          <!-- Navigation Menu -->
          <nav class="space-y-1">
            <div v-for="item in navigationItems" :key="item.path" class="group">
              <!-- Main Navigation Item -->
              <div class="relative">
                <router-link 
                  v-if="item.subItems.length === 0"
                  :to="item.path"
                  :class="{ 
                    'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg': isActiveRoute(item.path),
                    'text-gray-700 hover:bg-gray-50 hover:text-blue-600': !isActiveRoute(item.path)
                  }"
                  class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium"
                >
                  <component :is="item.icon" class="w-5 h-5" />
                  <span class="flex-1">{{ item.name }}</span>
                  <div v-if="item.badge" class="badge badge-primary badge-sm bg-blue-100 text-blue-600 border-0">
                    {{ item.badge }}
                  </div>
                </router-link>
                
                <!-- Expandable Navigation Item -->
                <div v-else>
                  <button
                    @click="toggleExpanded(item.name)"
                    :class="{ 
                      'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg': route.path === item.path,
                      'text-gray-700 hover:bg-gray-50 hover:text-blue-600': route.path !== item.path
                    }"
                    class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium w-full text-left"
                  >
                    <component :is="item.icon" class="w-5 h-5" />
                    <span class="flex-1">{{ item.name }}</span>
                    <div v-if="item.badge" class="badge badge-primary badge-sm bg-blue-100 text-blue-600 border-0">
                      {{ item.badge }}
                    </div>
                    <svg 
                      class="w-4 h-4 transition-transform duration-200"
                      :class="{ 'rotate-180': isExpanded(item.name) }"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  
                  <!-- Sub Items -->
                  <div 
                    v-if="isExpanded(item.name)"
                    class="ml-6 mt-2 space-y-1"
                  >
                    <router-link
                      v-for="subItem in item.subItems"
                      :key="subItem.path"
                      :to="subItem.path"
                      :class="{ 
                        'bg-blue-100 text-blue-700 border-l-2 border-blue-500': isActiveRoute(subItem.path),
                        'text-gray-600 hover:bg-gray-50 hover:text-gray-800': !isActiveRoute(subItem.path),
                        'opacity-50 cursor-not-allowed pointer-events-none': subItem.disabled
                      }"
                      class="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                    >
                      <component :is="subItem.icon" class="w-4 h-4" />
                      <span>{{ subItem.name }}</span>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          
          <!-- Divider -->
          <div class="my-6 border-t border-gray-200"></div>
          
          <!-- User Info -->
          <div class="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <div class="flex items-center gap-3">
              <div class="avatar">
                <div class="w-12 rounded-full ring-2 ring-white relative">
                  <img :src="userPhoto" :alt="userName" />
                  <!-- Online status indicator -->
                  <div v-if="isOnline" class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  <div v-else class="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></div>
                </div>
              </div>
              <div>
                <p class="font-semibold text-gray-800">{{ userName }}</p>
                <p class="text-sm text-gray-600">{{ userType }}</p>
                <p class="text-xs text-gray-500 truncate">{{ userEmail }}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.drawer-content {
  min-height: 100vh;
}

/* Custom scrollbar for sidebar */
.drawer-side::-webkit-scrollbar {
  width: 4px;
}

.drawer-side::-webkit-scrollbar-track {
  background: transparent;
}

.drawer-side::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 2px;
}

.drawer-side::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style> 