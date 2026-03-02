<script setup lang="ts">
const route = useRoute()

// Define navigation items
const items = [
  { 
    name: 'หน้าแรก', 
    path: '/home', 
    icon: 'i-heroicons-home' 
  },
  { 
    name: 'รายการ', 
    path: '/list', 
    icon: 'i-heroicons-clipboard-document-list' 
  },
  { 
    name: 'เพิ่มเลข', 
    path: '/add', 
    icon: 'i-heroicons-plus-circle',
    highlight: true // Special style for primary action
  },
  { 
    name: 'ตรวจหวย', 
    path: '/result', 
    icon: 'i-heroicons-trophy' 
  },
  { 
    name: 'สมาชิก', 
    path: '/member', 
    icon: 'i-heroicons-user'
  }
]

// Determine if path is active
const isActive = (path: string) => route.path === path
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2">
    <div class="max-w-md mx-auto">
      <nav class="glass-nav flex justify-around items-center px-2 py-3">
        <NuxtLink 
          v-for="item in items" 
          :key="item.path" 
          :to="item.path"
          class="nav-item flex flex-col items-center justify-center gap-1 transition-all duration-300 relative group"
          :class="[
            isActive(item.path) ? 'text-purple-700 active-scale' : 'text-gray-400',
            item.highlight ? '-mt-8' : ''
          ]"
        >
          <!-- Highlighter Background for Active State -->
          <div 
            v-if="isActive(item.path) && !item.highlight" 
            class="absolute -top-8 w-8 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-b-lg shadow-glow opacity-0 transition-all duration-300 group-hover:opacity-100"
          ></div>

          <!-- Icon Wrapper -->
          <div 
            class="icon-wrapper p-2 rounded-2xl transition-all duration-300"
            :class="[
              item.highlight 
                ? 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 shadow-gold text-white p-4 rounded-full transform hover:-translate-y-1' 
                : isActive(item.path) ? 'bg-purple-100/50' : 'hover:bg-gray-100/50'
            ]"
          >
            <UIcon 
              :name="item.icon" 
              :class="item.highlight ? 'text-3xl' : 'text-2xl'" 
            />
          </div>

          <!-- Label -->
          <span 
            class="text-[10px] font-bold tracking-wide transition-all duration-300"
            :class="[
              isActive(item.path) ? 'text-purple-900' : 'text-gray-400',
              item.highlight ? 'mt-1 text-amber-600' : ''
            ]"
          >
            {{ item.name }}
          </span>
          
          <!-- Active Dot indicator -->
          <div 
            v-if="isActive(item.path) && !item.highlight" 
            class="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1 animate-bounce"
          ></div>

        </NuxtLink>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.glass-nav {
  background: rgba(255, 255, 255, 0.85); /* Light frosted glass */
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-top: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 10px 30px -5px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  border-radius: 2rem; /* Capsule shape */
}

.shadow-gold {
  box-shadow: 
    0 4px 15px rgba(245, 158, 11, 0.4),
    0 0 0 4px rgba(255, 255, 255, 0.9); /* White ring around button */
}

.shadow-glow {
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.5);
}

.active-scale {
  transform: translateY(-2px);
}
</style>
