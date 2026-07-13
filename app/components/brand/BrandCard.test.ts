import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BrandCard from './BrandCard.vue'

describe('BrandCard', () => {
  it('renders slot content', () => {
    const wrapper = mount(BrandCard, { slots: { default: '<p>Card body</p>' } })
    expect(wrapper.text()).toBe('Card body')
  })

  it('always applies the brand border/background/shadow classes', () => {
    const wrapper = mount(BrandCard)
    expect(wrapper.classes()).toContain('border-[var(--brand-border-light)]')
    expect(wrapper.classes()).toContain('bg-[var(--brand-surface-white)]')
    expect(wrapper.classes()).toContain('rounded-[14px]')
  })

  it('does not add padding classes by default', () => {
    const wrapper = mount(BrandCard)
    expect(wrapper.classes()).not.toContain('p-5')
  })

  it('adds padding when the padded prop is true', () => {
    const wrapper = mount(BrandCard, { props: { padded: true } })
    expect(wrapper.classes()).toContain('p-5')
  })

  it('merges a custom class alongside the brand classes', () => {
    const wrapper = mount(BrandCard, { props: { class: 'custom-card' } })
    expect(wrapper.classes()).toContain('custom-card')
    expect(wrapper.classes()).toContain('border-[var(--brand-border-light)]')
  })
})
