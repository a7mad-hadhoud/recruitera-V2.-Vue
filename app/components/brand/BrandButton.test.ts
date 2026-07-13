import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BrandButton from './BrandButton.vue'

describe('BrandButton', () => {
  it('renders slot content', () => {
    const wrapper = mount(BrandButton, { slots: { default: 'Save' } })
    expect(wrapper.text()).toBe('Save')
  })

  it('defaults to the outline variant and md size', () => {
    const wrapper = mount(BrandButton)
    expect(wrapper.classes()).toContain('border-[var(--brand-border)]')
    expect(wrapper.classes()).toContain('h-9')
  })

  it('applies primary-teal variant classes', () => {
    const wrapper = mount(BrandButton, { props: { variant: 'primary-teal' } })
    expect(wrapper.classes()).toContain('bg-[var(--brand-teal)]')
    expect(wrapper.classes()).toContain('text-white')
  })

  it('applies danger variant classes', () => {
    const wrapper = mount(BrandButton, { props: { variant: 'danger' } })
    expect(wrapper.classes()).toContain('bg-[var(--brand-danger)]')
  })

  it('applies each size class', () => {
    const sizes: Record<string, string> = { sm: 'h-8', md: 'h-9', lg: 'h-10', icon: 'w-9' }
    for (const [size, expectedClass] of Object.entries(sizes)) {
      const wrapper = mount(BrandButton, { props: { size: size as 'sm' | 'md' | 'lg' | 'icon' } })
      expect(wrapper.classes()).toContain(expectedClass)
    }
  })

  it('merges a custom class alongside variant/size classes', () => {
    const wrapper = mount(BrandButton, { props: { class: 'custom-class' } })
    expect(wrapper.classes()).toContain('custom-class')
    expect(wrapper.classes()).toContain('shrink-0')
  })

  it('renders as a native button element by default', () => {
    const wrapper = mount(BrandButton)
    expect(wrapper.element.tagName).toBe('BUTTON')
  })
})
