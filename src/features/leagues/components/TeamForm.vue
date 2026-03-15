<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePlayersStore } from '@/stores/players'
import { useLeaguesStore } from '../stores/leaguesStore'
import { Input, Label, Button, Badge } from '@/components/ui'
import { Check, Loader2 } from 'lucide-vue-next'
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

const form = ref<TeamCreate>({ name: '', players: [] })
const errors = ref<Partial<Record<keyof TeamCreate, string>>>({})
const submitting = ref(false)

const isValid = computed(() => form.value.name.length >= 2 && form.value.players.length >= 1)

const availablePlayers = computed(() =>
  playersStore.players.filter((p) => p.community === props.communityId),
)

onMounted(async () => {
  if (availablePlayers.value.length === 0) await playersStore.fetchPlayers()
})

function validateForm(): boolean {
  errors.value = {}
  if (!form.value.name || form.value.name.length < 2) errors.value.name = 'Nome deve ter pelo menos 2 caracteres'
  if (form.value.players.length === 0) errors.value.players = 'Selecione pelo menos um jogador'
  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validateForm()) return
  submitting.value = true
  try {
    const team = await leaguesStore.createTeam(props.communityId, props.leagueId, form.value)
    emit('success', team)
  } catch (err: unknown) {
    const e = err as AxiosError
    if (e?.response?.data) {
      const data = e.response.data as Record<string, string[]>
      Object.keys(data).forEach((key) => {
        errors.value[key as keyof TeamCreate] = data[key]?.[0] ?? ''
      })
    }
  } finally {
    submitting.value = false
  }
}

function togglePlayer(playerId: string) {
  const idx = form.value.players.indexOf(playerId)
  if (idx > -1) form.value.players.splice(idx, 1)
  else form.value.players.push(playerId)
}

function isPlayerSelected(playerId: string): boolean {
  return form.value.players.includes(playerId)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-5">
    <div class="space-y-1.5">
      <Label for="teamName">Nome do Time <span class="text-destructive">*</span></Label>
      <Input
        id="teamName"
        v-model="form.name"
        placeholder="Ex: Time Azul"
        :class="{ 'border-destructive': errors.name }"
      />
      <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
    </div>

    <div class="space-y-1.5">
      <Label>Jogadores <span class="text-destructive">*</span></Label>
      <div
        v-if="availablePlayers.length > 0"
        class="max-h-64 overflow-y-auto border border-border rounded-lg p-3 space-y-1"
      >
        <label
          v-for="player in availablePlayers"
          :key="player.id"
          :class="[
            'flex items-center p-2.5 rounded-lg cursor-pointer transition-colors',
            isPlayerSelected(player.id) ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/50',
          ]"
        >
          <div
            :class="[
              'w-5 h-5 rounded border mr-3 flex items-center justify-center transition-colors',
              isPlayerSelected(player.id)
                ? 'bg-primary border-primary'
                : 'border-border',
            ]"
          >
            <Check v-if="isPlayerSelected(player.id)" :size="12" class="text-primary-foreground" />
          </div>
          <input type="checkbox" :checked="isPlayerSelected(player.id)" @change="togglePlayer(player.id)" class="sr-only" />
          <span class="text-sm text-foreground">
            {{ player.nickname || player.name }}
            <span v-if="player.number" class="text-muted-foreground">#{{ player.number }}</span>
          </span>
        </label>
      </div>
      <p v-else class="text-sm text-muted-foreground">Nenhum jogador disponível nesta comunidade.</p>
      <p v-if="errors.players" class="text-sm text-destructive">{{ errors.players }}</p>
      <p class="text-xs text-muted-foreground">
        <Badge variant="secondary" class="text-xs">{{ form.players.length }}</Badge>
        jogador(es) selecionado(s)
      </p>
    </div>

    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="$emit('cancel')">Cancelar</Button>
      <Button type="submit" :disabled="!isValid || submitting">
        <Loader2 v-if="submitting" :size="14" class="animate-spin mr-1" />
        {{ submitting ? 'Criando...' : 'Criar Time' }}
      </Button>
    </div>
  </form>
</template>
