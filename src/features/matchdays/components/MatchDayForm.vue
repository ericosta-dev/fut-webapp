<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMatchDaysStore } from '../stores/matchdaysStore'
import type { MatchDayCreate } from '../types'

interface Props {
  communityId: string
  leagueId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'success', matchdayId: string): void
  (e: 'cancel'): void
}>()

const store = useMatchDaysStore()

// ─── Form state ───────────────────────────────────────────────────────────────
const form = ref<MatchDayCreate>({
  date: new Date().toISOString().split('T')[0] ?? '',
  label: '',
  notes: '',
})

const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

// ─── Validation ───────────────────────────────────────────────────────────────
const isValid = computed(() => !!form.value.date)

function validateForm(): boolean {
  errors.value = {}
  if (!form.value.date) errors.value.date = 'Data é obrigatória.'
  return Object.keys(errors.value).length === 0
}

// ─── Submit ───────────────────────────────────────────────────────────────────
async function handleSubmit() {
  if (!validateForm() || isSubmitting.value) return
  isSubmitting.value = true
  try {
    const created = await store.createMatchDay(props.communityId, props.leagueId, {
      date: form.value.date,
      label: form.value.label || undefined,
      notes: form.value.notes || undefined,
    })
    emit('success', created.id)
  } catch (e: unknown) {
    const axiosError = e as { response?: { data?: Record<string, string[]> } }
    if (axiosError?.response?.data) {
      const data = axiosError.response.data
      Object.entries(data).forEach(([key, messages]) => {
        errors.value[key] = Array.isArray(messages) ? (messages[0] ?? '') : String(messages)
      })
    } else {
      errors.value.general = 'Erro ao criar súmula. Tente novamente.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="bg-slate-700/30 border border-slate-600/50 rounded-xl p-5 space-y-4">
    <h3 class="text-white font-semibold text-lg">Nova Súmula</h3>

    <!-- General error -->
    <p v-if="errors.general" class="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
      {{ errors.general }}
    </p>

    <!-- Date -->
    <div>
      <label class="block text-sm font-medium text-slate-300 mb-1.5">
        Data <span class="text-red-400">*</span>
      </label>
      <input
        v-model="form.date"
        type="date"
        class="w-full bg-slate-700/50 border border-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        :class="{ 'border-red-500': errors.date }"
      />
      <p v-if="errors.date" class="mt-1 text-xs text-red-400">{{ errors.date }}</p>
    </div>

    <!-- Label -->
    <div>
      <label class="block text-sm font-medium text-slate-300 mb-1.5">
        Título / Etapa
        <span class="text-slate-500 font-normal">(opcional)</span>
      </label>
      <input
        v-model="form.label"
        type="text"
        placeholder="Ex: Rodada 1, Semifinal..."
        class="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
      />
    </div>

    <!-- Notes -->
    <div>
      <label class="block text-sm font-medium text-slate-300 mb-1.5">
        Observações
        <span class="text-slate-500 font-normal">(opcional)</span>
      </label>
      <textarea
        v-model="form.notes"
        rows="2"
        placeholder="Notas adicionais sobre o dia..."
        class="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
      />
    </div>

    <!-- Actions -->
    <div class="flex gap-3 pt-1">
      <button
        @click="handleSubmit"
        :disabled="!isValid || isSubmitting"
        class="px-5 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {{ isSubmitting ? 'Criando...' : 'Criar Súmula' }}
      </button>
      <button
        @click="$emit('cancel')"
        class="px-5 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
      >
        Cancelar
      </button>
    </div>
  </div>
</template>
