<!--
  Cross Posting tab body for the /jobs/new editor. Mirrors the visual
  system used by Settings > Integrations (logo tile + name + copy +
  CTA), but the CTA changes for THIS surface: instead of "Connect to
  <Board>" (workspace-level auth), the Cross Posting tab asks the
  recruiter to "Publish to <Board>" for THIS job specifically.

  Boards:
    · LinkedIn — Publish / Published toggle
    · Google for Jobs — auto-included by default (no action needed);
      shown as a Published state chip so the recruiter can see it's
      already live
    · Wuzzuf — Publish / Published toggle

  Third-party brand-logo hex colors are the ONLY hex allowed in this
  file (they're fixed brand marks, not UI chrome).
-->
<!-- eslint-disable local/no-hex-colors -- third-party brand logo colors -->
<script setup lang="ts">
import { Check } from 'lucide-vue-next'

// Google for Jobs is included by default per product spec — the recruiter
// can't opt out from this tab (the workspace-level Integrations page in
// Settings still controls whether Google indexing runs at all).
const linkedinPublished = ref(false)
const wuzzufPublished   = ref(false)
</script>

<template>
  <div class="max-w-[880px] mx-auto p-6">
    <div class="text-[16px] font-bold text-[var(--brand-text)] mb-1">Publish this job to external platforms</div>
    <p class="text-[13.5px] text-[var(--brand-text-quiet)] mb-4">
      Reach more candidates by publishing this job to job boards. Google for Jobs is included by default.
    </p>

    <div class="grid grid-cols-3 gap-3.5">
      <!-- LinkedIn -->
      <div class="border border-[var(--brand-border-light)] rounded-[14px] p-5 bg-[var(--brand-surface-white)] flex flex-col gap-3">
        <div class="rounded-[10px] flex items-center justify-center shrink-0" style="width:42px;height:42px;background:#0077B5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
        </div>
        <div>
          <div class="text-[14px] font-bold text-[var(--brand-text)] mb-1">LinkedIn</div>
          <div class="text-[13px] text-[var(--brand-text-quiet)] leading-[1.55]">
            Publish this job to LinkedIn to reach qualified candidates on the platform.
          </div>
        </div>
        <div class="mt-auto">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 border border-[var(--brand-border)] rounded-[9px] px-3.5 py-2 text-[13.5px] font-semibold outline-none transition-colors"
            :class="linkedinPublished
              ? 'bg-[var(--brand-status-approved-bg)] text-[var(--brand-status-approved-text)] border-transparent'
              : 'bg-[var(--brand-surface-white)] text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint)]'"
            @click="linkedinPublished = !linkedinPublished"
          >
            <Check v-if="linkedinPublished" class="w-3.5 h-3.5" />
            {{ linkedinPublished ? 'Published' : 'Publish to LinkedIn' }}
          </button>
        </div>
      </div>

      <!-- Google for Jobs (auto-posted) -->
      <div class="border border-[var(--brand-border-light)] rounded-[14px] p-5 bg-[var(--brand-surface-white)] flex flex-col gap-3">
        <div class="rounded-[10px] border border-[var(--brand-border-light)] bg-[var(--brand-surface-white)] flex items-center justify-center shrink-0" style="width:42px;height:42px">
          <svg width="22" height="22" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
        </div>
        <div>
          <div class="text-[14px] font-bold text-[var(--brand-text)] mb-1">Google for Jobs</div>
          <div class="text-[13px] text-[var(--brand-text-quiet)] leading-[1.55]">
            This job appears in Google's job search results automatically. No action needed.
          </div>
        </div>
        <div class="mt-auto">
          <span class="inline-flex items-center gap-1.5 rounded-[9px] px-3.5 py-2 text-[13.5px] font-semibold bg-[var(--brand-status-approved-bg)] text-[var(--brand-status-approved-text)]">
            <Check class="w-3.5 h-3.5" />
            Published by default
          </span>
        </div>
      </div>

      <!-- Wuzzuf -->
      <div class="border border-[var(--brand-border-light)] rounded-[14px] p-5 bg-[var(--brand-surface-white)] flex flex-col gap-3">
        <div class="rounded-[10px] flex items-center justify-center shrink-0" style="width:42px;height:42px;background:#1B3A6B">
          <span class="text-white text-[18px] font-extrabold" style="letter-spacing:-1px">W</span>
        </div>
        <div>
          <div class="text-[14px] font-bold text-[var(--brand-text)] mb-1">Wuzzuf</div>
          <div class="text-[13px] text-[var(--brand-text-quiet)] leading-[1.55]">
            Publish this job on Wuzzuf to reach top talent in the region.
          </div>
        </div>
        <div class="mt-auto">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 border border-[var(--brand-border)] rounded-[9px] px-3.5 py-2 text-[13.5px] font-semibold outline-none transition-colors"
            :class="wuzzufPublished
              ? 'bg-[var(--brand-status-approved-bg)] text-[var(--brand-status-approved-text)] border-transparent'
              : 'bg-[var(--brand-surface-white)] text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint)]'"
            @click="wuzzufPublished = !wuzzufPublished"
          >
            <Check v-if="wuzzufPublished" class="w-3.5 h-3.5" />
            {{ wuzzufPublished ? 'Published' : 'Publish to Wuzzuf' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
