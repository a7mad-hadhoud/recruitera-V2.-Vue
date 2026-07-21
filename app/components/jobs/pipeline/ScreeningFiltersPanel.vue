<!--
  Screening list filter builder. Same visual pattern as JobsFiltersPanel
  ("All filters" header, Where/Field/Op/Values rows, Add filter / Clear
  filters footer) so the two pages read as one system.

  Rows come from useScreeningFilters; parent listens for add / remove /
  update / clear and passes the filtered result count for the header.
-->
<script setup lang="ts">
import { Plus, X, Info, ChevronDown, SlidersHorizontal } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Checkbox } from '~/components/ui/checkbox'
import {
  SCREENING_FILTER_FIELDS, SCREENING_FILTER_OPS, SCREENING_FILTER_OPTIONS,
  type ScreeningFilterField, type ScreeningFilterOp, type ScreeningFilterRow,
} from '~/composables/useScreeningFilters'

const props = defineProps<{
  rows: ScreeningFilterRow[]
  resultCount: number
}>()

const emit = defineEmits<{
  add: []
  remove: [id: string]
  update: [id: string, patch: Partial<ScreeningFilterRow>]
  clear: []
}>()

const activeCount = computed(() =>
  props.rows.filter(r => r.op === 'is-empty' || r.values.length).length,
)

