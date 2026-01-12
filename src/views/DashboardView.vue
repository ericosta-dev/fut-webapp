<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCommunitiesStore } from '@/stores/communities'
import AppLayout from '@/components/AppLayout.vue'

const authStore = useAuthStore()
const communitiesStore = useCommunitiesStore()

onMounted(async () => {
  try {
    await communitiesStore.fetchCommunities()
  } catch {
    // Error handled by store
  }
})
</script>

<template>
  <AppLayout>
    <div class="space-y-8">
      <!-- Welcome Section -->
      <div
        class="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl border border-emerald-500/20 p-6"
      >
        <h1 class="text-2xl font-bold text-white mb-2">
          Olá, {{ authStore.user?.first_name || authStore.user?.username || 'Jogador' }}!
        </h1>
        <p class="text-slate-400">
          Bem-vindo ao FutEngine. Gerencie suas peladas e acompanhe suas estatísticas.
        </p>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <svg
                class="w-6 h-6 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <p class="text-slate-400 text-sm">Comunidades</p>
              <p class="text-2xl font-bold text-white">{{ communitiesStore.communities.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <svg
                class="w-6 h-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p class="text-slate-400 text-sm">Próximos Jogos</p>
              <p class="text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </div>

        <div class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <svg
                class="w-6 h-6 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <p class="text-slate-400 text-sm">Partidas Jogadas</p>
              <p class="text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Communities List -->
      <div>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-white">Suas Comunidades</h2>
          <router-link
            to="/communities"
            class="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
          >
            Ver todas &rarr;
          </router-link>
        </div>

        <div v-if="communitiesStore.loading" class="flex items-center justify-center py-12">
          <svg class="animate-spin w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>

        <div v-else-if="communitiesStore.communities.length === 0" class="text-center py-12">
          <div
            class="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-white mb-2">Nenhuma comunidade</h3>
          <p class="text-slate-400 mb-4">Você ainda não faz parte de nenhuma comunidade.</p>
          <router-link
            to="/communities"
            class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-medium rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Criar Comunidade
          </router-link>
        </div>

        <div v-else class="grid gap-4">
          <router-link
            v-for="community in communitiesStore.communities.slice(0, 3)"
            :key="community.id"
            :to="`/communities/${community.id}`"
            class="block bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 hover:border-emerald-500/50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-white mb-1">{{ community.name }}</h3>
                <p class="text-slate-400 text-sm line-clamp-1">{{ community.description }}</p>
              </div>
              <svg
                class="w-5 h-5 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
