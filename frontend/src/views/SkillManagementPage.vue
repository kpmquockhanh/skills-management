<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- Header -->
    <div class="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-8">
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Skills & Skill Trees
            </h1>
            <p class="text-gray-600 mt-2 text-lg">Build skills and create powerful learning paths</p>
          </div>
          <div class="flex items-center gap-4">
            <button
              @click="openSkillModal()"
              class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <AddOutline class="w-5 h-5 mr-2" />
              Add Skill
            </button>
            <button
              @click="openSkillTreeModal()"
              class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <AddOutline class="w-5 h-5 mr-2" />
              Add Skill Tree
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Overview Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
              <BookOutline class="w-6 h-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Skills</p>
              <p class="text-2xl font-bold text-gray-900">{{ skillStore.skills.length }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
              <TrendingUpOutline class="w-6 h-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Skill Trees</p>
              <p class="text-2xl font-bold text-gray-900">{{ skillTreeStore.skillTrees.length }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
              <PeopleOutline class="w-6 h-6 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Active Users</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalActiveUsers }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-8">
        <div class="flex items-center gap-4 mb-6">
          <FilterOutline class="w-5 h-5 text-blue-600" />
          <h3 class="text-lg font-semibold text-gray-900">Filters & Search</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">Search</label>
            <div class="relative">
              <SearchOutline class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="filters.search"
                type="text"
                placeholder="Search skills or trees..."
                class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
              />
            </div>
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">Category</label>
            <select
              v-model="filters.category"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
            >
              <option value="">All Categories</option>
              <option v-for="category in skillCategories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">Level</label>
            <select
              v-model="filters.level"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">Type</label>
            <select
              v-model="filters.type"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
            >
              <option value="">All Types</option>
              <option value="career">Career</option>
              <option value="domain">Domain</option>
              <option value="technology">Technology</option>
              <option value="role">Role</option>
              <option value="certification">Certification</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">Status</label>
            <select
              v-model="filters.status"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
              <option value="deprecated">Deprecated</option>
              <option value="emerging">Emerging</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Skills Section -->
      <div class="mb-12">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Skills Library</h2>
            <p class="text-gray-600 mt-2">Manage your skill collection and assign them to skill trees</p>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="showSkillAssignmentModal = true"
              class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <LinkOutline class="w-4 h-4 mr-2" />
              <span class="hidden sm:inline">Assign Skills</span>
              <span class="sm:hidden">Assign</span>
            </button>
          </div>
        </div>

        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
          <div v-if="skillStore.loading" class="p-12 text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <p class="text-gray-600 mt-4 text-lg">Loading your skills...</p>
          </div>
          
          <div v-else-if="filteredSkills.length === 0" class="p-12 text-center">
            <div class="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <DocumentTextOutline class="w-12 h-12 text-blue-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">No skills found</h3>
            <p class="text-gray-600 mb-6">Try adjusting your filters or create your first skill.</p>
            <button
              @click="openSkillModal()"
              class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <AddOutline class="w-5 h-5 mr-2" />
              Create Your First Skill
            </button>
          </div>
          
          <!-- Content Views -->
          <div v-else>
            <!-- Desktop Table View -->
            <div class="hidden lg:block overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200/50">
              <thead class="bg-gradient-to-r from-gray-50 to-blue-50/50">
                <tr>
                  <th class="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Skill
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Level
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white/50 divide-y divide-gray-200/50">
                <tr v-for="skill in filteredSkills" :key="skill._id" class="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200">
                  <td class="px-8 py-6 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-12 w-12">
                        <div
                          class="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                          :style="{ backgroundColor: skill.color }"
                        >
                          {{ skill.icon || skill.name.charAt(0) }}
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-lg font-semibold text-gray-900">{{ skill.name }}</div>
                        <div class="text-sm text-gray-600 line-clamp-2 max-w-xs">{{ skill.description }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-6 whitespace-nowrap">
                    <span class="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-sm">
                      {{ skill.category }}
                    </span>
                  </td>
                  <td class="px-6 py-6 whitespace-nowrap">
                    <span
                      class="inline-flex px-3 py-1 text-sm font-semibold rounded-full shadow-sm"
                      :class="{
                        'bg-gradient-to-r from-green-100 to-green-200 text-green-800': skill.level === 'beginner',
                        'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800': skill.level === 'intermediate',
                        'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800': skill.level === 'advanced',
                        'bg-gradient-to-r from-red-100 to-red-200 text-red-800': skill.level === 'expert'
                      }"
                    >
                      {{ skill.level }}
                    </span>
                  </td>
                  <td class="px-6 py-6 whitespace-nowrap">
                    <span
                      class="inline-flex px-3 py-1 text-sm font-semibold rounded-full shadow-sm"
                      :class="{
                        'bg-gradient-to-r from-green-100 to-green-200 text-green-800': skill.status === 'active',
                        'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800': skill.status === 'inactive',
                        'bg-gradient-to-r from-red-100 to-red-200 text-red-800': skill.status === 'deprecated',
                        'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800': skill.status === 'emerging'
                      }"
                    >
                      {{ skill.status }}
                    </span>
                  </td>
                  <td class="px-6 py-6 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center justify-end gap-3">
                      <button
                        @click="assignSkillToTree(skill)"
                        class="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all duration-200"
                        title="Assign to Skill Tree"
                      >
                        <LinkOutline class="w-5 h-5" />
                      </button>
                      <button
                        @click="openSkillModal(skill)"
                        class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="Edit Skill"
                      >
                        <SettingsOutline class="w-5 h-5" />
                      </button>
                      <button
                        @click="deleteSkill(skill._id)"
                        class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete Skill"
                      >
                        <TrashOutline class="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

            <!-- Mobile Card View -->
            <div class="lg:hidden p-4 space-y-4">
              <div v-for="skill in filteredSkills" :key="skill._id" 
                   class="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-200">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center flex-1 min-w-0">
                    <div class="flex-shrink-0 h-12 w-12">
                      <div
                        class="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                        :style="{ backgroundColor: skill.color }"
                      >
                        {{ skill.icon || skill.name.charAt(0) }}
                      </div>
                    </div>
                    <div class="ml-3 flex-1 min-w-0">
                      <h3 class="text-lg font-semibold text-gray-900 truncate">{{ skill.name }}</h3>
                      <p class="text-sm text-gray-600 line-clamp-2">{{ skill.description }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 ml-2">
                    <button
                      @click="assignSkillToTree(skill)"
                      class="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all duration-200"
                      title="Assign to Skill Tree"
                    >
                      <LinkOutline class="w-4 h-4" />
                    </button>
                    <button
                      @click="openSkillModal(skill)"
                      class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      title="Edit Skill"
                    >
                      <SettingsOutline class="w-4 h-4" />
                    </button>
                    <button
                      @click="deleteSkill(skill._id)"
                      class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Delete Skill"
                    >
                      <TrashOutline class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2">
                  <span class="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-sm">
                    {{ skill.category }}
                  </span>
                  <span
                    class="inline-flex px-3 py-1 text-xs font-semibold rounded-full shadow-sm"
                    :class="{
                      'bg-gradient-to-r from-green-100 to-green-200 text-green-800': skill.level === 'beginner',
                      'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800': skill.level === 'intermediate',
                      'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800': skill.level === 'advanced',
                      'bg-gradient-to-r from-red-100 to-red-200 text-red-800': skill.level === 'expert'
                    }"
                  >
                    {{ skill.level }}
                  </span>
                  <span
                    class="inline-flex px-3 py-1 text-xs font-semibold rounded-full shadow-sm"
                    :class="{
                      'bg-gradient-to-r from-green-100 to-green-200 text-green-800': skill.status === 'active',
                      'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800': skill.status === 'inactive',
                      'bg-gradient-to-r from-red-100 to-red-200 text-red-800': skill.status === 'deprecated',
                      'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800': skill.status === 'emerging'
                    }"
                  >
                    {{ skill.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Skill Trees Section -->
      <div class="mb-12">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Skill Trees</h2>
            <p class="text-gray-600 mt-2">Create learning paths and organize skills hierarchically</p>
          </div>
        </div>

        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
          <div v-if="skillTreeStore.loading" class="p-12 text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mx-auto"></div>
            <p class="text-gray-600 mt-4 text-lg">Loading your skill trees...</p>
          </div>
          
          <div v-else-if="filteredSkillTrees.length === 0" class="p-12 text-center">
            <div class="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUpOutline class="w-12 h-12 text-green-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">No skill trees found</h3>
            <p class="text-gray-600 mb-6">Try adjusting your filters or create your first skill tree.</p>
            <button
              @click="openSkillTreeModal()"
              class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <AddOutline class="w-5 h-5 mr-2" />
              Create Your First Skill Tree
            </button>
          </div>
          
          <!-- Content Views -->
          <div v-else>
            <!-- Desktop Table View -->
            <div class="hidden lg:block overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200/50">
              <thead class="bg-gradient-to-r from-gray-50 to-green-50/50">
                <tr>
                  <th class="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Skill Tree
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Skills
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white/50 divide-y divide-gray-200/50">
                <tr v-for="skillTree in filteredSkillTrees" :key="skillTree._id" class="hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/50 transition-all duration-200">
                  <td class="px-8 py-6 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-12 w-12">
                        <div
                          class="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                          :style="{ backgroundColor: skillTree.color }"
                        >
                          {{ skillTree.icon || skillTree.name.charAt(0) }}
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-lg font-semibold text-gray-900">{{ skillTree.name }}</div>
                        <div class="text-sm text-gray-600 line-clamp-2 max-w-xs">{{ skillTree.description }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-6 whitespace-nowrap">
                    <span class="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-sm">
                      {{ skillTree.type }}
                    </span>
                  </td>
                  <td class="px-6 py-6 whitespace-nowrap">
                    <span class="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-sm">
                      {{ getSkillTreeSkillCount(skillTree._id) }}
                    </span>
                  </td>
                  <td class="px-6 py-6 whitespace-nowrap">
                    <span
                      class="inline-flex px-3 py-1 text-sm font-semibold rounded-full shadow-sm"
                      :class="{
                        'bg-gradient-to-r from-green-100 to-green-200 text-green-800': skillTree.status === 'active',
                        'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800': skillTree.status === 'inactive',
                        'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800': skillTree.status === 'draft',
                        'bg-gradient-to-r from-red-100 to-red-200 text-red-800': skillTree.status === 'archived'
                      }"
                    >
                      {{ skillTree.status }}
                    </span>
                  </td>
                  <td class="px-6 py-6 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center justify-end gap-3">
                      <button
                        @click="manageSkillTreeSkills(skillTree)"
                        class="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all duration-200"
                        title="Manage Skills"
                      >
                        <LinkOutline class="w-5 h-5" />
                      </button>
                      <button
                        @click="openSkillTreeModal(skillTree)"
                        class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                        title="Edit Skill Tree"
                      >
                        <SettingsOutline class="w-5 h-5" />
                      </button>
                      <button
                        @click="deleteSkillTree(skillTree._id)"
                        class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete Skill Tree"
                      >
                        <TrashOutline class="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

            <!-- Mobile Card View -->
            <div class="lg:hidden p-4 space-y-4">
              <div v-for="skillTree in filteredSkillTrees" :key="skillTree._id" 
                   class="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-200">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center flex-1 min-w-0">
                    <div class="flex-shrink-0 h-12 w-12">
                      <div
                        class="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                        :style="{ backgroundColor: skillTree.color }"
                      >
                        {{ skillTree.icon || skillTree.name.charAt(0) }}
                      </div>
                    </div>
                    <div class="ml-3 flex-1 min-w-0">
                      <h3 class="text-lg font-semibold text-gray-900 truncate">{{ skillTree.name }}</h3>
                      <p class="text-sm text-gray-600 line-clamp-2">{{ skillTree.description }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 ml-2">
                    <button
                      @click="manageSkillTreeSkills(skillTree)"
                      class="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all duration-200"
                      title="Manage Skills"
                    >
                      <LinkOutline class="w-4 h-4" />
                    </button>
                    <button
                      @click="openSkillTreeModal(skillTree)"
                      class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                      title="Edit Skill Tree"
                    >
                      <SettingsOutline class="w-4 h-4" />
                    </button>
                    <button
                      @click="deleteSkillTree(skillTree._id)"
                      class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Delete Skill Tree"
                    >
                      <TrashOutline class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2">
                  <span class="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-sm">
                    {{ skillTree.type }}
                  </span>
                  <span class="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-sm">
                    {{ getSkillTreeSkillCount(skillTree._id) }} skills
                  </span>
                  <span
                    class="inline-flex px-3 py-1 text-xs font-semibold rounded-full shadow-sm"
                    :class="{
                      'bg-gradient-to-r from-green-100 to-green-200 text-green-800': skillTree.status === 'active',
                      'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800': skillTree.status === 'inactive',
                      'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800': skillTree.status === 'draft',
                      'bg-gradient-to-r from-red-100 to-red-200 text-red-800': skillTree.status === 'archived'
                    }"
                  >
                    {{ skillTree.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <SkillModal
      :is-open="showSkillModal"
      :skill="selectedSkill"
      @close="closeSkillModal"
      @saved="saveSkill"
    />
    
    <SkillTreeModal
      :is-open="showSkillTreeModal"
      :skill-tree="selectedSkillTree"
      @close="closeSkillTreeModal"
      @saved="saveSkillTree"
    />

    <!-- Skill Assignment Modal -->
    <SkillAssignmentModal
      :is-open="showSkillAssignmentModal"
      :skills="skillStore.skills"
      :skill-trees="skillTreeStore.skillTrees"
      @close="showSkillAssignmentModal = false"
      @save="handleSkillAssignments"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSkillStore } from '@/stores/skill'
import { useSkillTreeStore } from '@/stores/skillTree'
import SkillModal from '@/components/SkillModal.vue'
import SkillTreeModal from '@/components/SkillTreeModal.vue'
import SkillAssignmentModal from '@/components/SkillAssignmentModal.vue'
import {
  BookOutline,
  TrendingUpOutline,
  AddOutline,
  FilterOutline,
  SearchOutline,
  SettingsOutline,
  TrashOutline,
  DocumentTextOutline,
  PeopleOutline,
  StarOutline,
  LinkOutline,
  CloseOutline
} from '@vicons/ionicons5'

// Stores
const skillStore = useSkillStore()
const skillTreeStore = useSkillTreeStore()

// Reactive data
const showSkillModal = ref(false)
const showSkillTreeModal = ref(false)
const showSkillAssignmentModal = ref(false)
const selectedSkill = ref(null)
const selectedSkillTree = ref(null)

// Filters
const filters = ref({
  search: '',
  category: '',
  level: '',
  type: '',
  status: ''
})

// Computed properties
const skillCategories = computed(() => {
  const categories = new Set()
  skillStore.skills.forEach(skill => {
    if (skill.category) categories.add(skill.category)
  })
  return Array.from(categories).sort()
})

const filteredSkills = computed(() => {
  return skillStore.skills.filter(skill => {
    const matchesSearch = !filters.value.search || 
      skill.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      skill.description.toLowerCase().includes(filters.value.search.toLowerCase())
    
    const matchesCategory = !filters.value.category || skill.category === filters.value.category
    const matchesLevel = !filters.value.level || skill.level === filters.value.level
    const matchesStatus = !filters.value.status || skill.status === filters.value.status
    
    return matchesSearch && matchesCategory && matchesLevel && matchesStatus
  })
})

const filteredSkillTrees = computed(() => {
  return skillTreeStore.skillTrees.filter(skillTree => {
    const matchesSearch = !filters.value.search || 
      skillTree.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      skillTree.description.toLowerCase().includes(filters.value.search.toLowerCase())
    
    const matchesType = !filters.value.type || skillTree.type === filters.value.type
    const matchesStatus = !filters.value.status || skillTree.status === filters.value.status
    
    return matchesSearch && matchesType && matchesStatus
  })
})

const totalActiveUsers = computed(() => {
  return skillStore.skills.reduce((total, skill) => total + (skill.stats?.totalUsers || 0), 0)
})

// Methods
const openSkillModal = (skill = null) => {
  selectedSkill.value = skill
  showSkillModal.value = true
}

const closeSkillModal = () => {
  selectedSkill.value = null
  showSkillModal.value = false
}

const openSkillTreeModal = (skillTree = null) => {
  selectedSkillTree.value = skillTree
  showSkillTreeModal.value = true
}

const closeSkillTreeModal = () => {
  selectedSkillTree.value = null
  showSkillTreeModal.value = false
}

const saveSkill = async (skill) => {
  try {
    // The skill is already saved by the modal component
    // We just need to close the modal
    closeSkillModal()
  } catch (error) {
    console.error('Error saving skill:', error)
  }
}

const saveSkillTree = async (skillTree) => {
  try {
    // The skill tree is already saved by the modal component
    // We just need to close the modal
    closeSkillTreeModal()
  } catch (error) {
    console.error('Error saving skill tree:', error)
  }
}

const deleteSkill = async (skillId) => {
  if (confirm('Are you sure you want to delete this skill?')) {
    try {
      await skillStore.deleteSkill(skillId)
    } catch (error) {
      console.error('Error deleting skill:', error)
    }
  }
}

const deleteSkillTree = async (skillTreeId) => {
  if (confirm('Are you sure you want to delete this skill tree?')) {
    try {
      await skillTreeStore.deleteSkillTree(skillTreeId)
    } catch (error) {
      console.error('Error deleting skill tree:', error)
    }
  }
}

const assignSkillToTree = (skill) => {
  selectedSkill.value = skill
  showSkillAssignmentModal.value = true
}

const manageSkillTreeSkills = (skillTree) => {
  selectedSkillTree.value = skillTree
  showSkillAssignmentModal.value = true
}

// Helper methods for skill-tree relationships
const getSkillTreeIds = (skillId) => {
  const treeIds = []
  skillTreeStore.skillTrees.forEach(tree => {
    if (tree.structure?.roots) {
      const hasSkill = checkSkillInTree(tree.structure.roots, skillId)
      if (hasSkill) {
        treeIds.push(tree._id)
      }
    }
  })
  return treeIds
}

const checkSkillInTree = (nodes, skillId) => {
  for (const node of nodes) {
    if (node.skillId?._id === skillId || node.skillId === skillId) {
      return true
    }
    if (node.children && node.children.length > 0) {
      if (checkSkillInTree(node.children, skillId)) {
        return true
      }
    }
  }
  return false
}

const getSkillTreeName = (treeId) => {
  const skillTree = skillTreeStore.skillTrees.find(tree => tree._id === treeId)
  return skillTree ? skillTree.name : 'Unknown'
}

const getSkillTreeSkillIds = (treeId) => {
  const skillIds = []
  const skillTree = skillTreeStore.skillTrees.find(tree => tree._id === treeId)
  
  if (skillTree?.structure?.roots) {
    collectSkillIds(skillTree.structure.roots, skillIds)
  }
  
  return skillIds
}

const collectSkillIds = (nodes, skillIds) => {
  for (const node of nodes) {
    if (node.skillId?._id) {
      skillIds.push(node.skillId._id)
    } else if (node.skillId) {
      skillIds.push(node.skillId)
    }
    if (node.children && node.children.length > 0) {
      collectSkillIds(node.children, skillIds)
    }
  }
}

const getSkillTreeSkillCount = (treeId) => {
  return getSkillTreeSkillIds(treeId).length
}

const getSkillName = (skillId) => {
  const skill = skillStore.skills.find(s => s._id === skillId)
  return skill ? skill.name : 'Unknown'
}

const handleSkillAssignments = async (assignments) => {
  console.log('assignments', assignments)
  try {
    const { additions, removals } = assignments
    
    // Show loading state
    const loadingMessage = document.createElement('div')
    loadingMessage.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
    loadingMessage.textContent = 'Saving skill assignments...'
    document.body.appendChild(loadingMessage)
    
    // Handle additions - group by skill tree
    if (additions && additions.length > 0) {
      const additionsByTree = new Map()
      
      additions.forEach(({ skillId, treeId }) => {
        if (!additionsByTree.has(treeId)) {
          additionsByTree.set(treeId, [])
        }
        additionsByTree.get(treeId).push({ skillId })
      })
      
      // Save additions for each skill tree
      const additionPromises = Array.from(additionsByTree.entries()).map(([treeId, treeAssignments]) => {
        return skillTreeStore.bulkAssignSkills(treeId, treeAssignments)
      })
      
      await Promise.all(additionPromises)
    }
    
    // Handle removals - group by skill tree for bulk removal
    if (removals && removals.length > 0) {
      const removalsByTree = new Map()
      
      removals.forEach(({ skillId, treeId }) => {
        if (!removalsByTree.has(treeId)) {
          removalsByTree.set(treeId, [])
        }
        removalsByTree.get(treeId).push(skillId)
      })

      console.log('removalsByTree', removalsByTree)
      
      // Remove skills from each skill tree in bulk
      const removalPromises = Array.from(removalsByTree.entries()).map(([treeId, skillIds]) => {
        return skillTreeStore.bulkRemoveSkills(treeId, skillIds)
      })
      
      await Promise.all(removalPromises)
    }
    
    showSkillAssignmentModal.value = false
    
    // Refresh the data to show updated assignments
    await Promise.all([
      skillStore.fetchSkills(),
      skillTreeStore.fetchSkillTrees()
    ])
    
    // Show success message
    loadingMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
    loadingMessage.textContent = 'Skill assignments saved successfully!'
    setTimeout(() => {
      document.body.removeChild(loadingMessage)
    }, 3000)
    
  } catch (error) {
    console.error('Error saving skill assignments:', error)
    
    // Show error message
    const errorMessage = document.createElement('div')
    errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
    errorMessage.textContent = 'Error saving skill assignments. Please try again.'
    document.body.appendChild(errorMessage)
    setTimeout(() => {
      document.body.removeChild(errorMessage)
    }, 5000)
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      skillStore.fetchSkills(),
      skillTreeStore.fetchSkillTrees()
    ])
  } catch (error) {
    console.error('Error loading data:', error)
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 