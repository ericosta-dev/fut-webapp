<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button, Input, Label } from '@/components/ui'
import { Zap, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = 'Preencha todos os campos'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    await authStore.login({
      username: username.value,
      password: password.value,
    })

    const redirect = route.query.redirect as string
    router.push(redirect || '/dashboard')
  } catch {
    errorMessage.value = 'Usuário ou senha inválidos'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
    <!-- Background effects -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-1/4 left-1/3 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
      <div class="absolute bottom-1/4 right-1/3 w-60 h-60 bg-accent/5 rounded-full blur-3xl" />
    </div>

    <div class="relative w-full max-w-sm animate-fade-in">
      <!-- Logo -->
      <div class="text-center mb-8">
        <router-link to="/" class="inline-block">
          <span class="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/20 border border-primary/30 mb-4">
            <Zap :size="28" class="text-accent" />
          </span>
        </router-link>
        <h1 class="text-2xl font-bold text-foreground">
          <span class="text-primary">Fut</span><span class="text-accent">Engine</span>
        </h1>
        <p class="text-sm text-muted-foreground mt-1.5">Entre na sua conta</p>
      </div>

      <!-- Login Form -->
      <div class="rounded-xl border border-border bg-card p-6">
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Error Message -->
          <div
            v-if="errorMessage"
            class="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
          >
            {{ errorMessage }}
          </div>

          <!-- Username -->
          <div class="space-y-2">
            <Label for="username">Usuário</Label>
            <Input
              id="username"
              v-model="username"
              placeholder="Digite seu usuário"
              autofocus
            />
          </div>

          <!-- Password -->
          <div class="space-y-2">
            <Label for="password">Senha</Label>
            <div class="relative">
              <Input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Digite sua senha"
                class="pr-10"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <EyeOff v-if="showPassword" :size="16" />
                <Eye v-else :size="16" />
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <Button
            type="submit"
            variant="accent"
            class="w-full"
            :disabled="isLoading"
          >
            <Loader2 v-if="isLoading" :size="16" class="animate-spin" />
            {{ isLoading ? 'Entrando...' : 'Entrar' }}
          </Button>
        </form>
      </div>

      <!-- Back to Home -->
      <div class="text-center mt-5">
        <router-link
          to="/"
          class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft :size="14" />
          Voltar para o início
        </router-link>
      </div>
    </div>
  </div>
</template>
