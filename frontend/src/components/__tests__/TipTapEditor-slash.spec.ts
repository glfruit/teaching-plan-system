import { render, fireEvent, waitFor } from '@testing-library/vue'
import { describe, it, expect } from 'vitest'
import TipTapEditor from '../TipTapEditor.vue'

describe('TipTapEditor slash menu', () => {
  it('shows slash items only after "/" and supports keyboard selection', async () => {
    const { queryByText, getByText, container } = render(TipTapEditor, { props: { modelValue: '<p></p>' } })
    expect(queryByText('/时间轴')).toBeNull()

    await waitFor(() => {
      expect(container.querySelector('.ProseMirror')).toBeTruthy()
    })
    const editable = container.querySelector('.ProseMirror') as HTMLElement
    await fireEvent.focus(editable)
    await fireEvent.keyDown(editable, { key: '/' })

    expect(getByText('/时间轴')).toBeTruthy()
    expect(getByText('/步骤卡')).toBeTruthy()
    expect(getByText('/三栏块')).toBeTruthy()

    await fireEvent.keyDown(editable, { key: 'ArrowDown' })
    await fireEvent.keyDown(editable, { key: 'Enter' })

    await waitFor(() => {
      expect(container.querySelector('[data-node-type="activityStepCard"]')).toBeTruthy()
    })
  })
})
