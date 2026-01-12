<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCommunitiesStore } from '@/stores/communities'
import { usePlayersStore } from '@/stores/players'
import AppLayout from '@/components/AppLayout.vue'

const route = useRoute()
const communitiesStore = useCommunitiesStore()
const playersStore = usePlayersStore()

const communityId = computed(() => route.params.id as string)

onMounted(async () => {
  await Promise.all([
    communitiesStore.fetchCommunity(communityId.value),
    playersStore.fetchPlayers(communityId.value),
  ])
})

const positionLabels: Record<string, string> = {
  FWD: 'Atacante',
  MID: 'Meio-Campo',
  DEF: 'Defensor',
  GK: 'Goleiro',
}
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Back Button -->
      <router-link
        to="/communities"
        class="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Voltar
      </router-link>

      <!-- Loading -->
      <div v-if="communitiesStore.loading" class="flex items-center justify-center py-24">
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

      <template v-else-if="communitiesStore.currentCommunity">
        <!-- Community Header -->
        <div
          class="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl border border-emerald-500/20 p-6"
        >
          <div class="flex items-start justify-between">
            <div>
              <h1 class="text-2xl font-bold text-white mb-2">
                {{ communitiesStore.currentCommunity.name }}
              </h1>
              <p class="text-slate-400">
                {{ communitiesStore.currentCommunity.description }}
              </p>
            </div>
            <button class="p-2 text-slate-400 hover:text-white transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <router-link
            :to="`/communities/${communityId}/players`"
            class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 hover:border-emerald-500/50 transition-colors text-center"
          >
            <div
              class="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mx-auto mb-3"
            >
              <svg
                class="w-5 h-5 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <p class="text-sm font-medium text-white">Jogadores</p>
            <p class="text-xs text-slate-400">{{ playersStore.players.length }} cadastrados</p>
          </router-link>

          <div
            class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 text-center opacity-60"
          >
            <div
              class="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mx-auto mb-3"
            >
              <svg
                class="w-5 h-5 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <p class="text-sm font-medium text-white">Lista Semanal</p>
            <p class="text-xs text-slate-400">Em breve</p>
          </div>

          <div
            class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 text-center opacity-60"
          >
            <div
              class="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center mx-auto mb-3"
            >
              <svg
                class="w-5 h-5 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p class="text-sm font-medium text-white">Súmulas</p>
            <p class="text-xs text-slate-400">Em breve</p>
          </div>

          <div
            class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 text-center opacity-60"
          >
            <div
              class="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mx-auto mb-3"
            >
              <svg
                class="w-5 h-5 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <p class="text-sm font-medium text-white">Estatísticas</p>
            <p class="text-xs text-slate-400">Em breve</p>
          </div>
        </div>

        <!-- Recent Players -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-white">Jogadores Recentes</h2>
            <router-link
              :to="`/communities/${communityId}/players`"
              class="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
            >
              Ver todos &rarr;
            </router-link>
          </div>

          <div v-if="playersStore.loading" class="flex items-center justify-center py-8">
            <svg class="animate-spin w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24">
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

          <div
            v-else-if="playersStore.players.length === 0"
            class="text-center py-8 bg-slate-800/30 rounded-xl border border-slate-700/50"
          >
            <p class="text-slate-400">Nenhum jogador cadastrado ainda.</p>
            <router-link
              :to="`/communities/${communityId}/players`"
              class="inline-flex items-center gap-2 mt-4 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Adicionar Jogador
            </router-link>
          </div>

          <div v-else class="grid gap-3">
            <div
              v-for="player in playersStore.players.slice(0, 5)"
              :key="player.id"
              class="flex items-center gap-4 bg-slate-800/50 rounded-xl border border-slate-700/50 p-4"
            >
              <div class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                <span class="text-sm font-medium text-white">
                  {{ (player.nickname || player.name)[0].toUpperCase() }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-white truncate">
                  {{ player.number ? `(${player.number}) ` : ''
                  }}{{ player.nickname || player.name }}
                </p>
                <p class="text-sm text-slate-400">{{ positionLabels[player.position] }}</p>
              </div>
              <span
                :class="[
                  'px-2 py-1 rounded-lg text-xs font-medium',
                  player.position === 'FWD'
                    ? 'bg-red-500/20 text-red-400'
                    : player.position === 'MID'
                      ? 'bg-blue-500/20 text-blue-400'
                      : player.position === 'DEF'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400',
                ]"
              >
                {{ player.position }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>
