import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import BrandEmptyState from './BrandEmptyState.vue'

describe('BrandEmptyState', () => {
  it('renders the required title', () => {
    const wrapper = mount(BrandEmptyState, { props: { title: 'No candidates found' } })
    expect(wrapper.text()).toContain('No candidates found')
  })

  it('does not render a description paragraph when none is given', () => {
    const wrapper = mount(BrandEmptyState, { props: { title: 'Empty' } })
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs).toHaveLength(1)
  })

  it('renders the description when provided', () => {
    const wrapper = mount(BrandEmptyState, {
      props: { title: 'Empty', description: 'Try adjusting your filters' },
    })
    expect(wrapper.text()).toContain('Try adjusting your filters')
  })

  it('does not render an icon when none is given', () => {
    const wrapper = mount(BrandEmptyState, { props: { title: 'Empty' } })
    expect(wrapper.findComponent({ name: 'IconStub' }).exists()).toBe(false)
  })

  it('renders the icon component when provided', () => {
    const IconStub = { name: 'IconStub', render: () => h('svg') }
    const wrapper = mount(BrandEmptyState, { props: { title: 'Empty', icon: IconStub } })
    expect(wrapper.findComponent(IconStub).exists()).toBe(true)
  })

  it('renders slot content for a CTA', () => {
    const wrapper = mount(BrandEmptyState, {
      props: { title: 'Empty' },
      slots: { default: '<button>Clear filters</button>' },
    })
    expect(wrapper.find('button').text()).toBe('Clear filters')
  })
})
