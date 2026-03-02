import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const token = useCookie<string | null>('auth_token')
  const user = ref<any>(null)
  
  const isAuthenticated = computed(() => !!token.value)

  const setToken = (t: string) => {
    token.value = t
  }

  const setUser = (u: any) => {
    user.value = u
  }

  const logout = () => {
    token.value = null
    user.value = null
    navigateTo('/login')
  }

  const runtimeConfig = useRuntimeConfig()

  const fetchProfile = async () => {
    if (!token.value) return null
    try {
      const data = await $fetch(`${runtimeConfig.public.apiBase}/auth/me`, {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      user.value = data
      return data
    } catch (e) {
      console.error('Fetch Profile Failed', e)
      token.value = null
      return null
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    setToken,
    setUser,
    logout,
    fetchProfile
  }
})
