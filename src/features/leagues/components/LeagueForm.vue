<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLeaguesStore } from '../stores/leaguesStore'
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

// Form state
const form = ref<LeagueCreate>({
  name: '',
  description: '',
  format: 'CUP',
  start_date: '',
  end_date: '',
})

const errors = ref<Partial<Record<keyof LeagueCreate, string>>>({})
const submitting = ref(false)

// Computed
const isValid = computed(() => {
  return (
    form.value.name.length >= 3 &&
    form.value.format &&
    form.value.start_date &&
    form.value.end_date &&
    new Date(form.value.end_date) > new Date(form.value.start_date)
  )
})

// Methods
function validateForm(): boolean {
  errors.value = {}

  if (!form.value.name || form.value.name.length < 3) {
    errors.value.name = 'Nome deve ter pelo menos 3 caracteres'
  }

  if (!form.value.format) {
    errors.value.format = 'Formato é obrigatório'
  }

  if (!form.value.start_date) {
    errors.value.start_date = 'Data de início é obrigatória'
  }

  if (!form.value.end_date) {
    errors.value.end_date = 'Data de fim é obrigatória'
  } else if (
    form.value.start_date &&
    new Date(form.value.end_date) <= new Date(form.value.start_date)
  ) {
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
      // Map backend errors to form errors
      const data = e.response.data as Record<string, string[]>
      Object.keys(data).forEach((key) => {
        errors.value[key as keyof LeagueCreate] = data[key][0]
      })
    }
  } finally {
    submitting.value = false
  }
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div>
      <label for="name" class="block text-sm font-medium text-white mb-2">
        Nome da Liga *
      </label>
      <input
        id="name"
        v-model="form.name"
        type="text"
        required
        placeholder="Ex: Campeonato de Verão 2026"
        class="block w-full rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2.5"
        :class="{ 'border-red-500': errors.name }"
      />
      <p v-if="errors.name" class="mt-1.5 text-sm text-red-400">
        {{ errors.name }}
      </p>
    </div>

    <div>
      <label for="description" class="block text-sm font-medium text-white mb-2">
        Descrição
      </label>
      <textarea
        id="description"
        v-model="form.description"
        rows="3"
        placeholder="Descreva a liga..."
        class="block w-full rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2.5"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-white mb-3">
        Formato *
      </label>
      <div class="space-y-3">
        <label class="flex items-start p-4 bg-slate-700/30 border border-slate-600 rounded-lg cursor-pointer hover:border-emerald-500/50 transition-colors">
          <input
            v-model="form.format"
            type="radio"
            value="CUP"
            class="mt-1 mr-3 text-emerald-500 focus:ring-emerald-500"
          />
          <div>
            <span class="text-white font-medium">Copa</span>
            <p class="text-sm text-slate-400 mt-0.5">Times fixos definidos na criação</p>
          </div>
        </label>
        <label class="flex items-start p-4 bg-slate-700/30 border border-slate-600 rounded-lg cursor-pointer hover:border-emerald-500/50 transition-colors">
          <input
            v-model="form.format"
            type="radio"
            value="LEAGUE"
            class="mt-1 mr-3 text-emerald-500 focus:ring-emerald-500"
          />
          <div>
            <span class="text-white font-medium">Liga</span>
            <p class="text-sm text-slate-400 mt-0.5">Times sorteados a cada rodada</p>
          </div>
        </label>
      </div>
      <p v-if="errors.format" class="mt-1.5 text-sm text-red-400">
        {{ errors.format }}
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="start_date" class="block text-sm font-medium text-white mb-2">
          Data de Início *
        </label>
        <input
          id="start_date"
          v-model="form.start_date"
          type="datetime-local"
          required
          class="block w-full rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2.5"
          :class="{ 'border-red-500': errors.start_date }"
        />
        <p v-if="errors.start_date" class="mt-1.5 text-sm text-red-400">
          {{ errors.start_date }}
        </p>
      </div>

      <div>
        <label for="end_date" class="block text-sm font-medium text-white mb-2">
          Data de Fim *
        </label>
        <input
          id="end_date"
          v-model="form.end_date"
          type="datetime-local"
          required
          class="block w-full rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:border-emerald-500 focus:ring-emerald-500 px-4 py-2.5"
          :class="{ 'border-red-500': errors.end_date }"
        />
        <p v-if="errors.end_date" class="mt-1.5 text-sm text-red-400">
          {{ errors.end_date }}
        </p>
      </div>
    </div>

    <div class="flex justify-end gap-3 pt-4">
      <button
        type="button"
        @click="handleCancel"
        class="px-6 py-2.5 text-sm font-medium text-slate-300 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
      >
        Cancelar
      </button>
      <button
        type="submit"
        :disabled="!isValid || submitting"
        class="px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
      >
        {{ submitting ? 'Criando...' : 'Criar Liga' }}
      </button>
    </div>
  </form>
</template>
