import { render, fireEvent, waitFor } from '@testing-library/vue'
import { describe, it, expect, vi } from 'vitest'
import TipTapEditor from '../TipTapEditor.vue'

describe('TipTapEditor teaching layout toolbar', () => {
  it('renders buttons and inserts timeline block on click', async () => {
    const { getByTitle, container } = render(TipTapEditor, { props: { modelValue: '<p></p>' } })
    const timelineBtn = getByTitle('插入时间轴')
    expect(timelineBtn).toBeTruthy()
    expect(getByTitle('插入步骤卡')).toBeTruthy()
    expect(getByTitle('插入三栏块')).toBeTruthy()

    await waitFor(() => {
      expect((timelineBtn as HTMLButtonElement).disabled).toBe(false)
    })
    await fireEvent.click(timelineBtn)

    await waitFor(() => {
      expect(container.querySelector('[data-node-type="lessonTimeline"]')).toBeTruthy()
    })
  })

  it('does not register duplicate extensions', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(TipTapEditor, { props: { modelValue: '<p></p>' } })

    await waitFor(() => {
      expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('Duplicate extension names found'))
    })

    warn.mockRestore()
  })
})
