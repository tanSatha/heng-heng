<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const config = useRuntimeConfig()
const router = useRouter()

definePageMeta({
  layout: 'auth'
})

const username = ref('')
const loading = ref(false)
const errorMsg = ref('')

onMounted(() => {
    if (!authStore.isAuthenticated) {
        navigateTo('/login')
        return
    }
    // If username already set, go home
    if (authStore.user?.username) {
        navigateTo('/home')
    }
})

const submitUsername = async () => {
    if (!username.value || username.value.length < 3) {
        errorMsg.value = 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร / Username must be at least 3 characters'
        return
    }

    // Check pattern (optional: a-z, 0-9, _)
    if (!/^[a-zA-Z0-9_]+$/.test(username.value)) {
        errorMsg.value = 'ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษรภาษาอังกฤษ ตัวเลข และ _ เท่านั้น'
        return
    }

    loading.value = true
    errorMsg.value = ''

    try {
        const res = await $fetch<{ access_token: string, user: any }>(`${config.public.apiBase}/auth/set-username`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authStore.token}`
            },
            body: { username: username.value }
        })

        if (res.access_token) {
            authStore.setToken(res.access_token)
            authStore.setUser(res.user)
            navigateTo('/home')
        }
    } catch (err: any) {
        console.error(err)
        if (err.statusCode === 409) {
            errorMsg.value = 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว / Username already taken'
        } else {
            errorMsg.value = 'เกิดข้อผิดพลาดในการตั้งชื่อผู้ใช้ / Failed to set username'
        }
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="heng-bg min-h-screen flex items-center justify-center relative overflow-hidden py-10 px-4">
        <!-- Decoration -->
        <div class="ornament-ring" style="width: 400px; height: 400px; top: -100px; right: -100px;"></div>
        <div class="heng-particles">
            <div class="particle particle-gold" style="width: 200px; height: 200px; top: 10%; right: 20%;"></div>
        </div>

        <div class="relative z-10 w-full max-w-md">
            <div class="text-center mb-8 animate-fade-in-up">
                <div class="text-5xl mb-4">👋</div>
                <h1 class="text-3xl font-black text-gold-gradient">ยินดีต้อนรับ!</h1>
                <p class="text-base mt-2" style="color: #6b7280;">
                    กรุณาตั้งชื่อผู้ใช้ของคุณเพื่อเริ่มต้น
                </p>
            </div>

            <div class="glass-card p-7 sm:p-8 animate-fade-in-up delay-200">
                <!-- Error Message -->
                <div v-if="errorMsg" class="mb-5 p-3.5 rounded-xl text-sm text-center animate-fade-in-scale"
                    style="background: rgba(254, 226, 226, 0.5); border: 1px solid rgba(239, 68, 68, 0.3); color: #b91c1c;">
                    {{ errorMsg }}
                </div>

                <form @submit.prevent="submitUsername" class="space-y-5">
                    <div>
                        <label class="heng-label">ชื่อผู้ใช้ / Username</label>
                        <div class="relative">
                            <div class="input-icon">
                                <UIcon name="i-heroicons-user" class="text-lg" style="color: #9333ea;" />
                            </div>
                            <input
                                v-model="username"
                                type="text"
                                placeholder="username"
                                class="heng-input"
                                required
                            />
                        </div>
                        <p class="text-xs mt-2 text-right" style="color: #9ca3af;">
                            * ภาษาอังกฤษ ตัวเลข และ _ เท่านั้น
                        </p>
                    </div>

                    <button
                        type="submit"
                        :disabled="loading"
                        class="btn-gold w-full py-4 rounded-xl text-lg flex items-center justify-center gap-2"
                    >
                        <span>{{ loading ? 'กำลังบันทึก...' : '✨ เริ่มใช้งาน' }}</span>
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.input-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  display: flex;
  align-items: center;
}
</style>
