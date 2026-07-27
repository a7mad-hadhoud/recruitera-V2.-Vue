<!--
  Auth canvas — deep-teal backdrop shared by signup / login / onboarding. The
  brand "R" pattern (Frame 427320920.svg — lime outlines on the same Deep Teal)
  tiles underneath and fades in toward the bottom, so the page reads clean up top
  where the card sits and branded below. Each page renders its own <AuthTopbar> +
  centered cream card on top.
-->
<template>
  <div class="relative min-h-screen bg-[var(--brand-teal)] overflow-hidden">
    <!-- brand R pattern — covers the full page, tiled and softly blurred. A smooth
         top-to-bottom mask makes it barely visible at the top and progressively
         stronger toward the bottom, so it reads as one continuous gradient of the
         lime lines with no hard seam. -->
    <div
      class="pointer-events-none absolute inset-0"
      style="background-image: url('/Frame 427320920.svg');
        background-repeat: repeat;
        background-size: 560px auto;
        background-position: center top;
        opacity: 0.42;
        filter: blur(1px);
        -webkit-mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.10) 30%, rgba(0,0,0,0.32) 58%, rgba(0,0,0,0.62) 82%, #000 100%);
        mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.10) 30%, rgba(0,0,0,0.32) 58%, rgba(0,0,0,0.62) 82%, #000 100%);"
    />
    <!-- subtle top glow -->
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-[40%]"
      style="background: radial-gradient(60% 80% at 50% -20%, rgba(201,253,19,0.08), transparent 70%);"
    />
    <div class="relative flex flex-col min-h-screen">
      <slot />
    </div>
  </div>
</template>
