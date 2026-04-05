<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useLeaguesStore } from '../stores/leaguesStore'
import { matchdaysApi } from '@/features/matchdays/api'
import { Input, Label, Button } from '@/components/ui'
import { Loader2 } from 'lucide-vue-next'
import type { League, LeagueCreate, LeagueUpdate } from '../types'
import type { AxiosError } from 'axios'

interface Props {
  communityId: string
  leagueId?: string
  initialLeague?: League | null
  mode?: 'create' | 'edit'
}

interface Emits {
  (e: 'success', league: League): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const leaguesStore = useLeaguesStore()
const isEditMode = computed(() => props.mode === 'edit')

const form = ref<LeagueCreate>({
  name: '',
  description: '',
  format: 'CUP',
  start_date: '',
  end_date: '',
})

const errors = ref<Partial<Record<keyof LeagueCreate, string>>>({})
const submitting = ref(false)
const submitProgress = ref('')

// ── Weekday selection ──────────────────────────────────────────────────────
const WEEKDAYS = [
  { value: 0, short: 'Dom', long: 'Domingo' },
  { value: 1, short: 'Seg', long: 'Segunda' },
  { value: 2, short: 'Ter', long: 'Terça' },
  { value: 3, short: 'Qua', long: 'Quarta' },
  { value: 4, short: 'Qui', long: 'Quinta' },
  { value: 5, short: 'Sex', long: 'Sexta' },
  { value: 6, short: 'Sáb', long: 'Sábado' },
]

const selectedWeekdays = ref<number[]>([])

function toDateInputValue(value: string) {
  return value ? value.slice(0, 10) : ''
}

watch(
  () => props.initialLeague,
  (league) => {
    if (!league) return

    form.value = {
      name: league.name,
      description: league.description ?? '',
      format: league.format,
      start_date: toDateInputValue(league.start_date),
      end_date: toDateInputValue(league.end_date),
    }
    selectedWeekdays.value = []
    errors.value = {}
  },
  { immediate: true },
)

function toggleWeekday(day: number) {
  const idx = selectedWeekdays.value.indexOf(day)
  if (idx === -1) selectedWeekdays.value.push(day)
  else selectedWeekdays.value.splice(idx, 1)
}

// Whether dates are valid enough to show the weekday section
const datesValid = computed(() =>
  !!form.value.start_date &&
  !!form.value.end_date &&
  new Date(form.value.end_date) > new Date(form.value.start_date),
)

// Generate all dates that fall on the selected weekdays between start and end
const generatedDates = computed<string[]>(() => {
  if (!datesValid.value || selectedWeekdays.value.length === 0) return []
  const result: string[] = []
  // Use local date arithmetic to avoid timezone drift
  const [sy, sm, sd] = form.value.start_date.split('-').map(Number)
  const [ey, em, ed] = form.value.end_date.split('-').map(Number)
  const current = new Date(sy!, sm! - 1, sd!)
  const end = new Date(ey!, em! - 1, ed!)
  while (current <= end) {
    if (selectedWeekdays.value.includes(current.getDay())) {
      const yyyy = current.getFullYear()
      const mm = String(current.getMonth() + 1).padStart(2, '0')
      const dd = String(current.getDate()).padStart(2, '0')
      result.push(`${yyyy}-${mm}-${dd}`)
    }
    current.setDate(current.getDate() + 1)
  }
  return result
})

function formatDateLabel(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y!, m! - 1, d!).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// ── Validation ─────────────────────────────────────────────────────────────
const isValid = computed(() => {
  return (
    form.value.name.length >= 3 &&
    form.value.format &&
    form.value.start_date &&
    form.value.end_date &&
    new Date(form.value.end_date) > new Date(form.value.start_date)
  )
})

function validateForm(): boolean {
  errors.value = {}
  if (!form.value.name || form.value.name.length < 3) errors.value.name = 'Nome deve ter pelo menos 3 caracteres'
  if (!form.value.format) errors.value.format = 'Formato é obrigatório'
  if (!form.value.start_date) errors.value.start_date = 'Data de início é obrigatória'
  if (!form.value.end_date) {
    errors.value.end_date = 'Data de fim é obrigatória'
  } else if (form.value.start_date && new Date(form.value.end_date) <= new Date(form.value.start_date)) {
    errors.value.end_date = 'Data de fim deve ser posterior à data de início'
  }
  return Object.keys(errors.value).length === 0
}

// ── Submit ─────────────────────────────────────────────────────────────────
async function handleSubmit() {
  if (!validateForm()) return
  submitting.value = true
  submitProgress.value = isEditMode.value ? 'Salvando configurações...' : 'Criando competição...'
  try {
    const payload: LeagueUpdate = {
      ...form.value,
      start_date: form.value.start_date ? `${form.value.start_date}T00:00:00` : '',
      end_date: form.value.end_date ? `${form.value.end_date}T23:59:59` : '',
    }

    if (isEditMode.value) {
      if (!props.leagueId) throw new Error('League ID is required to update a league')

      const league = await leaguesStore.updateLeague(props.communityId, props.leagueId, payload)
      emit('success', league)
      return
    }

    const league = await leaguesStore.createLeague(props.communityId, payload as LeagueCreate)

    // Create matchdays sequentially if weekdays were selected
    if (generatedDates.value.length > 0) {
      const total = generatedDates.value.length
      for (let i = 0; i < total; i++) {
        const isoDate = generatedDates.value[i]!
        submitProgress.value = `Criando rodada ${i + 1} de ${total}...`
        const [y, m, d] = isoDate.split('-').map(Number)
        const label = new Date(y!, m! - 1, d!).toLocaleDateString('pt-BR')
        await matchdaysApi.create(props.communityId, league.id, { date: isoDate, label })
      }
    }

    emit('success', league)
  } catch (err: unknown) {
    const e = err as AxiosError
    if (e?.response?.data) {
      const data = e.response.data as Record<string, string[]>
      Object.keys(data).forEach((key) => {
        errors.value[key as keyof LeagueCreate] = data[key]?.[0] ?? ''
      })
    }
  } finally {
    submitting.value = false
    submitProgress.value = ''
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="space-y-1.5">
      <Label for="name">Nome da Liga <span class="text-destructive">*</span></Label>
      <Input
        id="name"
        v-model="form.name"
        placeholder="Ex: Campeonato de Verão 2026"
        :class="{ 'border-destructive': errors.name }"
      />
      <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
    </div>

    <div class="space-y-1.5">
      <Label for="description">Descrição</Label>
      <textarea
        id="description"
        v-model="form.description"
        rows="3"
        placeholder="Descreva a liga..."
        class="flex w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary resize-none"
      />
    </div>

    <div class="space-y-2">
      <Label>Formato <span class="text-destructive">*</span></Label>
      <div class="space-y-3">
        <label
          :class="[
            'flex items-start rounded-lg border border-border bg-muted/30 p-4 transition-colors',
            isEditMode
              ? 'cursor-not-allowed opacity-70'
              : 'cursor-pointer hover:border-primary/50',
          ]"
        >
          <input
            v-model="form.format"
            type="radio"
            value="CUP"
            class="mt-1 mr-3 accent-primary"
            :disabled="isEditMode"
          />
          <div>
            <span class="text-foreground font-medium">Copa</span>
            <p class="text-sm text-muted-foreground mt-0.5">Times fixos definidos na criação</p>
          </div>
        </label>
        <label
          :class="[
            'flex items-start rounded-lg border border-border bg-muted/30 p-4 transition-colors',
            isEditMode
              ? 'cursor-not-allowed opacity-70'
              : 'cursor-pointer hover:border-primary/50',
          ]"
        >
          <input
            v-model="form.format"
            type="radio"
            value="LEAGUE"
            class="mt-1 mr-3 accent-primary"
            :disabled="isEditMode"
          />
          <div>
            <span class="text-foreground font-medium">Liga</span>
            <p class="text-sm text-muted-foreground mt-0.5">Times sorteados a cada rodada</p>
          </div>
        </label>
      </div>
      <p v-if="isEditMode" class="text-sm text-muted-foreground">
        O formato da competição permanece bloqueado para preservar times e rodadas já vinculados.
      </p>
      <p v-if="errors.format" class="text-sm text-destructive">{{ errors.format }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <Label for="start_date">Data de Início <span class="text-destructive">*</span></Label>
        <input
          id="start_date"
          v-model="form.start_date"
          type="date"
          :class="[
            'flex h-9 w-full rounded-lg border bg-card px-3 py-1 text-sm text-foreground transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary',
            '[color-scheme:dark]',
            errors.start_date ? 'border-destructive' : 'border-border',
          ]"
        />
        <p v-if="errors.start_date" class="text-sm text-destructive">{{ errors.start_date }}</p>
      </div>
      <div class="space-y-1.5">
        <Label for="end_date">Data de Fim <span class="text-destructive">*</span></Label>
        <input
          id="end_date"
          v-model="form.end_date"
          type="date"
          :class="[
            'flex h-9 w-full rounded-lg border bg-card px-3 py-1 text-sm text-foreground transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary',
            '[color-scheme:dark]',
            errors.end_date ? 'border-destructive' : 'border-border',
          ]"
        />
        <p v-if="errors.end_date" class="text-sm text-destructive">{{ errors.end_date }}</p>
      </div>
    </div>

    <!-- ── Rodadas automáticas ─────────────────────────────────────────── -->
    <Transition name="fade">
      <div v-if="datesValid && !isEditMode" class="space-y-4 pt-2 border-t border-border">
        <div>
          <Label>Dias das rodadas <span class="text-muted-foreground font-normal">(opcional)</span></Label>
          <p class="text-xs text-muted-foreground mt-0.5">
            Selecione os dias da semana para criar as rodadas automaticamente.
          </p>
        </div>

        <!-- Weekday pills -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="day in WEEKDAYS"
            :key="day.value"
            type="button"
            @click="toggleWeekday(day.value)"
            :class="[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border',
              selectedWeekdays.includes(day.value)
                ? 'bg-primary/20 text-primary border-primary/40'
                : 'bg-muted/30 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground',
            ]"
          >
            {{ day.short }}
          </button>
        </div>

        <!-- Preview -->
        <Transition name="fade">
          <div v-if="generatedDates.length > 0" class="rounded-lg border border-border bg-muted/20 overflow-hidden">
            <div class="px-4 py-2.5 border-b border-border flex items-center justify-between">
              <span class="text-sm font-medium text-foreground">
                {{ generatedDates.length }} {{ generatedDates.length === 1 ? 'rodada' : 'rodadas' }} serão criadas
              </span>
              <span class="text-xs text-muted-foreground">
                {{ selectedWeekdays.map(d => WEEKDAYS.find(w => w.value === d)?.long).join(', ') }}
              </span>
            </div>
            <div class="max-h-40 overflow-y-auto divide-y divide-border">
              <div
                v-for="(date, i) in generatedDates"
                :key="date"
                class="flex items-center gap-3 px-4 py-2 text-sm"
              >
                <span class="w-6 text-center text-xs font-mono text-muted-foreground">{{ i + 1 }}</span>
                <span class="text-foreground">{{ formatDateLabel(date) }}</span>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <div class="flex justify-end gap-3 pt-4">
      <Button type="button" variant="outline" @click="$emit('cancel')" :disabled="submitting">Cancelar</Button>
      <Button type="submit" :disabled="!isValid || submitting">
        <Loader2 v-if="submitting" :size="14" class="animate-spin mr-1" />
        {{ submitting ? submitProgress : isEditMode ? 'Salvar Configurações' : 'Criar Competição' }}
      </Button>
    </div>
  </form>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
