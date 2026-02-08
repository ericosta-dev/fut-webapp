<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePlayersStore } from '@/stores/players'
import { useLeaguesStore } from '../stores/leaguesStore'
import type { TeamCreate, Team } from '../types'
import type { AxiosError } from 'axios'

interface Props {
  communityId: string
  leagueId: string
}

interface Emits {
  (e: 'success', team: Team): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const playersStore = usePlayersStore()
const leaguesStore = useLeaguesStore()

// Form state
const form = ref<TeamCreate>({
  name: '',
  players: [],
})

const errors = ref<Partial<Record<keyof TeamCreate, string>>>({})
const submitting = ref(false)

// Computed
const isValid = computed(() => {
  return form.value.name.length >= 2 && form.value.players.length >= 1
})

const availablePlayers = computed(() => {
  return playersStore.players.filter((p) => p.community === props.communityId)
})

// Methods
onMounted(async () => {
  if (availablePlayers.value.length === 0) {
    await playersStore.fetchPlayers()
  }
})

function validateForm(): boolean {
  errors.value = {}

  if (!form.value.name || form.value.name.length < 2) {
    errors.value.name = 'Nome deve ter pelo menos 2 caracteres'
  }

  if (form.value.players.length === 0) {
    errors.value.players = 'Selecione pelo menos um jogador'
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validateForm()) return

  submitting.value = true
  try {
    const team = await leaguesStore.createTeam(
      props.communityId,
      props.leagueId,
      form.value
    )
    emit('success', team)
  } catch (err: unknown) {
    const e = err as AxiosError
    if (e?.response?.data) {
      const data = e.response.data as Record<string, string[]>
      Object.keys(data).forEach((key) => {
        errors.value[key as keyof TeamCreate] = data[key][0]
      })
    }
  } finally {
    submitting.value = false
  }
}

function handleCancel() {
  emit('cancel')
}

function togglePlayer(playerId: string) {
  const index = form.value.players.indexOf(playerId)
  if (index > -1) {
    form.value.players.splice(index, 1)
  } else {
    form.value.players.push(playerId)
  }
}

function isPlayerSelected(playerId: string): boolean {
  return form.value.players.includes(playerId)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700">
        Nome do Time *
      </label>
      <input
        id="name"
        v-model="form.name"
        type="text"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        :class="{ 'border-red-500': errors.name }"
      />
      <p v-if="errors.name" class="mt-1 text-sm text-red-600">
        {{ errors.name }}
      </p>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Jogadores *
      </label>
      <div
        v-if="availablePlayers.length > 0"
        class="max-h-64 overflow-y-auto border border-gray-300 rounded-md p-4 space-y-2"
      >
        <label
          v-for="player in availablePlayers"
          :key="player.id"
          class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
        >
          <input
            type="checkbox"
            :checked="isPlayerSelected(player.id)"
            @change="togglePlayer(player.id)"
            class="mr-3"
          />
          <span class="text-sm">
            {{ player.nickname || player.name }}
            <span v-if="player.number" class="text-gray-500">#{{ player.number }}</span>
          </span>
        </label>
      </div>
      <p v-else class="text-sm text-gray-500">
        Nenhum jogador disponível nesta comunidade.
      </p>
      <p v-if="errors.players" class="mt-1 text-sm text-red-600">
        {{ errors.players }}
      </p>
      <p class="mt-1 text-xs text-gray-500">
        {{ form.players.length }} jogador(es) selecionado(s)
      </p>
    </div>

    <div class="flex justify-end space-x-3">
      <button
        type="button"
        @click="handleCancel"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Cancelar
      </button>
      <button
        type="submit"
        :disabled="!isValid || submitting"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {{ submitting ? 'Criando...' : 'Criar Time' }}
      </button>
    </div>
  </form>
</template>
