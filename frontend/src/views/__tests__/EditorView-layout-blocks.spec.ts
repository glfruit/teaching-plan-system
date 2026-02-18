import { describe, it, expect } from 'vitest'
import {
  applyTemplateToForm,
  applyTemplateWithConfirmation,
  buildTemplateUpdatePayload,
  resolveTemplateEditSubmission,
  buildEditorLocalDraftStorageKey,
  buildEditorLocalDraftDisplayName,
  buildEditorLocalDraftSnapshot,
  serializeEditorLocalDraft,
  serializeEditorLocalDraftHistory,
  parseEditorLocalDraft,
  parseEditorLocalDraftHistory,
  pushEditorLocalDraftHistory,
  LOCAL_EDITOR_DRAFT_HISTORY_LIMIT,
  resolveEditorLocalDraftDisplayName,
  sortEditorLocalDraftHistoryForView,
  renameEditorLocalDraft,
  toggleEditorLocalDraftPinned,
  normalizeEditorLocalDraftSearchQuery,
  filterEditorLocalDraftHistory,
  buildEditorDraftDiffSummary,
  resolveEditorContentSourceLabel,
  shouldPersistLocalDraftOnLeave,
  buildPlanPayload,
  mapFetchedPlanToForm,
  buildEditorDraftSignature,
  hasEditorDraftChanges,
  shouldPromptUnsavedChanges,
} from '../EditorView.vue'
import type { JSONContent } from '@tiptap/core'

