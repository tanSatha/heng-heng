<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'auth'
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
    const token = route.query.token as string

    if (token) {
        authStore.setToken(token)
        
        // Fetch full profile to check username
        await authStore.fetchProfile()

        // Check if username is set
        if (!authStore.user?.username) {
             navigateTo('/set-username')
        } else {
             navigateTo('/home')
        }
    } else {
        // Error case
        navigateTo('/login?error=NoToken')
    }
})
</script>

<template>
    <div class="flex items-center justify-center min-h-screen heng-bg">
        <div class="text-center">
            <div class="text-4xl animate-spin-slow mb-4">⏳</div>
            <p class="text-lg font-bold" style="color: #6b7280;">กำลังเข้าสู่ระบบ...</p>
        </div>
    </div>
</template>
