<!--
  Sidebar "Assign" modal. Lets the recruiter tick one or more jobs / talent
  pools (with a search filter) and Continue to assign them to the candidate.
  Jobs come from useJobs; talent pools from a small fixture. Confirm emits
  the picked job titles + pool names — the parent applies them to local state
  (no write endpoint yet).
-->
<script setup lang="ts">
import { Search, Check, FolderCheck } from 'lucide-vue-next'
import {
  Dialog, DialogScrollContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '~/components/ui/dialog'
import { BrandButton } from '~/components/brand'
import { useJobs } from '~/composables/useJobs'

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ confirm: [payload: { jobs: string[], pools: string[] }] }>()

const { jobs: allJobs } = useJobs()
const jobs = computed(() => allJobs.value.map(j => ({ title: j.title, meta: [j.department, j.location].filter(Boolean).join(' · ') })))
const POOLS = [
  { name: 'Engineering', meta: 'Engineering' },
  { name: 'Leadership Pipeline', meta: 'Leadership' },
  { name: 'Design', meta: 'Product' },
]

const query = ref('')
const pickedJobs = ref<Set<string>>(new Set())
const pickedPools = ref<Set<string>>(new Set())

const fJobs = computed(() => {
  const q = query.value.trim().toLowerCase()
  return jobs.value.filter(j => !q || j.title.toLowerCase().includes(q))
})
const fPools = computed(() => {
  const q = query.value.trim().toLowerCase()
  return POOLS.filter(p => !q || p.name.toLowerCase().includes(q))
})

function toggle(set: Ref<Set<string>>, key: string) {
  const next = new Set(set.value)
  next.has(key) ? next.delete(key) : next.add(key)
  set.value = next
}
const total = computed(() => pickedJobs.value.size + pickedPools.value.size)

function confirm() {
  if (!total.value) return
  emit('confirm', { jobs: [...pickedJobs.value], pools: [...pickedPools.value] })
  open.value = false
}
watch(open, (v) => {
  if (!v) { query.value = ''; pickedJobs.value = new Set(); pickedPools.value = new Set() }
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogScrollContent class="max-w-[640px] p-0 gap-0 overflow-hidden">
      <DialogHeader class="px-[26px] py-[22px] border-b border-[var(--brand-border-hairline)] space-y-1 text-left">
        <DialogTitle class="text-[20px] font-bold text-[var(--brand-text)] tracking-[-0.01em]">Assign candidate</DialogTitle>
        <DialogDescription class="text-[14px] text-[var(--brand-text-secondary)]">Choose a job or a talent pool that you want to assign this candidate to.</DialogDescription>
      </DialogHeader>

      <div class="px-[26px] py-5 bg-[var(--brand-canvas)] max-h-[60vh] overflow-y-auto">
        <div class="border border-[var(--brand-border-light)] rounded-[14px] bg-[var(--brand-surface-white)] overflow-hidden">
          <div class="p-3.5">
            <div class="flex items-center gap-2.5 border-[1.6px] border-[var(--brand-border)] rounded-[10px] px-3.5 py-2.5 focus-within:border-[var(--brand-lime)]">
              <Search class="w-[17px] h-[17px] text-[var(--brand-text-quiet)]" stroke-width="1.7" />
              <input v-model="query" type="text" placeholder="Search jobs and talent pools" class="flex-1 min-w-0 border-none outline-none bg-transparent text-[14px] text-[var(--brand-text)]">
            </div>
          </div>

          <template v-if="fJobs.length">
            <div class="px-4 pt-1.5 pb-2.5 text-[12px] font-bold tracking-[0.06em] text-[var(--brand-text-quiet)]">JOBS</div>
            <button
              v-for="j in fJobs"
              :key="j.title"
              type="button"
              class="w-full flex items-start gap-3.5 px-4 py-4 border-t border-[var(--brand-border-hairline)] cursor-pointer hover:bg-[var(--brand-surface-hover)] text-left"
              @click="toggle(pickedJobs, j.title)"
            >
              <span
                class="w-6 h-6 shrink-0 mt-0.5 rounded-[7px] border-[1.8px] inline-flex items-center justify-center"
                :class="pickedJobs.has(j.title) ? 'bg-[var(--brand-teal)] border-[var(--brand-teal)]' : 'border-[var(--brand-border-mid)]'"
              >
                <Check v-if="pickedJobs.has(j.title)" class="w-3.5 h-3.5 text-white" stroke-width="3" />
              </span>
              <span class="min-w-0">
                <span class="flex items-center gap-2.5 flex-wrap">
                  <span class="w-[9px] h-[9px] rounded-full bg-[var(--brand-status-teal-green)] shrink-0" />
                  <span class="font-bold text-[15px] text-[var(--brand-text)]">{{ j.title }}</span>
                </span>
                <span v-if="j.meta" class="block text-[13.5px] text-[var(--brand-text-quiet)] mt-1.5">{{ j.meta }}</span>
              </span>
            </button>
          </template>

          <template v-if="fPools.length">
            <div class="px-4 pt-3.5 pb-2.5 text-[12px] font-bold tracking-[0.06em] text-[var(--brand-text-quiet)] border-t border-[var(--brand-border-hairline)]">TALENT POOLS</div>
            <button
              v-for="p in fPools"
              :key="p.name"
              type="button"
              class="w-full flex items-start gap-3.5 px-4 py-4 border-t border-[var(--brand-border-hairline)] cursor-pointer hover:bg-[var(--brand-surface-hover)] text-left"
              @click="toggle(pickedPools, p.name)"
            >
              <span
                class="w-6 h-6 shrink-0 mt-0.5 rounded-[7px] border-[1.8px] inline-flex items-center justify-center"
                :class="pickedPools.has(p.name) ? 'bg-[var(--brand-teal)] border-[var(--brand-teal)]' : 'border-[var(--brand-border-mid)]'"
              >
                <Check v-if="pickedPools.has(p.name)" class="w-3.5 h-3.5 text-white" stroke-width="3" />
              </span>
              <span class="min-w-0">
                <span class="flex items-center gap-2.5 flex-wrap">
                  <FolderCheck class="w-[18px] h-[18px] text-[var(--brand-icon-default)] shrink-0" stroke-width="1.7" />
                  <span class="font-bold text-[15px] text-[var(--brand-text)]">{{ p.name }}</span>
                </span>
                <span class="block text-[13.5px] text-[var(--brand-text-quiet)] mt-1.5">{{ p.meta }}</span>
              </span>
            </button>
          </template>

          <p v-if="!fJobs.length && !fPools.length" class="px-4 py-8 text-center text-[13.5px] text-[var(--brand-text-quiet)]">No jobs or talent pools match.</p>
        </div>
      </div>

      <DialogFooter class="px-[26px] py-4 border-t border-[var(--brand-border-hairline)] gap-3 sm:justify-end">
        <BrandButton variant="outline" size="md" @click="open = false">Cancel</BrandButton>
        <BrandButton variant="primary-teal" size="md" :class="{ 'opacity-50 pointer-events-none': !total }" @click="confirm">Continue<span v-if="total"> ({{ total }})</span></BrandButton>
      </DialogFooter>
    </DialogScrollContent>
  </Dialog>
</template>
