<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCommunitiesStore } from '@/stores/communities'
import { usePlayersStore } from '@/stores/players'
import AppLayout from '@/components/AppLayout.vue'
import { Card, Badge, Button, Input, Label } from '@/components/ui'
import { ArrowLeft, Plus, Edit, User, Loader2 } from 'lucide-vue-next'
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
  FWD: 'Atacante', MID: 'Meio-Campo', DEF: 'Defensor', GK: 'Goleiro',
}

const positionVariant = (pos: string) => {
  const map: Record<string, string> = { FWD: 'destructive', MID: 'default', DEF: 'warning', GK: 'success' }
  return (map[pos] ?? 'secondary') as 'destructive' | 'default' | 'warning' | 'success' | 'secondary'
}

watch(
  () => formData.value.position,
  (pos) => { if (pos === 'GK') formData.value.status = 'ONE_TIME' },
)

const selectMonthly = () => {
  if (formData.value.position !== 'GK') formData.value.status = 'MONTHLY'
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
  formData.value = { community: communityId.value, name: '', nickname: '', position: 'MID', number: undefined, status: 'ONE_TIME' }
  showModal.value = true
}

const openEditModal = (playerId: string) => {
  const player = playersStore.players.find((p) => p.id === playerId)
  if (!player) return
  submitError.value = null
  editingPlayerId.value = playerId
  formData.value = {
    community: player.community, name: player.name, nickname: player.nickname || '',
    position: player.position, number: player.number || undefined, role: player.role, status: player.status,
  }
  showModal.value = true
}

const closeModal = () => { showModal.value = false; editingPlayerId.value = null; submitError.value = null }

const monthlyCount = computed(() =>
  playersStore.players.filter((p) => p.status === 'MONTHLY' && p.id !== editingPlayerId.value).length,
)
const maxMensalistas = computed(() => communitiesStore.currentCommunity?.max_mensalistas ?? 0)

