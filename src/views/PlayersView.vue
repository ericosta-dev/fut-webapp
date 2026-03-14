<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCommunitiesStore } from '@/stores/communities'
import { usePlayersStore } from '@/stores/players'
import AppLayout from '@/components/AppLayout.vue'
import type { PlayerCreate, PlayerPosition, PlayerStatus } from '@/types'

const route = useRoute()
const communitiesStore = useCommunitiesStore()
const playersStore = usePlayersStore()

const communityId = computed(() => route.params.id as string)

const showModal = ref(false)
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const editingPlayerId = ref<string | null>(null)
const isEditMode = computed(() => editingPlayerId.value !== null)

// Filters
const activePosition = ref<PlayerPosition | null>(null)
const activeStatus = ref<PlayerStatus | null>(null)

const filteredPlayers = computed(() => {
  return playersStore.players.filter((p) => {
    const posMatch = activePosition.value === null || p.position === activePosition.value
    const statusMatch = activeStatus.value === null || p.status === activeStatus.value
    return posMatch && statusMatch
  })
})

const formData = ref<PlayerCreate>({
  community: '',
  name: '',
  nickname: '',
  position: 'MID',
  number: undefined,
  status: 'ONE_TIME',
})

const positions: { value: PlayerPosition; label: string }[] = [
  { value: 'FWD', label: 'Atacante' },
  { value: 'MID', label: 'Meio-Campo' },
  { value: 'DEF', label: 'Defensor' },
  { value: 'GK', label: 'Goleiro' },
]

const positionLabels: Record<string, string> = {
  FWD: 'Atacante',
  MID: 'Meio-Campo',
  DEF: 'Defensor',
  GK: 'Goleiro',
}

// When position changes to GK, force status back to ONE_TIME
watch(
  () => formData.value.position,
  (pos) => {
    if (pos === 'GK') {
      formData.value.status = 'ONE_TIME'
    }
  },
)

const selectMonthly = () => {
  if (formData.value.position !== 'GK') {
    formData.value.status = 'MONTHLY'
  }
}

onMounted(async () => {
  await Promise.all([
    communitiesStore.fetchCommunity(communityId.value),
    playersStore.fetchPlayers(communityId.value),
  ])
})

const openModal = () => {
  editingPlayerId.value = null
  submitError.value = null
  formData.value = {
    community: communityId.value,
    name: '',
    nickname: '',
    position: 'MID',
    number: undefined,
    status: 'ONE_TIME',
  }
  showModal.value = true
}

