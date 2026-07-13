<!--
  Candidate Profile → Files tab. Ported from the reference mockup's
  data-panel="files": a document list (PDF badge + filename + timestamp +
  delete + "more" menu) and an "Upload Files" action.

  State is local-only (no upload endpoint exists yet): the file list seeds
  from `profile.cvFileName`, "Upload Files" opens a real native file picker
  and appends the chosen names to the local list (visual only — nothing is
  actually persisted), and Delete/more-menu just mutate that local array.
-->
<script setup lang="ts">
import { FileText, Trash2, MoreVertical, FileSignature, Download, Upload } from 'lucide-vue-next'
import type { CandidateProfile } from '~/types'

const props = defineProps<{ profile: CandidateProfile }>()

interface FileRow { id: string, name: string, uploadedAt: string, isResume: boolean }

const files = ref<FileRow[]>(
  props.profile.cvFileName
    ? [
        { id: 'f1', name: props.profile.cvFileName, uploadedAt: 'Jul 12, 2026 1:12 am', isResume: true },
        { id: 'f2', name: 'Cover Letter.pdf', uploadedAt: 'Jul 12, 2026 1:15 am', isResume: false },
      ]
    : [],
)

const openMenuId = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

function openPicker() {
  fileInput.value?.click()
}

function onFilesChosen(e: Event) {
  const picked = (e.target as HTMLInputElement).files
  if (!picked) return
  for (const f of Array.from(picked)) {
    files.value.push({
      id: `f-${Date.now()}-${f.name}`,
      name: f.name,
      uploadedAt: 'Just now',
      isResume: false,
    })
  }
  ;(e.target as HTMLInputElement).value = ''
}

function removeFile(id: string) {
  files.value = files.value.filter(f => f.id !== id)
  if (openMenuId.value === id) openMenuId.value = null
}

function setAsResume(id: string) {
  files.value = files.value.map(f => ({ ...f, isResume: f.id === id }))
  openMenuId.value = null
}
</script>

<template>
  <div class="p-6 pb-9 w-full">
    <div class="flex items-center justify-between gap-3 mb-4">
      <span class="font-bold text-[15px] text-[var(--brand-text)]">Documents</span>
      <button
        type="button"
        class="inline-flex items-center gap-2 font-semibold text-[14px] text-[var(--brand-text)] bg-[var(--brand-lime-active-bg)] border border-[var(--brand-lime)]/55 rounded-[10px] px-3.5 py-2 cursor-pointer hover:bg-[var(--brand-lime-active-bg-strong)]"
        @click="openPicker"
      >
        <Upload class="w-4 h-4" stroke-width="1.9" />Upload Files
      </button>
      <input ref="fileInput" type="file" multiple class="hidden" @change="onFilesChosen">
    </div>

    <div v-if="files.length" class="flex flex-col gap-2.5">
      <div
        v-for="f in files"
        :key="f.id"
        class="flex items-center gap-3.5 px-3.5 py-3 border border-[var(--brand-border-light)] rounded-xl bg-[var(--brand-surface-white)]"
      >
        <span class="w-10 h-10 rounded-[10px] bg-[var(--brand-surface-hover)] border border-[var(--brand-border-hairline)] flex items-center justify-center shrink-0 relative">
          <FileText class="w-5 h-5 text-[var(--brand-border-mid)]" stroke-width="1.4" />
          <span class="absolute -bottom-1 -right-1 text-[7px] font-extrabold text-white bg-[var(--brand-pdf-icon)] rounded px-1 leading-[1.4]">PDF</span>
        </span>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 font-bold text-[14px] text-[var(--brand-text)] truncate">
            {{ f.name }}
            <span v-if="f.isResume" class="shrink-0 text-[10.5px] font-bold uppercase tracking-[0.03em] text-[var(--brand-olive)] bg-[var(--brand-lime-active-bg)] border border-[var(--brand-lime)]/55 rounded px-1.5 py-[1px]">Resume</span>
          </div>
          <div class="text-[12.5px] text-[var(--brand-text-quiet)] mt-0.5">{{ f.uploadedAt }}</div>
        </div>
        <button
          type="button"
          class="w-[34px] h-[34px] inline-flex items-center justify-center border border-[var(--brand-border)] rounded-[9px] text-[var(--brand-danger)] shrink-0 cursor-pointer hover:bg-[var(--brand-danger)]/10"
          title="Delete"
          @click="removeFile(f.id)"
        >
          <Trash2 class="w-[17px] h-[17px]" stroke-width="1.7" />
        </button>
        <span class="relative inline-flex shrink-0">
          <button
            type="button"
            class="w-[34px] h-[34px] inline-flex items-center justify-center border border-[var(--brand-border)] rounded-[9px] text-[var(--brand-text-secondary)] cursor-pointer hover:bg-[var(--brand-surface-hover)]"
            title="More options"
            @click="openMenuId = openMenuId === f.id ? null : f.id"
          >
            <MoreVertical class="w-[17px] h-[17px]" stroke-width="1.7" />
          </button>
          <div
            v-if="openMenuId === f.id"
            class="absolute top-[calc(100%+6px)] right-0 w-[206px] bg-[var(--brand-surface-white)] border border-[var(--brand-border-light)] rounded-xl shadow-[0_16px_48px_rgba(0,20,18,0.2)] z-20 p-1.5"
          >
            <button type="button" class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-medium text-[var(--brand-text)] hover:bg-[var(--brand-surface-hover)] cursor-pointer" @click="setAsResume(f.id)">
              <FileSignature class="w-4 h-4 text-[var(--brand-text-secondary)]" stroke-width="1.8" />Set as resume
            </button>
            <button type="button" class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-medium text-[var(--brand-text)] hover:bg-[var(--brand-surface-hover)] cursor-pointer" @click="openMenuId = null">
              <Download class="w-4 h-4 text-[var(--brand-text-secondary)]" stroke-width="1.8" />Download
            </button>
          </div>
        </span>
      </div>
    </div>
    <p v-else class="text-[13.5px] text-[var(--brand-text-quiet)]">No files uploaded yet.</p>
  </div>
</template>
