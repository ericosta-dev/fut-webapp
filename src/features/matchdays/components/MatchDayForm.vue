<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMatchDaysStore } from '../stores/matchdaysStore'
import { Input, Label, Button } from '@/components/ui'
import { Loader2 } from 'lucide-vue-next'
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

const form = ref<MatchDayCreate>({
  date: new Date().toISOString().split('T')[0] ?? '',
  label: '',
  notes: '',
})

const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)
const isValid = computed(() => !!form.value.date)

function validateForm(): boolean {
  errors.value = {}
  if (!form.value.date) errors.value.date = 'Data é obrigatória.'
  return Object.keys(errors.value).length === 0
}

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
  <div class="rounded-xl border border-border bg-card p-5 space-y-4">
    <h3 class="text-foreground font-semibold text-lg">Nova Súmula</h3>

    <p v-if="errors.general" class="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
      {{ errors.general }}
    </p>

    <div class="space-y-1.5">
      <Label for="mdDate">Data <span class="text-destructive">*</span></Label>
      <Input
        id="mdDate"
        v-model="form.date"
        type="date"
        :class="{ 'border-destructive': errors.date }"
      />
      <p v-if="errors.date" class="text-xs text-destructive">{{ errors.date }}</p>
    </div>

    <div class="space-y-1.5">
      <Label for="mdLabel">
        Título / Etapa
        <span class="text-muted-foreground font-normal">(opcional)</span>
      </Label>
      <Input
        id="mdLabel"
        v-model="form.label"
        placeholder="Ex: Rodada 1, Semifinal..."
      />
    </div>

    <div class="space-y-1.5">
      <Label for="mdNotes">
        Observações
        <span class="text-muted-foreground font-normal">(opcional)</span>
      </Label>
      <textarea
        id="mdNotes"
        v-model="form.notes"
        rows="2"
        placeholder="Notas adicionais sobre o dia..."
        class="flex w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary resize-none"
      />
    </div>

    <div class="flex gap-3 pt-1">
      <Button @click="handleSubmit" :disabled="!isValid || isSubmitting" variant="accent" size="sm">
        <Loader2 v-if="isSubmitting" :size="14" class="animate-spin" />
        {{ isSubmitting ? 'Criando...' : 'Criar Súmula' }}
      </Button>
      <Button @click="$emit('cancel')" variant="outline" size="sm">Cancelar</Button>
    </div>
  </div>
</template>