const openEditModal = (playerId: string) => {
  const player = playersStore.players.find((p) => p.id === playerId)
  if (!player) return

  submitError.value = null
  editingPlayerId.value = playerId
  formData.value = {
    community: player.community,
    name: player.name,
    nickname: player.nickname || '',
    position: player.position,
    number: player.number || undefined,
    role: player.role,
    status: player.status,
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingPlayerId.value = null
  submitError.value = null
}

// Count current monthly players (excluding the one being edited)
const monthlyCount = computed(() =>
  playersStore.players.filter((p) => p.status === 'MONTHLY' && p.id !== editingPlayerId.value)
    .length,
)
const maxMensalistas = computed(() => communitiesStore.currentCommunity?.max_mensalistas ?? 0)

const handleSubmit = async () => {
  if (!formData.value.name) return

  submitError.value = null

  // Frontend guard: max mensalistas
  if (
    formData.value.status === 'MONTHLY' &&
    maxMensalistas.value > 0 &&
    monthlyCount.value >= maxMensalistas.value
  ) {
    submitError.value = `Limite de ${maxMensalistas.value} mensalista(s) já atingido para esta comunidade.`
    return
  }

  isSubmitting.value = true
  try {
    if (isEditMode.value && editingPlayerId.value) {
      await playersStore.updatePlayer(editingPlayerId.value, formData.value)
    } else {
      await playersStore.createPlayer(formData.value)
    }
    closeModal()
  } catch (e: unknown) {
    const err = e as { response?: { data?: Record<string, string[]> } }
    if (err?.response?.data) {
      const messages = Object.values(err.response.data).flat().join(' ')
      submitError.value = messages || 'Erro ao salvar jogador.'
    } else {
      submitError.value = 'Erro ao salvar jogador.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Back Button -->
      <router-link
        :to="`/communities/${communityId}`"
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
        Voltar para {{ communitiesStore.currentCommunity?.name || 'Comunidade' }}
      </router-link>

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Jogadores</h1>
          <p class="text-slate-400 mt-1">{{ playersStore.players.length }} jogadores cadastrados</p>
        </div>
        <button
          @click="openModal"
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
          Novo Jogador
        </button>
      </div>

      <!-- Filters: Position + Status -->      
      <div class="flex flex-wrap gap-2 pb-2">
        <!-- All -->
        <button
          @click="activePosition = null; activeStatus = null"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
            activePosition === null && activeStatus === null
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-slate-800/50 text-slate-400 hover:text-white',
          ]"
        >
          Todos ({{ playersStore.players.length }})
        </button>
        <!-- Position chips -->
        <button
          v-for="pos in positions"
          :key="pos.value"
          @click="activePosition = activePosition === pos.value ? null : pos.value"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
            activePosition === pos.value
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-slate-800/50 text-slate-400 hover:text-white',
          ]"
        >
          {{ pos.label }} ({{ playersStore.playersByPosition[pos.value].length }})
        </button>
        <!-- Divider -->
        <div class="w-px bg-slate-700 self-stretch mx-1" />
        <!-- Status chips -->
        <button
          @click="activeStatus = activeStatus === 'MONTHLY' ? null : 'MONTHLY'"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
            activeStatus === 'MONTHLY'
              ? 'bg-purple-500/20 text-purple-400'
              : 'bg-slate-800/50 text-slate-400 hover:text-white',
          ]"
        >
          Mensalistas ({{ playersStore.players.filter((p) => p.status === 'MONTHLY').length }})
        </button>
        <button
          @click="activeStatus = activeStatus === 'ONE_TIME' ? null : 'ONE_TIME'"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
            activeStatus === 'ONE_TIME'
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-slate-800/50 text-slate-400 hover:text-white',
          ]"
        >
          Avulsos ({{ playersStore.players.filter((p) => p.status === 'ONE_TIME').length }})
        </button>
      </div>

      <!-- Loading -->
      <div v-if="playersStore.loading" class="flex items-center justify-center py-24">
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

      <!-- Empty State (no players at all) -->
      <div v-else-if="playersStore.players.length === 0" class="text-center py-24">
        <div
          class="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-6"
        >
          <svg
            class="w-10 h-10 text-slate-600"
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
        <h3 class="text-xl font-medium text-white mb-2">Nenhum jogador cadastrado</h3>
        <p class="text-slate-400 mb-6 max-w-md mx-auto">
          Adicione jogadores à sua comunidade para começar a organizar as peladas.
        </p>
        <button
          @click="openModal"
          class="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-medium rounded-xl transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Adicionar Jogador
        </button>
      </div>

      <!-- Players Grid -->
      <div v-else class="space-y-4">
        <!-- No results for active filter -->
        <p v-if="filteredPlayers.length === 0" class="text-slate-400 text-sm py-12 text-center">
          Nenhum jogador encontrado para o filtro selecionado.
        </p>
        <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="player in filteredPlayers"
          :key="player.id"
          class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 hover:border-slate-600 transition-colors"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
              <span class="text-lg font-medium text-white">
                {{ (player.nickname || player.name || '?')[0]!.toUpperCase() }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-white truncate">
                {{ player.number ? `(${player.number}) ` : '' }}{{ player.nickname || player.name }}
              </p>
              <p class="text-sm text-slate-400">{{ positionLabels[player.position] }}</p>
            </div>
            <!-- Position badge -->
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
            <!-- Status badge -->
            <span
              :class="[
                'px-2 py-1 rounded-lg text-xs font-medium',
                player.status === 'MONTHLY'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-slate-700 text-slate-400',
              ]"
            >
              {{ player.status === 'MONTHLY' ? 'Mens.' : 'Avulso' }}
            </span>
            <button
              @click="openEditModal(player.id)"
              class="p-2 text-slate-400 hover:text-white transition-colors"
              title="Editar jogador"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60" @click="closeModal" />
        <div class="relative bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md p-6">
          <h2 class="text-xl font-bold text-white mb-6">
            {{ isEditMode ? 'Editar Jogador' : 'Novo Jogador' }}
          </h2>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-slate-300 mb-2">
                Nome Completo
              </label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                class="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                placeholder="Ex: João Silva"
              />
            </div>

            <div>
              <label for="nickname" class="block text-sm font-medium text-slate-300 mb-2">
                Apelido (opcional)
              </label>
              <input
                id="nickname"
                v-model="formData.nickname"
                type="text"
                class="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                placeholder="Ex: Joãozinho"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="position" class="block text-sm font-medium text-slate-300 mb-2">
                  Posição
                </label>
                <select
                  id="position"
                  v-model="formData.position"
                  class="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                >
                  <option v-for="pos in positions" :key="pos.value" :value="pos.value">
                    {{ pos.label }}
                  </option>
                </select>
              </div>

              <div>
                <label for="number" class="block text-sm font-medium text-slate-300 mb-2">
                  Número (opcional)
                </label>
                <input
                  id="number"
                  v-model.number="formData.number"
                  type="number"
                  min="0"
                  max="99"
                  class="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                  placeholder="10"
                />
              </div>
            </div>

            <!-- Status -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Tipo de Jogador</label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  @click="formData.status = 'ONE_TIME'"
                  :class="[
                    'px-4 py-3 rounded-xl border text-sm font-medium transition-colors',
                    formData.status === 'ONE_TIME'
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                      : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-white',
                  ]"
                >
                  Avulso
                </button>
                <button
                  type="button"
                  @click="selectMonthly"
                  :disabled="formData.position === 'GK'"
                  :title="formData.position === 'GK' ? 'Goleiros não podem ser mensalistas' : ''"
                  :class="[
                    'px-4 py-3 rounded-xl border text-sm font-medium transition-colors',
                    formData.position === 'GK'
                      ? 'opacity-40 cursor-not-allowed bg-slate-900/50 border-slate-700 text-slate-500'
                      : formData.status === 'MONTHLY'
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                        : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-white',
                  ]"
                >
                  Mensalista
                  <span
                    v-if="maxMensalistas > 0"
                    class="block text-xs opacity-70 mt-0.5"
                  >
                    {{ monthlyCount }}/{{ maxMensalistas }}
                  </span>
                </button>
              </div>
            </div>

            <!-- Submit error -->
            <div
              v-if="submitError"
              class="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
            >
              {{ submitError }}
            </div>

            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isSubmitting || !formData.name"
                class="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-slate-900 font-medium rounded-xl transition-colors"
              >
                {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>
