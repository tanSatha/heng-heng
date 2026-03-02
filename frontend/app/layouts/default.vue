<script setup lang="ts">
// Default Layout
// Universal layout with 'heng-bg' theme
import HomeHeader from '~/components/home/HomeHeader.vue'
</script>

<template>
  <div class="heng-bg min-h-screen flex flex-col relative text-slate-800 font-sans overflow-x-hidden">
    <!-- Main Content Area - full width, scrollable, padded bottom for nav -->
    <main class="flex-grow pb-28 relative z-10 w-full">
      <div class="max-w-4xl mx-auto px-4 pt-8 w-full z-50">
        <HomeHeader />
      </div>
      <slot />
    </main>
    
    <!-- Mobile Bottom Navigation (Floating) -->
    <BottomNav />
  </div>
</template>

<style>
/* Global Layout Styles */
html, body {
  @apply antialiased scroll-smooth;
}

/* Theme Background */
.heng-bg {
  background-color: #fcfcfc;
  background-image: 
    radial-gradient(at 0% 0%, rgba(251, 191, 36, 0.15) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(251, 146, 60, 0.1) 0px, transparent 40%),
    radial-gradient(at 100% 100%, rgba(244, 63, 94, 0.05) 0px, transparent 40%);
  background-attachment: fixed;
}
</style>
