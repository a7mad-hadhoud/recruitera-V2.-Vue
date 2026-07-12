<script setup lang="ts">
import { Copy, Check } from 'lucide-vue-next'
import SettingsPageHeader from '~/components/settings/SettingsPageHeader.vue'

definePageMeta({ layout: 'settings' })

const linkedinConnected = ref(false)
const wuzzufConnected = ref(false)
const whatsappConnected = ref(false)

// Plain text used for the clipboard (Copy button).
const EMBED_CODE = `<div id="recruitera_jobs"
     data-company-id="1762714138755x403499217688461300"
     data-base-api="https://jobs.recruitera.ai"
     data-page-size="12"
     data-lang="en"
     data-theme-radius="16px"
     data-apply-target="_blank"></div>

<script src="https://recruitera-web-widget.pages.dev/embed/v4.js" async><\/script>
<script>
  (function tryInit(){
    if (!window.RecruiteraEmbed) return setTimeout(tryInit, 60);
    var el = document.getElementById('recruitera_jobs');
    RecruiteraEmbed.render('#recruitera_jobs', {
      companyId: el.getAttribute('data-company-id'),
      baseApi: el.getAttribute('data-base-api'),
      pageSize: parseInt(el.getAttribute('data-page-size'))||12,
      lang: el.getAttribute('data-lang') || 'en',
      applyTarget: el.getAttribute('data-apply-target') || '_blank',
    });
  })();
<\/script>`

// VS Code / ground-truth style syntax highlighting: tags cyan, attrs green,
// strings orange, keywords purple, functions yellow. Rendered via v-html.
const EMBED_CODE_HTML = `<span style="color:#7ec8e3">&lt;div</span> <span style="color:#b5cea8">id</span>=<span style="color:#ce9178">"recruitera_jobs"</span>
     <span style="color:#b5cea8">data-company-id</span>=<span style="color:#ce9178">"1762714138755x403499217688461300"</span>
     <span style="color:#b5cea8">data-base-api</span>=<span style="color:#ce9178">"https://jobs.recruitera.ai"</span>
     <span style="color:#b5cea8">data-page-size</span>=<span style="color:#ce9178">"12"</span>
     <span style="color:#b5cea8">data-lang</span>=<span style="color:#ce9178">"en"</span>
     <span style="color:#b5cea8">data-theme-radius</span>=<span style="color:#ce9178">"16px"</span>
     <span style="color:#b5cea8">data-apply-target</span>=<span style="color:#ce9178">"_blank"</span><span style="color:#7ec8e3">&gt;&lt;/div&gt;</span>

<span style="color:#7ec8e3">&lt;script</span> <span style="color:#b5cea8">src</span>=<span style="color:#ce9178">"https://recruitera-web-widget.pages.dev/embed/v4.js"</span> <span style="color:#b5cea8">async</span><span style="color:#7ec8e3">&gt;&lt;/script&gt;</span>
<span style="color:#7ec8e3">&lt;script&gt;</span>
  <span style="color:#dcdcaa">(function tryInit</span>(){
    <span style="color:#c586c0">if</span> (!window.RecruiteraEmbed) <span style="color:#c586c0">return</span> <span style="color:#dcdcaa">setTimeout</span>(tryInit, 60);
    <span style="color:#c586c0">var</span> el = document.<span style="color:#dcdcaa">getElementById</span>(<span style="color:#ce9178">'recruitera_jobs'</span>);
    RecruiteraEmbed.<span style="color:#dcdcaa">render</span>(<span style="color:#ce9178">'#recruitera_jobs'</span>, {
      companyId: el.<span style="color:#dcdcaa">getAttribute</span>(<span style="color:#ce9178">'data-company-id'</span>),
      baseApi: el.<span style="color:#dcdcaa">getAttribute</span>(<span style="color:#ce9178">'data-base-api'</span>),
      pageSize: <span style="color:#dcdcaa">parseInt</span>(el.<span style="color:#dcdcaa">getAttribute</span>(<span style="color:#ce9178">'data-page-size'</span>))||12,
      lang: el.<span style="color:#dcdcaa">getAttribute</span>(<span style="color:#ce9178">'data-lang'</span>) || <span style="color:#ce9178">'en'</span>,
      applyTarget: el.<span style="color:#dcdcaa">getAttribute</span>(<span style="color:#ce9178">'data-apply-target'</span>) || <span style="color:#ce9178">'_blank'</span>,
    });
  })();
<span style="color:#7ec8e3">&lt;/script&gt;</span>`

