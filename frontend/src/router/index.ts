import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'

const initApp = async () => {
  const authStore = useAuthStore()

  try {
    await authStore.initAuth()
    console.log('Auth initialized successfully')
  } catch (error) {
    console.error('Failed to initialize auth:', error)
  }

  dayjs.extend(duration)
  dayjs.extend(relativeTime)

  return authStore.isAuth
}


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/DashboardPage.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardPage.vue'),
      meta: {
        requiresAuth: true,
        title: 'Dashboard'
      }
    },
    {
      path: '/classes',
      name: 'classes',
      component: () => import('../views/ClassManagementPage.vue'),
      meta: {
        requiresAuth: true,
        title: 'Classes'
      }
    },
    {
      path: '/classes/:id',
      name: 'class-details',
      component: () => import('../views/ClassDetailsPage.vue'),
      meta: {
        requiresAuth: true,
        title: 'Class Details'
      }
    },
    {
      path: '/skills',
      name: 'skills',
      component: () => import('../views/SkillManagementPage.vue'),
      meta: {
        requiresAuth: true,
        title: 'Skills'
      }
    },
    {
      path: '/chat',
      name: 'chat-list',
      component: () => import('../views/RoomList.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/chat/:room_id',
      name: 'chat',
      component: () => import('../views/ChatBoard.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/chat/edit/:room_id',
      name: 'chat:edit',
      component: () => import('../views/EditRoomPage.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/random',
      name: 'randomPage',
      component: () => import('../views/RandomPage.vue')
    },
    {
      path: '/questions',
      name: 'questionPage',
      component: () => import('../views/QuestionPage.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginPage.vue'),
      meta: {
        layout: 'auth'
      }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterPage.vue'),
      meta: {
        layout: 'auth'
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsPage.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/user-management',
      name: 'user-management',
      component: () => import('../views/UserManagementPage.vue'),
      meta: {
        requiresAuth: true,
        title: 'Users'
      }
    },
    {
      path: '/user-management/:id',
      name: 'user-details',
      component: () => import('../views/UserDetailsPage.vue'),
      meta: {
        requiresAuth: true,
        title: 'User Details'
      }
    },
    {
      path: '/ai-number',
      name: 'ai_number',
      component: () => import('../views/NumberPredictionPage.vue')
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/TestPage.vue')
    },
    {
      path: '/error',
      component: () => import('../views/SomethingWrongPage.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('../views/NotFoundPage.vue')
    }
  ]
})

let isInitialized = false

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Ensure auth is initialized before proceeding
  if (!isInitialized) {
    try {
      await initApp()
      isInitialized = true
    } catch (error) {
      console.error('Failed to initialize app:', error)
      next({ name: 'error' })
      return
    }
  }

  let isBlock = false
  if (to.meta.requiresAuth) {
    if (!authStore.isAuth) {
      authStore.setLastPath(to.fullPath)
      next({ name: 'login' })
      isBlock = true
    }
  }

  if (to.name === 'login' && authStore.isAuth) {
    next({ name: 'home' })
    isBlock = true
  }

  if (!isBlock) {
    next()
  }
})

export default router
