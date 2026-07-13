import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BrandDataTable from './BrandDataTable.vue'

describe('BrandDataTable', () => {
  it('renders the header and default slot content', () => {
    const wrapper = mount(BrandDataTable, {
      slots: {
        header: '<thead><tr><th>Name</th></tr></thead>',
        default: '<tbody><tr><td>Ada Lovelace</td></tr></tbody>',
      },
    })
    expect(wrapper.find('th').text()).toBe('Name')
    expect(wrapper.find('td').text()).toBe('Ada Lovelace')
  })

  it('renders a single table element', () => {
    const wrapper = mount(BrandDataTable)
    expect(wrapper.findAll('table')).toHaveLength(1)
  })

  it('applies the outer chrome classes (border, radius, scroll)', () => {
    const wrapper = mount(BrandDataTable)
    expect(wrapper.classes()).toContain('rounded-[14px]')
    expect(wrapper.classes()).toContain('border-[var(--brand-border-light)]')
    expect(wrapper.classes()).toContain('overflow-x-auto')
  })

  it('applies the table-fixed/border-collapse classes to the inner table', () => {
    const wrapper = mount(BrandDataTable)
    const table = wrapper.find('table')
    expect(table.classes()).toContain('table-fixed')
    expect(table.classes()).toContain('border-collapse')
  })
})
