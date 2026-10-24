<script setup>
defineProps({
  eyebrow: { type: String, default: 'Free PDF tool' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  steps: { type: Array, default: () => [] },
  note: { type: String, default: '' },
  faqs: { type: Array, default: () => [] },
  related: { type: Array, default: () => [] }
})
</script>
<template>
  <main>
    <section class="border-b border-slate-100 bg-[linear-gradient(180deg,#f4f8ff,#fff)]">
      <div class="site-container max-w-[880px] pb-10 pt-12 text-center sm:pb-12 sm:pt-16">
        <p class="eyebrow">{{ eyebrow }}</p>
        <h1 class="mt-3 text-[clamp(2.2rem,5vw,3.65rem)] font-extrabold leading-tight tracking-[-.055em] text-ink">{{ title }}</h1>
        <p class="mx-auto mt-4 max-w-[670px] text-base leading-8 text-slate-600">{{ description }}</p>
        <div class="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500">
          <span>✓ Free to use</span><span>✓ No account needed</span><span>✓ Processed on your device</span>
        </div>
      </div>
    </section>
    <div class="site-container max-w-[980px] pt-9"><slot /></div>
    <div class="site-container max-w-[860px] pt-17 sm:pt-22">
      <section class="prose-custom">
        <h2>How to {{ title.toLowerCase() }}</h2>
        <ol><li v-for="step in steps" :key="step">{{ step }}</li></ol>
        <p v-if="note">{{ note }}</p>
        <slot name="article" />
      </section>
      <section v-if="faqs.length" class="mt-12">
        <h2 class="text-2xl font-extrabold tracking-tight text-ink">Frequently asked questions</h2>
        <div class="mt-5 space-y-3">
          <details v-for="faq in faqs" :key="faq[0]" class="rounded-xl border border-slate-200 bg-white px-5 py-4 open:border-blue-200">
            <summary class="cursor-pointer font-bold text-ink">{{ faq[0] }}</summary>
            <p class="mt-3 text-sm leading-7 text-slate-600">{{ faq[1] }}</p>
          </details>
        </div>
      </section>
      <section v-if="related.length" class="mt-14">
        <h2 class="text-2xl font-extrabold tracking-tight text-ink">More PDF tools</h2>
        <div class="mt-5 grid gap-3 sm:grid-cols-2">
          <NuxtLink v-for="item in related" :key="item.to" :to="item.to" class="rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-brand transition-colors hover:border-blue-300 hover:bg-blue-50">{{ item.label }} →</NuxtLink>
        </div>
      </section>
    </div>
  </main>
</template>
