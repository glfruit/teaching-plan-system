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
  removeUnpinnedEditorLocalDrafts,
  buildClearUnpinnedDraftConfirmMessage,
  buildClearAllDraftConfirmMessage,
  serializeEditorLocalDraftExportPayload,
  parseEditorLocalDraftImportPayload,
  mergeEditorLocalDraftHistory,
  buildEditorLocalDraftImportPreview,
  buildEditorLocalDraftImportPreviewMessage,
  buildEditorLocalDraftImportCandidates,
  pickEditorLocalDraftsForImport,
  selectEditorLocalDraftImportSavedAtByStrategy,
  filterEditorLocalDraftImportCandidates,
  searchEditorLocalDraftImportCandidates,
  buildEditorLocalDraftImportConflictItems,
  buildEditorLocalDraftImportConflictDiffItems,
  buildEditorLocalDraftImportConflictDetailItems,
  buildEditorLocalDraftImportFieldSelectionsByPreset,
  pickEditorLocalDraftImportConflictDetailsBySelection,
  mergeEditorDraftFormBySelectedFields,
  buildEditorLocalDraftImportPreparedDrafts,
  buildEditorLocalDraftExportFileName,
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

  it('can remove only unpinned drafts from local history', () => {
    const history = [
      {
        version: 1,
        savedAt: '2026-02-17T12:00:00.000Z',
        form: { title: 'A', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
        snapshot: { displayName: 'A', title: 'A', courseName: '', className: '' },
        pinned: false,
      },
      {
        version: 1,
        savedAt: '2026-02-17T12:05:00.000Z',
        form: { title: 'B', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
        snapshot: { displayName: 'B', title: 'B', courseName: '', className: '' },
        pinned: true,
      },
    ]

    const kept = removeUnpinnedEditorLocalDrafts(history as any)
    expect(kept).toHaveLength(1)
    expect(kept[0].snapshot.displayName).toBe('B')
  })

  it('builds clear confirmation messages with pinned protection hint', () => {
    expect(buildClearUnpinnedDraftConfirmMessage(3, 2)).toContain('保留 2 条置顶草稿')
    expect(buildClearUnpinnedDraftConfirmMessage(1, 0)).toContain('清理 1 条未置顶草稿')
    expect(buildClearAllDraftConfirmMessage(5, 2)).toContain('含置顶')
    expect(buildClearAllDraftConfirmMessage(4, 0)).toContain('清空全部 4 条草稿')
  })

  it('serializes export payload and parses import payload', () => {
    const history = [
      {
        version: 1,
        savedAt: '2026-02-17T12:00:00.000Z',
        form: { title: 'A', courseName: '课程A', className: '1班', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
        snapshot: { displayName: 'A', title: 'A', courseName: '课程A', className: '1班' },
        pinned: true,
      },
    ]

    const exported = serializeEditorLocalDraftExportPayload(history as any, '2026-02-18T01:00:00.000Z')
    const imported = parseEditorLocalDraftImportPayload(exported)
    expect(imported).toHaveLength(1)
    expect(imported[0].snapshot.displayName).toBe('A')
    expect(imported[0].pinned).toBe(true)
  })

  it('merges imported drafts with existing drafts and de-duplicates by savedAt', () => {
    const existing = [
      {
        version: 1,
        savedAt: '2026-02-17T12:00:00.000Z',
        form: { title: 'Existing', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
        snapshot: { displayName: 'Existing', title: 'Existing', courseName: '', className: '' },
        pinned: true,
      },
    ]
    const imported = [
      {
        version: 1,
        savedAt: '2026-02-17T12:00:00.000Z',
        form: { title: 'Imported Duplicate', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
        snapshot: { displayName: 'Imported Duplicate', title: 'Imported Duplicate', courseName: '', className: '' },
        pinned: false,
      },
      {
        version: 1,
        savedAt: '2026-02-17T13:00:00.000Z',
        form: { title: 'Imported New', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
        snapshot: { displayName: 'Imported New', title: 'Imported New', courseName: '', className: '' },
        pinned: false,
      },
    ]

    const merged = mergeEditorLocalDraftHistory(existing as any, imported as any, 5)
    expect(merged).toHaveLength(2)
    expect(merged[0].savedAt).toBe('2026-02-17T13:00:00.000Z')
    expect(merged[1].snapshot.displayName).toBe('Existing')
    expect(merged[1].pinned).toBe(true)
  })

  it('supports prefer-imported mode to overwrite same savedAt draft', () => {
    const existing = [
      {
        version: 1,
        savedAt: '2026-02-17T12:00:00.000Z',
        form: { title: 'Existing', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
        snapshot: { displayName: 'Existing', title: 'Existing', courseName: '', className: '' },
        pinned: true,
      },
    ]
    const imported = [
      {
        version: 1,
        savedAt: '2026-02-17T12:00:00.000Z',
        form: { title: 'Imported', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
        snapshot: { displayName: 'Imported', title: 'Imported', courseName: '', className: '' },
        pinned: false,
      },
    ]

    const merged = mergeEditorLocalDraftHistory(existing as any, imported as any, 5, 'prefer-imported')
    expect(merged).toHaveLength(1)
    expect(merged[0].snapshot.displayName).toBe('Imported')
    expect(merged[0].pinned).toBe(false)
  })

  it('builds import preview and confirmation message', () => {
    const existing = [
      {
        version: 1,
        savedAt: '2026-02-17T12:00:00.000Z',
        form: { title: 'Existing', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
        snapshot: { displayName: 'Existing', title: 'Existing', courseName: '', className: '' },
        pinned: true,
      },
    ]
    const imported = [
      {
        version: 1,
        savedAt: '2026-02-17T12:00:00.000Z',
        form: { title: 'Overwrite', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
        snapshot: { displayName: 'Overwrite', title: 'Overwrite', courseName: '', className: '' },
        pinned: false,
      },
      {
        version: 1,
        savedAt: '2026-02-17T13:00:00.000Z',
        form: { title: 'New', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
        snapshot: { displayName: 'New', title: 'New', courseName: '', className: '' },
        pinned: false,
      },
    ]

    const preview = buildEditorLocalDraftImportPreview(existing as any, imported as any, 5)
    expect(preview.importedCount).toBe(2)
    expect(preview.newCount).toBe(1)
    expect(preview.overwriteCount).toBe(1)
    expect(preview.nextCount).toBe(2)

    const message = buildEditorLocalDraftImportPreviewMessage(preview)
    expect(message).toContain('预计新增 1 条，覆盖 1 条')
    expect(message).toContain('是否继续导入')
  })

  it('builds keep-existing import preview without overwriting local conflicts', () => {
    const existing = [
      {
        version: 1,
        savedAt: '2026-02-17T12:00:00.000Z',
        form: { title: 'Existing', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
        snapshot: { displayName: 'Existing', title: 'Existing', courseName: '', className: '' },
        pinned: true,
      },
    ]
    const imported = [
      {
        version: 1,
        savedAt: '2026-02-17T12:00:00.000Z',
        form: { title: 'Imported Conflict', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
        snapshot: { displayName: 'Imported Conflict', title: 'Imported Conflict', courseName: '', className: '' },
        pinned: false,
      },
      {
        version: 1,
        savedAt: '2026-02-17T13:00:00.000Z',
        form: { title: 'Imported New', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
        snapshot: { displayName: 'Imported New', title: 'Imported New', courseName: '', className: '' },
        pinned: false,
      },
    ]

    const preview = (buildEditorLocalDraftImportPreview as any)(
      existing as any,
      imported as any,
      5,
      'keep-existing'
    )
    expect(preview.importedCount).toBe(2)
    expect(preview.newCount).toBe(1)
    expect(preview.overwriteCount).toBe(0)
    expect(preview.nextCount).toBe(2)
    expect(preview.mergedHistory[1].snapshot.displayName).toBe('Existing')
    expect(preview.mergedHistory[1].pinned).toBe(true)

    const message = buildEditorLocalDraftImportPreviewMessage(preview)
    expect(message).toContain('预计新增 1 条，覆盖 0 条')
  })

  it('builds deduplicated import candidates and marks conflicts', () => {
    const existing = [
      {
        version: 1,
        savedAt: '2026-02-17T12:00:00.000Z',
        form: { title: 'Existing', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
        snapshot: { displayName: 'Existing', title: 'Existing', courseName: '', className: '' },
        pinned: true,
      },
    ]
    const imported = [
      {
        version: 1,
        savedAt: '2026-02-17T12:00:00.000Z',
        form: { title: 'Conflict Old', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
        snapshot: { displayName: 'Conflict Old', title: 'Conflict Old', courseName: '', className: '' },
        pinned: false,
      },
      {
        version: 1,
        savedAt: '2026-02-17T12:00:00.000Z',
        form: { title: 'Conflict New', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
        snapshot: { displayName: 'Conflict New', title: 'Conflict New', courseName: '', className: '' },
        pinned: false,
      },
      {
        version: 1,
        savedAt: '2026-02-17T13:00:00.000Z',
        form: { title: 'Unique', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
        snapshot: { displayName: 'Unique', title: 'Unique', courseName: '', className: '' },
        pinned: false,
      },
    ]

    const candidates = buildEditorLocalDraftImportCandidates(existing as any, imported as any)
    expect(candidates).toHaveLength(2)
    expect(candidates.find((item) => item.draft.savedAt === '2026-02-17T12:00:00.000Z')?.conflict).toBe(true)
    expect(candidates.find((item) => item.draft.savedAt === '2026-02-17T12:00:00.000Z')?.draft.snapshot.displayName).toBe('Conflict New')
    expect(candidates.find((item) => item.draft.savedAt === '2026-02-17T13:00:00.000Z')?.conflict).toBe(false)
  })

  it('picks selected drafts for import from candidate list', () => {
    const candidates = [
      {
        draft: {
          version: 1,
          savedAt: '2026-02-17T12:00:00.000Z',
          form: { title: 'A', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
          snapshot: { displayName: 'A', title: 'A', courseName: '', className: '' },
          pinned: false,
        },
        conflict: true,
      },
      {
        draft: {
          version: 1,
          savedAt: '2026-02-17T13:00:00.000Z',
          form: { title: 'B', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
          snapshot: { displayName: 'B', title: 'B', courseName: '', className: '' },
          pinned: false,
        },
        conflict: false,
      },
    ]
    const selected = pickEditorLocalDraftsForImport(candidates as any, ['2026-02-17T13:00:00.000Z'])
    expect(selected).toHaveLength(1)
    expect(selected[0].snapshot.displayName).toBe('B')
  })

  it('selects import draft savedAt by strategy', () => {
    const candidates = [
      {
        draft: {
          version: 1,
          savedAt: '2026-02-17T12:00:00.000Z',
          form: { title: 'Conflict', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
          snapshot: { displayName: 'Conflict', title: 'Conflict', courseName: '', className: '' },
          pinned: false,
        },
        conflict: true,
      },
      {
        draft: {
          version: 1,
          savedAt: '2026-02-17T13:00:00.000Z',
          form: { title: 'New', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
          snapshot: { displayName: 'New', title: 'New', courseName: '', className: '' },
          pinned: false,
        },
        conflict: false,
      },
    ]

    expect(selectEditorLocalDraftImportSavedAtByStrategy(candidates as any, 'all')).toEqual([
      '2026-02-17T12:00:00.000Z',
      '2026-02-17T13:00:00.000Z',
    ])
    expect(selectEditorLocalDraftImportSavedAtByStrategy(candidates as any, 'conflict')).toEqual([
      '2026-02-17T12:00:00.000Z',
    ])
    expect(selectEditorLocalDraftImportSavedAtByStrategy(candidates as any, 'new')).toEqual([
      '2026-02-17T13:00:00.000Z',
    ])
    expect(selectEditorLocalDraftImportSavedAtByStrategy(candidates as any, 'none')).toEqual([])
  })

  it('builds import conflict items with local and imported display names', () => {
    const existing = [
      {
        version: 1,
        savedAt: '2026-02-17T12:00:00.000Z',
        form: { title: 'Local', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
        snapshot: { displayName: 'Local Draft', title: 'Local', courseName: '', className: '' },
        pinned: false,
      },
    ]
    const candidates = [
      {
        draft: {
          version: 1,
          savedAt: '2026-02-17T12:00:00.000Z',
          form: { title: 'Imported', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
          snapshot: { displayName: 'Imported Draft', title: 'Imported', courseName: '', className: '' },
          pinned: false,
        },
        conflict: true,
      },
      {
        draft: {
          version: 1,
          savedAt: '2026-02-17T13:00:00.000Z',
          form: { title: 'Non Conflict', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
          snapshot: { displayName: 'Non Conflict', title: 'Non Conflict', courseName: '', className: '' },
          pinned: false,
        },
        conflict: false,
      },
    ]

    const items = buildEditorLocalDraftImportConflictItems(existing as any, candidates as any)
    expect(items).toHaveLength(1)
    expect(items[0].savedAt).toBe('2026-02-17T12:00:00.000Z')
    expect(items[0].localDisplayName).toBe('Local Draft')
    expect(items[0].importedDisplayName).toBe('Imported Draft')
  })

  it('builds import conflict diff items with changed field labels', () => {
    const existing = [
      {
        version: 1,
        savedAt: '2026-02-17T12:00:00.000Z',
        form: { title: 'Local', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p>old</p>', keyPoints: '<p></p>', process: '<p>流程A</p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
        snapshot: { displayName: 'Local Draft', title: 'Local', courseName: '', className: '' },
        pinned: false,
      },
    ]
    const candidates = [
      {
        draft: {
          version: 1,
          savedAt: '2026-02-17T12:00:00.000Z',
          form: { title: 'Imported', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p>new</p>', keyPoints: '<p></p>', process: '<p>流程B</p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
          snapshot: { displayName: 'Imported Draft', title: 'Imported', courseName: '', className: '' },
          pinned: false,
        },
        conflict: true,
      },
    ]

    const items = buildEditorLocalDraftImportConflictDiffItems(existing as any, candidates as any)
    expect(items).toHaveLength(1)
    expect(items[0].savedAt).toBe('2026-02-17T12:00:00.000Z')
    expect(items[0].changedCount).toBeGreaterThan(0)
    expect(items[0].fields).toContain('教案标题')
    expect(items[0].fields).toContain('教学目标')
    expect(items[0].fields).toContain('教学过程')
  })

  it('builds import conflict detail items with field previews', () => {
    const existing = [
      {
        version: 1,
        savedAt: '2026-02-17T12:00:00.000Z',
        form: { title: 'Local', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p>old</p>', keyPoints: '<p></p>', process: '<p>流程A</p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
        snapshot: { displayName: 'Local Draft', title: 'Local', courseName: '', className: '' },
        pinned: false,
      },
    ]
    const candidates = [
      {
        draft: {
          version: 1,
          savedAt: '2026-02-17T12:00:00.000Z',
          form: { title: 'Imported', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p>new</p>', keyPoints: '<p></p>', process: '<p>流程B</p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
          snapshot: { displayName: 'Imported Draft', title: 'Imported', courseName: '', className: '' },
          pinned: false,
        },
        conflict: true,
      },
    ]

    const items = buildEditorLocalDraftImportConflictDetailItems(existing as any, candidates as any)
    expect(items).toHaveLength(1)
    expect(items[0].savedAt).toBe('2026-02-17T12:00:00.000Z')
    expect(items[0].changedCount).toBeGreaterThan(0)
    expect(items[0].details.some((item) => item.label === '教学目标')).toBe(true)
    expect(items[0].details.some((item) => item.label === '教学过程')).toBe(true)
  })

  it('filters import candidates by conflict and selected options', () => {
    const candidates = [
      {
        draft: {
          version: 1,
          savedAt: '2026-02-17T12:00:00.000Z',
          form: { title: 'Conflict', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
          snapshot: { displayName: 'Conflict', title: 'Conflict', courseName: '', className: '' },
          pinned: false,
        },
        conflict: true,
      },
      {
        draft: {
          version: 1,
          savedAt: '2026-02-17T13:00:00.000Z',
          form: { title: 'New', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
          snapshot: { displayName: 'New', title: 'New', courseName: '', className: '' },
          pinned: false,
        },
        conflict: false,
      },
    ]

    expect(
      filterEditorLocalDraftImportCandidates(candidates as any, {
        onlyConflict: true,
        onlySelected: false,
        selectedSavedAt: [],
      }).map((item) => item.draft.savedAt)
    ).toEqual(['2026-02-17T12:00:00.000Z'])

    expect(
      filterEditorLocalDraftImportCandidates(candidates as any, {
        onlyConflict: false,
        onlySelected: true,
        selectedSavedAt: ['2026-02-17T13:00:00.000Z'],
      }).map((item) => item.draft.savedAt)
    ).toEqual(['2026-02-17T13:00:00.000Z'])
  })

  it('searches import candidates by snapshot and conflict fields', () => {
    const candidates = [
      {
        draft: {
          version: 1,
          savedAt: '2026-02-17T12:00:00.000Z',
          form: { title: '冲突稿', courseName: '语文', className: '1班', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
          snapshot: { displayName: '冲突草稿', title: '冲突稿', courseName: '语文', className: '1班' },
          pinned: false,
        },
        conflict: true,
      },
      {
        draft: {
          version: 1,
          savedAt: '2026-02-17T13:00:00.000Z',
          form: { title: '实验教学', courseName: '物理', className: '2班', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
          snapshot: { displayName: '实验草稿', title: '实验教学', courseName: '物理', className: '2班' },
          pinned: false,
        },
        conflict: false,
      },
    ]
    const conflictDiffItems = [
      {
        savedAt: '2026-02-17T12:00:00.000Z',
        changedCount: 1,
        fields: ['教学过程'],
      },
    ]

    expect(
      searchEditorLocalDraftImportCandidates(candidates as any, '', conflictDiffItems as any).map(
        (item) => item.draft.savedAt
      )
    ).toEqual(['2026-02-17T12:00:00.000Z', '2026-02-17T13:00:00.000Z'])
    expect(
      searchEditorLocalDraftImportCandidates(candidates as any, '实验', conflictDiffItems as any).map(
        (item) => item.draft.savedAt
      )
    ).toEqual(['2026-02-17T13:00:00.000Z'])
    expect(
      searchEditorLocalDraftImportCandidates(candidates as any, '教学过程', conflictDiffItems as any).map(
        (item) => item.draft.savedAt
      )
    ).toEqual(['2026-02-17T12:00:00.000Z'])
  })

  it('merges draft forms by selected fields only', () => {
    const localForm = {
      title: '本地标题',
      courseName: '课程A',
      className: '1班',
      duration: 45,
      methods: '讲授法',
      resources: 'PPT',
      objectives: '<p>本地目标</p>',
      keyPoints: '<p>本地重点</p>',
      process: '<p>本地过程</p>',
      blackboard: '<p>本地板书</p>',
      reflection: '<p>本地反思</p>',
      contentJson: {},
    }
    const importedForm = {
      ...localForm,
      title: '导入标题',
      process: '<p>导入过程</p>',
      objectives: '<p>导入目标</p>',
    }

    const merged = mergeEditorDraftFormBySelectedFields(localForm as any, importedForm as any, [
      'title',
      'process',
    ])
    expect(merged.title).toBe('导入标题')
    expect(merged.process).toBe('<p>导入过程</p>')
    expect(merged.objectives).toBe('<p>本地目标</p>')
  })

  it('prepares selected import drafts with per-field conflict merge in keep-existing mode', () => {
    const existing = [
      {
        version: 1,
        savedAt: '2026-02-17T12:00:00.000Z',
        form: { title: 'Local', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p>old</p>', keyPoints: '<p></p>', process: '<p>A</p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
        snapshot: { displayName: 'Local Draft', title: 'Local', courseName: '', className: '' },
        pinned: false,
      },
    ]
    const candidates = [
      {
        draft: {
          version: 1,
          savedAt: '2026-02-17T12:00:00.000Z',
          form: { title: 'Imported', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p>new</p>', keyPoints: '<p></p>', process: '<p>B</p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
          snapshot: { displayName: 'Imported Draft', title: 'Imported', courseName: '', className: '' },
          pinned: false,
        },
        conflict: true,
      },
      {
        draft: {
          version: 1,
          savedAt: '2026-02-17T13:00:00.000Z',
          form: { title: 'Non Conflict', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p></p>', keyPoints: '<p></p>', process: '<p></p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
          snapshot: { displayName: 'Non Conflict', title: 'Non Conflict', courseName: '', className: '' },
          pinned: false,
        },
        conflict: false,
      },
    ]

    const prepared = buildEditorLocalDraftImportPreparedDrafts(
      existing as any,
      candidates as any,
      ['2026-02-17T12:00:00.000Z', '2026-02-17T13:00:00.000Z'],
      'keep-existing',
      {
        '2026-02-17T12:00:00.000Z': ['title'],
      } as any
    )

    expect(prepared.effectiveMode).toBe('prefer-imported')
    expect(prepared.importedDrafts).toHaveLength(2)
    const mergedConflict = prepared.importedDrafts.find((item) => item.savedAt === '2026-02-17T12:00:00.000Z')
    expect(mergedConflict?.form.title).toBe('Imported')
    expect(mergedConflict?.form.process).toBe('<p>A</p>')
  })

  it('builds conflict field selections by preset for all conflicts', () => {
    const items = [
      {
        savedAt: '2026-02-17T12:00:00.000Z',
        changedCount: 3,
        details: [
          { field: 'title', label: '教案标题', currentPreview: 'A', importedPreview: 'B' },
          { field: 'process', label: '教学过程', currentPreview: 'P1', importedPreview: 'P2' },
          { field: 'objectives', label: '教学目标', currentPreview: 'O1', importedPreview: 'O2' },
        ],
      },
      {
        savedAt: '2026-02-17T13:00:00.000Z',
        changedCount: 2,
        details: [
          { field: 'courseName', label: '课程名称', currentPreview: 'C1', importedPreview: 'C2' },
          { field: 'resources', label: '教学资源', currentPreview: 'R1', importedPreview: 'R2' },
        ],
      },
    ]

    const allPreset = buildEditorLocalDraftImportFieldSelectionsByPreset(items as any, 'all')
    expect(allPreset['2026-02-17T12:00:00.000Z']).toEqual(['title', 'process', 'objectives'])
    expect(allPreset['2026-02-17T13:00:00.000Z']).toEqual(['courseName', 'resources'])

    const metadataPreset = buildEditorLocalDraftImportFieldSelectionsByPreset(items as any, 'metadata')
    expect(metadataPreset['2026-02-17T12:00:00.000Z']).toEqual(['title'])
    expect(metadataPreset['2026-02-17T13:00:00.000Z']).toEqual(['courseName', 'resources'])

    const contentPreset = buildEditorLocalDraftImportFieldSelectionsByPreset(items as any, 'content')
    expect(contentPreset['2026-02-17T12:00:00.000Z']).toEqual(['process', 'objectives'])
    expect(contentPreset['2026-02-17T13:00:00.000Z']).toEqual([])

    const nonePreset = buildEditorLocalDraftImportFieldSelectionsByPreset(items as any, 'none')
    expect(nonePreset['2026-02-17T12:00:00.000Z']).toEqual([])
    expect(nonePreset['2026-02-17T13:00:00.000Z']).toEqual([])
  })

  it('applies content preset when preparing drafts in keep-existing mode', () => {
    const existing = [
      {
        version: 1,
        savedAt: '2026-02-17T12:00:00.000Z',
        form: { title: 'Local', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p>old</p>', keyPoints: '<p>old-key</p>', process: '<p>本地过程</p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
        snapshot: { displayName: 'Local Draft', title: 'Local', courseName: '', className: '' },
        pinned: false,
      },
    ]
    const candidates = [
      {
        draft: {
          version: 1,
          savedAt: '2026-02-17T12:00:00.000Z',
          form: { title: 'Imported', courseName: '', className: '', duration: 45, methods: '', resources: '', objectives: '<p>new</p>', keyPoints: '<p>new-key</p>', process: '<p>导入过程</p>', blackboard: '<p></p>', reflection: '<p></p>', contentJson: {} },
          snapshot: { displayName: 'Imported Draft', title: 'Imported', courseName: '', className: '' },
          pinned: false,
        },
        conflict: true,
      },
    ]
    const detailItems = [
      {
        savedAt: '2026-02-17T12:00:00.000Z',
        changedCount: 4,
        details: [
          { field: 'title', label: '教案标题', currentPreview: 'Local', importedPreview: 'Imported' },
          { field: 'objectives', label: '教学目标', currentPreview: 'old', importedPreview: 'new' },
          { field: 'keyPoints', label: '教学重点', currentPreview: 'old-key', importedPreview: 'new-key' },
          { field: 'process', label: '教学过程', currentPreview: '本地过程', importedPreview: '导入过程' },
        ],
      },
    ]

    const selections = buildEditorLocalDraftImportFieldSelectionsByPreset(detailItems as any, 'content')
    const prepared = buildEditorLocalDraftImportPreparedDrafts(
      existing as any,
      candidates as any,
      ['2026-02-17T12:00:00.000Z'],
      'keep-existing',
      selections
    )

    expect(prepared.effectiveMode).toBe('prefer-imported')
    expect(prepared.importedDrafts).toHaveLength(1)
    expect(prepared.importedDrafts[0].form.title).toBe('Local')
    expect(prepared.importedDrafts[0].form.objectives).toBe('<p>new</p>')
    expect(prepared.importedDrafts[0].form.keyPoints).toBe('<p>new-key</p>')
    expect(prepared.importedDrafts[0].form.process).toBe('<p>导入过程</p>')
  })

  it('picks conflict detail items by selected drafts when requested', () => {
    const conflictDetails = [
      {
        savedAt: '2026-02-17T12:00:00.000Z',
        changedCount: 1,
        details: [{ field: 'title', label: '教案标题', currentPreview: 'A', importedPreview: 'B' }],
      },
      {
        savedAt: '2026-02-17T13:00:00.000Z',
        changedCount: 1,
        details: [{ field: 'process', label: '教学过程', currentPreview: 'P1', importedPreview: 'P2' }],
      },
    ]

    expect(
      pickEditorLocalDraftImportConflictDetailsBySelection(
        conflictDetails as any,
        ['2026-02-17T12:00:00.000Z'],
        true
      ).map((item) => item.savedAt)
    ).toEqual(['2026-02-17T12:00:00.000Z'])

    expect(
      pickEditorLocalDraftImportConflictDetailsBySelection(
        conflictDetails as any,
        ['2026-02-17T12:00:00.000Z'],
        false
      ).map((item) => item.savedAt)
    ).toEqual(['2026-02-17T12:00:00.000Z', '2026-02-17T13:00:00.000Z'])
  })

  it('builds export filename with plan id and timestamp', () => {
    const name = buildEditorLocalDraftExportFileName('plan-123', new Date('2026-02-18T08:09:10.000Z'))
    expect(name).toBe('editor-local-drafts-plan-123-20260218-080910.json')
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
