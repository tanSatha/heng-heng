export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()
  
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  // If token exists but user data is missing, try to fetch profile
  if (authStore.isAuthenticated && !authStore.user) {
    try {
      await authStore.fetchProfile()
      if (!authStore.user) {
        // If fetch failed (e.g. 401), clear token and redirect
        authStore.logout()
        return navigateTo('/login')
      }
    } catch (e) {
        authStore.logout()
        return navigateTo('/login')
    }
  }
})
