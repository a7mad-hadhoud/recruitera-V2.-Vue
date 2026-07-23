<!--
  Rich-text field for the /jobs/new "About the role" section. Visual
  parity with the Tellent/Recruitee editor (Text style dropdown, B/I/U,
  font size, fill + text color, quote, align, list, indent, link/image/
  video, more, emoji) — the toolbar sits BELOW the editing area exactly
  like the reference.

  The toolbar is presentational for now (no live rich-text engine wired
  yet); swap the buttons for real commands when the editor lands. All
  colors come from --brand-* tokens.
-->
<script setup lang="ts">
import { Type, Bold, Italic, Underline, PaintBucket, Baseline, Quote,
         AlignLeft, List, IndentIncrease, Link2, Image, Video,
         MoreHorizontal, Smile, ChevronDown } from 'lucide-vue-next'

defineProps<{
  label: string
  placeholder?: string
  required?: boolean
  minHeight?: string
}>()
const model = defineModel<string>()

// Toolbar groups — order mirrors the reference toolbar left→right.
const GROUP_A = [
  { key: 'bold',      icon: Bold,      label: 'Bold'          },
  { key: 'italic',    icon: Italic,    label: 'Italic'        },
  { key: 'underline', icon: Underline, label: 'Underline'     },
]
const GROUP_B = [
  { key: 'fontsize',  icon: Type,        label: 'Font size'   },
  { key: 'fill',      icon: PaintBucket, label: 'Highlight'   },
  { key: 'color',     icon: Baseline,    label: 'Text color'  },
  { key: 'quote',     icon: Quote,       label: 'Quote'       },
]
// Dropdown-style tools (carry a caret in the reference).
const GROUP_C = [
  { key: 'align',  icon: AlignLeft,      label: 'Alignment'   },
  { key: 'list',   icon: List,           label: 'Lists'       },
  { key: 'indent', icon: IndentIncrease, label: 'Indent'      },
]
const GROUP_D = [
  { key: 'link',  icon: Link2, label: 'Insert link'  },
  { key: 'image', icon: Image, label: 'Insert image' },
  { key: 'video', icon: Video, label: 'Insert video' },
]
</script>

<template>
  <div>
    <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-2">
      {{ label }} <span v-if="required" class="text-[var(--brand-status-closed-text)]">*</span>
    </label>
    <div class="rounded-[10px] border-[1.5px] border-[var(--brand-border)] bg-white focus-within:border-[var(--brand-teal)] transition overflow-hidden">
      <textarea
        v-model="model"
        :placeholder="placeholder"
        :style="{ minHeight: minHeight || '150px' }"
        class="w-full px-4 py-3 text-[13.5px] leading-relaxed bg-transparent focus:outline-none resize-y block"
      />

      <!-- Toolbar (below the editing area, matching the reference) -->
      <div class="flex items-center gap-0.5 px-2 h-11 border-t border-[var(--brand-border-fade)] bg-white overflow-x-auto">
        <!-- Paragraph style -->
        <button
          type="button"
          class="inline-flex items-center gap-1 h-8 px-2 rounded-md text-[13px] font-medium text-[var(--brand-text-secondary)] hover:bg-[var(--brand-canvas)] transition shrink-0"
        >
          Text
          <ChevronDown class="w-3 h-3 text-[var(--brand-text-quiet)]" stroke-width="2" />
        </button>
        <span class="w-px h-5 mx-1 bg-[var(--brand-border-fade)] shrink-0" />

        <!-- B / I / U -->
        <button
          v-for="t in GROUP_A"
          :key="t.key"
          type="button"
          :aria-label="t.label"
          class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[var(--brand-text-secondary)] hover:bg-[var(--brand-canvas)] hover:text-[var(--brand-text)] transition shrink-0"
        >
          <component :is="t.icon" class="w-4 h-4" stroke-width="2" />
        </button>
        <span class="w-px h-5 mx-1 bg-[var(--brand-border-fade)] shrink-0" />

        <!-- Font size / fill / color / quote -->
        <button
          v-for="t in GROUP_B"
          :key="t.key"
          type="button"
          :aria-label="t.label"
          class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[var(--brand-text-secondary)] hover:bg-[var(--brand-canvas)] hover:text-[var(--brand-text)] transition shrink-0"
        >
          <component :is="t.icon" class="w-4 h-4" stroke-width="1.9" />
        </button>
        <span class="w-px h-5 mx-1 bg-[var(--brand-border-fade)] shrink-0" />

        <!-- Align / list / indent (each with a caret) -->
        <button
          v-for="t in GROUP_C"
          :key="t.key"
          type="button"
          :aria-label="t.label"
          class="inline-flex items-center gap-0.5 h-8 px-1.5 rounded-md text-[var(--brand-text-secondary)] hover:bg-[var(--brand-canvas)] hover:text-[var(--brand-text)] transition shrink-0"
        >
          <component :is="t.icon" class="w-4 h-4" stroke-width="1.9" />
          <ChevronDown class="w-2.5 h-2.5 text-[var(--brand-text-quiet)]" stroke-width="2.2" />
        </button>
        <span class="w-px h-5 mx-1 bg-[var(--brand-border-fade)] shrink-0" />

        <!-- Link / image / video -->
        <button
          v-for="t in GROUP_D"
          :key="t.key"
          type="button"
          :aria-label="t.label"
          class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[var(--brand-text-secondary)] hover:bg-[var(--brand-canvas)] hover:text-[var(--brand-text)] transition shrink-0"
        >
          <component :is="t.icon" class="w-4 h-4" stroke-width="1.9" />
        </button>
        <span class="w-px h-5 mx-1 bg-[var(--brand-border-fade)] shrink-0" />

        <!-- More -->
        <button
          type="button"
          aria-label="More formatting"
          class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[var(--brand-text-secondary)] hover:bg-[var(--brand-canvas)] hover:text-[var(--brand-text)] transition shrink-0"
        >
          <MoreHorizontal class="w-4 h-4" stroke-width="2" />
        </button>

        <span class="flex-1" />

        <!-- Emoji (far right, like the reference) -->
        <button
          type="button"
          aria-label="Insert emoji"
          class="w-8 h-8 rounded-md inline-flex items-center justify-center text-[var(--brand-text-secondary)] hover:bg-[var(--brand-canvas)] hover:text-[var(--brand-text)] transition shrink-0"
        >
          <Smile class="w-4 h-4" stroke-width="1.9" />
        </button>
      </div>
    </div>
  </div>
</template>