const handleSubmit = async () => {
  if (!formData.value.name) return
  submitError.value = null
  if (formData.value.status === 'MONTHLY' && maxMensalistas.value > 0 && monthlyCount.value >= maxMensalistas.value) {
    submitError.value = `Limite de ${maxMensalistas.value} mensalista(s) já atingido para esta comunidade.`
    return
  }
  isSubmitting.value = true
  try {
    if (isEditMode.value && editingPlayerId.value) await playersStore.updatePlayer(editingPlayerId.value, formData.value)
    else await playersStore.createPlayer(formData.value)
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
    <div class="space-y-6 animate-fade-in">
      <!-- Back -->
      <router-link
        :to="`/communities/${communityId}`"
        class="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft :size="18" />
        Voltar para {{ communitiesStore.currentCommunity?.name || 'Comunidade' }}
      </router-link>

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Jogadores</h1>
          <p class="text-muted-foreground mt-1">{{ playersStore.players.length }} jogadores cadastrados</p>
        </div>
        <Button @click="openModal">
          <Plus :size="18" class="mr-1" />
          Novo Jogador
        </Button>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-2 pb-2">
        <button
          @click="activePosition = null; activeStatus = null"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
            activePosition === null && activeStatus === null
              ? 'bg-primary/20 text-primary'
              : 'bg-card text-muted-foreground hover:text-foreground',
          ]"
        >
          Todos ({{ playersStore.players.length }})
        </button>
        <button
          v-for="pos in positions"
          :key="pos.value"
          @click="activePosition = activePosition === pos.value ? null : pos.value"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
            activePosition === pos.value
              ? 'bg-primary/20 text-primary'
              : 'bg-card text-muted-foreground hover:text-foreground',
          ]"
        >
          {{ pos.label }} ({{ playersStore.playersByPosition[pos.value].length }})
        </button>
        <div class="w-px bg-border self-stretch mx-1" />
        <button
          @click="activeStatus = activeStatus === 'MONTHLY' ? null : 'MONTHLY'"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
            activeStatus === 'MONTHLY'
              ? 'bg-primary/20 text-primary'
              : 'bg-card text-muted-foreground hover:text-foreground',
          ]"
        >
          Mensalistas ({{ playersStore.players.filter((p) => p.status === 'MONTHLY').length }})
        </button>
        <button
          @click="activeStatus = activeStatus === 'ONE_TIME' ? null : 'ONE_TIME'"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
            activeStatus === 'ONE_TIME'
              ? 'bg-warning/20 text-warning'
              : 'bg-card text-muted-foreground hover:text-foreground',
          ]"
        >
          Avulsos ({{ playersStore.players.filter((p) => p.status === 'ONE_TIME').length }})
        </button>
      </div>

      <!-- Loading -->
      <div v-if="playersStore.loading" class="flex items-center justify-center py-24">
        <Loader2 :size="32" class="animate-spin text-primary" />
      </div>

      <!-- Empty -->
      <div v-else-if="playersStore.players.length === 0" class="text-center py-24">
        <div class="w-20 h-20 rounded-2xl bg-card flex items-center justify-center mx-auto mb-6">
          <User :size="40" class="text-muted-foreground" />
        </div>
        <h3 class="text-xl font-medium text-foreground mb-2">Nenhum jogador cadastrado</h3>
        <p class="text-muted-foreground mb-6 max-w-md mx-auto">
          Adicione jogadores à sua comunidade para começar a organizar as peladas.
        </p>
        <Button @click="openModal" size="lg">
          <Plus :size="18" class="mr-1" />
          Adicionar Jogador
        </Button>
      </div>

      <!-- Players Grid -->
      <div v-else class="space-y-4">
        <p v-if="filteredPlayers.length === 0" class="text-muted-foreground text-sm py-12 text-center">
          Nenhum jogador encontrado para o filtro selecionado.
        </p>
        <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            v-for="player in filteredPlayers"
            :key="player.id"
            class="p-4 hover:border-primary/30 transition-colors"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <span class="text-lg font-medium text-foreground">
                  {{ (player.nickname || player.name || '?')[0]!.toUpperCase() }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-foreground truncate">
                  {{ player.number ? `(${player.number}) ` : '' }}{{ player.nickname || player.name }}
                </p>
                <p class="text-sm text-muted-foreground">{{ positionLabels[player.position] }}</p>
              </div>
              <Badge :variant="positionVariant(player.position)">{{ player.position }}</Badge>
              <Badge :variant="player.status === 'MONTHLY' ? 'default' : 'secondary'">
                {{ player.status === 'MONTHLY' ? 'Mens.' : 'Avulso' }}
              </Badge>
              <button
                @click="openEditModal(player.id)"
                class="p-2 text-muted-foreground hover:text-foreground transition-colors"
                title="Editar jogador"
              >
                <Edit :size="18" />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-background/80 backdrop-blur-sm" @click="closeModal" />
        <div class="relative bg-card rounded-2xl border border-border w-full max-w-md p-6">
          <h2 class="text-xl font-bold text-foreground mb-6">
            {{ isEditMode ? 'Editar Jogador' : 'Novo Jogador' }}
          </h2>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="space-y-1.5">
              <Label for="name">Nome Completo</Label>
              <Input id="name" v-model="formData.name" placeholder="Ex: João Silva" />
            </div>

            <div class="space-y-1.5">
              <Label for="nickname">Apelido (opcional)</Label>
              <Input id="nickname" v-model="formData.nickname" placeholder="Ex: Joãozinho" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <Label for="position">Posição</Label>
                <select
                  id="position"
                  v-model="formData.position"
                  class="flex h-10 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary"
                >
                  <option v-for="pos in positions" :key="pos.value" :value="pos.value">{{ pos.label }}</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <Label for="number">Número (opcional)</Label>
                <Input id="number" v-model.number="formData.number" type="number" min="0" max="99" placeholder="10" />
              </div>
            </div>

            <!-- Status -->
            <div class="space-y-1.5">
              <Label>Tipo de Jogador</Label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  @click="formData.status = 'ONE_TIME'"
                  :class="[
                    'px-4 py-3 rounded-xl border text-sm font-medium transition-colors',
                    formData.status === 'ONE_TIME'
                      ? 'bg-warning/20 border-warning/50 text-warning'
                      : 'bg-input border-border text-muted-foreground hover:text-foreground',
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
                      ? 'opacity-40 cursor-not-allowed bg-input border-border text-muted-foreground'
                      : formData.status === 'MONTHLY'
                        ? 'bg-primary/20 border-primary/50 text-primary'
                        : 'bg-input border-border text-muted-foreground hover:text-foreground',
                  ]"
                >
                  Mensalista
                  <span v-if="maxMensalistas > 0" class="block text-xs opacity-70 mt-0.5">
                    {{ monthlyCount }}/{{ maxMensalistas }}
                  </span>
                </button>
              </div>
            </div>

            <!-- Error -->
            <div v-if="submitError" class="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {{ submitError }}
            </div>

            <div class="flex gap-3 pt-4">
              <Button type="button" variant="outline" class="flex-1" @click="closeModal">Cancelar</Button>
              <Button type="submit" :disabled="isSubmitting || !formData.name" class="flex-1">
                <Loader2 v-if="isSubmitting" :size="14" class="animate-spin mr-1" />
                {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>
