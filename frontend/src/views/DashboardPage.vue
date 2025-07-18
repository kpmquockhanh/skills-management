<script setup lang="ts">
import { ref, onMounted, computed, markRaw } from 'vue'
import type { Ref } from 'vue'
import { useSkillRating } from '@/stores/skillRating'
import { useUser } from '@/stores/user'
import { 
  BookOutline, 
  TrophyOutline, 
  TrendingUpOutline, 
  TimeOutline,
  CheckmarkCircleOutline,
  PlayCircleOutline,
  DocumentTextOutline,
  PeopleOutline,
  StarOutline
} from '@vicons/ionicons5'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import {getSrc} from '@/utils'

dayjs.extend(relativeTime)

const skillRating = useSkillRating()
const userStore = useUser()

const stats = ref([
  { 
    title: 'Skills Learned', 
    value: '0', 
    change: '+0 this month', 
    icon: markRaw(BookOutline),
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  { 
    title: 'Completed Skills', 
    value: '0', 
    change: '+0 this month', 
    icon: markRaw(TrophyOutline),
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
  { 
    title: 'Study Hours', 
    value: '0', 
    change: '+0h this week', 
    icon: markRaw(TimeOutline),
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600'
  },
  { 
    title: 'Avg Rating', 
    value: '0/10', 
    change: '+0 this month', 
    icon: markRaw(TrendingUpOutline),
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600'
  }
])

const recentActivities: Ref<any[]> = ref([])

// Computed properties for real data
const completedSkills = computed(() => {
  return skillRating.completedRatings || []
})

const allSkills = computed(() => {
  return skillRating.ratings || []
})

const updateStats = () => {
  if (skillRating.stats) {
    stats.value[0].value = skillRating.stats.totalSkills?.toString() || '0'
    stats.value[1].value = skillRating.stats.completedSkills?.toString() || '0'
    stats.value[2].value = Math.round(skillRating.stats.totalTimeSpent / 60).toString() || '0'
    stats.value[3].value = `${Math.round(skillRating.stats.averageRating * 10) / 10}/10`
  }
}

const loadUserSkills = async () => {
  if (!userStore.user?._id) return
  
  try {
    await skillRating.fetchUserRatings(userStore.user._id, {
      page: 1,
      limit: 50
    })
    updateStats()
    updateRecentActivities()
  } catch (error) {
    console.error('Failed to load user skills:', error)
  }
}

const updateRecentActivities = () => {
  const activities: any[] = []
  
  // Add completed skills
  completedSkills.value.forEach(rating => {
    activities.push({
      action: `Completed ${rating.skill.name}`,
      user: userStore.user?.name || 'You',
      time: dayjs(rating.updatedAt).fromNow(),
      type: 'certificate',
      avatar: getSrc(userStore.user?.photoUrl, true) || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      skill: rating.skill.name,
      progress: rating.progress,
      rating: rating.rating,
      masteryLevel: rating.masteryLevel
    })
  })
  
  // Add active skills with high progress
  allSkills.value
    .filter(rating => rating.status === 'active' && rating.progress >= 50)
    .forEach(rating => {
      activities.push({
        action: `Progress on ${rating.skill.name}`,
        user: getSrc(userStore.user?.photoUrl, true) || 'You',
        time: dayjs(rating.updatedAt).fromNow(),
        type: 'learning',
        avatar: userStore.user?.photoUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        skill: rating.skill.name,
        progress: rating.progress,
        rating: rating.rating,
        masteryLevel: rating.masteryLevel
      })
    })
  
  // Sort by most recent and take top 6
  activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  recentActivities.value = activities.slice(0, 6)
}

// Lifecycle
onMounted(() => {
  loadUserSkills()
  skillRating.fetchAllCompletedSkills({ page: 1, limit: 10 })
})

const skillProgress = computed(() => {
  return allSkills.value
    .filter(rating => rating.status === 'active' || rating.status === 'completed')
    .map(rating => ({
      name: rating.skill.name,
      progress: rating.progress,
      level: rating.masteryLevel,
      color: getSkillColor(rating.skill.name),
      rating: rating.rating
    }))
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 5)
})

const getSkillColor = (skillName: string) => {
  const colors = [
    'from-yellow-400 to-orange-500',
    'from-blue-400 to-cyan-500', 
    'from-green-400 to-emerald-500',
    'from-purple-400 to-pink-500',
    'from-indigo-400 to-purple-500',
    'from-red-400 to-pink-500',
    'from-teal-400 to-cyan-500',
    'from-orange-400 to-red-500'
  ]
  const index = skillName.length % colors.length
  return colors[index]
}

const getActivityIcon = (type: string) => {
  const icons = {
    certificate: CheckmarkCircleOutline,
    learning: PlayCircleOutline,
    project: DocumentTextOutline,
    collaboration: PeopleOutline
  }
  return icons[type as keyof typeof icons] || PlayCircleOutline
}

const getActivityColor = (type: string) => {
  const colors = {
    certificate: 'bg-green-100 text-green-600',
    learning: 'bg-blue-100 text-blue-600',
    project: 'bg-purple-100 text-purple-600',
    collaboration: 'bg-orange-100 text-orange-600'
  }
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-600'
}

</script>

<template>
  <div>
    <!-- Welcome Section -->
    <div class="mb-6 sm:mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Welcome back, {{ userStore.user?.name || 'User' }}! 👋</h1>
      <p class="text-gray-600 text-sm sm:text-base">Track your skills progress and continue learning.</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <div v-for="stat in stats" :key="stat.title" 
           class="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div class="flex items-center justify-between mb-3 sm:mb-4">
          <div class="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl" :class="stat.bgColor">
            <component :is="stat.icon" class="w-5 h-5 sm:w-6 sm:h-6" :class="stat.textColor" />
          </div>
          <div class="text-right">
            <div class="text-xs sm:text-sm font-medium text-gray-500">{{ stat.title }}</div>
            <div class="text-xl sm:text-2xl font-bold" :class="stat.textColor">{{ stat.value }}</div>
          </div>
        </div>
        <div class="flex items-center text-xs sm:text-sm">
          <span class="text-green-600 font-medium">{{ stat.change }}</span>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
      <!-- Left Column: Noticeboard + Recent Activities -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Noticeboard: Completed Skills -->
        <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-blue-200 p-4 sm:p-6 mb-4">
          <h2 class="text-lg sm:text-xl font-bold text-blue-700 mb-2 flex items-center gap-2">
            <TrophyOutline class="w-5 h-5 text-blue-500" />
            Noticeboard: Completed Skills
          </h2>
          <div v-if="skillRating.allCompletedSkills.length > 0" class="relative">
            <div class="timeline-modern relative">
              <div v-for="(item, idx) in skillRating.allCompletedSkills" :key="item._id" class="timeline-item flex items-start gap-4 mb-10 last:mb-0 group animate-fadein">
                <!-- Timeline vertical line (only if not last item) -->
                <div class="absolute left-5 top-6 w-0.5 bg-blue-200" :style="{ height: idx < skillRating.allCompletedSkills.length - 1 ? 'calc(100% + 1.5rem)' : '0' }"></div>
                <!-- Dot and avatar -->
                <div class="relative flex flex-col items-center" style="width: 40px;">
                  <span class="block w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white z-10 mb-1"></span>
                  <img v-if="item.user?.photo?.src" :src="getSrc(item.user.photo.src, true)" class="w-12 h-12 object-cover rounded-full border-2 border-blue-100" :alt="item.user.name" />
                  <div v-else class="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 border-2 border-blue-200">
                    <TrophyOutline class="w-6 h-6 text-blue-500" />
                  </div>
                </div>
                <!-- Content card -->
                <div class="flex-1 min-w-0 bg-white rounded-xl p-4 border border-blue-100 transition-all">
                  <div class="font-semibold text-gray-800 text-base truncate mb-1">{{ item.skill?.name }}</div>
                  <div class="text-xs text-gray-500 mb-2">
                    <div>
                      By <span class="font-medium text-blue-700">{{ item.user?.name || 'Unknown' }}</span> 
                    </div>
                    <div>
                      Completed {{ dayjs(item.completedAt).format('MMM D, YYYY') }}
                    </div>
                  </div>
                  <div class="flex items-center gap-2 mt-1">
                    <span v-if="item.rating" class="text-xs text-yellow-600 font-bold flex items-center gap-1">
                      <StarOutline class="w-3 h-3" /> {{ item.rating }}/10
                    </span>
                    <span v-if="item.masteryLevel" class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">{{ item.masteryLevel }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-4 text-gray-500">
            <TrophyOutline class="w-8 h-8 mx-auto mb-2 text-blue-200" />
            No completed skills yet. Keep learning!
          </div>
        </div>
        <!-- Recent Activities -->
        <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-4 sm:p-6 border-b border-gray-100">
            <h2 class="text-lg sm:text-xl font-bold text-gray-800">Recent Learning Activities</h2>
            <p class="text-gray-600 text-sm mt-1">Your latest skill development progress</p>
          </div>
          <div class="p-4 sm:p-6">
            <!-- Empty State -->
            <div v-if="recentActivities.length === 0" class="text-center py-8">
              <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                <PlayCircleOutline class="w-8 h-8 text-gray-400" />
              </div>
              <h3 class="text-lg font-semibold text-gray-700 mb-2">No Recent Activities</h3>
            </div>
            <!-- Activities List -->
            <div v-else>
              <div class="space-y-3 sm:space-y-4">
                <div v-for="activity in recentActivities" :key="`${activity.skill}-${activity.time}`" 
                     class="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors">
                  <div class="avatar">
                    <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-2 ring-white">
                      <img :src="activity.avatar" :alt="activity.user" />
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-800 text-sm sm:text-base truncate">{{ activity.action }}</p>
                    <div class="flex gap-2 mt-1 flex-col">
                      <div class="flex items-center gap-1">
                        <span class="text-xs sm:text-sm text-gray-600">{{ activity.skill }}</span>
                        <span class="text-xs sm:text-sm text-gray-600">•</span>
                        <span class="text-xs sm:text-sm text-gray-600">{{ activity.progress }}%</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <div class="flex items-center gap-1">
                          <StarOutline class="w-3 h-3 text-yellow-500" />
                          <span class="text-xs text-gray-600">{{ activity.rating }}/10</span>
                        </div>
                        <span class="text-xs sm:text-sm text-gray-600">•</span>
                        <span v-if="activity.masteryLevel" class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">{{ activity.masteryLevel }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <component :is="getActivityIcon(activity.type)" class="w-4 h-4 sm:w-5 sm:h-5" :class="getActivityColor(activity.type).split(' ')[1]" />
                    <span class="text-xs sm:text-sm text-gray-500 hidden sm:inline">{{ activity.time }}</span>
                  </div>
                </div>
              </div>
              <div class="mt-4 sm:mt-6">
                <button class="btn btn-outline w-full border-gray-200 hover:bg-gray-50 hover:border-blue-300 text-sm">
                  View All Activities
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="space-y-4 sm:space-y-6">
        <!-- Quick Actions Card -->
        <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-4 sm:p-6 border-b border-gray-100">
            <h2 class="text-lg sm:text-xl font-bold text-gray-800">Quick Actions</h2>
            <p class="text-gray-600 text-sm mt-1">Continue your learning journey</p>
          </div>
          <div class="p-4 sm:p-6 space-y-3">
            <button class="btn w-full bg-gradient-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 shadow-lg text-white text-sm">
              <PlayCircleOutline class="w-4 h-4" />
              Start New Course
            </button>
            <button class="btn btn-outline w-full border-gray-200 hover:bg-gray-50 hover:border-blue-300 text-sm">
              <DocumentTextOutline class="w-4 h-4" />
              Take Assessment
            </button>
            <button class="btn btn-outline w-full border-gray-200 hover:bg-gray-50 hover:border-blue-300 text-sm">
              <PeopleOutline class="w-4 h-4" />
              Join Study Group
            </button>
          </div>
        </div>

        <!-- Skill Progress Card -->
        <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-4 sm:p-6 border-b border-gray-100">
            <h2 class="text-lg sm:text-xl font-bold text-gray-800">Skill Progress</h2>
            <p class="text-gray-600 text-sm mt-1">Your current skill levels</p>
          </div>
          <div class="p-4 sm:p-6">
            <!-- Empty State -->
            <div v-if="skillProgress.length === 0" class="text-center py-8">
              <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                <BookOutline class="w-8 h-8 text-gray-400" />
              </div>
              <h3 class="text-lg font-semibold text-gray-700 mb-2">No Skills Yet</h3>
            </div>
            
            <!-- Skills List -->
            <div v-else class="space-y-4 sm:space-y-6">
              <div v-for="skill in skillProgress" :key="skill.name" class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-gray-700">{{ skill.name }}</span>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-500">{{ skill.level }}</span>
                    <span class="text-sm font-bold" :class="skill.color.includes('yellow') ? 'text-yellow-600' : skill.color.includes('blue') ? 'text-blue-600' : skill.color.includes('green') ? 'text-green-600' : skill.color.includes('purple') ? 'text-purple-600' : 'text-gray-600'">{{ skill.progress }}%</span>
                  </div>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="h-2 rounded-full transition-all duration-300" :class="`bg-gradient-to-r ${skill.color}`" :style="`width: ${skill.progress}%`"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Cards -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-8">
      <!-- Study Partners -->
      <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 sm:p-6 border-b border-gray-100">
          <h2 class="text-lg sm:text-xl font-bold text-gray-800">Study Partners</h2>
          <p class="text-gray-600 text-sm mt-1">Learning together</p>
        </div>
        <div class="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div class="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
            <div class="avatar">
              <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-2 ring-white">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" alt="Avatar" />
              </div>
            </div>
            <div class="flex-1">
              <p class="font-semibold text-gray-800 text-sm sm:text-base">John Doe</p>
              <p class="text-xs sm:text-sm text-gray-600">React Expert • 15 courses completed</p>
            </div>
            <div class="badge badge-success bg-green-100 text-green-600 border-0 text-xs">Online</div>
          </div>
          <div class="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
            <div class="avatar">
              <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-2 ring-white">
                <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face" alt="Avatar" />
              </div>
            </div>
            <div class="flex-1">
              <p class="font-semibold text-gray-800 text-sm sm:text-base">Jane Smith</p>
              <p class="text-xs sm:text-sm text-gray-600">Python Developer • 8 courses completed</p>
            </div>
            <div class="badge badge-warning bg-yellow-100 text-yellow-600 border-0 text-xs">Studying</div>
          </div>
        </div>
      </div>

      <!-- Recent Certificates -->
      <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 sm:p-6 border-b border-gray-100">
          <h2 class="text-lg sm:text-xl font-bold text-gray-800">Recent Certificates</h2>
          <p class="text-gray-600 text-sm mt-1">Your latest achievements</p>
        </div>
        <div class="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div class="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors">
            <div class="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl">
              <TrophyOutline class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div class="flex-1">
              <p class="font-medium text-gray-800 text-sm sm:text-base">React Advanced Certification</p>
              <p class="text-xs sm:text-sm text-gray-600">Completed 2 hours ago</p>
            </div>
            <button class="btn btn-ghost btn-sm">
              <DocumentTextOutline class="w-4 h-4" />
            </button>
          </div>
          <div class="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors">
            <div class="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl">
              <TrophyOutline class="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div class="flex-1">
              <p class="font-medium text-gray-800 text-sm sm:text-base">Python Fundamentals</p>
              <p class="text-xs sm:text-sm text-gray-600">Completed 1 day ago</p>
            </div>
            <button class="btn btn-ghost btn-sm">
              <DocumentTextOutline class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template> 

<style scoped>
.timeline-modern {
  position: relative;
}
.timeline-item {
  position: relative;
}
.timeline-item:last-child .absolute.left-5.top-6.w-0\.5 {
  display: none;
}
@media (max-width: 640px) {
  .timeline-modern {
    padding-left: 1.5rem;
  }
  .timeline-item .flex-1 {
    padding: 1rem 0.5rem;
  }
}
@keyframes fadein {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: none; }
}
.animate-fadein {
  animation: fadein 0.5s cubic-bezier(0.4,0,0.2,1);
}
</style> 