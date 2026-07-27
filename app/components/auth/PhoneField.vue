<!--
  International phone input for the auth forms. A country selector (flag + dial
  code, searchable) sits inline before the national number, on the same underline
  field style as <AuthField>. Two-way: v-model:country (ISO) + v-model:number.
  Visual/validation only — no real phone verification yet.
-->
<script setup lang="ts">
import { ChevronDown, Search, Check } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'

const COUNTRIES = [
  { iso: 'EG', name: 'Egypt', dial: '+20', flag: '🇪🇬' },
  { iso: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦' },
  { iso: 'AE', name: 'United Arab Emirates', dial: '+971', flag: '🇦🇪' },
  { iso: 'QA', name: 'Qatar', dial: '+974', flag: '🇶🇦' },
  { iso: 'KW', name: 'Kuwait', dial: '+965', flag: '🇰🇼' },
  { iso: 'BH', name: 'Bahrain', dial: '+973', flag: '🇧🇭' },
  { iso: 'OM', name: 'Oman', dial: '+968', flag: '🇴🇲' },
  { iso: 'JO', name: 'Jordan', dial: '+962', flag: '🇯🇴' },
  { iso: 'LB', name: 'Lebanon', dial: '+961', flag: '🇱🇧' },
  { iso: 'MA', name: 'Morocco', dial: '+212', flag: '🇲🇦' },
  { iso: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
  { iso: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
  { iso: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
  { iso: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
  { iso: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
  { iso: 'ES', name: 'Spain', dial: '+34', flag: '🇪🇸' },
  { iso: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹' },
  { iso: 'NL', name: 'Netherlands', dial: '+31', flag: '🇳🇱' },
  { iso: 'IE', name: 'Ireland', dial: '+353', flag: '🇮🇪' },
  { iso: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
  { iso: 'PK', name: 'Pakistan', dial: '+92', flag: '🇵🇰' },
  { iso: 'TR', name: 'Türkiye', dial: '+90', flag: '🇹🇷' },
  { iso: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺' },
] as const

const number = defineModel<string>('number', { default: '' })
const country = defineModel<string>('country', { default: 'EG' })

const open = ref(false)
const query = ref('')
const selected = computed(() => COUNTRIES.find(c => c.iso === country.value) ?? COUNTRIES[0])
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return COUNTRIES.filter(c => !q || c.name.toLowerCase().includes(q) || c.dial.includes(q))
})
function pick(iso: string) { country.value = iso; open.value = false; query.value = '' }
// Keep only digits / spaces in the national number.
function onInput(e: Event) { number.value = (e.target as HTMLInputElement).value.replace(/[^\d\s]/g, '') }
</script>

<template>
  <label class="block">
    <span class="block mb-2 text-[15px] font-bold text-[var(--brand-text-secondary)]">
      <span class="text-[var(--brand-danger)]">*</span> Phone number
    </span>
    <div class="flex items-center h-11 border-b-[1.5px] border-[var(--brand-border-mid)] transition-colors focus-within:border-[var(--brand-teal)]">
      <!-- country selector -->
      <Popover v-model:open="open">
        <PopoverTrigger as-child>
          <button type="button" class="flex items-center gap-1.5 pr-2.5 mr-2.5 h-7 border-r border-[var(--brand-border)] outline-none cursor-pointer">
            <span class="text-[18px] leading-none">{{ selected.flag }}</span>
            <ChevronDown class="w-3.5 h-3.5 text-[var(--brand-text-quiet)] transition-transform" :class="{ 'rotate-180': open }" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" class="w-[300px] p-0 rounded-xl overflow-hidden">
          <div class="p-2 border-b border-[var(--brand-border-hairline)]">
            <div class="flex items-center gap-2 h-9 px-3 rounded-lg bg-[var(--brand-canvas)]">
              <Search class="w-4 h-4 text-[var(--brand-text-quiet)]" stroke-width="1.8" />
              <input v-model="query" type="text" placeholder="Search country" class="flex-1 min-w-0 bg-transparent border-none outline-none text-[14px] text-[var(--brand-text)]">
            </div>
          </div>
          <div class="max-h-[280px] overflow-y-auto py-1">
            <button
              v-for="c in filtered"
              :key="c.iso"
              type="button"
              class="w-full flex items-center gap-3 px-3 h-10 hover:bg-[var(--brand-surface-hover)] cursor-pointer text-left"
              @click="pick(c.iso)"
            >
              <span class="text-[18px] leading-none">{{ c.flag }}</span>
              <span class="flex-1 min-w-0 text-[14px] text-[var(--brand-text)] truncate">{{ c.name }}</span>
              <span class="text-[13px] text-[var(--brand-text-quiet)]">{{ c.dial }}</span>
              <Check v-if="c.iso === country" class="w-4 h-4 text-[var(--brand-teal)] shrink-0" stroke-width="2.4" />
            </button>
            <p v-if="!filtered.length" class="px-3 py-6 text-center text-[13px] text-[var(--brand-text-quiet)]">No match.</p>
          </div>
        </PopoverContent>
      </Popover>

      <span class="text-[16px] font-semibold text-[var(--brand-text-secondary)] mr-2 tabular-nums">{{ selected.dial }}</span>
      <input
        :value="number"
        type="tel"
        inputmode="tel"
        autocomplete="tel"
        placeholder="10 0123 4567"
        class="flex-1 min-w-0 h-full bg-transparent border-none outline-none text-[16px] text-[var(--brand-text)] placeholder:text-[var(--brand-text-faint)]"
        @input="onInput"
      >
    </div>
  </label>
</template>
