<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLeaguesStore } from '../stores/leaguesStore'
import { Input, Label, Button } from '@/components/ui'
import { Loader2 } from 'lucide-vue-next'
import type { LeagueCreate, League } from '../types'
import type { AxiosError } from 'axios'

interface Props {
  communityId: string
}

interface Emits {
  (e: 'success', league: League): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const leaguesStore = useLeaguesStore()

const form = ref<LeagueCreate>({
  name: '',
  description: '',
  format: 'CUP',
  start_date: '',
  end_date: '',
})

const errors = ref<Partial<Record<keyof LeagueCreate, string>>>({})
const submitting = ref(false)

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

async function handleSubmit() {
  if (!validateForm()) return
  submitting.value = true
  try {
    const league = await leaguesStore.createLeague(props.communityId, form.value)
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
        <label class="flex items-start p-4 bg-muted/30 border border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
          <input
            v-model="form.format"
            type="radio"
            value="CUP"
            class="mt-1 mr-3 accent-primary"
          />
          <div>
            <span class="text-foreground font-medium">Copa</span>
            <p class="text-sm text-muted-foreground mt-0.5">Times fixos definidos na criação</p>
          </div>
        </label>
        <label class="flex items-start p-4 bg-muted/30 border border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
          <input
            v-model="form.format"
            type="radio"
            value="LEAGUE"
            class="mt-1 mr-3 accent-primary"
          />
          <div>
            <span class="text-foreground font-medium">Liga</span>
            <p class="text-sm text-muted-foreground mt-0.5">Times sorteados a cada rodada</p>
          </div>
        </label>
      </div>
      <p v-if="errors.format" class="text-sm text-destructive">{{ errors.format }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <Label for="start_date">Data de Início <span class="text-destructive">*</span></Label>
        <Input
          id="start_date"
          v-model="form.start_date"
          type="datetime-local"
          :class="{ 'border-destructive': errors.start_date }"
        />
        <p v-if="errors.start_date" class="text-sm text-destructive">{{ errors.start_date }}</p>
      </div>
      <div class="space-y-1.5">
        <Label for="end_date">Data de Fim <span class="text-destructive">*</span></Label>
        <Input
          id="end_date"
          v-model="form.end_date"
          type="datetime-local"
          :class="{ 'border-destructive': errors.end_date }"
        />
        <p v-if="errors.end_date" class="text-sm text-destructive">{{ errors.end_date }}</p>
      </div>
    </div>

    <div class="flex justify-end gap-3 pt-4">
      <Button type="button" variant="outline" @click="$emit('cancel')">Cancelar</Button>
      <Button type="submit" :disabled="!isValid || submitting">
        <Loader2 v-if="submitting" :size="14" class="animate-spin mr-1" />
        {{ submitting ? 'Criando...' : 'Criar Liga' }}
      </Button>
    </div>
  </form>
</template>
