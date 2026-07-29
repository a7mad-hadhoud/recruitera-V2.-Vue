<!--
  Social Sharing tab body for the /jobs/new editor. Ports the reference
  layout:

    · SEO card — live Google-preview + Subject line + Description w/
      0/200 char counter that stays in sync as the recruiter types.
    · Social media image — upload button + preview tile (uses the
      chosen file when present, lime gradient placeholder otherwise).

  All colors go through --brand-* tokens; no hex. Reuses BrandButton
  where a CTA fits its variants.
-->
<script setup lang="ts">
import { UploadCloud, Image as ImageIcon } from 'lucide-vue-next'
import { useCompany } from '~/composables/useCompany'

const props = defineProps<{ jobTitle?: string }>()
const { data: company } = useCompany()

const MAX_DESC = 200

// Live inputs. Empty inputs still let the preview show a sensible
// placeholder derived from the job title / description so recruiters
// see the search snippet before they've filled anything in.
const subject = ref('')
const description = ref('')

// Google-preview values — subject/desc fall back to sensible defaults
// when empty, matching the reference's placeholder-preview behavior.
const previewUrl = computed(() => {
  const slug = (props.jobTitle || 'marketer-sample').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  return `https://recruitera.ai/o/${slug}`
})
const previewTitle = computed(() =>
  subject.value.trim() || props.jobTitle || 'Marketer (Sample)',
)
const previewDesc = computed(() =>
  description.value.trim()
    || 'We are searching for a professional Marketeer. You will contribute to a variety of projects from content and graphics to publishing final materials…',
)
const workspaceName = computed(() => company.value?.name || 'iCareer')

// Upload — read as data URL so the preview reflects the picked image
// without needing a real API. Same trick used by the Team-tab avatar
// picker in Settings.
const imageDataUrl = ref<string | null>(null)
function onPickImage(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    // Silent guard — real UI would toast; keeping stub minimal.
    input.value = ''
    return
  }
  const reader = new FileReader()
  reader.onload = () => { imageDataUrl.value = String(reader.result ?? '') }
  reader.readAsDataURL(file)
  input.value = ''
}
</script>

<template>
  <div class="max-w-[960px] mx-auto pt-8 flex flex-col gap-6">
    <!-- SEO ─────────────────────────────────────────────────── -->
    <section class="rounded-[12px] bg-white border border-[var(--brand-border-fade)] p-8">
      <h2 class="text-[17px] font-bold text-[var(--brand-text)]">SEO</h2>
      <p class="text-[13.5px] text-[var(--brand-text-quiet)] mt-1 mb-5">
        Create a meta title and description for the job page to get more visitors.
        <a class="font-bold text-[var(--brand-teal-secondary)] hover:text-[var(--brand-teal)]" href="#">Learn more</a>
      </p>

      <!-- Google-style preview -->
      <div class="rounded-[12px] border-[1.5px] border-[var(--brand-border-fade)] bg-[color-mix(in_srgb,var(--brand-lime-tint)_28%,white)] px-5 py-4 mb-5">
        <div class="text-[12px] font-semibold text-[var(--brand-text-secondary)]">{{ workspaceName }}</div>
        <div class="text-[13px] text-[var(--brand-teal-secondary)] mt-1 truncate">{{ previewUrl }}</div>
        <div class="text-[16px] font-bold text-[color-mix(in_srgb,var(--brand-pipeline-purple)_45%,var(--brand-teal))] mt-1.5">{{ previewTitle }}</div>
        <div class="text-[13px] text-[var(--brand-text-secondary)] leading-relaxed mt-1.5 line-clamp-3">
          {{ previewDesc }}
        </div>
      </div>

      <!-- Subject line -->
      <div class="mb-4">
        <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-2">Subject line</label>
        <input
          v-model="subject"
          type="text"
          placeholder="Type title"
          class="w-full h-11 px-3.5 text-[14px] rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none transition"
        >
      </div>

      <!-- Description + char counter -->
      <div>
        <label class="block text-[13px] font-bold text-[var(--brand-text-secondary)] mb-2">Description</label>
        <div class="relative">
          <textarea
            v-model="description"
            :maxlength="MAX_DESC"
            rows="3"
            placeholder="Type description"
            class="w-full px-3.5 py-3 pr-16 text-[14px] leading-relaxed rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white focus:border-[var(--brand-teal)] focus:outline-none resize-y transition"
          />
          <div class="absolute bottom-2 right-3 text-[12px] text-[var(--brand-text-quiet)] tabular-nums pointer-events-none">
            {{ description.length }} / {{ MAX_DESC }}
          </div>
        </div>
      </div>
    </section>

    <!-- Social media image ─────────────────────────────────── -->
    <section class="rounded-[12px] bg-white border border-[var(--brand-border-fade)] p-8">
      <div class="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 class="text-[17px] font-bold text-[var(--brand-text)]">Social media image</h2>
          <p class="text-[13.5px] text-[var(--brand-text-quiet)] mt-1">The image generates social media previews.</p>
        </div>
        <label class="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-[9px] border-[1.5px] border-[var(--brand-border)] bg-white text-[13px] font-semibold text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)] hover:bg-[var(--brand-canvas)] transition cursor-pointer whitespace-nowrap">
          <UploadCloud class="w-3.5 h-3.5" stroke-width="1.8" />
          Upload new image
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            class="hidden"
            @change="onPickImage"
          >
        </label>
      </div>

      <div class="flex items-center gap-5">
        <!-- Preview tile — data-URL when uploaded, lime gradient otherwise. -->
        <div
          class="w-[280px] h-[158px] rounded-[12px] border border-[var(--brand-border-fade)] shrink-0 flex items-center justify-center overflow-hidden bg-cover bg-center"
          :style="imageDataUrl
            ? { backgroundImage: `url('${imageDataUrl}')` }
            : { background: 'linear-gradient(135deg, var(--brand-canvas), var(--brand-lime) 120%)' }"
        >
          <ImageIcon
            v-if="!imageDataUrl"
            class="w-9 h-9 text-[var(--brand-text-quiet)]"
            stroke-width="1.4"
          />
        </div>
        <div class="text-[13px] text-[var(--brand-text-quiet)] leading-[1.9]">
          Max file size: 2MB.<br>
          Allowed types: JPG, JPEG, PNG.
        </div>
      </div>
    </section>
  </div>
</template>
