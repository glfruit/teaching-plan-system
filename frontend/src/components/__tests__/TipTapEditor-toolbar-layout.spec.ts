import { render } from '@testing-library/vue'
import { describe, it, expect } from 'vitest'
import TipTapEditor from '../TipTapEditor.vue'

describe('TipTapEditor teaching layout toolbar', () => {
  it('renders three teaching layout buttons', () => {
    const { getByTitle } = render(TipTapEditor, { props: { modelValue: '' } })
    expect(getByTitle('插入时间轴')).toBeTruthy()
    expect(getByTitle('插入步骤卡')).toBeTruthy()
    expect(getByTitle('插入三栏块')).toBeTruthy()
  })
})
