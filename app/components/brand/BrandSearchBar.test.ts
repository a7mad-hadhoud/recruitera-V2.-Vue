import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BrandSearchBar from './BrandSearchBar.vue'

describe('BrandSearchBar', () => {
  it('renders the placeholder', () => {
    const wrapper = mount(BrandSearchBar, { props: { placeholder: 'Find candidates' } })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Find candidates')
  })

  it('defaults to the "Search" placeholder and md size', () => {
    const wrapper = mount(BrandSearchBar)
    expect(wrapper.find('input').attributes('placeholder')).toBe('Search')
    expect(wrapper.find('input').classes()).toContain('h-9')
  })

  it('emits update:modelValue when typed into', async () => {
    const wrapper = mount(BrandSearchBar, { props: { modelValue: '' } })
    await wrapper.find('input').setValue('engineer')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['engineer'])
  })

  it('reflects modelValue in the input', () => {
    const wrapper = mount(BrandSearchBar, { props: { modelValue: 'preset' } })
    expect(wrapper.find('input').element.value).toBe('preset')
  })

  it('applies the correct height class per size', () => {
    const sizes: Record<string, string> = { sm: 'h-8', md: 'h-9', lg: 'h-11' }
    for (const [size, expectedClass] of Object.entries(sizes)) {
      const wrapper = mount(BrandSearchBar, { props: { size: size as 'sm' | 'md' | 'lg' } })
      expect(wrapper.find('input').classes()).toContain(expectedClass)
    }
  })

  it('renders the hint kbd only when the hint prop is set', () => {
    const withoutHint = mount(BrandSearchBar)
    expect(withoutHint.find('kbd').exists()).toBe(false)

    const withHint = mount(BrandSearchBar, { props: { hint: '⌘K' } })
    expect(withHint.find('kbd').exists()).toBe(true)
    expect(withHint.find('kbd').text()).toBe('⌘K')
    expect(withHint.find('input').classes()).toContain('pr-16')
  })
})
