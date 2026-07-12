<!--
  Favorite row: [drag handle | icon] label [count].
  Icon slot swaps to a drag handle on hover / active — same fixed 22px width,
  so text never shifts.

  When `draggable` is true, the row participates in HTML5 drag-and-drop.
  Parent listens to `dragstart` / `dragover` / `drop` to reorder the list.
-->
<script setup lang="ts">
import { GripVertical } from 'lucide-vue-next'
import BrandCountBadge from './BrandCountBadge.vue'

const props = defineProps<{
  label: string
  count: number
  icon: unknown
  active?: boolean
  draggable?: boolean
}>()

const emit = defineEmits<{
  select: []
  dragstart: [event: DragEvent]
  dragover: [event: DragEvent]
  drop: [event: DragEvent]
  dragend: [event: DragEvent]
}>()

const hovered = ref(false)
const showDrag = computed(() => hovered.value || props.active)
const isDragging = ref(false)

function onDragStart(e: DragEvent) {
  isDragging.value = true
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
  emit('dragstart', e)
}
function onDragEnd(e: DragEvent) {
  isDragging.value = false
  emit('dragend', e)
}
function onDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  emit('dragover', e)
}
function onDrop(e: DragEvent) {
  e.preventDefault()
  emit('drop', e)
}
</script>

<template>
  <button
    class="group flex items-center px-2 py-1.5 rounded-lg cursor-pointer text-[13.5px] text-[var(--brand-text-secondary)] transition-colors w-full text-left"
    :class="[
      props.active ? 'bg-[var(--brand-lime-tint)]' : 'hover:bg-[var(--brand-lime-tint)]',
      isDragging ? 'opacity-40' : '',
    ]"
    :draggable="props.draggable"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @click="$emit('select')"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <span class="w-[22px] mr-2.5 shrink-0 flex items-center justify-center">
      <GripVertical
        v-if="showDrag"
        class="w-[15px] h-[15px] text-[var(--brand-text-faint)]"
        stroke-width="1.7"
      />
      <component
        v-else
        :is="props.icon"
        class="w-[17px] h-[17px] text-[var(--brand-text-quiet)]"
        stroke-width="1.6"
      />
    </span>
    <span class="flex-1 whitespace-nowrap">{{ props.label }}</span>
    <BrandCountBadge :count="props.count" />
  </button>
</template>
