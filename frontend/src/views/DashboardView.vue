<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="welcome-container">
    <div class="welcome-card">
      <h1 class="welcome-heading">Welcome</h1>
      <p v-if="authStore.user?.fullName" class="welcome-sub">
        {{ authStore.user.fullName }}
      </p>
      <button class="logout-button" @click="handleLogout">
        Logout
      </button>
    </div>
  </div>
</template>

<style scoped>
.welcome-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  padding: 1.5rem;
}

.welcome-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
  min-width: 320px;
}

.welcome-heading {
  margin: 0;
  font-size: 2.25rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.welcome-sub {
  margin: 0.5rem 0 2rem;
  font-size: 1.1rem;
  color: #64748b;
}

.logout-button {
  padding: 0.65rem 1.5rem;
  background-color: #ffffff;
  color: #dc2626;
  border: 1px solid #dc2626;
  border-radius: 6px;
  font-size: 0.925rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.logout-button:hover {
  background-color: #dc2626;
  color: #ffffff;
}
</style>
