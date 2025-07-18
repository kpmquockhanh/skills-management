<template>
  <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 mb-8">
    <!-- Search Bar -->
    <div class="p-4 border-b border-gray-200/50">
      <div class="flex items-center gap-4">
        <div class="flex-1 relative">
          <SearchOutline class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            :value="modelValue.search"
            @input="(e) => updateFilter('search', (e.target as HTMLInputElement).value)"
            type="text"
            :placeholder="searchPlaceholder"
            class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
          />
        </div>
        <button
          @click="showAdvancedFilters = !showAdvancedFilters"
          class="inline-flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200"
        >
          <FilterOutline class="w-4 h-4 mr-2" />
          Filters
          <ChevronDownOutline 
            class="w-4 h-4 ml-1 transition-transform duration-200"
            :class="{ 'rotate-180': showAdvancedFilters }"
          />
        </button>
        <button
          v-if="hasActiveFilters"
          @click="clearAllFilters"
          class="inline-flex items-center px-3 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
        >
          <CloseOutline class="w-4 h-4 mr-1" />
          Clear
        </button>
      </div>
    </div>

    <!-- Quick Filter Chips -->
    <div v-if="!showAdvancedFilters && quickFilters.length > 0" class="px-4 py-3 border-b border-gray-200/50">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="filter in quickFilters"
          :key="`${filter.type}-${filter.value}`"
          @click="toggleQuickFilter(filter.type, filter.value)"
          class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200"
          :class="getQuickFilterClass(filter.type, filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Advanced Filters -->
    <div v-if="showAdvancedFilters && advancedFilters.length > 0" class="p-4 border-t border-gray-200/50">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          v-for="filter in advancedFilters" 
          :key="filter.key"
          class="space-y-1"
        >
          <label class="block text-xs font-medium text-gray-700 uppercase tracking-wide">
            {{ filter.label }}
          </label>
                      <select
              :value="modelValue[filter.key]"
              @change="(e) => updateFilter(filter.key, (e.target as HTMLSelectElement).value)"
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
            >
            <option value="">{{ filter.placeholder || `All ${filter.label}` }}</option>
            <option 
              v-for="option in filter.options" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  SearchOutline,
  FilterOutline,
  ChevronDownOutline,
  CloseOutline
} from '@vicons/ionicons5'

interface FilterOption {
  value: string
  label: string
}

interface AdvancedFilter {
  key: string
  label: string
  placeholder?: string
  options: FilterOption[]
}

interface QuickFilter {
  type: string
  value: string
  label: string
  activeClass: string
  inactiveClass: string
}

interface FilterModel {
  search: string
  [key: string]: string
}

interface Props {
  modelValue: FilterModel
  searchPlaceholder?: string
  quickFilters?: QuickFilter[]
  advancedFilters?: AdvancedFilter[]
}

interface Emits {
  (e: 'update:modelValue', value: FilterModel): void
  (e: 'clear'): void
}

const props = withDefaults(defineProps<Props>(), {
  searchPlaceholder: 'Search...',
  quickFilters: () => [],
  advancedFilters: () => []
})

const emit = defineEmits<Emits>()

const showAdvancedFilters = ref(false)

const hasActiveFilters = computed(() => {
  return Object.values(props.modelValue).some(value => value && value !== '')
})

const updateFilter = (key: string, value: string) => {
  const newFilters = { ...props.modelValue, [key]: value }
  emit('update:modelValue', newFilters)
}

const toggleQuickFilter = (filterType: string, value: string) => {
  const currentValue = props.modelValue[filterType]
  const newValue = currentValue === value ? '' : value
  updateFilter(filterType, newValue)
}

const clearAllFilters = () => {
  const clearedFilters = Object.keys(props.modelValue).reduce((acc, key) => {
    acc[key] = ''
    return acc
  }, {} as FilterModel)
  emit('update:modelValue', clearedFilters)
  emit('clear')
}

const getQuickFilterClass = (filterType: string, value: string) => {
  const filter = props.quickFilters.find(f => f.type === filterType && f.value === value)
  if (!filter) return 'bg-gray-100 text-gray-600 hover:bg-gray-200'
  
  return props.modelValue[filterType] === value 
    ? filter.activeClass 
    : filter.inactiveClass
}
</script> 