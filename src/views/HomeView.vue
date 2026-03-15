<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui'
import {
  Zap,
  Users,
  ClipboardList,
  BarChart3,
  Shuffle,
  Trophy,
  Shield,
  ArrowRight,
  ChevronRight,
} from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()

const handleGetStarted = () => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  } else {
    router.push('/login')
  }
}

const features = [
  {
    icon: Users,
    title: 'Comunidades',
    description: 'Organize seus grupos de pelada com gestão de jogadores e configurações.',
  },
  {
    icon: ClipboardList,
    title: 'Súmulas inteligentes',
    description: 'Registre partidas, gols e assistências em poucos toques.',
  },
  {
    icon: Shuffle,
    title: 'Sorteio de times',
    description: 'Monte times equilibrados de forma automática ou manual.',
  },
  {
    icon: BarChart3,
    title: 'Estatísticas',
    description: 'Rankings, artilharia, assistências e desempenho individual.',
  },
  {
    icon: Trophy,
    title: 'Competições',
    description: 'Crie campeonatos no formato Copa ou Liga com classificação.',
  },
  {
    icon: Shield,
    title: 'Multi-comunidade',
    description: 'Participe de várias comunidades e acompanhe cada uma.',
  },
]

const steps = [
  { number: '01', title: 'Crie sua comunidade', description: 'Cadastre seu grupo e convide os jogadores.' },
  { number: '02', title: 'Cadastre jogadores', description: 'Adicione mensalistas e avulsos com posição e dados.' },
  { number: '03', title: 'Registre súmulas', description: 'Monte times, registre gols e veja o resumo em tempo real.' },
]
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- Nav -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div class="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
        <router-link to="/" class="flex items-center gap-2">
          <span class="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap :size="18" class="text-accent" />
          </span>
          <span class="text-base font-bold">
            <span class="text-primary">Fut</span><span class="text-accent">Engine</span>
          </span>
        </router-link>
        <div class="flex items-center gap-3">
          <Button
            v-if="authStore.isAuthenticated"
            variant="accent"
            size="sm"
            @click="router.push('/dashboard')"
          >
            Dashboard
            <ArrowRight :size="14" />
          </Button>
          <template v-else>
            <Button variant="ghost" size="sm" @click="router.push('/login')">Entrar</Button>
            <Button variant="accent" size="sm" @click="router.push('/login')">
              Começar grátis
            </Button>
          </template>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <section class="relative pt-32 pb-20 overflow-hidden">
      <!-- Background gradient effects -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div class="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/8 rounded-full blur-3xl" />
      </div>

      <div class="relative max-w-6xl mx-auto px-6 text-center">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/50 text-xs text-muted-foreground mb-8">
          <Zap :size="12" class="text-accent" />
          <span>Plataforma para gestão de peladas</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight max-w-3xl mx-auto">
          Gerencie suas peladas
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            como nunca antes.
          </span>
        </h1>

        <p class="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Times, súmulas, estatísticas e rankings — tudo em um só lugar.
          Simples, rápido e feito para quem joga.
        </p>

        <div class="mt-10 flex items-center justify-center gap-4">
          <Button variant="accent" size="xl" @click="handleGetStarted">
            Começar agora
            <ArrowRight :size="18" />
          </Button>
          <Button variant="outline" size="lg" @click="handleGetStarted">
            Ver como funciona
          </Button>
        </div>

        <!-- Stats -->
        <div class="mt-16 flex items-center justify-center gap-8 sm:gap-16">
          <div class="text-center">
            <p class="text-2xl font-bold text-accent">100%</p>
            <p class="text-xs text-muted-foreground mt-1">Gratuito</p>
          </div>
          <div class="w-px h-8 bg-border" />
          <div class="text-center">
            <p class="text-2xl font-bold text-foreground">∞</p>
            <p class="text-xs text-muted-foreground mt-1">Comunidades</p>
          </div>
          <div class="w-px h-8 bg-border" />
          <div class="text-center">
            <p class="text-2xl font-bold text-foreground">∞</p>
            <p class="text-xs text-muted-foreground mt-1">Jogadores</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-20 border-t border-border">
      <div class="max-w-6xl mx-auto px-6">
        <div class="text-center mb-14">
          <h2 class="text-2xl sm:text-3xl font-bold">Tudo que sua pelada precisa</h2>
          <p class="mt-3 text-muted-foreground max-w-md mx-auto">
            Funcionalidades pensadas para quem organiza e joga.
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="group p-6 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-200"
          >
            <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <component :is="feature.icon" :size="20" class="text-primary" />
            </div>
            <h3 class="font-semibold text-foreground">{{ feature.title }}</h3>
            <p class="mt-2 text-sm text-muted-foreground leading-relaxed">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="py-20 border-t border-border">
      <div class="max-w-4xl mx-auto px-6">
        <div class="text-center mb-14">
          <h2 class="text-2xl sm:text-3xl font-bold">Como funciona</h2>
          <p class="mt-3 text-muted-foreground">Três passos para começar.</p>
        </div>

        <div class="space-y-8">
          <div
            v-for="(step, index) in steps"
            :key="step.number"
            class="flex items-start gap-6"
          >
            <div class="shrink-0 w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm">
              {{ step.number }}
            </div>
            <div class="pt-2">
              <h3 class="font-semibold text-lg text-foreground">{{ step.title }}</h3>
              <p class="mt-1 text-muted-foreground">{{ step.description }}</p>
            </div>
            <div v-if="index < steps.length - 1" class="hidden" />
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20 border-t border-border">
      <div class="max-w-3xl mx-auto px-6">
        <div class="relative rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-10 text-center overflow-hidden">
          <div class="absolute inset-0 pointer-events-none">
            <div class="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />
            <div class="absolute -bottom-20 -left-20 w-60 h-60 bg-accent/10 rounded-full blur-3xl" />
          </div>
          <div class="relative">
            <h2 class="text-2xl sm:text-3xl font-bold">
              Pronto para organizar suas peladas?
            </h2>
            <p class="mt-4 text-muted-foreground max-w-md mx-auto">
              Crie sua comunidade, cadastre jogadores e comece a registrar súmulas hoje.
            </p>
            <Button variant="accent" size="xl" class="mt-8" @click="handleGetStarted">
              Começar agora
              <ChevronRight :size="18" />
            </Button>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-border py-8">
      <div class="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Zap :size="16" class="text-accent" />
          <span class="text-sm font-semibold">
            <span class="text-primary">Fut</span><span class="text-accent">Engine</span>
          </span>
        </div>
        <p class="text-xs text-muted-foreground">
          &copy; 2026 FutEngine. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  </div>
</template>
