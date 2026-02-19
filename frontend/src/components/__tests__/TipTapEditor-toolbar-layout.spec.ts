import { render, fireEvent, waitFor } from '@testing-library/vue'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TipTapEditor from '../TipTapEditor.vue'

const TOOLBAR_VISIBILITY_STORAGE_KEY = 'tiptap-toolbar-visibility-v1'
const createMockStorage = (): Storage => {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => map.delete(key),
    setItem: (key: string, value: string) => {
      map.set(key, value)
    },
  }
}

describe('TipTapEditor teaching layout toolbar', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: createMockStorage(),
      configurable: true,
    })
  })

  it('restores toolbar visibility from local storage', async () => {
    window.localStorage.setItem(
      TOOLBAR_VISIBILITY_STORAGE_KEY,
      JSON.stringify({ table: true, teaching: true })
    )

    const { getByTitle } = render(TipTapEditor, { props: { modelValue: '<p></p>' } })

    await waitFor(() => {
      expect(getByTitle('收起表格工具')).toBeTruthy()
      expect(getByTitle('收起教学块工具')).toBeTruthy()
      expect(getByTitle('插入表格')).toBeTruthy()
      expect(getByTitle('插入时间轴')).toBeTruthy()
    })

    window.localStorage.removeItem(TOOLBAR_VISIBILITY_STORAGE_KEY)
  })

  it('renders buttons and inserts timeline block on click', async () => {
    const { getByTitle, queryByTitle, container } = render(TipTapEditor, { props: { modelValue: '<p></p>' } })
    expect(queryByTitle('插入时间轴')).toBeNull()
    expect(queryByTitle('插入步骤卡')).toBeNull()
    expect(queryByTitle('插入三栏块')).toBeNull()

    await fireEvent.click(getByTitle('展开教学块工具'))

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

  it('collapses table tools by default and expands on demand', async () => {
    window.localStorage.removeItem(TOOLBAR_VISIBILITY_STORAGE_KEY)
    const { getByTitle, queryByTitle } = render(TipTapEditor, { props: { modelValue: '<p></p>' } })

    expect(queryByTitle('插入表格')).toBeNull()
    await fireEvent.click(getByTitle('展开表格工具'))
    expect(getByTitle('插入表格')).toBeTruthy()
  })

  it('does not register duplicate extensions', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(TipTapEditor, { props: { modelValue: '<p></p>' } })

    await waitFor(() => {
      expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('Duplicate extension names found'))
    })

    warn.mockRestore()
  })

  it('renders unknown placeholder as readonly and allows deleting it', async () => {
    const rawUnknownNode = {
      type: 'futureTeachingBlock',
      attrs: { title: '未来节点' },
      content: [{ type: 'text', text: 'payload' }],
    }

    const modelJson = {
      type: 'doc',
      content: [
        {
          type: 'unknownNodePlaceholder',
          attrs: {
            originalType: 'futureTeachingBlock',
            summary: '未来节点',
            rawJson: JSON.stringify(rawUnknownNode),
          },
        },
      ],
    }

    const { container, getByTitle } = render(TipTapEditor, {
      props: { modelValue: '<p></p>', modelJson },
    })

    await waitFor(() => {
      const placeholder = container.querySelector('[data-node-type="unknownNodePlaceholder"]') as HTMLElement | null
      expect(placeholder).toBeTruthy()
      expect(placeholder?.textContent).toContain('只读')
      expect(placeholder?.getAttribute('contenteditable')).toBe('false')
    })

    const placeholder = container.querySelector('[data-node-type="unknownNodePlaceholder"]') as HTMLElement
    await fireEvent.click(placeholder)
    await fireEvent.click(getByTitle('展开教学块工具'))
    await fireEvent.click(getByTitle('删除当前块'))

    await waitFor(() => {
      expect(container.querySelector('[data-node-type="unknownNodePlaceholder"]')).toBeNull()
    })
  })

  it('shows realtime content metrics in footer', async () => {
    const { getByText } = render(TipTapEditor, {
      props: { modelValue: '<p>abc</p><p>de</p>' },
    })

    await waitFor(() => {
      expect(getByText('字数 5')).toBeTruthy()
      expect(getByText('段落 2')).toBeTruthy()
    })
  })
})
