import { render } from '@testing-library/vue'
import { describe, it, expect } from 'vitest'
import TipTapEditor from '../TipTapEditor.vue'

describe('TipTapEditor slash menu', () => {
  it('contains teaching layout slash items', () => {
    const { getByText } = render(TipTapEditor, { props: { modelValue: '' } })
    expect(getByText('/时间轴')).toBeTruthy()
    expect(getByText('/步骤卡')).toBeTruthy()
    expect(getByText('/三栏块')).toBeTruthy()
  })
})
