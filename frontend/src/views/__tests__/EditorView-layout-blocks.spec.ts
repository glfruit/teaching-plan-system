import { describe, it, expect } from 'vitest'
import {
  applyTemplateToForm,
  applyTemplateWithConfirmation,
  buildTemplateUpdatePayload,
  resolveTemplateEditSubmission,
  buildPlanPayload,
  mapFetchedPlanToForm,
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
})
