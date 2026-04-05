<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-vue-next'
import type { CalendarMatchDay } from '@/types'

const props = defineProps<{
  matchdays: CalendarMatchDay[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'select-matchday', matchday: CalendarMatchDay): void
}>()

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

// Build matchday lookup by date string (YYYY-MM-DD)
const matchdaysByDate = computed(() => {
  const map: Record<string, CalendarMatchDay[]> = {}
  for (const md of props.matchdays) {
    if (!map[md.date]) map[md.date] = []
    map[md.date].push(md)
  }
  return map
})

// Calendar grid: array of weeks, each week is 7 day-cells
interface DayCell {
  day: number
  dateStr: string
  isCurrentMonth: boolean
  isToday: boolean
  matchdays: CalendarMatchDay[]
}

const calendarWeeks = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startWeekday = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const cells: DayCell[] = []

  // Fill leading days from previous month
  const prevMonthLast = new Date(year, month, 0).getDate()
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = prevMonthLast - i
    const m = month === 0 ? 11 : month - 1
    const y = month === 0 ? year - 1 : year
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({
      day: d,
      dateStr,
      isCurrentMonth: false,
      isToday: false,
      matchdays: matchdaysByDate.value[dateStr] ?? [],
    })
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const isToday =
      d === today.getDate() && month === today.getMonth() && year === today.getFullYear()
    cells.push({
      day: d,
      dateStr,
      isCurrentMonth: true,
      isToday,
      matchdays: matchdaysByDate.value[dateStr] ?? [],
    })
  }

  // Fill trailing days
  const remaining = 7 - (cells.length % 7)
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const m = month === 11 ? 0 : month + 1
      const y = month === 11 ? year + 1 : year
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      cells.push({
        day: d,
        dateStr,
        isCurrentMonth: false,
        isToday: false,
        matchdays: matchdaysByDate.value[dateStr] ?? [],
      })
    }
  }

  // Split into weeks
  const weeks: DayCell[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
})

// Selected day for showing details
const selectedDate = ref<string | null>(null)

const selectedMatchdays = computed(() => {
  if (!selectedDate.value) return []
  return matchdaysByDate.value[selectedDate.value] ?? []
})

function onDayClick(cell: DayCell) {
  if (cell.matchdays.length > 0) {
    selectedDate.value = selectedDate.value === cell.dateStr ? null : cell.dateStr
  }
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}
</script>

<template>
  <section class="rounded-xl border border-border bg-card overflow-hidden">
    <div class="px-4 py-3 border-b border-border flex items-center gap-2">
      <Calendar :size="16" class="text-primary" />
      <h3 class="text-sm font-semibold text-foreground">Calendário</h3>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="px-4 py-6">
      <div class="animate-pulse space-y-2">
        <div class="h-6 bg-muted rounded-lg w-1/2 mx-auto" />
        <div class="grid grid-cols-7 gap-1">
          <div v-for="i in 35" :key="i" class="h-8 bg-muted rounded" />
        </div>
      </div>
    </div>

    <div v-else class="p-3">
      <!-- Month navigation -->
      <div class="flex items-center justify-between mb-3">
        <button
          class="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          @click="prevMonth"
        >
          <ChevronLeft :size="16" />
        </button>
        <span class="text-sm font-semibold text-foreground">
          {{ MONTH_NAMES[currentMonth] }} {{ currentYear }}
        </span>
        <button
          class="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          @click="nextMonth"
        >
          <ChevronRight :size="16" />
        </button>
      </div>

      <!-- Weekday headers -->
      <div class="grid grid-cols-7 mb-1">
        <div
          v-for="label in WEEKDAY_LABELS"
          :key="label"
          class="text-center text-[10px] text-muted-foreground font-medium py-1"
        >
          {{ label }}
        </div>
      </div>

      <!-- Calendar grid -->
      <div
        v-for="(week, wIdx) in calendarWeeks"
        :key="wIdx"
        class="grid grid-cols-7"
      >
        <button
          v-for="cell in week"
          :key="cell.dateStr"
          class="relative flex flex-col items-center justify-center py-1.5 rounded-lg text-xs transition-colors"
          :class="[
            cell.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/40',
            cell.isToday ? 'bg-primary/15 font-bold text-primary' : '',
            cell.matchdays.length > 0
              ? 'cursor-pointer hover:bg-muted'
              : 'cursor-default',
            selectedDate === cell.dateStr ? 'bg-accent/10 ring-1 ring-accent' : '',
          ]"
          @click="onDayClick(cell)"
        >
          <span class="tabular-nums">{{ cell.day }}</span>
          <!-- Dot indicator -->
          <span
            v-if="cell.matchdays.length > 0"
            class="w-1 h-1 rounded-full bg-accent mt-0.5"
          />
        </button>
      </div>

      <!-- Selected day details -->
      <div
        v-if="selectedMatchdays.length > 0"
        class="mt-3 pt-3 border-t border-border space-y-2"
      >
        <p class="text-xs text-muted-foreground font-medium mb-1">
          {{ formatDate(selectedDate!) }}
        </p>
        <div
          v-for="md in selectedMatchdays"
          :key="md.id"
          class="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
          @click="emit('select-matchday', md)"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-xs text-foreground font-medium truncate">{{ md.label }}</p>
            <p class="text-[10px] text-muted-foreground truncate">{{ md.league_name }}</p>
          </div>
          <span class="text-[10px] text-muted-foreground shrink-0">
            {{ md.status === 'IN_PROGRESS' ? 'Em Andamento' : 'Rascunho' }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
