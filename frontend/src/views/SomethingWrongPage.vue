<script setup lang="ts">
</script>

<template>
  <section class="bg-white w-full">
    <div class="container flex items-center min-h-screen px-6 py-12 mx-auto">
      <div>
        <p class="text-sm font-medium text-blue-500 dark:text-blue-400">Oh no!!!</p>
        <h1 class="mt-3 text-2xl font-semibold text-gray-800 md:text-3xl">
          Something went wrong!!!
        </h1>
        <p class="mt-4 text-gray-500 dark:text-gray-400">
          We apologize for the inconvenience, but it seems that something went wrong with our website.
          We understand that encountering errors can be frustrating, and we're here to assist you in resolving the issue.
          Our team has been alerted to the problem and is working diligently to fix it as quickly as possible.</p>
        <div class="flex items-center mt-6 gap-x-3">
          <button class="btn btn-sm flex items-center justify-center" @click="$router.back()">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 rtl:rotate-180">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
            </svg>
            <span>Go back</span>
          </button>

          <router-link to="/" class="btn btn-info"> Back to home page </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>

</style>
