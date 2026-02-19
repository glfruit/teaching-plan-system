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

    Object.defineProperty(HTMLElement.prototype, 'getClientRects', {
      value: () => [],
      configurable: true,
    })
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      value: () => ({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        toJSON: () => ({}),
      }),
      configurable: true,
    })
    if (typeof Range !== 'undefined') {
      Object.defineProperty(Range.prototype, 'getClientRects', {
        value: () => [],
        configurable: true,
      })
      Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
        value: () => ({
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          toJSON: () => ({}),
        }),
        configurable: true,
      })
    }
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

  it('toggles all advanced tool groups with one click', async () => {
    window.localStorage.removeItem(TOOLBAR_VISIBILITY_STORAGE_KEY)
    const { getByTitle, queryByTitle } = render(TipTapEditor, { props: { modelValue: '<p></p>' } })

    expect(queryByTitle('插入表格')).toBeNull()
    expect(queryByTitle('插入时间轴')).toBeNull()

    await fireEvent.click(getByTitle('展开全部工具组'))

    expect(getByTitle('插入表格')).toBeTruthy()
    expect(getByTitle('插入时间轴')).toBeTruthy()
    expect(getByTitle('收起全部工具组')).toBeTruthy()
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

  it('shows success feedback after inserting timeline block', async () => {
    const { getByTitle, getByText, container } = render(TipTapEditor, { props: { modelValue: '<p></p>' } })

    await fireEvent.click(getByTitle('展开教学块工具'))
    await fireEvent.click(getByTitle('插入时间轴'))

    await waitFor(() => {
      expect(getByText('已插入时间轴块，可按 Ctrl/Cmd+Z 撤销。')).toBeTruthy()
      expect(container.querySelector('[data-testid="editor-operation-message"]')?.className).toContain('text-emerald-700')
    })
  })

  it('shows failure feedback when deleting without selecting a teaching block', async () => {
    const { getByTitle, getByText, container } = render(TipTapEditor, { props: { modelValue: '<p>普通段落</p>' } })

    await fireEvent.click(getByTitle('展开教学块工具'))
    await fireEvent.click(getByTitle('删除当前块'))

    await waitFor(() => {
      expect(getByText('未找到可删除的教学块，请先选中目标块。')).toBeTruthy()
      expect(container.querySelector('[data-testid="editor-operation-message"]')?.className).toContain('text-red-700')
    })
  })

  it('shows success feedback after inserting table', async () => {
    const { getByTitle, getByText, container } = render(TipTapEditor, { props: { modelValue: '<p></p>' } })

    await fireEvent.click(getByTitle('展开表格工具'))
    await fireEvent.click(getByTitle('插入表格'))

    await waitFor(() => {
      expect(getByText('已插入3×3表格，可继续调整行列。')).toBeTruthy()
      expect(container.querySelector('[data-testid="editor-operation-message"]')?.className).toContain('text-emerald-700')
    })
  })

  it('shows failure feedback when splitting a non-merged table cell', async () => {
    const { getByTitle, getByText, container } = render(TipTapEditor, { props: { modelValue: '<p></p>' } })

    await fireEvent.click(getByTitle('展开表格工具'))
    await fireEvent.click(getByTitle('插入表格'))
    const firstCell = container.querySelector('th,td') as HTMLElement
    await fireEvent.click(firstCell)
    await waitFor(() => {
      expect(getByTitle('拆分单元格')).toBeTruthy()
    })
    await fireEvent.click(getByTitle('拆分单元格'))

    await waitFor(() => {
      expect(getByText('拆分失败：请先选中一个已合并的单元格。')).toBeTruthy()
      expect(container.querySelector('[data-testid="editor-operation-message"]')?.className).toContain('text-red-700')
    })
  })

  it('shows success feedback after inserting image from dialog', async () => {
    const { getByTitle, getByPlaceholderText, getByText, container } = render(TipTapEditor, {
      props: { modelValue: '<p></p>' },
    })

    await fireEvent.click(getByTitle('插入图片'))
    await fireEvent.update(getByPlaceholderText('https://example.com/image.jpg'), 'https://example.com/demo.jpg')
    await fireEvent.click(getByText('插入'))

    await waitFor(() => {
      expect(getByText('已插入图片。')).toBeTruthy()
      expect(container.querySelector('[data-testid="editor-operation-message"]')?.className).toContain('text-emerald-700')
    })
  })

  it('shows success feedback after clearing formatting', async () => {
    const { getByTitle, getByText, container } = render(TipTapEditor, {
      props: { modelValue: '<p><strong>格式文本</strong></p>' },
    })

    await fireEvent.click(getByTitle('清除格式'))

    await waitFor(() => {
      expect(getByText('已清除当前格式。')).toBeTruthy()
      expect(container.querySelector('[data-testid="editor-operation-message"]')?.className).toContain('text-emerald-700')
    })
  })

  it('supports configurable table shortcut to insert table', async () => {
    const { container, getByText } = render(TipTapEditor, {
      props: {
        modelValue: '<p></p>',
        shortcutConfig: {
          insertTable: { key: 'T', shift: true },
          deleteTable: { key: 'G', shift: true },
        },
      },
    })

    await waitFor(() => {
      expect(container.querySelector('.ProseMirror')).toBeTruthy()
    })
    const editable = container.querySelector('.ProseMirror') as HTMLElement
    await fireEvent.focus(editable)
    await fireEvent.keyDown(editable, { key: 'T', ctrlKey: true, shiftKey: true })

    await waitFor(() => {
      expect(container.querySelector('table')).toBeTruthy()
      expect(getByText('已插入3×3表格，可继续调整行列。')).toBeTruthy()
    })
  })

  it('supports configurable table shortcut to delete table', async () => {
    const { container, getByTitle, getByText } = render(TipTapEditor, {
      props: {
        modelValue: '<p></p>',
        shortcutConfig: {
          insertTable: { key: 'T', shift: true },
          deleteTable: { key: 'G', shift: true },
        },
      },
    })

    await fireEvent.click(getByTitle('展开表格工具'))
    await fireEvent.click(getByTitle('插入表格'))
    await waitFor(() => {
      expect(container.querySelector('table')).toBeTruthy()
      expect(container.querySelector('.ProseMirror')).toBeTruthy()
    })

    const firstCell = container.querySelector('th,td') as HTMLElement
    await fireEvent.click(firstCell)
    const editable = container.querySelector('.ProseMirror') as HTMLElement
    await fireEvent.focus(editable)
    await fireEvent.keyDown(editable, { key: 'G', ctrlKey: true, shiftKey: true })

    await waitFor(() => {
      expect(container.querySelector('table')).toBeNull()
      expect(getByText('已删除表格，可按 Ctrl/Cmd+Z 撤销。')).toBeTruthy()
    })
  })

  it('clears feedback timeout when unmounting component', async () => {
    vi.useFakeTimers()
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')

    try {
      const { getByTitle, unmount } = render(TipTapEditor, { props: { modelValue: '<p></p>' } })
      await fireEvent.click(getByTitle('展开教学块工具'))
      await fireEvent.click(getByTitle('插入时间轴'))

      const beforeUnmount = clearTimeoutSpy.mock.calls.length
      unmount()

      expect(clearTimeoutSpy.mock.calls.length).toBeGreaterThan(beforeUnmount)
    } finally {
      clearTimeoutSpy.mockRestore()
      vi.useRealTimers()
    }
  })
})
