<template>
  <div class="max-w-4xl mx-auto px-6 py-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl mt-4 transform transition-all duration-500 hover:shadow-2xl">
    <div class="flex flex-col items-center justify-center py-8">
      <div class="relative w-32 h-32 mb-6 animate-bounce-slow">
        <img 
          src="https://cdn-icons-png.flaticon.com/512/1178/1178428.png" 
          alt="Welcome Icon" 
          class="w-full h-full object-contain transform hover:scale-110 transition-transform duration-300"
        >
        <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-blue-500 rounded-full opacity-50"></div>
      </div>
      
      <h2 class="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Welcome to Memo!
      </h2>
      
      <p class="text-gray-600 text-center text-lg leading-relaxed max-w-2xl mb-8">
        Capture, share, and relive your precious moments with our beautiful photo sharing platform.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-8">
        <div class="feature-card">
          <div class="text-2xl mb-2">📸</div>
          <h3 class="font-semibold mb-2">Capture Memories</h3>
          <p class="text-gray-600 text-sm">Upload and organize your photos with ease</p>
        </div>
        
        <div class="feature-card">
          <div class="text-2xl mb-2">🔒</div>
          <h3 class="font-semibold mb-2">Privacy Control</h3>
          <p class="text-gray-600 text-sm">Choose what to share and what to keep private</p>
        </div>
        
        <div class="feature-card">
          <div class="text-2xl mb-2">👥</div>
          <h3 class="font-semibold mb-2">Connect</h3>
          <p class="text-gray-600 text-sm">Share moments with friends and family</p>
        </div>
        
        <div class="feature-card">
          <div class="text-2xl mb-2">✨</div>
          <h3 class="font-semibold mb-2">Beautiful UI</h3>
          <p class="text-gray-600 text-sm">Enjoy a stunning and intuitive interface</p>
        </div>
      </div>

      <button 
        class="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 font-semibold text-lg"
        @click="$emit('start')"
      >
        Get Started
      </button>
    </div>
  </div>
</template>

<script setup>
// No additional script needed
</script>

<style scoped>
.animate-bounce-slow {
  animation: bounce 3s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.feature-card {
  @apply p-4 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow duration-300;
  @apply border border-gray-100 hover:border-blue-100;
  @apply transform hover:-translate-y-1 transition-transform duration-300;
}
</style>