function optionsFor(f: ScreeningFilterField) {
  return SCREENING_FILTER_OPTIONS[f] ?? []
}
function toggleValue(row: ScreeningFilterRow, v: string) {
  const has = row.values.includes(v)
  emit('update', row.id, { values: has ? row.values.filter(x => x !== v) : [...row.values, v] })
}
function labelForValue(f: ScreeningFilterField, v: string) {
  return optionsFor(f).find(o => o.value === v)?.label ?? v
}
function dotForValue(f: ScreeningFilterField, v: string) {
  return optionsFor(f).find(o => o.value === v)?.dot
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <button
        class="relative w-9 h-9 rounded-[10px] inline-flex items-center justify-center transition"
        :class="activeCount > 0
          ? 'bg-[var(--brand-teal)] text-white'
          : 'bg-[var(--brand-canvas)] text-[var(--brand-text-quiet)] hover:bg-[var(--brand-lime-tint)] hover:text-[var(--brand-text)]'"
        aria-label="Filters"
      >
        <SlidersHorizontal class="w-4 h-4" stroke-width="1.7" />
        <span
          v-if="activeCount > 0"
          class="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[var(--brand-lime)] text-[var(--brand-teal)] text-[10px] font-bold inline-flex items-center justify-center px-1"
        >{{ activeCount }}</span>
      </button>
    </PopoverTrigger>

    <PopoverContent
      align="end"
      :side-offset="8"
      class="w-[720px] max-w-[96vw] p-0 rounded-[16px] border border-[var(--brand-border-light)] shadow-[0_12px_40px_rgba(0,20,18,0.18)]"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--brand-border-fade)]">
        <div class="flex items-center gap-2.5">
          <span class="text-[16px] font-bold text-[var(--brand-text)]">All filters</span>
          <span class="text-[13px] text-[var(--brand-text-quiet)]">{{ props.resultCount }} results</span>
        </div>
        <a href="#" class="inline-flex items-center gap-1.5 text-[13px] text-[var(--brand-text-quiet)] hover:text-[var(--brand-text-secondary)]" @click.prevent>
          <Info class="w-3.5 h-3.5" stroke-width="1.7" />
          Learn more
        </a>
      </div>

      <!-- Rows -->
      <div class="px-6 py-4 flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto">
        <div
          v-for="(row, idx) in props.rows"
          :key="row.id"
          class="flex items-center gap-2"
        >
          <span class="text-[13px] text-[var(--brand-text-quiet)] w-12 shrink-0">
            {{ idx === 0 ? 'Where' : 'And' }}
          </span>

          <!-- Field select -->
          <div class="relative w-[150px] shrink-0">
            <select
              class="w-full h-9 rounded-[9px] border border-[var(--brand-border)] bg-white px-3 pr-7 text-[13px] appearance-none"
              :value="row.field"
              @change="(e) => emit('update', row.id, { field: (e.target as HTMLSelectElement).value as ScreeningFilterField, values: [] })"
            >
              <option v-for="f in SCREENING_FILTER_FIELDS" :key="f.key" :value="f.key">{{ f.label }}</option>
            </select>
            <ChevronDown class="w-3 h-3 text-[var(--brand-text-quiet)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <!-- Op select -->
          <div class="relative w-[110px] shrink-0">
            <select
              class="w-full h-9 rounded-[9px] border border-[var(--brand-border)] bg-white px-3 pr-7 text-[13px] appearance-none"
              :value="row.op"
              @change="(e) => emit('update', row.id, { op: (e.target as HTMLSelectElement).value as ScreeningFilterOp })"
            >
              <option v-for="o in SCREENING_FILTER_OPS" :key="o.key" :value="o.key">{{ o.label }}</option>
            </select>
            <ChevronDown class="w-3 h-3 text-[var(--brand-text-quiet)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <!-- Value chips (popover for editing) -->
          <Popover v-if="row.op !== 'is-empty'">
            <PopoverTrigger as-child>
              <button
                class="flex-1 flex items-center flex-wrap gap-1.5 rounded-[9px] border border-[var(--brand-border)] bg-white px-2.5 py-1.5 min-h-9 text-left cursor-pointer hover:bg-[var(--brand-lime-tint)]/30"
              >
                <template v-if="row.values.length">
                  <span
                    v-for="v in row.values"
                    :key="v"
                    class="inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-[12.5px] font-medium bg-[var(--brand-canvas)] text-[var(--brand-text-secondary)]"
                  >
                    <span
                      v-if="dotForValue(row.field, v)"
                      class="w-2 h-2 rounded-full"
                      :style="{ background: dotForValue(row.field, v) as string }"
                    />
                    {{ labelForValue(row.field, v) }}
                    <button
                      class="text-[var(--brand-text-faint)] hover:text-[var(--brand-text-secondary)]"
                      :aria-label="`Remove ${labelForValue(row.field, v)}`"
                      @click.stop="toggleValue(row, v)"
                    >
                      <X class="w-3 h-3" stroke-width="2" />
                    </button>
                  </span>
                </template>
                <span v-else class="text-[13px] text-[var(--brand-text-quiet)] px-1">Select</span>
                <ChevronDown class="w-3 h-3 text-[var(--brand-text-faint)] ml-auto shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              class="w-[240px] p-1.5 rounded-[10px] border border-[var(--brand-border-light)] shadow-[0_8px_28px_rgba(0,20,18,0.14)]"
            >
              <label
                v-for="opt in optionsFor(row.field)"
                :key="opt.value"
                class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] text-[var(--brand-text)] cursor-pointer hover:bg-[var(--brand-lime-tint)]/40"
              >
                <Checkbox
                  :model-value="row.values.includes(opt.value)"
                  @update:model-value="() => toggleValue(row, opt.value)"
                />
                <span v-if="opt.dot" class="w-2 h-2 rounded-full shrink-0" :style="{ background: opt.dot }" />
                {{ opt.label }}
              </label>
            </PopoverContent>
          </Popover>
          <div v-else class="flex-1 h-9 rounded-[9px] border border-dashed border-[var(--brand-border)] flex items-center px-3 text-[13px] text-[var(--brand-text-quiet)]">
            (empty)
          </div>

          <!-- Remove -->
          <button
            class="w-8 h-8 rounded-lg text-[var(--brand-text-faint)] hover:bg-[var(--brand-lime-tint)]/40 hover:text-[var(--brand-text-secondary)] shrink-0 inline-flex items-center justify-center"
            title="Remove filter"
            @click="emit('remove', row.id)"
          >
            <X class="w-4 h-4" stroke-width="2" />
          </button>
        </div>

        <div v-if="!props.rows.length" class="text-[13px] text-[var(--brand-text-quiet)] py-6 text-center">
          Click <span class="font-semibold">Add filter</span> to narrow the list.
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between px-6 py-3.5 border-t border-[var(--brand-border-fade)]">
        <button
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-[9px] border-[1.5px] border-[var(--brand-teal)] bg-[var(--brand-lime-tint)] text-[13.5px] font-semibold text-[var(--brand-teal)] hover:brightness-95"
          @click="emit('add')"
        >
          <Plus class="w-3.5 h-3.5" stroke-width="2.2" />
          Add filter
        </button>
        <button
          class="text-[13.5px] font-semibold text-[var(--brand-text-quiet)] hover:text-[var(--brand-text-secondary)]"
          @click="emit('clear')"
        >Clear filters</button>
      </div>
    </PopoverContent>
  </Popover>
</template>
