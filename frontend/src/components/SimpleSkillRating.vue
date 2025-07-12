<script setup>
import { ref, computed } from 'vue'
import { useSkillRating } from '@/stores/skillRating'
import { useSkillStore } from '@/stores/skill'
import { useToast } from 'vue-toastification'
import { Star, StarOutline } from '@vicons/ionicons5'

const props = defineProps({
  userId: {
    type: String,
    required: true
  },
  skillId: {
    type: String,
    default: ''
  },
  showSkillSelector: {
    type: Boolean,
    default: false
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['rated', 'saved'])

const skillRating = useSkillRating()
const skillStore = useSkillStore()
const toast = useToast()

// State
const selectedRating = ref(0)
const hoveredRating = ref(0)
const selectedSkillId = ref(props.skillId || '')
const isSubmitting = ref(false)

// Computed
const displayRating = computed(() => hoveredRating.value || selectedRating.value)

const stars = computed(() => {
  return Array.from({ length: 5 }, (_, index) => ({
    index: index + 1,
    filled: index < displayRating.value
  }))
})

// Methods
const handleStarClick = (rating) => {
  selectedRating.value = rating
}

const handleStarHover = (rating) => {
  hoveredRating.value = rating
}

const handleStarLeave = () => {
  hoveredRating.value = 0
}

const saveRating = async () => {
  if (!selectedSkillId.value) {
    toast.error('Please select a skill')
    return
  }

  if (selectedRating.value === 0) {
    toast.error('Please select a rating')
    return
  }

  try {
    isSubmitting.value = true
    
    const result = await skillRating.createOrUpdateRating({
      userId: props.userId,
      skillId: selectedSkillId.value,
      rating: selectedRating.value,
      progress: 0,
      status: 'active'
    })

    toast.success('Rating saved successfully!')
    emit('rated', selectedRating.value, selectedSkillId.value)
    emit('saved', result)
    
    // Reset form
    selectedRating.value = 0
    if (props.showSkillSelector) {
      selectedSkillId.value = ''
    }
  } catch (error) {
    toast.error('Failed to save rating')
    console.error('Error saving rating:', error)
  } finally {
    isSubmitting.value = false
  }
}

const loadSkills = async () => {
  if (props.showSkillSelector && skillStore.skills.length === 0) {
    try {
      await skillStore.fetchSkills()
    } catch (error) {
      toast.error('Failed to load skills')
    }
  }
}

// Load skills on mount if needed
if (props.showSkillSelector) {
  loadSkills()
}
</script>

<template>
  <div :class="[
    'bg-white rounded-lg border border-gray-200 p-4',
    { 'max-w-sm': compact }
  ]">
    <!-- Header -->
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-gray-900">
        {{ compact ? 'Rate Skill' : 'Rate Your Skill' }}
      </h3>
      <p v-if="!compact" class="text-sm text-gray-600 mt-1">
        How would you rate your proficiency in this skill?
      </p>
    </div>

    <!-- Skill Selector (if enabled) -->
    <div v-if="showSkillSelector" class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Select Skill
      </label>
      <select
        v-model="selectedSkillId"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      >
        <option value="">Choose a skill...</option>
        <option
          v-for="skill in skillStore.skills"
          :key="skill._id"
          :value="skill._id"
        >
          {{ skill.name }}
        </option>
      </select>
    </div>

    <!-- Rating Stars -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Your Rating
      </label>
      <div class="flex items-center space-x-1">
        <button
          v-for="star in stars"
          :key="star.index"
          @click="handleStarClick(star.index)"
          @mouseenter="handleStarHover(star.index)"
          @mouseleave="handleStarLeave"
          class="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          :class="[
            star.filled ? 'text-yellow-400' : 'text-gray-300',
            'hover:text-yellow-400 transition-colors duration-150'
          ]"
        >
          <Star v-if="star.filled" class="w-8 h-8" />
          <StarOutline v-else class="w-8 h-8" />
        </button>
      </div>
      
      <!-- Rating Label -->
      <div class="mt-2 text-sm text-gray-600">
        <span v-if="selectedRating === 0">Click to rate</span>
        <span v-else>
          {{ selectedRating }}/5 - 
          <span v-if="selectedRating === 1">Beginner</span>
          <span v-else-if="selectedRating === 2">Novice</span>
          <span v-else-if="selectedRating === 3">Intermediate</span>
          <span v-else-if="selectedRating === 4">Advanced</span>
          <span v-else-if="selectedRating === 5">Expert</span>
        </span>
      </div>
    </div>

    <!-- Submit Button -->
    <button
      @click="saveRating"
      :disabled="isSubmitting || selectedRating === 0 || (showSkillSelector && !selectedSkillId)"
      class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium py-2 px-4 rounded-md hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
    >
      <span v-if="isSubmitting" class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Saving...
      </span>
      <span v-else>Save Rating</span>
    </button>

    <!-- Rating Guide (only show if not compact) -->
    <div v-if="!compact" class="mt-4 pt-4 border-t border-gray-200">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Rating Guide:</h4>
      <div class="text-xs text-gray-600 space-y-1">
        <div><strong>1 - Beginner:</strong> Just starting to learn</div>
        <div><strong>2 - Novice:</strong> Basic understanding</div>
        <div><strong>3 - Intermediate:</strong> Comfortable with basics</div>
        <div><strong>4 - Advanced:</strong> Strong proficiency</div>
        <div><strong>5 - Expert:</strong> Mastery level</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom focus styles for better accessibility */
button:focus-visible {
  @apply ring-2 ring-blue-500 ring-offset-2;
}

/* Smooth transitions for star interactions */
.star-transition {
  transition: all 0.15s ease-in-out;
}
</style> 