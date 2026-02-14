import { NodeSelection } from '@tiptap/pm/state'
import type { Editor, JSONContent } from '@tiptap/core'

const TEACHING_NODE_TYPES = new Set([
  'lessonTimeline',
  'activityStepCard',
  'goalActivityAssessmentGrid',
])

const createStarterParagraph = (text: string): JSONContent[] => [
  {
    type: 'paragraph',
    content: [{ type: 'text', text }],
  },
]

const insertAtCurrentOrEnd = (editor: Editor, payload: JSONContent): boolean => {
  const insertedAtCursor = editor.chain().focus().insertContent(payload).run()
  if (insertedAtCursor) {
    return true
  }

  const end = editor.state.doc.content.size
  return editor.chain().focus().setTextSelection(end).insertContent(payload).run()
}

const findCurrentTeachingNode = (editor: Editor) => {
  if (editor.state.selection instanceof NodeSelection) {
    const selectedNode = editor.state.selection.node
    if (TEACHING_NODE_TYPES.has(selectedNode.type.name)) {
      const pos = editor.state.selection.from
      const $pos = editor.state.doc.resolve(pos)
      return {
        node: selectedNode,
        parent: $pos.parent,
        index: $pos.index(),
        pos,
      }
    }
  }

  const { $from } = editor.state.selection

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth)
    if (!TEACHING_NODE_TYPES.has(node.type.name)) {
      continue
    }

    const parent = $from.node(depth - 1)
    const index = $from.index(depth - 1)
    return {
      node,
      parent,
      index,
      pos: $from.before(depth),
    }
  }

  let fallbackPos: number | null = null
  editor.state.doc.descendants((node, pos) => {
    if (!TEACHING_NODE_TYPES.has(node.type.name)) {
      return
    }
    if (pos <= editor.state.selection.from) {
      fallbackPos = pos
    }
  })

  if (fallbackPos !== null) {
    const $pos = editor.state.doc.resolve(fallbackPos)
    return {
      node: $pos.nodeAfter!,
      parent: $pos.parent,
      index: $pos.index(),
      pos: fallbackPos,
    }
  }

  return null
}

export const insertLessonTimeline = (editor: Editor): boolean =>
  insertAtCurrentOrEnd(editor, {
    type: 'lessonTimeline',
    content: createStarterParagraph('示例：导入 10 分钟，讲解 20 分钟，练习 10 分钟'),
  })

export const insertActivityStepCard = (editor: Editor): boolean =>
  insertAtCurrentOrEnd(editor, {
    type: 'activityStepCard',
    content: createStarterParagraph('示例：步骤1 观察，步骤2 讨论，步骤3 汇报'),
  })

export const insertGoalActivityAssessmentGrid = (editor: Editor): boolean =>
  insertAtCurrentOrEnd(editor, {
    type: 'goalActivityAssessmentGrid',
    content: createStarterParagraph('示例：目标-识记概念，活动-小组实验，评价-口头反馈'),
  })

export const copyCurrentTeachingNode = (editor: Editor): boolean => {
  const current = findCurrentTeachingNode(editor)
  if (!current) {
    return false
  }

  const tr = editor.state.tr.insert(current.pos + current.node.nodeSize, current.node.copy(current.node.content))
  editor.view.dispatch(tr)
  return true
}

export const deleteCurrentTeachingNode = (editor: Editor): boolean => {
  const current = findCurrentTeachingNode(editor)
  if (!current) {
    return false
  }

  const tr = editor.state.tr.delete(current.pos, current.pos + current.node.nodeSize)
  editor.view.dispatch(tr)
  return true
}

export const moveCurrentTeachingNodeUp = (editor: Editor): boolean => {
  const current = findCurrentTeachingNode(editor)
  if (!current || current.index === 0) {
    return false
  }

  const previous = current.parent.child(current.index - 1)
  const tr = editor.state.tr
  tr.delete(current.pos, current.pos + current.node.nodeSize)
  const newPos = current.pos - previous.nodeSize
  tr.insert(newPos, current.node.copy(current.node.content))
  tr.setSelection(NodeSelection.create(tr.doc, newPos))
  editor.view.dispatch(tr)
  return true
}

export const moveCurrentTeachingNodeDown = (editor: Editor): boolean => {
  const current = findCurrentTeachingNode(editor)
  if (!current || current.index >= current.parent.childCount - 1) {
    return false
  }

  const next = current.parent.child(current.index + 1)
  const tr = editor.state.tr
  tr.delete(current.pos, current.pos + current.node.nodeSize)
  const newPos = current.pos + next.nodeSize
  tr.insert(newPos, current.node.copy(current.node.content))
  tr.setSelection(NodeSelection.create(tr.doc, newPos))
  editor.view.dispatch(tr)
  return true
}