describe('EditorView teaching layout persistence', () => {
  it('keeps teaching layout blocks after save and reload', () => {
    const block = '<div data-node-type="lessonTimeline" data-minutes="10"></div>'
    const processJson: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'lessonTimeline',
          attrs: {
            title: '导入',
            minutes: 10,
          },
        },
      ],
    }

    const payload = buildPlanPayload({
      title: 'test',
      courseName: 'course',
      className: 'class',
      duration: 90,
      methods: '',
      resources: '',
      objectives: '<p></p>',
      keyPoints: '<p></p>',
      process: block,
      blackboard: '<p></p>',
      reflection: '<p></p>',
      contentJson: {
        process: processJson,
      },
    })

    expect(payload.contentJson?.process).toEqual(processJson)
    expect(payload.htmlContent).toContain('data-node-type="lessonTimeline"')

    const restored = mapFetchedPlanToForm({
      process: payload.process,
      contentJson: payload.contentJson,
    })
    expect(restored.contentJson?.process).toEqual(processJson)
  })

  it('derives process contentJson from teaching-layout html when json is missing', () => {
    const block = '<div data-node-type="lessonTimeline" data-title="导入" data-minutes="10"></div>'

    const payload = buildPlanPayload({
      title: 'test',
      courseName: 'course',
      className: 'class',
      duration: 90,
      methods: '',
      resources: '',
      objectives: '<p>obj</p>',
      keyPoints: '<p>key</p>',
      process: block,
      blackboard: '<p>blackboard</p>',
      reflection: '<p>reflection</p>',
      contentJson: {},
    })

    const processJson = payload.contentJson?.process as JSONContent
    expect(processJson.type).toBe('doc')
    expect(processJson.content?.[0]?.type).toBe('lessonTimeline')
    expect((processJson.content?.[0] as any).attrs?.title).toBe('导入')
    expect((processJson.content?.[0] as any).attrs?.minutes).toBe(10)
  })

  it('derives readable paragraph json from legacy plain html', () => {
    const payload = buildPlanPayload({
      title: 'test',
      courseName: 'course',
      className: 'class',
      duration: 90,
      methods: '',
      resources: '',
      objectives: '<p>学习目标：理解基础概念</p>',
      keyPoints: '<p></p>',
      process: '<p>第一步讲解，第二步练习</p>',
      blackboard: '<p></p>',
      reflection: '<p></p>',
      contentJson: {},
    })

    const objectivesJson = payload.contentJson?.objectives as JSONContent
    expect(objectivesJson.type).toBe('doc')
    expect(objectivesJson.content?.[0]?.type).toBe('paragraph')
    expect((objectivesJson.content?.[0] as any).content?.[0]?.text).toContain('学习目标')
  })

  it('derives activityStepCard contentJson from teaching-layout html when json is missing', () => {
    const block = '<div data-node-type="activityStepCard" data-title="探究步骤" data-steps="[&quot;观察&quot;,&quot;讨论&quot;]"></div>'

    const payload = buildPlanPayload({
      title: 'test',
      courseName: 'course',
      className: 'class',
      duration: 90,
      methods: '',
      resources: '',
      objectives: '<p>obj</p>',
      keyPoints: '<p>key</p>',
      process: block,
      blackboard: '<p>blackboard</p>',
      reflection: '<p>reflection</p>',
      contentJson: {},
    })

    const processJson = payload.contentJson?.process as JSONContent
    expect(processJson.type).toBe('doc')
    expect(processJson.content?.[0]?.type).toBe('activityStepCard')
    expect((processJson.content?.[0] as any).attrs?.title).toBe('探究步骤')
    expect((processJson.content?.[0] as any).attrs?.steps).toContain('观察')
  })

  it('derives goalActivityAssessmentGrid contentJson from teaching-layout html when json is missing', () => {
    const block =
      '<div data-node-type="goalActivityAssessmentGrid" data-goal="理解概念" data-activity="小组实验" data-assessment="口头反馈"></div>'

    const payload = buildPlanPayload({
      title: 'test',
      courseName: 'course',
      className: 'class',
      duration: 90,
      methods: '',
      resources: '',
      objectives: '<p>obj</p>',
      keyPoints: '<p>key</p>',
      process: block,
      blackboard: '<p>blackboard</p>',
      reflection: '<p>reflection</p>',
      contentJson: {},
    })

    const processJson = payload.contentJson?.process as JSONContent
    expect(processJson.type).toBe('doc')
    expect(processJson.content?.[0]?.type).toBe('goalActivityAssessmentGrid')
    expect((processJson.content?.[0] as any).attrs?.goal).toBe('理解概念')
    expect((processJson.content?.[0] as any).attrs?.activity).toBe('小组实验')
    expect((processJson.content?.[0] as any).attrs?.assessment).toBe('口头反馈')
  })

  it('restores unknown placeholder node back to original payload on save', () => {
    const rawUnknownNode = {
      type: 'futureTeachingBlock',
      attrs: { version: 'v2', title: '未来节点' },
      content: [{ type: 'text', text: 'payload' }],
    }

    const payload = buildPlanPayload({
      title: 'test',
      courseName: 'course',
      className: 'class',
      duration: 90,
      methods: '',
      resources: '',
      objectives: '<p>obj</p>',
      keyPoints: '<p>key</p>',
      process: '<p></p>',
      blackboard: '<p></p>',
      reflection: '<p></p>',
      contentJson: {
        process: {
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
        },
      },
    })

    const processJson = payload.contentJson?.process as JSONContent
    expect(processJson.content?.[0]).toEqual(rawUnknownNode as any)
  })

  it('applies template as full overwrite for editor form', () => {
    const current = {
      title: '当前教案',
      courseName: '数学',
      className: '一班',
      duration: 45,
      methods: '讲授法',
      resources: 'PPT',
      objectives: '<p>当前目标</p>',
      keyPoints: '<p>当前重点</p>',
      process: '<p>当前过程</p>',
      blackboard: '<p>当前板书</p>',
      reflection: '<p>当前反思</p>',
      contentJson: {},
    }

    const template = {
      title: '模板教案',
      courseName: '语文',
      className: '二班',
      duration: 40,
      methods: '讨论法',
      resources: '讲义',
      objectives: '<p>模板目标</p>',
      keyPoints: '<p>模板重点</p>',
      process: '<p>模板过程</p>',
      blackboard: '<p>模板板书</p>',
      reflection: '<p>模板反思</p>',
      contentJson: {
        process: {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: '模板过程' }] }],
        },
      },
    }

    const merged = applyTemplateToForm(current as any, template as any)
    expect(merged.title).toBe('模板教案')
    expect(merged.courseName).toBe('语文')
    expect(merged.duration).toBe(40)
    expect(merged.process).toContain('模板过程')
    expect((merged.contentJson.process as any).type).toBe('doc')
  })

  it('keeps form unchanged when template apply is not confirmed', () => {
    const current = {
      title: '当前教案',
      courseName: '数学',
      className: '一班',
      duration: 45,
      methods: '讲授法',
      resources: 'PPT',
      objectives: '<p>当前目标</p>',
      keyPoints: '<p>当前重点</p>',
      process: '<p>当前过程</p>',
      blackboard: '<p>当前板书</p>',
      reflection: '<p>当前反思</p>',
      contentJson: {},
    }
    const template = {
      title: '模板教案',
      courseName: '语文',
      className: '二班',
      duration: 40,
      methods: '讨论法',
      resources: '讲义',
      objectives: '<p>模板目标</p>',
      keyPoints: '<p>模板重点</p>',
      process: '<p>模板过程</p>',
      blackboard: '<p>模板板书</p>',
      reflection: '<p>模板反思</p>',
      contentJson: {},
    }

    const result = applyTemplateWithConfirmation(current as any, template as any, false)
    expect(result).toBe(current)
    expect(result.title).toBe('当前教案')
    expect(result.process).toContain('当前过程')
  })

  it('builds template update payload with edited title and restorable contentJson', () => {
    const edited = {
      title: '原模板标题',
      courseName: '语文',
      className: '二班',
      duration: 40,
      methods: '讨论法',
      resources: '讲义',
      objectives: '<p>模板目标</p>',
      keyPoints: '<p>模板重点</p>',
      process: '<p>模板过程</p>',
      blackboard: '<p>模板板书</p>',
      reflection: '<p>模板反思</p>',
      contentJson: {},
    }

    const payload = buildTemplateUpdatePayload(edited as any, '新模板标题')
    expect(payload.title).toBe('新模板标题')
    expect((payload.contentJson?.process as any).type).toBe('doc')
  })

  it('returns null when template edit submission is canceled', () => {
    const edited = {
      title: '原模板标题',
      courseName: '语文',
      className: '二班',
      duration: 40,
      methods: '讨论法',
      resources: '讲义',
      objectives: '<p>模板目标</p>',
      keyPoints: '<p>模板重点</p>',
      process: '<p>模板过程</p>',
      blackboard: '<p>模板板书</p>',
      reflection: '<p>模板反思</p>',
      contentJson: {},
    }

    const canceled = resolveTemplateEditSubmission(edited as any, '新模板标题', false)
    expect(canceled).toBeNull()
  })

  it('builds stable draft signatures for equivalent forms', () => {
    const form = {
      title: '教案标题',
      courseName: '课程',
      className: '1班',
      duration: 45,
      methods: '讲授法',
      resources: 'PPT',
      objectives: '<p>目标</p>',
      keyPoints: '<p>重点</p>',
      process: '<p>过程</p>',
      blackboard: '<p>板书</p>',
      reflection: '<p>反思</p>',
      contentJson: {},
    }

    expect(buildEditorDraftSignature(form as any)).toBe(buildEditorDraftSignature({ ...form } as any))
  })

  it('detects unsaved changes against saved draft signature', () => {
    const savedForm = {
      title: '教案A',
      courseName: '课程',
      className: '1班',
      duration: 45,
      methods: '讲授法',
      resources: '',
      objectives: '<p>目标</p>',
      keyPoints: '<p>重点</p>',
      process: '<p>过程</p>',
      blackboard: '<p></p>',
      reflection: '<p></p>',
      contentJson: {},
    }

    const changedForm = {
      ...savedForm,
      title: '教案A-修改',
    }

    const savedSignature = buildEditorDraftSignature(savedForm as any)
    expect(hasEditorDraftChanges(savedForm as any, savedSignature)).toBe(false)
    expect(hasEditorDraftChanges(changedForm as any, savedSignature)).toBe(true)
  })

  it('prompts only when there are unsaved changes and save is not in progress', () => {
    expect(shouldPromptUnsavedChanges(true, false)).toBe(true)
    expect(shouldPromptUnsavedChanges(true, true)).toBe(false)
    expect(shouldPromptUnsavedChanges(false, false)).toBe(false)
  })

  it('builds stable local draft storage keys for new and existing plans', () => {
    expect(buildEditorLocalDraftStorageKey()).toBe('editor-local-draft:new')
    expect(buildEditorLocalDraftStorageKey('')).toBe('editor-local-draft:new')
    expect(buildEditorLocalDraftStorageKey('plan-123')).toBe('editor-local-draft:plan-123')
  })

  it('builds readable local draft display name with title first', () => {
    const withTitle = {
      title: '函数式编程导论',
      courseName: '前端开发',
      className: '2301',
      duration: 45,
      methods: '',
      resources: '',
      objectives: '<p></p>',
      keyPoints: '<p></p>',
      process: '<p></p>',
      blackboard: '<p></p>',
      reflection: '<p></p>',
      contentJson: {},
    }
    expect(buildEditorLocalDraftDisplayName(withTitle as any)).toBe('函数式编程导论')

    const noTitle = { ...withTitle, title: '' }
    expect(buildEditorLocalDraftDisplayName(noTitle as any)).toBe('前端开发｜2301')
  })

  it('builds local draft snapshot and fallback display name', () => {
    const form = {
      title: '',
      courseName: '',
      className: '',
      duration: 45,
      methods: '',
      resources: '',
      objectives: '<p></p>',
      keyPoints: '<p></p>',
      process: '<p></p>',
      blackboard: '<p></p>',
      reflection: '<p></p>',
      contentJson: {},
    }

    const snapshot = buildEditorLocalDraftSnapshot(form as any)
    expect(snapshot.displayName).toBe('未命名草稿')
    expect(snapshot.courseName).toBe('')
    expect(snapshot.className).toBe('')
  })

  it('serializes and parses local editor draft payload', () => {
    const form = {
      title: '本地草稿',
      courseName: '课程',
      className: '1班',
      duration: 45,
      methods: '讲授法',
      resources: 'PPT',
      objectives: '<p>目标</p>',
      keyPoints: '<p>重点</p>',
      process: '<p>过程</p>',
      blackboard: '<p>板书</p>',
      reflection: '<p>反思</p>',
      contentJson: {},
    }

    const raw = serializeEditorLocalDraft(form as any, '2026-02-17T12:00:00.000Z')
    const parsed = parseEditorLocalDraft(raw)
    expect(parsed?.savedAt).toBe('2026-02-17T12:00:00.000Z')
    expect(parsed?.form.title).toBe('本地草稿')
    expect(parsed?.form.process).toContain('过程')
    expect(parsed?.pinned).toBe(false)
  })

  it('returns null for malformed local editor draft payload', () => {
    expect(parseEditorLocalDraft('')).toBeNull()
    expect(parseEditorLocalDraft('invalid-json')).toBeNull()
    expect(
      parseEditorLocalDraft(
        JSON.stringify({
          version: 1,
          savedAt: '2026-02-17T12:00:00.000Z',
          form: { title: '缺少字段' },
        })
      )
    ).toBeNull()
  })

  it('parses local editor draft history payload and keeps latest first', () => {
    const formA = {
      title: '草稿A',
      courseName: '课程',
      className: '1班',
      duration: 45,
      methods: '',
      resources: '',
      objectives: '<p>A</p>',
      keyPoints: '<p>A</p>',
      process: '<p>A</p>',
      blackboard: '<p></p>',
      reflection: '<p></p>',
      contentJson: {},
    }
    const formB = {
      ...formA,
      title: '草稿B',
      process: '<p>B</p>',
    }

    const raw = serializeEditorLocalDraftHistory([
      { version: 1, savedAt: '2026-02-17T12:01:00.000Z', form: formB as any, snapshot: buildEditorLocalDraftSnapshot(formB as any) },
      { version: 1, savedAt: '2026-02-17T12:00:00.000Z', form: formA as any, snapshot: buildEditorLocalDraftSnapshot(formA as any) },
    ])

    const history = parseEditorLocalDraftHistory(raw)
    expect(history).toHaveLength(2)
    expect(history[0].form.title).toBe('草稿B')
    expect(history[1].form.title).toBe('草稿A')
    expect(history[0].snapshot.displayName).toBe('草稿B')
  })

  it('supports parsing legacy single-draft payload as history', () => {
    const legacy = serializeEditorLocalDraft(
      {
        title: '旧格式草稿',
        courseName: '课程',
        className: '1班',
        duration: 45,
        methods: '',
        resources: '',
        objectives: '<p>目标</p>',
        keyPoints: '<p>重点</p>',
        process: '<p>过程</p>',
        blackboard: '<p></p>',
        reflection: '<p></p>',
        contentJson: {},
      } as any,
      '2026-02-17T11:59:00.000Z'
    )

    const history = parseEditorLocalDraftHistory(legacy)
    expect(history).toHaveLength(1)
    expect(history[0].form.title).toBe('旧格式草稿')
    expect(history[0].snapshot.displayName).toBe('旧格式草稿')
    expect(history[0].pinned).toBe(false)
  })

  it('pushes local draft history with limit and replaces same-signature latest', () => {
    const base = {
      title: '草稿',
      courseName: '课程',
      className: '1班',
      duration: 45,
      methods: '',
      resources: '',
      objectives: '<p>目标</p>',
      keyPoints: '<p>重点</p>',
      process: '<p>过程</p>',
      blackboard: '<p></p>',
      reflection: '<p></p>',
      contentJson: {},
    }

    const first = pushEditorLocalDraftHistory([], base as any, '2026-02-17T12:00:00.000Z', 2)
    const same = pushEditorLocalDraftHistory(first, base as any, '2026-02-17T12:00:30.000Z', 2)
    expect(same).toHaveLength(1)
    expect(same[0].savedAt).toBe('2026-02-17T12:00:30.000Z')
    expect(same[0].pinned).toBe(false)

    const second = pushEditorLocalDraftHistory(
      same,
      { ...base, process: '<p>过程2</p>' } as any,
      '2026-02-17T12:01:00.000Z',
      2
    )
    const third = pushEditorLocalDraftHistory(
      second,
      { ...base, process: '<p>过程3</p>' } as any,
      '2026-02-17T12:02:00.000Z',
      2
    )
    expect(third).toHaveLength(2)
    expect(third[0].savedAt).toBe('2026-02-17T12:02:00.000Z')
    expect(third[1].savedAt).toBe('2026-02-17T12:01:00.000Z')

    expect(LOCAL_EDITOR_DRAFT_HISTORY_LIMIT).toBeGreaterThan(1)
  })

  it('keeps pinned and custom display name when same-signature draft is updated', () => {
    const form = {
      title: '教案A',
      courseName: '课程',
      className: '1班',
      duration: 45,
      methods: '',
      resources: '',
      objectives: '<p></p>',
      keyPoints: '<p></p>',
      process: '<p></p>',
      blackboard: '<p></p>',
      reflection: '<p></p>',
      contentJson: {},
    }

    const history = [
      {
        version: 1,
        savedAt: '2026-02-17T12:00:00.000Z',
        form,
        snapshot: {
          displayName: '我的草稿名',
          title: '教案A',
          courseName: '课程',
          className: '1班',
        },
        pinned: true,
      },
    ]

    const updated = pushEditorLocalDraftHistory(history as any, form as any, '2026-02-17T12:01:00.000Z', 3)
    expect(updated[0].savedAt).toBe('2026-02-17T12:01:00.000Z')
    expect(updated[0].pinned).toBe(true)
    expect(updated[0].snapshot.displayName).toBe('我的草稿名')
  })

  it('resolves draft display name from snapshot first and falls back to form', () => {
    const form = {
      title: '表单标题',
      courseName: '课程A',
      className: '1班',
      duration: 45,
      methods: '',
      resources: '',
      objectives: '<p></p>',
      keyPoints: '<p></p>',
      process: '<p></p>',
      blackboard: '<p></p>',
      reflection: '<p></p>',
      contentJson: {},
    }

    const withSnapshot = {
      version: 1,
      savedAt: '2026-02-17T12:00:00.000Z',
      form,
      snapshot: {
        displayName: '快照标题',
        title: '',
        courseName: '',
        className: '',
      },
    }
    expect(resolveEditorLocalDraftDisplayName(withSnapshot as any)).toBe('快照标题')

    const withoutDisplayName = {
      ...withSnapshot,
      snapshot: {
        displayName: '',
        title: '',
        courseName: '',
        className: '',
      },
    }
    expect(resolveEditorLocalDraftDisplayName(withoutDisplayName as any)).toBe('表单标题')
  })

  it('normalizes local draft search query', () => {
    expect(normalizeEditorLocalDraftSearchQuery('  Vue 教案  ')).toBe('vue 教案')
    expect(normalizeEditorLocalDraftSearchQuery('')).toBe('')
  })

  it('filters local draft history by display name and course/class snapshot', () => {
    const history = [
      {
        version: 1,
        savedAt: '2026-02-17T12:00:00.000Z',
        form: {
          title: 'Vue 入门',
          courseName: '前端开发',
          className: '2301',
          duration: 45,
          methods: '',
          resources: '',
          objectives: '<p></p>',
          keyPoints: '<p></p>',
          process: '<p></p>',
          blackboard: '<p></p>',
          reflection: '<p></p>',
          contentJson: {},
        },
        snapshot: {
          displayName: 'Vue 入门',
          title: 'Vue 入门',
          courseName: '前端开发',
          className: '2301',
        },
        pinned: false,
      },
      {
        version: 1,
        savedAt: '2026-02-17T12:05:00.000Z',
        form: {
          title: '数据库基础',
          courseName: '数据库',
          className: '2202',
          duration: 45,
          methods: '',
          resources: '',
          objectives: '<p></p>',
          keyPoints: '<p></p>',
          process: '<p></p>',
          blackboard: '<p></p>',
          reflection: '<p></p>',
          contentJson: {},
        },
        snapshot: {
          displayName: '数据库基础',
          title: '数据库基础',
          courseName: '数据库',
          className: '2202',
        },
        pinned: false,
      },
    ]

    expect(filterEditorLocalDraftHistory(history as any, '').length).toBe(2)
    expect(filterEditorLocalDraftHistory(history as any, 'vue')[0].snapshot.displayName).toBe('Vue 入门')
    expect(filterEditorLocalDraftHistory(history as any, '2202')[0].snapshot.displayName).toBe('数据库基础')
    expect(filterEditorLocalDraftHistory(history as any, '不存在')).toHaveLength(0)
  })

  it('sorts local draft history with pinned first and then by time', () => {
    const history = [
      {
        version: 1,
        savedAt: '2026-02-17T12:01:00.000Z',
        form: { title: 'A', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
        snapshot: { displayName: 'A', title: 'A', courseName: '', className: '' },
        pinned: false,
      },
      {
        version: 1,
        savedAt: '2026-02-17T12:00:00.000Z',
        form: { title: 'B', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
        snapshot: { displayName: 'B', title: 'B', courseName: '', className: '' },
        pinned: true,
      },
    ]
    const sorted = sortEditorLocalDraftHistoryForView(history as any)
    expect(sorted[0].snapshot.displayName).toBe('B')
    expect(sorted[1].snapshot.displayName).toBe('A')
  })

  it('can rename and toggle pin for a specific local draft', () => {
    const history = [
      {
        version: 1,
        savedAt: '2026-02-17T12:00:00.000Z',
        form: { title: 'A', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
        snapshot: { displayName: 'A', title: 'A', courseName: '', className: '' },
        pinned: false,
      },
    ]

    const renamed = renameEditorLocalDraft(history as any, '2026-02-17T12:00:00.000Z', '新的名称')
    expect(renamed[0].snapshot.displayName).toBe('新的名称')

    const pinned = toggleEditorLocalDraftPinned(renamed as any, '2026-02-17T12:00:00.000Z')
    expect(pinned[0].pinned).toBe(true)
  })

  it('builds draft diff summary between current form and selected draft', () => {
    const current = {
      title: '教案A',
      courseName: '课程',
      className: '1班',
      duration: 45,
      methods: '讲授法',
      resources: 'PPT',
      objectives: '<p>目标：理解概念</p>',
      keyPoints: '<p>重点A</p>',
      process: '<p>过程A</p>',
      blackboard: '<p>板书A</p>',
      reflection: '<p>反思A</p>',
      contentJson: {},
    }

    const selectedDraft = {
      version: 1,
      savedAt: '2026-02-17T12:00:00.000Z',
      form: {
        ...current,
        title: '教案B',
        duration: 40,
        process: '<p>过程B（差异）</p>',
      },
    }

    const diff = buildEditorDraftDiffSummary(current as any, selectedDraft as any)
    expect(diff.changedCount).toBe(3)
    expect(diff.items.map((item) => item.field)).toContain('title')
    expect(diff.items.map((item) => item.field)).toContain('duration')
    expect(diff.items.map((item) => item.field)).toContain('process')
  })

  it('returns empty diff summary when draft is null or same as current', () => {
    const current = {
      title: '教案A',
      courseName: '课程',
      className: '1班',
      duration: 45,
      methods: '讲授法',
      resources: 'PPT',
      objectives: '<p>目标：理解概念</p>',
      keyPoints: '<p>重点A</p>',
      process: '<p>过程A</p>',
      blackboard: '<p>板书A</p>',
      reflection: '<p>反思A</p>',
      contentJson: {},
    }

    expect(buildEditorDraftDiffSummary(current as any, null).changedCount).toBe(0)

    const sameDraft = {
      version: 1,
      savedAt: '2026-02-17T12:00:00.000Z',
      form: current,
    }
    expect(buildEditorDraftDiffSummary(current as any, sameDraft as any).changedCount).toBe(0)
  })

  it('resolves content source label for local/server/new', () => {
    expect(resolveEditorContentSourceLabel('local')).toBe('内容来源：本地草稿')
    expect(resolveEditorContentSourceLabel('server')).toBe('内容来源：服务器')
    expect(resolveEditorContentSourceLabel('new')).toBe('内容来源：新建教案')
  })

  it('persists local draft on leave only when unsaved and not saving', () => {
    expect(shouldPersistLocalDraftOnLeave(true, false)).toBe(true)
    expect(shouldPersistLocalDraftOnLeave(true, true)).toBe(false)
    expect(shouldPersistLocalDraftOnLeave(false, false)).toBe(false)
  })
})
