<script setup lang="ts">
defineProps<{
  records: any[]
}>()
</script>

<template>
  <div class="grid grid-cols-3 gap-4 mb-10 animate-fade-in-up delay-100 px-2">
    <!-- Total Card -->
    <div class="stat-card from-purple-50 to-white border-purple-200">
      <div class="stat-icon bg-purple-100 text-purple-600">
        📝
      </div>
      <div class="stat-content">
        <div class="stat-value text-purple-700">{{ records.length }}</div>
        <div class="stat-label text-purple-600">เลขทั้งหมด</div>
      </div>
    </div>

    <!-- Thai Card -->
    <div class="stat-card from-orange-50 to-white border-orange-200">
      <div class="stat-icon bg-orange-100 text-orange-600">
        🇹🇭
      </div>
      <div class="stat-content">
        <div class="stat-value text-orange-700">
          {{ records.filter(r => r.type === 'THAI').length }}
        </div>
        <div class="stat-label text-orange-600">หวยไทย</div>
      </div>
    </div>

    <!-- Lao Card -->
    <div class="stat-card from-blue-50 to-white border-blue-200">
      <div class="stat-icon bg-blue-100 text-blue-600">
        🇱🇦
      </div>
      <div class="stat-content">
        <div class="stat-value text-blue-700">
          {{ records.filter(r => r.type === 'LAO').length }}
        </div>
        <div class="stat-label text-blue-600">หวยลาว</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 0.5rem;
  border-radius: 1.25rem;
  background: linear-gradient(145deg, var(--tw-gradient-from), var(--tw-gradient-to));
  border-width: 1px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.stat-card:active {
  transform: scale(0.95);
}

.stat-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 0.25rem;
  text-align: center;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  opacity: 0.9;
}
</style>
