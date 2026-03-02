<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const isOpen = ref(false)

const closeMenu = () => {
  isOpen.value = false
}
</script>

<template>
  <div class="flex items-center justify-between mb-8 animate-fade-in-up">
    <!-- Menu Button & Title -->
    <div class="flex items-center gap-3">
      <button @click="isOpen = true" class="p-2 -ml-2 rounded-full text-amber-500 hover:bg-amber-50 active:scale-95 transition-all">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h8m-8 6h16" />
        </svg>
      </button>

      <div>
        <h1 class="text-2xl sm:text-3xl font-black text-gold-gradient"
          style="filter: drop-shadow(0 2px 8px rgba(255,215,0,0.15));">
          📖 บุ๊คเลข
        </h1>
        <p class="text-sm mt-1 font-medium text-gray-600">
          สวัสดี, <span class="text-purple-700 font-bold">{{ authStore.user?.username || 'สมาชิก' }}</span> 👋
        </p>
      </div>
    </div>
    
    <!-- Profile Avatar -->
    <NuxtLink to="/member" class="relative group cursor-pointer transition-transform active:scale-95">
      <div class="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-500 shadow-md group-hover:shadow-gold transition-all">
        <img 
          :src="authStore.user?.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${authStore.user?.username || 'user'}`"
          class="w-full h-full rounded-full object-cover bg-slate-50 border-2 border-white"
          alt="Profile"
        />
      </div>
    </NuxtLink>

    <!-- Sidebar Menu Overlay -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-show="isOpen" class="fixed inset-0 z-[100] flex">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="closeMenu"></div>

          <!-- Slide-in Panel -->
          <Transition name="slide-left">
            <div v-show="isOpen" class="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col pointer-events-auto border-r border-amber-100">
              
              <!-- Header -->
              <div class="p-6 bg-gradient-to-br from-amber-50 to-yellow-50/20 border-b border-amber-100/50">
                <div class="flex justify-between items-center mb-6">
                  <h2 class="text-2xl font-black text-gold-gradient">เมนูหลัก</h2>
                  <button @click="closeMenu" class="p-1 rounded-full text-gray-400 hover:bg-white hover:text-gray-600 transition-colors shadow-sm bg-white/50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div class="flex items-center gap-3">
                  <img 
                    :src="authStore.user?.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${authStore.user?.username || 'user'}`"
                    class="w-12 h-12 rounded-full object-cover bg-slate-50 border-2 border-white shadow-md shadow-amber-200"
                    alt="Profile"
                  />
                  <div>
                    <h3 class="font-bold text-gray-800 leading-tight">{{ authStore.user?.username || 'สมาชิกท่านหนึ่ง' }}</h3>
                    <p class="text-xs text-amber-600 font-medium">สมาชิก <span class="text-green-500">•</span> ออนไลน์</p>
                  </div>
                </div>
              </div>

              <!-- Nav Links -->
              <div class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                <NuxtLink to="/home" @click="closeMenu" class="flex items-center gap-4 p-3 rounded-2xl transition-all text-gray-700 hover:bg-amber-50 hover:text-amber-600 group" active-class="bg-gradient-to-r from-amber-400 to-amber-500 !text-white shadow-md shadow-amber-200 pointer-events-none">
                  <span class="text-xl w-6 text-center">🏠</span>
                  <span class="font-bold">หน้าหลัก</span>
                </NuxtLink>

                <NuxtLink to="/add" @click="closeMenu" class="flex items-center gap-4 p-3 rounded-2xl transition-all text-gray-700 hover:bg-amber-50 hover:text-amber-600 group" active-class="bg-gradient-to-r from-amber-400 to-amber-500 !text-white shadow-md shadow-amber-200 pointer-events-none">
                  <span class="text-xl w-6 text-center">✨</span>
                  <span class="font-bold">เพิ่มเลขเด็ด</span>
                </NuxtLink>

                <NuxtLink to="/list" @click="closeMenu" class="flex items-center gap-4 p-3 rounded-2xl transition-all text-gray-700 hover:bg-amber-50 hover:text-amber-600 group" active-class="bg-gradient-to-r from-amber-400 to-amber-500 !text-white shadow-md shadow-amber-200 pointer-events-none">
                  <span class="text-xl w-6 text-center">📋</span>
                  <span class="font-bold">รายการบันทึก</span>
                </NuxtLink>

                <NuxtLink to="/wins" @click="closeMenu" class="flex items-center gap-4 p-3 rounded-2xl transition-all text-gray-700 hover:bg-amber-50 hover:text-amber-600 group" active-class="bg-gradient-to-r from-green-500 to-emerald-500 !text-white shadow-md shadow-green-200 pointer-events-none">
                  <span class="text-xl w-6 text-center">🎉</span>
                  <span class="font-bold">ประวัติถูกรางวัล</span>
                </NuxtLink>

                <NuxtLink to="/result" @click="closeMenu" class="flex items-center gap-4 p-3 rounded-2xl transition-all text-gray-700 hover:bg-amber-50 hover:text-amber-600 group" active-class="bg-gradient-to-r from-amber-400 to-amber-500 !text-white shadow-md shadow-amber-200 pointer-events-none">
                  <span class="text-xl w-6 text-center">🏆</span>
                  <span class="font-bold">ตรวจผลรางวัล</span>
                </NuxtLink>
                
                <div class="h-px bg-gray-100 my-4 mx-2"></div>

                <NuxtLink to="/member" @click="closeMenu" class="flex items-center gap-4 p-3 rounded-2xl transition-all text-gray-700 hover:bg-amber-50 hover:text-amber-600 group" active-class="bg-gradient-to-r from-amber-400 to-amber-500 !text-white shadow-md shadow-amber-200 pointer-events-none">
                  <span class="text-xl w-6 text-center">👤</span>
                  <span class="font-bold">ข้อมูลสมาชิก</span>
                </NuxtLink>
              </div>

              <!-- Footer -->
              <div class="p-4 border-t border-gray-100 bg-gray-50/50">
                <button @click="authStore.logout(); closeMenu();" class="flex items-center gap-3 w-full p-3 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors font-bold group">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  ออกจากระบบ
                </button>
              </div>

            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Slide classes for transition wrapper */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
