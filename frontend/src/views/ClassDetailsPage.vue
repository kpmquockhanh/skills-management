<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- Header -->
    <div class="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between py-8">
          <div class="flex items-center gap-4">
            <button
              @click="$router.go(-1)"
              class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <ArrowBackOutline class="w-6 h-6" />
            </button>
            <div>
              <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {{ classData?.name || 'Class Details' }}
              </h1>
              <p class="text-gray-600 mt-2 text-lg">{{ classData?.code || 'Loading...' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <button
              @click="editClass"
              class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <CreateOutline class="w-5 h-5 mr-2" />
              Edit Class
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="classData" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Overview Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
              <PeopleOutline class="w-6 h-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Enrolled Students</p>
              <p class="text-2xl font-bold text-gray-900">{{ classData.enrolledStudents }}/{{ classData.maxStudents }}</p>
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
              <p class="text-2xl font-bold text-gray-900">{{ classData.skillTrees.length }}</p>
              <p class="text-xs text-gray-500">{{ skillTreesWithFullData.reduce((total, st) => total + getSkillTreeSkillCount(st.fullData || {}), 0) }} total skills</p>
            </div>
          </div>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
              <TimeOutline class="w-6 h-6 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Duration</p>
              <p class="text-2xl font-bold text-gray-900">{{ classData.duration || 'N/A' }}h</p>
            </div>
          </div>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
              <CheckmarkCircleOutline class="w-6 h-6 text-orange-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Status</p>
              <p class="text-2xl font-bold text-gray-900">{{ classData.status }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column - Class Information -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Class Information -->
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
            <div class="p-6 border-b border-gray-200/50">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-xl font-bold text-gray-900">Class Information</h2>
                  <p class="text-gray-600 mt-1">Complete details about this class</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-sm">
                    <div class="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    {{ classData.status }}
                  </span>
                </div>
              </div>
            </div>
            <div class="p-6">
              <!-- Basic Information Grid -->
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <!-- Class Identity -->
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <div class="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span class="text-white text-sm font-bold">ID</span>
                    </div>
                    Class Identity
                  </h3>
                  <div class="space-y-3">
                    <div class="bg-gray-50 rounded-lg p-3">
                      <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</span>
                      <p class="text-gray-900 font-medium mt-1">{{ classData.name }}</p>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-3">
                      <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Code</span>
                      <p class="text-gray-900 font-mono font-medium mt-1">{{ classData.code }}</p>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-3">
                      <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</span>
                      <span class="ml-2 inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-sm mt-1">
                        {{ classData.type }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Class Details -->
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <div class="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <span class="text-white text-sm font-bold">D</span>
                    </div>
                    Class Details
                  </h3>
                  <div class="space-y-3">
                    <div class="bg-gray-50 rounded-lg p-3">
                      <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Level</span>
                      <span
                        class="ml-2 inline-flex px-3 py-1 text-sm font-semibold rounded-full shadow-sm mt-1"
                        :class="{
                          'bg-gradient-to-r from-green-100 to-green-200 text-green-800': classData.level === 'beginner',
                          'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800': classData.level === 'intermediate',
                          'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800': classData.level === 'advanced',
                          'bg-gradient-to-r from-red-100 to-red-200 text-red-800': classData.level === 'expert'
                        }"
                      >
                        {{ classData.level }}
                      </span>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-3">
                      <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</span>
                      <p class="text-gray-900 font-medium mt-1">{{ classData.duration || 'N/A' }} hours</p>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-3">
                      <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Capacity</span>
                      <p class="text-gray-900 font-medium mt-1">{{ classData.enrolledStudents }}/{{ classData.maxStudents }} students</p>
                    </div>
                  </div>
                </div>

                <!-- Class Stats -->
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <div class="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span class="text-white text-sm font-bold">S</span>
                    </div>
                    Quick Stats
                  </h3>
                  <div class="space-y-3">
                    <div class="bg-gray-50 rounded-lg p-3">
                      <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Skill Trees</span>
                      <p class="text-gray-900 font-medium mt-1">{{ classData.skillTrees.length }} assigned</p>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-3">
                      <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Teachers</span>
                      <p class="text-gray-900 font-medium mt-1">{{ classData.teachers?.length || 0 }} assigned</p>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-3">
                      <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Created</span>
                      <p class="text-gray-900 font-medium mt-1">{{ formatDate(classData.createdAt) }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Description Section -->
              <div class="border-t border-gray-200/50 pt-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div class="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <span class="text-white text-sm font-bold">📝</span>
                  </div>
                  Description
                </h3>
                <div class="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl p-4 border border-gray-200/50">
                  <p class="text-gray-700 leading-relaxed text-base">{{ classData.description || 'No description provided for this class.' }}</p>
                </div>
              </div>

              <!-- Additional Information -->
              <div v-if="classData.tags && classData.tags.length > 0" class="border-t border-gray-200/50 pt-6 mt-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div class="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <span class="text-white text-sm font-bold">🏷️</span>
                  </div>
                  Tags
                </h3>
                <div class="flex flex-wrap gap-2">
                  <span v-for="tag in classData.tags" :key="tag" 
                        class="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 shadow-sm hover:from-orange-200 hover:to-orange-300 transition-all duration-200">
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Learning Objectives -->
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
            <div class="p-6 border-b border-gray-200/50">
              <h2 class="text-xl font-bold text-gray-900">Learning Objectives</h2>
            </div>
            <div class="p-6">
              <div v-if="classData.objectives && classData.objectives.length > 0" class="space-y-3">
                <div v-for="(objective, index) in classData.objectives" :key="index" class="flex items-start gap-3">
                  <div class="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span class="text-white text-sm font-bold">{{ index + 1 }}</span>
                  </div>
                  <p class="text-gray-700">{{ objective }}</p>
                </div>
              </div>
              <div v-else class="text-gray-500 italic">No learning objectives defined.</div>
            </div>
          </div>

          <!-- Skill Trees -->
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
            <div class="p-6 border-b border-gray-200/50">
              <h2 class="text-xl font-bold text-gray-900">Skill Trees</h2>
              <p class="text-gray-600 mt-1">Skills and learning paths covered in this class</p>
            </div>
            <div class="p-6">
              <div v-if="skillTreesWithFullData.length > 0" class="space-y-4">
                <div v-for="skillTree in skillTreesWithFullData" :key="skillTree.skillTree._id" 
                     class="bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl border border-gray-200/50 overflow-hidden">
                  <!-- Skill Tree Header -->
                  <div class="p-4">
                    <div class="flex items-start justify-between">
                      <div class="flex items-center flex-1">
                        <div class="flex-shrink-0 h-12 w-12">
                          <div
                            class="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                            :style="{ backgroundColor: skillTree.skillTree.color }"
                          >
                            {{ skillTree.skillTree.icon || skillTree.skillTree.name.charAt(0) }}
                          </div>
                        </div>
                        <div class="ml-4 flex-1">
                          <h3 class="text-lg font-semibold text-gray-900">{{ skillTree.skillTree.name }}</h3>
                          <p class="text-sm text-gray-600">{{ skillTree.skillTree.description }}</p>
                          <div class="flex flex-wrap items-center gap-2 mt-3">
                            <span class="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-sm">
                              <div class="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                              {{ skillTree.level }}
                            </span>
                            <span v-if="skillTree.isRequired" class="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-red-100 to-red-200 text-red-800 shadow-sm">
                              <div class="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></div>
                              Required
                            </span>
                            <span v-else class="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 shadow-sm">
                              <div class="w-1.5 h-1.5 bg-gray-500 rounded-full mr-1.5"></div>
                              Optional
                            </span>
                            <span class="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-sm">
                              <div class="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5"></div>
                              {{ getSkillTreeSkillCount(skillTree.fullData || {}) }} skills
                            </span>
                          </div>
                        </div>
                      </div>
                      <button 
                        @click="toggleSkillTree(skillTree.skillTree._id)"
                        class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronDownOutline v-if="expandSkillTree.has(skillTree.skillTree._id)" class="w-5 h-5" />
                        <ChevronForwardOutline v-else class="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <!-- Skills Details -->
                  <div v-if="expandSkillTree.has(skillTree.skillTree._id)" class="border-t border-gray-200/50 bg-white/50">
                    <div class="p-4 space-y-3">
                      <div v-if="skillTree.fullData?.structure?.roots" class="space-y-2">
                        <div v-for="(rootNode, rootIndex) in (skillTree.fullData.structure.roots || [])" :key="`root-${rootIndex}`" class="space-y-2">
                          <!-- Root Skill -->
                          <div class="flex items-center p-3 bg-white rounded-lg border border-gray-200/50 hover:bg-gray-50 transition-colors">
                            <div class="flex items-center gap-3 flex-1">
                              <div class="w-3 h-3 rounded-full" :style="`background-color: ${rootNode.skillId?.color || '#3B82F6'}`"></div>
                              <div class="flex-1">
                                <span class="text-sm font-medium text-gray-800">{{ rootNode.skillId?.name || 'Unknown Skill' }}</span>
                                <div class="flex flex-wrap items-center gap-2 mt-2">
                                  <span class="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 shadow-sm">
                                    <div class="w-1 h-1 bg-gray-500 rounded-full mr-1.5"></div>
                                    {{ rootNode.skillId?.level || 'beginner' }}
                                  </span>
                                  <span v-if="rootNode.properties?.required" class="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 shadow-sm">
                                    <div class="w-1 h-1 bg-red-500 rounded-full mr-1.5"></div>
                                    Required
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <!-- Child Skills -->
                          <div v-if="rootNode.children && rootNode.children.length > 0" class="ml-6 space-y-2">
                            <div v-for="(childNode, childIndex) in rootNode.children" :key="`child-${rootIndex}-${childIndex}`" class="space-y-2">
                              <!-- Child Skill -->
                              <div class="flex items-center p-3 bg-white rounded-lg border border-gray-200/50 hover:bg-gray-50 transition-colors">
                                <div class="flex items-center gap-3 flex-1">
                                  <div class="w-3 h-3 rounded-full" :style="`background-color: ${childNode.skillId?.color || '#3B82F6'}`"></div>
                                  <div class="flex-1">
                                    <span class="text-sm font-medium text-gray-800">{{ childNode.skillId?.name || 'Unknown Skill' }}</span>
                                    <div class="flex flex-wrap items-center gap-2 mt-2">
                                      <span class="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 shadow-sm">
                                        <div class="w-1 h-1 bg-gray-500 rounded-full mr-1.5"></div>
                                        {{ childNode.skillId?.level || 'beginner' }}
                                      </span>
                                      <span v-if="childNode.properties?.required" class="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 shadow-sm">
                                        <div class="w-1 h-1 bg-red-500 rounded-full mr-1.5"></div>
                                        Required
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <!-- Grandchild Skills -->
                              <div v-if="childNode.children && childNode.children.length > 0" class="ml-6 space-y-2">
                                <div v-for="(grandchildNode, grandchildIndex) in childNode.children" :key="`grandchild-${rootIndex}-${childIndex}-${grandchildIndex}`">
                                  <div class="flex items-center p-3 bg-white rounded-lg border border-gray-200/50 hover:bg-gray-50 transition-colors">
                                    <div class="flex items-center gap-3 flex-1">
                                      <div class="w-3 h-3 rounded-full" :style="`background-color: ${grandchildNode.skillId?.color || '#3B82F6'}`"></div>
                                      <div class="flex-1">
                                        <span class="text-sm font-medium text-gray-800">{{ grandchildNode.skillId?.name || 'Unknown Skill' }}</span>
                                        <div class="flex items-center gap-2 mt-1">
                                          <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                            {{ grandchildNode.skillId?.level || 'beginner' }}
                                          </span>
                                          <span v-if="grandchildNode.properties?.required" class="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">
                                            Required
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- No Skills Message -->
                      <div v-else class="text-center py-4 text-gray-500 text-sm">
                        No skills assigned to this tree yet
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-gray-500 italic">No skill trees assigned to this class.</div>
            </div>
          </div>

          <!-- Assigned Students -->
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
            <div class="p-6 border-b border-gray-200/50">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-xl font-bold text-gray-900">Assigned Students</h2>
                  <p class="text-gray-600 mt-1">{{ classData.students?.length || 0 }} students assigned</p>
                </div>
                <button @click="openStudentModal" class="btn btn-sm bg-gradient-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 text-white">
                  <AddOutline class="w-4 h-4 mr-1" />
                  Assign Student
                </button>
              </div>
            </div>
            <div class="p-6">
              <div v-if="classData.students && classData.students.length > 0" class="space-y-4">
                <div v-for="student in classData.students" :key="student.user._id" 
                     class="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl border border-gray-200/50 hover:bg-gray-100/50 transition-colors">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <img 
                        :src="student.user.photoUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'" 
                        :alt="student.user.name"
                        class="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                      />
                    </div>
                    <div class="ml-4">
                      <h3 class="text-sm font-semibold text-gray-900">{{ student.user.name }}</h3>
                      <p class="text-sm text-gray-600">{{ student.user.email }}</p>
                      <div class="flex items-center gap-2 mt-1">
                        <span class="text-xs text-gray-500">Assigned: {{ formatDate(student.enrolledAt) }}</span>
                        <span class="text-xs text-gray-400">•</span>
                        <span class="text-xs text-gray-500">{{ student.completedSkillTrees?.length || 0 }} skill trees completed</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="text-center">
                      <div class="text-sm font-semibold text-gray-900">{{ student.progress }}%</div>
                      <div class="text-xs text-gray-500">Progress</div>
                    </div>
                    <span
                      class="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full shadow-sm"
                      :class="{
                        'bg-gradient-to-r from-green-100 to-green-200 text-green-800': student.status === 'enrolled',
                        'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800': student.status === 'completed',
                        'bg-gradient-to-r from-red-100 to-red-200 text-red-800': student.status === 'dropped',
                        'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800': student.status === 'pending'
                      }"
                    >
                      <div class="w-1.5 h-1.5 rounded-full mr-1.5" :class="{
                        'bg-green-500': student.status === 'enrolled',
                        'bg-blue-500': student.status === 'completed',
                        'bg-red-500': student.status === 'dropped',
                        'bg-yellow-500': student.status === 'pending'
                      }"></div>
                      {{ student.status }}
                    </span>
                    <button class="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Remove student" @click="removeStudent(student.user._id)">
                      <TrashOutline class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8">
                <div class="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PeopleOutline class="w-8 h-8 text-gray-400" />
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No students assigned</h3>
                <p class="text-gray-600 mb-4">Start by assigning students to this class</p>
                <button @click="openStudentModal" class="btn bg-gradient-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 text-white">
                  <AddOutline class="w-4 h-4 mr-2" />
                  Assign First Student
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Sidebar -->
        <div class="space-y-8">
          <!-- Class Status -->
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
            <div class="p-6 border-b border-gray-200/50">
              <h2 class="text-xl font-bold text-gray-900">Class Status</h2>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm font-medium text-gray-600">Status</span>
                  <div class="">
                    <span
                      class="inline-flex px-3 py-1 text-sm font-semibold rounded-full shadow-sm"
                      :class="{
                        'bg-gradient-to-r from-green-100 to-green-200 text-green-800': classData.status === 'active',
                        'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800': classData.status === 'inactive',
                        'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800': classData.status === 'draft',
                        'bg-gradient-to-r from-red-100 to-red-200 text-red-800': classData.status === 'archived'
                      }"
                    >
                      {{ classData.status }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm font-medium text-gray-600">Created</span>
                  <p class="text-gray-900">{{ formatDate(classData.createdAt) }}</p>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm font-medium text-gray-600">Last Updated</span>
                  <p class="text-gray-900">{{ formatDate(classData.updatedAt) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Teachers -->
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
            <div class="p-6 border-b border-gray-200/50">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-xl font-bold text-gray-900">Teachers</h2>
                  <p class="text-gray-600 mt-1 text-sm">{{ classData.teachers?.length || 0 }} teachers assigned</p>
                </div>
                <button @click="openTeacherModal" class="btn btn-sm bg-gradient-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 text-white">
                  <AddOutline class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div class="p-6">
              <div v-if="classData.teachers && classData.teachers.length > 0" class="space-y-3">
                <div v-for="teacher in classData.teachers" :key="teacher._id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8">
                      <img 
                        :src="teacher.photoUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'" 
                        :alt="teacher.name"
                        class="h-8 w-8 rounded-full object-cover"
                      />
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-gray-900">{{ teacher.name }}</p>
                      <p class="text-xs text-gray-600">{{ teacher.email }}</p>
                    </div>
                  </div>
                  <button
                    @click="removeTeacher(teacher._id)"
                    class="btn btn-sm btn-ghost text-red-600 hover:bg-red-50"
                    title="Remove teacher"
                  >
                    <CloseOutline class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div v-else class="text-center py-8">
                <div class="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PeopleOutline class="w-8 h-8 text-gray-400" />
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No teachers assigned</h3>
                <p class="text-gray-600 mb-4">Start by assigning teachers to this class</p>
                <button @click="openTeacherModal" class="btn bg-gradient-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 text-white">
                  <AddOutline class="w-4 h-4 mr-2" />
                  Assign First Teacher
                </button>
              </div>
            </div>
          </div>

          <!-- Class Settings -->
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
            <div class="p-6 border-b border-gray-200/50">
              <h2 class="text-xl font-bold text-gray-900">Settings</h2>
            </div>
            <div class="p-6">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-600">Self Enrollment</span>
                  <span :class="classData.settings?.allowSelfEnrollment ? 'text-green-600' : 'text-red-600'">
                    {{ classData.settings?.allowSelfEnrollment ? 'Allowed' : 'Not Allowed' }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-600">Require Approval</span>
                  <span :class="classData.settings?.requireApproval ? 'text-red-600' : 'text-green-600'">
                    {{ classData.settings?.requireApproval ? 'Required' : 'Not Required' }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-600">Public Class</span>
                  <span :class="classData.settings?.isPublic ? 'text-green-600' : 'text-red-600'">
                    {{ classData.settings?.isPublic ? 'Public' : 'Private' }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-600">Guest Access</span>
                  <span :class="classData.settings?.allowGuestAccess ? 'text-green-600' : 'text-red-600'">
                    {{ classData.settings?.allowGuestAccess ? 'Allowed' : 'Not Allowed' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div v-if="classData.tags && classData.tags.length > 0" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
            <div class="p-6 border-b border-gray-200/50">
              <h2 class="text-xl font-bold text-gray-900">Tags</h2>
            </div>
            <div class="p-6">
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in classData.tags" :key="tag" 
                      class="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 shadow-sm">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <div class="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircleOutline class="w-12 h-12 text-red-600" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Error Loading Class</h3>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <button
          @click="loadClass"
          class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <RefreshOutline class="w-5 h-5 mr-2" />
          Try Again
        </button>
      </div>
    </div>

    <!-- Student Assignment Modal -->
    <div v-if="showStudentModal" class="modal modal-open">
      <div class="modal-box max-w-4xl">
        <h3 class="font-bold text-lg mb-4">
          Manage Students for {{ classData?.name }}
        </h3>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Current Students -->
          <div>
            <h4 class="font-semibold text-gray-800 mb-3">Current Students</h4>
            <div class="space-y-2 max-h-64 overflow-y-auto">
              <div v-if="classData?.students?.length === 0" class="text-center py-8 text-gray-500">
                <PeopleOutline class="w-8 h-8 mx-auto mb-2" />
                <p>No students assigned</p>
              </div>
              <div
                v-for="student in classData?.students"
                :key="student.user._id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full overflow-hidden">
                    <img 
                      :src="student.user.photoUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'" 
                      :alt="student.user.name"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p class="font-medium text-gray-800">{{ student.user.name }}</p>
                    <p class="text-sm text-gray-600">{{ student.user.email }}</p>
                    <p class="text-xs text-gray-500">{{ student.progress }}% progress</p>
                  </div>
                </div>
                <button
                  @click="removeStudent(student.user._id)"
                  class="btn btn-sm btn-ghost text-red-600 hover:bg-red-50"
                >
                  <CloseOutline class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <!-- Assign New Student -->
          <div>
            <h4 class="font-semibold text-gray-800 mb-3">Assign New Student</h4>
            <div class="space-y-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Select Student</span>
                </label>
                <select
                  v-model="selectedUserId"
                  class="select select-bordered w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a student...</option>
                  <option
                    v-for="user in availableUsers.filter(u => !classData?.students?.find(s => s.user._id === u._id))"
                    :key="user._id"
                    :value="user._id"
                  >
                    {{ user.name }} ({{ user.email }})
                  </option>
                </select>
              </div>
              

            </div>
          </div>
        </div>
        
        <div class="modal-action">
          <button
            @click="showStudentModal = false"
            class="btn btn-outline"
          >
            Close
          </button>
          <button
            @click="assignStudent"
            class="btn bg-gradient-to-r from-green-500 to-blue-500 border-0 hover:from-green-600 hover:to-blue-600 text-white"
            :disabled="!selectedUserId || userManagement.loading"
          >
            <span v-if="userManagement.loading" class="loading loading-spinner loading-sm"></span>
            <span v-else>Assign</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Teacher Assignment Modal -->
    <div v-if="showTeacherModal" class="modal modal-open">
      <div class="modal-box max-w-4xl">
        <h3 class="font-bold text-lg mb-4">
          Manage Teachers for {{ classData?.name }}
        </h3>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Current Teachers -->
          <div>
            <h4 class="font-semibold text-gray-800 mb-3">Current Teachers</h4>
            <div class="space-y-2 max-h-64 overflow-y-auto">
              <div v-if="classData?.teachers?.length === 0" class="text-center py-8 text-gray-500">
                <PeopleOutline class="w-8 h-8 mx-auto mb-2" />
                <p>No teachers assigned</p>
              </div>
              <div
                v-for="teacher in classData?.teachers"
                :key="teacher._id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full overflow-hidden">
                    <img 
                      :src="teacher.photoUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'" 
                      :alt="teacher.name"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p class="font-medium text-gray-800">{{ teacher.name }}</p>
                    <p class="text-sm text-gray-600">{{ teacher.email }}</p>
                  </div>
                </div>
                <button
                  @click="removeTeacher(teacher._id)"
                  class="btn btn-sm btn-ghost text-red-600 hover:bg-red-50"
                >
                  <CloseOutline class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <!-- Assign New Teacher -->
          <div>
            <h4 class="font-semibold text-gray-800 mb-3">Assign New Teacher</h4>
            <div class="space-y-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">Select Teacher</span>
                </label>
                <select
                  v-model="selectedTeacherId"
                  class="select select-bordered w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a teacher...</option>
                  <option
                    v-for="user in availableTeachers.filter(u => !classData?.teachers?.find(t => t._id === u._id))"
                    :key="user._id"
                    :value="user._id"
                  >
                    {{ user.name }} ({{ user.email }})
                  </option>
                </select>
              </div>
              

            </div>
          </div>
        </div>
        
        <div class="modal-action">
          <button
            @click="showTeacherModal = false"
            class="btn btn-outline"
          >
            Close
          </button>
          <button
            @click="assignTeacher"
            class="btn bg-gradient-to-r from-green-500 to-blue-500 border-0 hover:from-green-600 hover:to-blue-600 text-white"
            :disabled="!selectedTeacherId || userManagement.loading"
          >
            <span v-if="userManagement.loading" class="loading loading-spinner loading-sm"></span>
            <span v-else>Assign</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClassStore, type Class } from '../stores/class'
import { useSkillTreeStore } from '../stores/skillTree'
import { useUserManagement, type UserManagementUser, type Class as UserManagementClass } from '@/stores/userManagement'
import { useToast } from 'vue-toastification'
import {
  ArrowBackOutline,
  PeopleOutline,
  TrendingUpOutline,
  TimeOutline,
  CheckmarkCircleOutline,
  CreateOutline,
  AlertCircleOutline,
  RefreshOutline,
  ChevronDownOutline,
  ChevronForwardOutline,
  TrashOutline,
  AddOutline,
  BookOutline,
  CloseOutline
} from '@vicons/ionicons5'

// Route and router
const route = useRoute()
const router = useRouter()

// Store
const classStore = useClassStore()
const skillTreeStore = useSkillTreeStore()
const userManagement = useUserManagement()
const toast = useToast()

// Reactive data
const loading = ref(true)
const error = ref<string | null>(null)
const classData = ref<Class | null>(null)
const expandSkillTree = ref(new Set<string>())

// Student assignment modal state
const showStudentModal = ref(false)
const availableUsers = ref<UserManagementUser[]>([])
const classStudents = ref<UserManagementUser[]>([])
const selectedUserId = ref('')

// Teacher assignment modal state
const showTeacherModal = ref(false)
const availableTeachers = ref<UserManagementUser[]>([])
const selectedTeacherId = ref('')

// Methods
const loadClass = async () => {
  try {
    loading.value = true
    error.value = null
    
    const classId = route.params.id as string
    if (!classId) {
      throw new Error('Class ID is required')
    }
    
    // Load class data and skill trees in parallel
    const [data] = await Promise.all([
      classStore.fetchClassById(classId),
      skillTreeStore.fetchSkillTrees() // Load skill trees to get full structure
    ])
    
    classData.value = data
  } catch (err: any) {
    error.value = err.message || 'Failed to load class details'
    console.error('Error loading class:', err)
  } finally {
    loading.value = false
  }
}

const editClass = () => {
  if (classData.value) {
    router.push(`/classes/${classData.value._id}/edit`)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Skill tree methods
const toggleSkillTree = (skillTreeId: string) => {
  if (expandSkillTree.value.has(skillTreeId)) {
    expandSkillTree.value.delete(skillTreeId)
  } else {
    expandSkillTree.value.add(skillTreeId)
  }
}

const getSkillProgress = (skillName: string) => {
  // Mock progress calculation - you can implement actual logic here
  return Math.floor(Math.random() * 100)
}

// Get skills count for a skill tree
const getSkillTreeSkillCount = (skillTree: any) => {
  let count = 0
  const countSkills = (nodes: any[]) => {
    nodes.forEach(node => {
      count++
      if (node.children && node.children.length > 0) {
        countSkills(node.children)
      }
    })
  }
  
  if (skillTree.structure?.roots) {
    countSkills(skillTree.structure.roots)
  }
  return count
}

// Get full skill tree data by ID
const getFullSkillTreeData = (skillTreeId: string) => {
  return skillTreeStore.skillTrees.find(st => st._id === skillTreeId)
}

// Computed property to get skill trees with full data
const skillTreesWithFullData = computed(() => {
  if (!classData.value?.skillTrees) return []
  
  return classData.value.skillTrees.map(skillTree => ({
    ...skillTree,
    fullData: getFullSkillTreeData(skillTree.skillTree._id)
  }))
})

// Student assignment methods
const openStudentModal = async () => {
  if (!classData.value) return
  
  try {
    // Load all users and current class students
    await Promise.all([
      userManagement.fetchUsers({ limit: 1000 }), // Get all users
      loadClassStudents()
    ])
    
    // Filter users to get only students (type === 'user' or 'kid')
    availableUsers.value = userManagement.users.filter(user => 
      user.type === 'user' || user.type === 'kid'
    )
    showStudentModal.value = true
  } catch (error) {
    return error
  }
}

const loadClassStudents = async () => {
  if (!classData.value) return
  
  try {
    // Get users who are already assigned to this class
    const classStudentIds = classData.value.students?.map(s => s.user._id) || []
    
    // Filter users to get only those assigned to this class
    const allUsers = await userManagement.fetchUsers({ limit: 1000 })
    classStudents.value = userManagement.users.filter(user => 
      classStudentIds.includes(user._id)
    )
  } catch (error) {
    console.error('Error loading class students:', error)
  }
}

const assignStudent = async () => {
  if (!selectedUserId.value || !classData.value) return
  
  try {
    await userManagement.assignUserToClass(selectedUserId.value, classData.value._id, 'assign')
    toast.success('Student assigned to class successfully')
    
    // Refresh class data and student list
    await loadClass()
    await loadClassStudents()
    selectedUserId.value = ''
  } catch (error) {
    toast.error('Failed to assign student to class')
  }
}

const removeStudent = async (userId: string) => {
  if (!classData.value) return
  
  try {
    await userManagement.assignUserToClass(userId, classData.value._id, 'remove')
    toast.success('Student removed from class successfully')
    
    // Refresh class data and student list
    await loadClass()
    await loadClassStudents()
  } catch (error) {
    toast.error('Failed to remove student from class')
  }
}

// Teacher assignment methods
const openTeacherModal = async () => {
  if (!classData.value) return
  
  try {
    // Load all users and filter for teachers only
    await userManagement.fetchUsers({ limit: 1000 })
    
    // Filter users to get only teachers (type === 'teacher' or 'admin')
    availableTeachers.value = userManagement.users.filter(user => 
      user.type === 'teacher' || user.type === 'admin'
    )
    
    showTeacherModal.value = true
  } catch (error) {
    return error
  }
}

const assignTeacher = async () => {
  if (!selectedTeacherId.value || !classData.value) return
  
  try {
    // Use the class store to assign teacher to class
    await classStore.assignTeacherToClass(classData.value._id, selectedTeacherId.value)
    toast.success('Teacher assigned to class successfully')
    
    // Refresh class data
    await loadClass()
    selectedTeacherId.value = ''
  } catch (error) {
    toast.error('Failed to assign teacher to class')
  }
}

const removeTeacher = async (teacherId: string) => {
  if (!classData.value) return
  
  try {
    // Use the class store to remove teacher from class
    await classStore.removeTeacherFromClass(classData.value._id, teacherId)
    toast.success('Teacher removed from class successfully')
    
    // Refresh class data
    await loadClass()
  } catch (error) {
    toast.error('Failed to remove teacher from class')
  }
}

// Lifecycle
onMounted(() => {
  loadClass()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.modal {
  @apply z-50;
}

.modal-box {
  @apply max-h-[90vh] overflow-y-auto;
}

/* Ensure modal actions stay visible */
.modal-action {
  @apply sticky bottom-0 bg-white border-t border-gray-200 p-4;
}

/* Custom scrollbar for student lists */
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