const copied = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | undefined
async function copyEmbedCode() {
  try {
    await navigator.clipboard.writeText(EMBED_CODE)
  }
  catch {
    // clipboard unavailable — no-op, matches ground truth's silent catch
  }
  copied.value = true
  if (copyTimer) clearTimeout(copyTimer)
  copyTimer = setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <div>
    <SettingsPageHeader
      title="Integrations"
      subtitle="Connect Recruitera with your existing tools to reach more candidates and streamline hiring."
      no-divider
    />
    <div class="h-px bg-[var(--brand-border-light)]" style="margin:20px 0 24px"></div>

    <!-- Publish your jobs -->
    <div class="mb-7">
      <div class="text-[16px] font-bold text-[var(--brand-text)] mb-1">Publish your jobs to external platforms</div>
      <p class="text-[13.5px] text-[var(--brand-text-quiet)]" style="margin-bottom:18px">Publish your jobs to external platforms to reach more candidates.</p>

      <div class="grid grid-cols-3 gap-3.5">
        <!-- LinkedIn -->
        <div class="border border-[var(--brand-border-light)] rounded-[14px] p-5 bg-[var(--brand-surface-white)] flex flex-col gap-3">
          <div class="rounded-[10px] flex items-center justify-center shrink-0" style="width:42px;height:42px;background:#0077B5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
          </div>
          <div>
            <div class="text-[14px] font-bold text-[var(--brand-text)] mb-1">LinkedIn Job Promotion</div>
            <div class="text-[13px] text-[var(--brand-text-quiet)] leading-[1.55]">promote your job on linkedin to reach more qualified candidates.</div>
          </div>
          <div class="mt-auto">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 border border-[var(--brand-border)] rounded-[9px] px-3.5 py-2 text-[13.5px] font-semibold outline-none transition-colors"
              :class="linkedinConnected
                ? 'bg-[var(--brand-status-approved-bg)] text-[var(--brand-status-approved-text)] border-transparent'
                : 'bg-[var(--brand-surface-white)] text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint)]'"
              @click="linkedinConnected = !linkedinConnected"
            >
              <Check v-if="linkedinConnected" class="w-3.5 h-3.5" />
              {{ linkedinConnected ? 'Connected' : 'Connect to LinkedIn' }}
            </button>
          </div>
        </div>

        <!-- Google -->
        <div class="border border-[var(--brand-border-light)] rounded-[14px] p-5 bg-[var(--brand-surface-white)] flex flex-col gap-3">
          <div class="rounded-[10px] border border-[var(--brand-border-light)] bg-[var(--brand-surface-white)] flex items-center justify-center shrink-0" style="width:42px;height:42px">
            <svg width="22" height="22" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          </div>
          <div>
            <div class="text-[14px] font-bold text-[var(--brand-text)] mb-1">Google Job Promotion</div>
            <div class="text-[13px] text-[var(--brand-text-quiet)] leading-[1.55]">publish your job to google jobs so it appears in google job search results.</div>
          </div>
          <div class="mt-auto text-[13px] text-[var(--brand-text-quiet)] font-medium py-0.5">No steps required to connect.</div>
        </div>

        <!-- WUZZUF -->
        <div class="border border-[var(--brand-border-light)] rounded-[14px] p-5 bg-[var(--brand-surface-white)] flex flex-col gap-3">
          <div class="rounded-[10px] flex items-center justify-center shrink-0" style="width:42px;height:42px;background:#1B3A6B">
            <span class="text-white text-[18px] font-extrabold" style="letter-spacing:-1px">W</span>
          </div>
          <div>
            <div class="text-[14px] font-bold text-[var(--brand-text)] mb-1">WUZZUF Job Promotion</div>
            <div class="text-[13px] text-[var(--brand-text-quiet)] leading-[1.55]">publish your job on wuzzuf to reach top talent in the region.</div>
          </div>
          <div class="mt-auto">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 border border-[var(--brand-border)] rounded-[9px] px-3.5 py-2 text-[13.5px] font-semibold outline-none transition-colors"
              :class="wuzzufConnected
                ? 'bg-[var(--brand-status-approved-bg)] text-[var(--brand-status-approved-text)] border-transparent'
                : 'bg-[var(--brand-surface-white)] text-[var(--brand-text)] hover:bg-[var(--brand-lime-tint)]'"
              @click="wuzzufConnected = !wuzzufConnected"
            >
              <Check v-if="wuzzufConnected" class="w-3.5 h-3.5" />
              {{ wuzzufConnected ? 'Connected' : 'Connect to Wuzzuf' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- WhatsApp -->
    <div class="mb-7">
      <div class="grid grid-cols-3 gap-3.5">
        <div class="border border-[var(--brand-border-light)] rounded-[14px] p-5 bg-[var(--brand-surface-white)] flex flex-col gap-3">
          <div class="rounded-full flex items-center justify-center shrink-0" style="width:42px;height:42px;background:#25D366">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
          </div>
          <div>
            <div class="text-[14px] font-bold text-[var(--brand-text)] mb-1">WhatsApp Integration</div>
            <div class="text-[13px] text-[var(--brand-text-quiet)] leading-[1.55]">Connect your business account to start recruiting via WhatsApp.</div>
          </div>
          <div class="mt-auto">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-[9px] px-4 py-2.5 text-[13.5px] font-bold text-white outline-none transition-colors"
              :style="{ background: whatsappConnected ? 'var(--brand-status-approved-text)' : '#25D366' }"
              @click="whatsappConnected = !whatsappConnected"
            >
              <Check v-if="whatsappConnected" class="w-3.5 h-3.5" />
              {{ whatsappConnected ? 'Connected' : 'Connect WhatsApp' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="h-px bg-[var(--brand-border-light)] mb-7"></div>

    <!-- Embed jobs -->
    <div>
      <div class="text-[16px] font-bold text-[var(--brand-text)] mb-1">Embed jobs on your website</div>
      <p class="text-[13.5px] text-[var(--brand-text-quiet)] mb-0.5">display your open jobs on your company website.</p>
      <p class="text-[13.5px] text-[var(--brand-text-quiet)] mb-4">this widget automatically updates whenever a new job is published in recruitera.</p>
      <p class="text-[13.5px] font-semibold text-[var(--brand-text-secondary)] mb-2.5">Copy the embed code &amp; Paste it into your careers page HTML</p>

      <div class="relative rounded-[12px] overflow-hidden" :style="{ background: 'var(--brand-text)', padding: '18px 20px' }">
        <button
          type="button"
          class="absolute top-3 right-3 rounded-[7px] px-2.5 py-1.5 flex items-center gap-1.5 text-[12px] font-semibold outline-none transition-colors"
          style="background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); color:rgba(255,255,255,0.8)"
          @click="copyEmbedCode"
        >
          <Check v-if="copied" class="w-[13px] h-[13px]" />
          <Copy v-else class="w-[13px] h-[13px]" />
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
        <pre class="m-0 text-[12.5px] leading-[1.7] whitespace-pre overflow-x-auto" :style="{ fontFamily: `'SF Mono',Menlo,Monaco,Consolas,monospace`, color: 'var(--brand-lime)' }" v-html="EMBED_CODE_HTML" />
      </div>
    </div>
  </div>
</template>
