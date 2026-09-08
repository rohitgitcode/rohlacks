<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const fullName = ref('')
const email = ref('')
const password = ref('')
const workspaceName = ref('')
const showPassword = ref(false)
const errorMessage = ref('')

async function handleRegister() {
  errorMessage.value = ''

  if (!fullName.value.trim() || !email.value.trim() || !password.value) {
    errorMessage.value = 'Please fill in all required fields'
    return
  }

  try {
    await authStore.register({
      fullName: fullName.value.trim(),
      email: email.value.trim(),
      password: password.value,
      workspaceName: workspaceName.value.trim() || undefined,
    })

    router.push('/dashboard')
  } catch (err: any) {
    if (err.response?.data?.errors?.[0]?.message) {
      errorMessage.value = err.response.data.errors[0].message
    } else if (err.response?.data?.message) {
      errorMessage.value = err.response.data.message
    } else {
      errorMessage.value = 'Failed to create account. Please try again.'
    }
  }
}
</script>

<template>
  <div class="register-wrapper">
    <div class="register-card">
      <div class="brand">
        <div class="brand-badge"></div>
        <span class="brand-text">OpsFlow</span>
      </div>

      <h1 class="title">Create Account</h1>
      <p class="subtitle">Start managing your team workspace</p>

      <div v-if="errorMessage" class="error-box">
        {{ errorMessage }}
      </div>

      <form class="form" @submit.prevent="handleRegister">
        <div class="field">
          <label for="fullName">Full Name</label>
          <input
            id="fullName"
            v-model="fullName"
            type="text"
            placeholder="John Doe"
            autocomplete="name"
            required
            :disabled="authStore.loading"
          />
        </div>

        <div class="field">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="name@example.com"
            autocomplete="email"
            required
            :disabled="authStore.loading"
          />
        </div>

        <div class="field">
          <label for="password">Password</label>
          <div class="password-wrap">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Minimum 8 characters"
              autocomplete="new-password"
              required
              :disabled="authStore.loading"
            />
            <button
              type="button"
              class="eye-btn"
              tabindex="-1"
              @click="showPassword = !showPassword"
            >
              <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </div>
        </div>

        <div class="field">
          <div class="label-row">
            <label for="workspaceName">Workspace Name</label>
            <span class="optional">Optional</span>
          </div>
          <input
            id="workspaceName"
            v-model="workspaceName"
            type="text"
            placeholder="e.g. Acme Corp"
            :disabled="authStore.loading"
          />
        </div>

        <button type="submit" class="btn-primary" :disabled="authStore.loading">
          {{ authStore.loading ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>

      <div class="footer">
        Already have an account?
        <RouterLink to="/login" class="link">Sign in</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background-color: #f8fafc;
}

.register-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 2.5rem 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.brand-badge {
  width: 12px;
  height: 12px;
  background-color: #dc2626;
  border-radius: 3px;
}

.brand-text {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.title {
  margin: 0 0 0.35rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.subtitle {
  margin: 0 0 1.5rem;
  font-size: 0.875rem;
  color: #64748b;
}

.error-box {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  margin-bottom: 1.25rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

label {
  font-size: 0.825rem;
  font-weight: 600;
  color: #334155;
}

.optional {
  font-size: 0.75rem;
  color: #94a3b8;
}

input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.925rem;
  color: #0f172a;
  background: #ffffff;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

input:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12);
}

.password-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrap input {
  padding-right: 2.5rem;
}

.eye-btn {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.eye-btn:hover {
  color: #0f172a;
}

.btn-primary {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.75rem;
  background-color: #dc2626;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 0.925rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #b91c1c;
}

.btn-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.85rem;
  color: #64748b;
}

.link {
  color: #dc2626;
  text-decoration: none;
  font-weight: 600;
  margin-left: 0.25rem;
}

.link:hover {
  text-decoration: underline;
}
</style>
