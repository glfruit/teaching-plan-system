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
  buildEditorCompletionSummary,
  buildEditorSectionCompletion,
  resolveNextIncompleteEditorSection,
  resolveActiveEditorSectionFromViewport,
  sumEditorProcessMinutes,
  buildEditorQualityTips,
  applyEditorLessonSkeleton,
  buildEditorExportPrecheck,
  recommendEditorLessonSkeletonPreset,
  resolveEditorProcessTimelineOptions,
  allocateEditorTimelineMinutes,
  buildEditorProcessTimelineHtml,
  buildEditorTimelineStepsFromPreset,
  buildEditorTimelineProcessHtmlFromSteps,
  alignEditorTimelineStepsToDuration,
  applyEditorTimelineStepsToForm,
  normalizeEditorTimelineDraftSteps,
  buildEditorTimelineApplyPreview,
  moveEditorTimelineSteps,
  reorderEditorTimelineSteps,
  isEditorTimelineStepCollapsedState,
  toggleEditorTimelineStepCollapsedState,
  normalizeEditorTimelineStepCollapsedState,
  areAllEditorTimelineStepsCollapsed,
  toggleAllEditorTimelineStepCollapsedState,
  isEditorTimelineStepSelectedState,
  toggleEditorTimelineStepSelectedState,
  normalizeEditorTimelineStepSelectedState,
  areAllEditorTimelineStepsSelected,
  toggleAllEditorTimelineStepSelectedState,
  removeSelectedEditorTimelineSteps,
  redistributeEditorTimelineSelectedStepMinutes,
  redistributeEditorTimelineSelectedStepMinutesToDuration,
  adjustEditorTimelineSelectedStepMinutes,
  autofillEditorTimelineDraftStepLabels,
  buildEditorTimelineApplyPreviewDiff,
  cloneEditorTimelineDraftSteps,
  hasEditorTimelineDraftStepChanges,
  pushEditorTimelineDraftUndoStack,
  applyEditorProcessTimeline,
  buildEditorExportPrecheckFixActions,
  applyEditorExportPrecheckFix,
  shouldPersistLocalDraftOnLeave,
  shouldShowEditorTemplatePanel,
  resolveEditorLayoutTabBySection,
  resolveEditorSectionForLayoutTab,
  buildEditorLayoutTabSummaries,
  isEditorSectionCollapsedInState,
  setEditorSectionCollapsedState,
  toggleEditorSectionCollapsedState,
  normalizeEditorCollapsibleSections,
  normalizeEditorLayoutTab,
  parseEditorViewPreference,
  serializeEditorViewPreference,
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
      duration: 70,
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
      duration: 70,
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

  it('builds completion summary for fully filled editor form', () => {
    const summary = buildEditorCompletionSummary({
      title: '完整教案',
      courseName: '计算机网络',
      className: '23计网1班',
      duration: 90,
      methods: '讲授法',
      resources: 'PPT',
      objectives: '<p>掌握基础概念</p>',
      keyPoints: '<p>重点内容</p>',
      process: '<p>教学过程安排</p>',
      blackboard: '<p>板书结构</p>',
      reflection: '<p>课后反思</p>',
      contentJson: {},
    } as any)

    expect(summary.score).toBe(100)
    expect(summary.missingLabels).toEqual([])
    expect(summary.filledCount).toBe(summary.totalCount)
  })

  it('builds completion summary for partial editor form and lists missing labels', () => {
    const summary = buildEditorCompletionSummary({
      title: '未完成教案',
      courseName: '高等数学',
      className: '24数媒2班',
      duration: 45,
      methods: '',
      resources: '',
      objectives: '<p></p>',
      keyPoints: '<p> </p>',
      process: '<p></p>',
      blackboard: '',
      reflection: '',
      contentJson: {},
    } as any)

    expect(summary.score).toBeLessThan(50)
    expect(summary.missingLabels).toContain('教学目标')
    expect(summary.missingLabels).toContain('教学过程')
    expect(summary.missingLabels).toContain('教学方法')
    expect(summary.filledCount).toBeLessThan(summary.totalCount)
  })

  it('builds quality tips for short objectives and process', () => {
    const tips = buildEditorQualityTips({
      title: '教案A',
      courseName: '课程A',
      className: '1班',
      duration: 45,
      methods: '',
      resources: '',
      objectives: '<p>目标</p>',
      keyPoints: '<p></p>',
      process: '<p>过程</p>',
      blackboard: '<p></p>',
      reflection: '<p></p>',
      contentJson: {},
    } as any)

    expect(tips.some((item) => item.message.includes('教学目标建议不少于20字'))).toBe(true)
    expect(tips.some((item) => item.message.includes('教学过程建议包含关键环节与时间安排'))).toBe(true)
    expect(tips.some((item) => item.message.includes('建议补充教学方法或教学资源'))).toBe(true)
  })

  it('returns empty quality tips for well-formed content', () => {
    const tips = buildEditorQualityTips({
      title: '教案A',
      courseName: '课程A',
      className: '1班',
      duration: 70,
      methods: '案例教学',
      resources: 'PPT、视频',
      objectives: '<p>通过本节课学习，学生能够理解核心概念并完成基础应用任务。</p>',
      keyPoints: '<p>核心概念与应用步骤。</p>',
      process: '<p>导入5分钟并设置问题情境，讲授30分钟拆解步骤，分组练习25分钟完成任务，最后总结反馈并布置拓展作业10分钟。</p>',
      blackboard: '<p>板书结构完整</p>',
      reflection: '<p>课后反思与改进点</p>',
      contentJson: {},
    } as any)

    expect(tips).toEqual([])
  })

  it('applies lesson skeleton in fill-empty mode without overriding existing values', () => {
    const next = applyEditorLessonSkeleton(
      {
        title: '已有标题',
        courseName: '课程A',
        className: '1班',
        duration: 90,
        methods: '',
        resources: '',
        objectives: '<p></p>',
        keyPoints: '<p></p>',
        process: '<p>已有过程</p>',
        blackboard: '',
        reflection: '',
        contentJson: {},
      } as any,
      'lecture',
      'fill-empty'
    )

    expect(next.title).toBe('已有标题')
    expect(next.process).toBe('<p>已有过程</p>')
    expect(next.methods.length).toBeGreaterThan(0)
    expect(next.objectives).not.toBe('<p></p>')
  })

  it('applies lesson skeleton in overwrite mode for selected preset', () => {
    const next = applyEditorLessonSkeleton(
      {
        title: '旧标题',
        courseName: '课程A',
        className: '1班',
        duration: 90,
        methods: '旧方法',
        resources: '旧资源',
        objectives: '<p>旧目标</p>',
        keyPoints: '<p>旧重点</p>',
        process: '<p>旧过程</p>',
        blackboard: '<p>旧板书</p>',
        reflection: '<p>旧反思</p>',
        contentJson: {},
      } as any,
      'lab',
      'overwrite'
    )

    expect(next.methods).not.toBe('旧方法')
    expect(next.resources).not.toBe('旧资源')
    expect(next.process).toContain('实验')
  })

  it('builds export precheck report with blocking and warning issues', () => {
    const completion = buildEditorCompletionSummary({
      title: '',
      courseName: '课程A',
      className: '',
      duration: 0,
      methods: '',
      resources: '',
      objectives: '<p></p>',
      keyPoints: '<p></p>',
      process: '<p>过程很短</p>',
      blackboard: '',
      reflection: '',
      contentJson: {},
    } as any)
    const qualityTips = buildEditorQualityTips({
      title: '',
      courseName: '课程A',
      className: '',
      duration: 0,
      methods: '',
      resources: '',
      objectives: '<p>短</p>',
      keyPoints: '<p></p>',
      process: '<p>短</p>',
      blackboard: '',
      reflection: '',
      contentJson: {},
    } as any)
    const report = buildEditorExportPrecheck(completion, qualityTips)

    expect(report.blockingIssues.length).toBeGreaterThan(0)
    expect(report.warningIssues.length).toBeGreaterThan(0)
    expect(report.passed).toBe(false)
  })

  it('recommends skeleton preset by course name keywords', () => {
    expect(recommendEditorLessonSkeletonPreset('数据库实验')).toBe('lab')
    expect(recommendEditorLessonSkeletonPreset('Web项目实训')).toBe('practice')
    expect(recommendEditorLessonSkeletonPreset('高等数学')).toBe('lecture')
  })

  it('builds precheck fix actions for blocking and warning issues', () => {
    const completion = buildEditorCompletionSummary({
      title: '',
      courseName: '',
      className: '',
      duration: 0,
      methods: '',
      resources: '',
      objectives: '<p></p>',
      keyPoints: '<p></p>',
      process: '<p></p>',
      blackboard: '',
      reflection: '',
      contentJson: {},
    } as any)
    const qualityTips = buildEditorQualityTips({
      title: '',
      courseName: '',
      className: '',
      duration: 0,
      methods: '',
      resources: '',
      objectives: '<p>短</p>',
      keyPoints: '<p></p>',
      process: '<p>短</p>',
      blackboard: '',
      reflection: '',
      contentJson: {},
    } as any)
    const actions = buildEditorExportPrecheckFixActions(completion, qualityTips)

    expect(actions.some((item) => item.key === 'fill-title')).toBe(true)
    expect(actions.some((item) => item.key === 'fill-objectives')).toBe(true)
    expect(actions.some((item) => item.key === 'enhance-process')).toBe(true)
  })

  it('applies export precheck fix action to form', () => {
    const fixed = applyEditorExportPrecheckFix(
      {
        title: '',
        courseName: '',
        className: '',
        duration: 0,
        methods: '',
        resources: '',
        objectives: '<p></p>',
        keyPoints: '<p></p>',
        process: '<p></p>',
        blackboard: '',
        reflection: '',
        contentJson: {},
      } as any,
      'fill-objectives'
    )

    expect(fixed.objectives).toContain('待补充')
    expect(fixed.title).toBe('')
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

  it('builds section completion status and finds next required incomplete section', () => {
    const form = {
      title: '',
      courseName: '课程A',
      className: '',
      duration: 90,
      methods: '',
      resources: '',
      objectives: '<p></p>',
      keyPoints: '<p>重点</p>',
      process: '<p></p>',
      blackboard: '<p></p>',
      reflection: '<p>反思</p>',
      contentJson: {},
    } as any

    const items = buildEditorSectionCompletion(form)
    const basic = items.find((item) => item.section === 'basic')
    const objectives = items.find((item) => item.section === 'objectives')

    expect(basic?.requiredMissingLabels).toContain('教案标题')
    expect(objectives?.requiredMissingLabels).toContain('教学目标')
    expect(resolveNextIncompleteEditorSection(items)).toBe('basic')
  })

  it('warns process-duration mismatch and supports aligning duration fix', () => {
    const form = {
      title: '示例教案',
      courseName: '课程A',
      className: '一班',
      duration: 90,
      methods: '讲授法',
      resources: 'PPT',
      objectives: '<p>完整教学目标内容不少于20字。</p>',
      keyPoints: '<p>重点</p>',
      process: '<p>导入（10分钟）→ 讲解（20分钟）→ 练习（20分钟）</p>',
      blackboard: '<p>板书</p>',
      reflection: '<p>反思</p>',
      contentJson: {},
    } as any

    expect(sumEditorProcessMinutes(form.process)).toBe(50)

    const qualityTips = buildEditorQualityTips(form)
    expect(qualityTips.some((item) => item.message.includes('教学过程时间合计约50分钟'))).toBe(true)

    const completion = buildEditorCompletionSummary(form)
    const actions = buildEditorExportPrecheckFixActions(completion, qualityTips)
    expect(actions.some((item) => item.key === 'align-duration-with-process')).toBe(true)

    const fixed = applyEditorExportPrecheckFix(form, 'align-duration-with-process')
    expect(fixed.duration).toBe(50)
  })

  it('builds timeline options and allocates minutes to exact duration', () => {
    const options = resolveEditorProcessTimelineOptions()
    expect(options.length).toBeGreaterThan(0)
    expect(options.some((item) => item.id === 'balanced')).toBe(true)

    const minutes = allocateEditorTimelineMinutes(90, [0.12, 0.43, 0.3, 0.15])
    expect(minutes.reduce((sum, value) => sum + value, 0)).toBe(90)
  })

  it('builds and applies process timeline html in replace/append mode', () => {
    const html = buildEditorProcessTimelineHtml(45, 'balanced')
    expect(html).toContain('分钟')
    expect(html).toContain('导入')

    const baseForm = {
      title: '教案A',
      courseName: '课程A',
      className: '1班',
      duration: 45,
      methods: '',
      resources: '',
      objectives: '<p></p>',
      keyPoints: '<p></p>',
      process: '<p>已有过程</p>',
      blackboard: '<p></p>',
      reflection: '<p></p>',
      contentJson: {
        process: { type: 'doc', content: [] },
      },
    } as any

    const replaced = applyEditorProcessTimeline(baseForm, 'balanced', 'replace')
    expect(replaced.process).not.toContain('已有过程')
    expect(replaced.process).toContain('分钟')
    expect(replaced.contentJson.process).toBeUndefined()

    const appended = applyEditorProcessTimeline(baseForm, 'balanced', 'append')
    expect(appended.process).toContain('已有过程')
    expect(appended.process).toContain('分钟')
    expect(appended.contentJson.process).toBeUndefined()
  })

  it('builds timeline steps from preset with exact duration total', () => {
    const steps = buildEditorTimelineStepsFromPreset(75, 'balanced')
    expect(steps.length).toBe(4)
    expect(steps[0].label).toBe('导入')
    expect(steps.reduce((sum, step) => sum + step.minutes, 0)).toBe(75)
  })

  it('builds timeline html from steps and falls back when empty', () => {
    const html = buildEditorTimelineProcessHtmlFromSteps([
      { label: ' 导入 ', minutes: 8.6 },
      { label: '', minutes: 10 },
      { label: '讲授', minutes: Number.NaN },
    ])
    expect(html).toContain('导入（9分钟）')
    expect(html).toContain('讲授（0分钟）')
    expect(buildEditorTimelineProcessHtmlFromSteps([])).toBe('<p></p>')
  })

  it('applies timeline steps to form in replace and append mode', () => {
    const baseForm = {
      title: '教案B',
      courseName: '课程B',
      className: '2班',
      duration: 60,
      methods: '',
      resources: '',
      objectives: '<p></p>',
      keyPoints: '<p></p>',
      process: '<p>已有流程</p>',
      blackboard: '<p></p>',
      reflection: '<p></p>',
      contentJson: {
        process: { type: 'doc', content: [] },
      },
    } as any

    const steps = [
      { label: '导入', minutes: 10 },
      { label: '讲解', minutes: 20 },
    ]

    const replaced = applyEditorTimelineStepsToForm(baseForm, steps, 'replace')
    expect(replaced.process).toContain('导入（10分钟）')
    expect(replaced.process).not.toContain('已有流程')
    expect(replaced.contentJson.process).toBeUndefined()

    const appended = applyEditorTimelineStepsToForm(baseForm, steps, 'append')
    expect(appended.process).toContain('已有流程')
    expect(appended.process).toContain('讲解（20分钟）')
    expect(appended.contentJson.process).toBeUndefined()
  })

  it('normalizes timeline draft steps and builds apply preview', () => {
    const draftSteps = [
      { id: 'a', label: ' 导入 ', minutes: 8.6 },
      { id: 'b', label: ' ', minutes: 10 },
      { id: 'c', label: '讲授', minutes: -5 },
    ]

    const normalized = normalizeEditorTimelineDraftSteps(draftSteps)
    expect(normalized).toEqual([
      { label: '导入', minutes: 9 },
      { label: '讲授', minutes: 0 },
    ])

    const replacePreview = buildEditorTimelineApplyPreview('<p>已有内容</p>', draftSteps, 'replace')
    expect(replacePreview.canApply).toBe(true)
    expect(replacePreview.mode).toBe('replace')
    expect(replacePreview.stepCount).toBe(2)
    expect(replacePreview.minuteTotal).toBe(9)
    expect(replacePreview.nextProcessHtml).toContain('导入（9分钟）')
    expect(replacePreview.currentTextLength).toBeGreaterThan(0)

    const appendPreview = buildEditorTimelineApplyPreview('<p>已有内容</p>', draftSteps, 'append')
    expect(appendPreview.mode).toBe('append')
    expect(appendPreview.nextProcessHtml).toContain('已有内容')
    expect(appendPreview.nextTextLength).toBeGreaterThan(appendPreview.currentTextLength)
  })

  it('returns blocked preview when timeline draft has no valid step', () => {
    const preview = buildEditorTimelineApplyPreview('<p>已有内容</p>', [{ id: 'a', label: '   ', minutes: 0 }], 'replace')
    expect(preview.canApply).toBe(false)
    expect(preview.stepCount).toBe(0)
    expect(preview.nextProcessHtml).toBe('')
  })

  it('moves timeline steps up and down without crossing boundaries', () => {
    const steps = [
      { id: 'a', label: '导入', minutes: 8 },
      { id: 'b', label: '讲授', minutes: 25 },
      { id: 'c', label: '总结', minutes: 12 },
    ]

    const moveUp = moveEditorTimelineSteps(steps, 'b', 'up')
    expect(moveUp.map((item) => item.id)).toEqual(['b', 'a', 'c'])

    const moveDown = moveEditorTimelineSteps(steps, 'b', 'down')
    expect(moveDown.map((item) => item.id)).toEqual(['a', 'c', 'b'])

    const keepTop = moveEditorTimelineSteps(steps, 'a', 'up')
    expect(keepTop).toBe(steps)

    const keepBottom = moveEditorTimelineSteps(steps, 'c', 'down')
    expect(keepBottom).toBe(steps)
  })

  it('reorders timeline steps by drag source and drop target', () => {
    const steps = [
      { id: 'a', label: '导入', minutes: 8 },
      { id: 'b', label: '讲授', minutes: 25 },
      { id: 'c', label: '总结', minutes: 12 },
    ]

    const moved = reorderEditorTimelineSteps(steps, 'c', 'a')
    expect(moved.map((item) => item.id)).toEqual(['c', 'a', 'b'])

    const unchangedBySame = reorderEditorTimelineSteps(steps, 'b', 'b')
    expect(unchangedBySame).toBe(steps)

    const unchangedByMissing = reorderEditorTimelineSteps(steps, 'x', 'a')
    expect(unchangedByMissing).toBe(steps)
  })

  it('toggles and normalizes collapsed timeline step ids', () => {
    const collapsed = toggleEditorTimelineStepCollapsedState([], 'a')
    expect(isEditorTimelineStepCollapsedState(collapsed, 'a')).toBe(true)

    const expanded = toggleEditorTimelineStepCollapsedState(collapsed, 'a')
    expect(isEditorTimelineStepCollapsedState(expanded, 'a')).toBe(false)

    const normalized = normalizeEditorTimelineStepCollapsedState(
      ['a', 'a', 'x', 'b'],
      [{ id: 'a' }, { id: 'b' }]
    )
    expect(normalized).toEqual(['a', 'b'])
  })

  it('supports toggle-all collapsed timeline step ids', () => {
    const steps = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]

    expect(areAllEditorTimelineStepsCollapsed([], steps)).toBe(false)

    const collapseAll = toggleAllEditorTimelineStepCollapsedState([], steps)
    expect(collapseAll).toEqual(['a', 'b', 'c'])
    expect(areAllEditorTimelineStepsCollapsed(collapseAll, steps)).toBe(true)

    const expandAll = toggleAllEditorTimelineStepCollapsedState(['a', 'b', 'c'], steps)
    expect(expandAll).toEqual([])
  })

  it('toggles and normalizes selected timeline step ids', () => {
    const selected = toggleEditorTimelineStepSelectedState([], 'a')
    expect(isEditorTimelineStepSelectedState(selected, 'a')).toBe(true)

    const unselected = toggleEditorTimelineStepSelectedState(selected, 'a')
    expect(isEditorTimelineStepSelectedState(unselected, 'a')).toBe(false)

    const normalized = normalizeEditorTimelineStepSelectedState(
      ['a', 'a', 'x', 'b'],
      [{ id: 'a' }, { id: 'b' }]
    )
    expect(normalized).toEqual(['a', 'b'])
  })

  it('supports toggle-all selected timeline step ids', () => {
    const steps = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]

    expect(areAllEditorTimelineStepsSelected([], steps)).toBe(false)

    const selectAll = toggleAllEditorTimelineStepSelectedState([], steps)
    expect(selectAll).toEqual(['a', 'b', 'c'])
    expect(areAllEditorTimelineStepsSelected(selectAll, steps)).toBe(true)

    const clearAll = toggleAllEditorTimelineStepSelectedState(['a', 'b', 'c'], steps)
    expect(clearAll).toEqual([])
  })

  it('removes selected timeline steps and keeps original when all are selected', () => {
    const steps = [
      { id: 'a', label: '导入', minutes: 10 },
      { id: 'b', label: '讲授', minutes: 20 },
      { id: 'c', label: '练习', minutes: 15 },
    ]
    const removed = removeSelectedEditorTimelineSteps(steps, ['b'])
    expect(removed.map((item) => item.id)).toEqual(['a', 'c'])

    const keepOriginal = removeSelectedEditorTimelineSteps(steps, ['a', 'b', 'c'])
    expect(keepOriginal).toBe(steps)
  })

  it('redistributes selected timeline step minutes by selected total', () => {
    const steps = [
      { id: 'a', label: '导入', minutes: 10 },
      { id: 'b', label: '讲授', minutes: 20 },
      { id: 'c', label: '练习', minutes: 15 },
    ]
    const redistributed = redistributeEditorTimelineSelectedStepMinutes(steps, ['a', 'c'])
    expect(redistributed[0]?.minutes).toBe(13)
    expect(redistributed[2]?.minutes).toBe(12)
    expect(redistributed[1]?.minutes).toBe(20)
  })

  it('aligns selected timeline step minutes to duration while keeping unselected fixed', () => {
    const steps = [
      { id: 'a', label: '导入', minutes: 10 },
      { id: 'b', label: '讲授', minutes: 20 },
      { id: 'c', label: '练习', minutes: 15 },
    ]
    const aligned = redistributeEditorTimelineSelectedStepMinutesToDuration(steps, ['a', 'c'], 60)
    expect(aligned[1]?.minutes).toBe(20)
    expect((aligned[0]?.minutes || 0) + (aligned[2]?.minutes || 0)).toBe(40)
    expect(aligned.reduce((sum, item) => sum + item.minutes, 0)).toBe(60)
  })

  it('adjusts selected timeline step minutes with upper/lower bounds', () => {
    const steps = [
      { id: 'a', label: '导入', minutes: 10 },
      { id: 'b', label: '讲授', minutes: 2 },
      { id: 'c', label: '练习', minutes: 15 },
    ]
    const plus = adjustEditorTimelineSelectedStepMinutes(steps, ['a', 'b'], 5)
    expect(plus[0]?.minutes).toBe(15)
    expect(plus[1]?.minutes).toBe(7)
    expect(plus[2]?.minutes).toBe(15)

    const minus = adjustEditorTimelineSelectedStepMinutes(steps, ['a', 'b'], -5)
    expect(minus[0]?.minutes).toBe(5)
    expect(minus[1]?.minutes).toBe(0)
    expect(minus[2]?.minutes).toBe(15)
  })

  it('autofills empty timeline labels for selected steps only', () => {
    const steps = [
      { id: 'a', label: '', minutes: 10 },
      { id: 'b', label: '讲授', minutes: 20 },
      { id: 'c', label: ' ', minutes: 15 },
    ]
    const selectedOnly = autofillEditorTimelineDraftStepLabels(steps, ['c'])
    expect(selectedOnly[0]?.label).toBe('')
    expect(selectedOnly[2]?.label).toBe('环节3')

    const all = autofillEditorTimelineDraftStepLabels(steps, [])
    expect(all[0]?.label).toBe('环节1')
    expect(all[2]?.label).toBe('环节3')
  })

  it('builds timeline apply preview diff with changed line highlights', () => {
    const diff = buildEditorTimelineApplyPreviewDiff(
      '<p>导入（10分钟）</p><p>旧内容</p>',
      '<p>导入（10分钟）</p><p>讲授（30分钟）</p>'
    )
    expect(diff.before.some((item) => item.changed)).toBe(true)
    expect(diff.after.some((item) => item.changed)).toBe(true)
    expect(diff.changedCount).toBeGreaterThan(0)
  })

  it('clones timeline draft steps and detects changes', () => {
    const steps = [
      { id: 'a', label: '导入', minutes: 10 },
      { id: 'b', label: '讲授', minutes: 20 },
    ]
    const cloned = cloneEditorTimelineDraftSteps(steps)
    expect(cloned).toEqual(steps)
    expect(cloned).not.toBe(steps)
    expect(hasEditorTimelineDraftStepChanges(steps, cloned)).toBe(false)
    expect(
      hasEditorTimelineDraftStepChanges(steps, [
        { id: 'a', label: '导入', minutes: 12 },
        { id: 'b', label: '讲授', minutes: 18 },
      ])
    ).toBe(true)
  })

  it('pushes timeline undo snapshots with change detection and limit', () => {
    const previous = [{ id: 'a', label: '导入', minutes: 10 }]
    const next = [{ id: 'a', label: '导入', minutes: 12 }]
    const unchanged = pushEditorTimelineDraftUndoStack([], previous, previous)
    expect(unchanged).toEqual([])

    const changed = pushEditorTimelineDraftUndoStack([], previous, next, 2)
    expect(changed).toEqual([[{ id: 'a', label: '导入', minutes: 10 }]])

    const limited = pushEditorTimelineDraftUndoStack(
      [
        [{ id: 'x', label: 'x', minutes: 1 }],
        [{ id: 'y', label: 'y', minutes: 2 }],
      ],
      previous,
      next,
      2
    )
    expect(limited.length).toBe(2)
    expect(limited[0]?.[0]?.id).toBe('y')
  })

  it('aligns timeline steps minutes to duration while keeping labels', () => {
    const steps = [
      { label: '导入', minutes: 5 },
      { label: '讲授', minutes: 15 },
      { label: '训练', minutes: 10 },
    ]
    const aligned = alignEditorTimelineStepsToDuration(steps, 60)
    expect(aligned.map((step) => step.label)).toEqual(['导入', '讲授', '训练'])
    expect(aligned.reduce((sum, step) => sum + step.minutes, 0)).toBe(60)

    const allZeroAligned = alignEditorTimelineStepsToDuration(
      [
        { label: '导入', minutes: 0 },
        { label: '讲授', minutes: 0 },
      ],
      30
    )
    expect(allZeroAligned.reduce((sum, step) => sum + step.minutes, 0)).toBe(30)
  })

  it('shows template panel only when enabled and not in focus mode', () => {
    expect(shouldShowEditorTemplatePanel(true, false)).toBe(true)
    expect(shouldShowEditorTemplatePanel(true, true)).toBe(false)
    expect(shouldShowEditorTemplatePanel(false, false)).toBe(false)
  })

  it('toggles collapsible editor sections in state', () => {
    const collapsed = toggleEditorSectionCollapsedState([], 'objectives')
    expect(isEditorSectionCollapsedInState(collapsed, 'objectives')).toBe(true)

    const expanded = toggleEditorSectionCollapsedState(collapsed, 'objectives')
    expect(isEditorSectionCollapsedInState(expanded, 'objectives')).toBe(false)
  })

  it('ignores collapse operations for non-collapsible basic section', () => {
    const collapsed = setEditorSectionCollapsedState([], 'basic', true)
    expect(collapsed).toEqual([])
  })

  it('normalizes and persists editor view preference payload', () => {
    const normalized = normalizeEditorCollapsibleSections([
      'process',
      'process',
      'unknown',
      'objectives',
    ])
    expect(normalized).toEqual(['process', 'objectives'])

    const serialized = serializeEditorViewPreference({
      focusMode: true,
      collapsedSections: ['process', 'objectives'],
      activeLayoutTab: 'design',
    })
    const parsed = parseEditorViewPreference(serialized)
    expect(parsed).toEqual({
      focusMode: true,
      collapsedSections: ['process', 'objectives'],
      activeLayoutTab: 'design',
    })
  })

  it('returns null for invalid editor view preference payload', () => {
    expect(parseEditorViewPreference(null)).toBeNull()
    expect(parseEditorViewPreference('{"focusMode":"yes"}')).toBeNull()
  })

  it('normalizes invalid active layout tab to basic', () => {
    expect(normalizeEditorLayoutTab('design')).toBe('design')
    expect(normalizeEditorLayoutTab('unknown')).toBe('basic')
    expect(
      parseEditorViewPreference(
        JSON.stringify({
          focusMode: false,
          collapsedSections: [],
          activeLayoutTab: 'mystery',
        })
      )
    ).toEqual({
      focusMode: false,
      collapsedSections: [],
      activeLayoutTab: 'basic',
    })
  })

  it('maps editor sections to layout tabs for tabbed editing flow', () => {
    expect(resolveEditorLayoutTabBySection('basic')).toBe('basic')
    expect(resolveEditorLayoutTabBySection('objectives')).toBe('design')
    expect(resolveEditorLayoutTabBySection('keyPoints')).toBe('design')
    expect(resolveEditorLayoutTabBySection('process')).toBe('process')
    expect(resolveEditorLayoutTabBySection('blackboard')).toBe('review')
    expect(resolveEditorLayoutTabBySection('reflection')).toBe('review')
  })

  it('resolves focus section by selected layout tab', () => {
    expect(resolveEditorSectionForLayoutTab('design', 'basic')).toBe('objectives')
    expect(resolveEditorSectionForLayoutTab('design', 'keyPoints')).toBe('keyPoints')
    expect(resolveEditorSectionForLayoutTab('review', 'process')).toBe('blackboard')
  })

  it('builds layout tab summaries from section completion items', () => {
    const summaries = buildEditorLayoutTabSummaries([
      {
        section: 'basic',
        label: '基本信息',
        filledCount: 4,
        totalCount: 6,
        requiredMissingLabels: ['课时长度'],
        status: 'partial',
        progress: 67,
      },
      {
        section: 'objectives',
        label: '教学目标',
        filledCount: 1,
        totalCount: 1,
        requiredMissingLabels: [],
        status: 'complete',
        progress: 100,
      },
      {
        section: 'keyPoints',
        label: '重点难点',
        filledCount: 0,
        totalCount: 1,
        requiredMissingLabels: [],
        status: 'empty',
        progress: 0,
      },
      {
        section: 'process',
        label: '教学过程',
        filledCount: 1,
        totalCount: 1,
        requiredMissingLabels: [],
        status: 'complete',
        progress: 100,
      },
      {
        section: 'blackboard',
        label: '板书设计',
        filledCount: 0,
        totalCount: 1,
        requiredMissingLabels: [],
        status: 'empty',
        progress: 0,
      },
      {
        section: 'reflection',
        label: '教学反思',
        filledCount: 1,
        totalCount: 1,
        requiredMissingLabels: [],
        status: 'complete',
        progress: 100,
      },
    ])

    expect(summaries.map((item) => item.id)).toEqual(['basic', 'design', 'process', 'review'])
    expect(summaries.find((item) => item.id === 'basic')).toMatchObject({
      filledCount: 4,
      totalCount: 6,
      requiredMissingCount: 1,
    })
    expect(summaries.find((item) => item.id === 'design')).toMatchObject({
      filledCount: 1,
      totalCount: 2,
      requiredMissingCount: 0,
    })
    expect(summaries.find((item) => item.id === 'review')).toMatchObject({
      filledCount: 1,
      totalCount: 2,
      requiredMissingCount: 0,
    })
  })

  it('resolves active editor section from viewport positions', () => {
    expect(
      resolveActiveEditorSectionFromViewport(
        [
          { section: 'basic', top: 120 },
          { section: 'objectives', top: 520 },
          { section: 'keyPoints', top: 860 },
        ],
        null,
        160
      )
    ).toBe('basic')

    expect(
      resolveActiveEditorSectionFromViewport(
        [
          { section: 'basic', top: -780 },
          { section: 'objectives', top: -120 },
          { section: 'keyPoints', top: 260 },
          { section: 'process', top: 680 },
        ],
        'basic',
        160
      )
    ).toBe('objectives')

    expect(
      resolveActiveEditorSectionFromViewport(
        [
          { section: 'basic', top: -1200 },
          { section: 'objectives', top: -700 },
          { section: 'keyPoints', top: -300 },
          { section: 'process', top: -40 },
        ],
        'basic',
        160
      )
    ).toBe('process')

    expect(resolveActiveEditorSectionFromViewport([], 'reflection', 160)).toBe('reflection')
  })
})
