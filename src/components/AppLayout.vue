<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCommunitiesStore } from '@/stores/communities'

const router = useRouter()
const authStore = useAuthStore()
const communitiesStore = useCommunitiesStore()
const isSidebarOpen = ref(false)

onMounted(async () => {
  if (communitiesStore.communities.length === 0) {
    try {
      await communitiesStore.fetchCommunities()
    } catch {
      // silently fail
    }
  }
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

// ── Community selector ──────────────────────────────────────────────────────
const selectedCommunityId = computed({
  get: () => communitiesStore.currentCommunity?.id ?? '',
  set: (val: string) => {
    if (val === '__new__') {
      router.push('/communities')
      return
    }
    if (val === '') {
      communitiesStore.setCurrentCommunity(null)
      return
    }
    const found = communitiesStore.communities.find((c) => c.id === val) ?? null
    communitiesStore.setCurrentCommunity(found)
  },
})

// ── Sidebar navigation ──────────────────────────────────────────────────────
const communityId = computed(() => communitiesStore.currentCommunity?.id ?? null)

const communityLinksDisabled = computed(() => !communityId.value)

const playersPath = computed(() =>
  communityId.value ? `/communities/${communityId.value}/players` : '/communities',
)
const leaguesPath = computed(() =>
  communityId.value ? `/communities/${communityId.value}` : '/communities',
)
</script>

<template>
  <div class="min-h-screen bg-slate-900">
    <!-- Mobile sidebar backdrop -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="isSidebarOpen = false"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 left-0 z-50 h-full w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-200 lg:translate-x-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b border-slate-700">
        <router-link to="/dashboard" class="flex items-center gap-3">
          <span class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke-width="2" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v20M2 12h20" />
            </svg>
          </span>
          <span class="text-lg font-bold text-white">
            <span class="text-emerald-400">Fut</span>Engine
          </span>
        </router-link>
      </div>

      <!-- Navigation -->
      <nav class="p-4 space-y-1">
        <!-- Dashboard -->
        <router-link
          to="/dashboard"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
          active-class="!bg-emerald-500/10 !text-emerald-400"
          @click="isSidebarOpen = false"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Dashboard</span>
        </router-link>

        <!-- Comunidades -->
        <router-link
          to="/communities"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
          active-class="!bg-emerald-500/10 !text-emerald-400"
          @click="isSidebarOpen = false"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Comunidades</span>
        </router-link>

        <!-- Divider -->
        <div class="pt-2 pb-1">
          <p class="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {{ communitiesStore.currentCommunity?.name ?? 'Comunidade' }}
          </p>
        </div>

        <!-- Jogadores -->
        <router-link
          :to="playersPath"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
            communityLinksDisabled
              ? 'text-slate-600 cursor-default'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white',
          ]"
          :active-class="communityLinksDisabled ? '' : '!bg-emerald-500/10 !text-emerald-400'"
          @click="isSidebarOpen = false"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Jogadores</span>
          <span
            v-if="communityLinksDisabled"
            class="ml-auto text-xs text-slate-600"
            title="Selecione uma comunidade"
          >—</span>
        </router-link>

        <!-- Ligas e Competições -->
        <router-link
          :to="leaguesPath"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
            communityLinksDisabled
              ? 'text-slate-600 cursor-default'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white',
          ]"
          :active-class="communityLinksDisabled ? '' : '!bg-emerald-500/10 !text-emerald-400'"
          @click="isSidebarOpen = false"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <span>Ligas e Competições</span>
          <span
            v-if="communityLinksDisabled"
            class="ml-auto text-xs text-slate-600"
            title="Selecione uma comunidade"
          >—</span>
        </router-link>
      </nav>

      <!-- User Menu -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
        <div class="flex items-center gap-3 px-4 py-3">
          <div class="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <span class="text-emerald-400 font-medium">
              {{
                (
                  authStore.user?.first_name?.[0] ||
                  authStore.user?.username?.[0] ||
                  'U'
                ).toUpperCase()
              }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">
              {{ authStore.user?.first_name || authStore.user?.username || 'Usuário' }}
            </p>
            <p class="text-xs text-slate-400 truncate">{{ authStore.user?.email }}</p>
          </div>
          <button
            @click="handleLogout"
            class="p-2 text-slate-400 hover:text-red-400 transition-colors"
            title="Sair"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div class="lg:pl-64">
      <!-- Top bar -->
      <header class="h-16 bg-slate-800/80 backdrop-blur border-b border-slate-700 flex items-center gap-4 px-4 lg:px-8 sticky top-0 z-30">
        <!-- Mobile hamburger -->
        <button @click="isSidebarOpen = true" class="p-2 text-slate-400 hover:text-white lg:hidden">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Community selector -->
        <div class="relative flex-1 max-w-xs">
          <div class="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <select
            v-model="selectedCommunityId"
            class="w-full appearance-none bg-slate-700/60 border border-slate-600 text-slate-200 text-sm rounded-lg pl-9 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors cursor-pointer"
          >
            <option value="">Todas as comunidades</option>
            <option
              v-for="community in communitiesStore.communities"
              :key="community.id"
              :value="community.id"
            >
              {{ community.name }}
            </option>
            <option value="__new__">+ Adicionar nova</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <!-- Spacer -->
        <div class="flex-1" />

        <!-- Active community badge -->
        <div v-if="communitiesStore.currentCommunity" class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span class="text-xs font-medium text-emerald-400 truncate max-w-[160px]">
            {{ communitiesStore.currentCommunity.name }}
          </span>
        </div>
      </header>

      <!-- Page content -->
      <main class="p-4 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
