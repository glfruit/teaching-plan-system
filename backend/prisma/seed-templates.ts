import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const systemTemplates = [
  {
    name: '理论课模板',
    description: '适用于理论讲授类课程',
    category: 'THEORY',
    isSystem: true,
    structure: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '一、教学目标' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '【填写教学目标】' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '二、教学重点与难点' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '【填写重点难点】' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '三、教学过程' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '【填写教学过程】' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '四、板书设计' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '【填写板书设计】' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '五、教学反思' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '【填写教学反思】' }] },
      ],
    },
  },
  {
    name: '实验课模板',
    description: '适用于实验操作类课程',
    category: 'EXPERIMENT',
    isSystem: true,
    structure: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '一、实验目的' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '【填写实验目的】' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '二、实验器材' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '【填写实验器材】' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '三、实验原理' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '【填写实验原理】' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '四、实验步骤' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '【填写实验步骤】' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '五、实验结果与分析' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '【填写实验结果与分析】' }] },
      ],
    },
  },
  {
    name: '实训课模板',
    description: '适用于技能实训类课程',
    category: 'PRACTICE',
    isSystem: true,
    structure: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '一、实训任务' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '【填写实训任务】' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '二、实训要求' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '【填写实训要求】' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '三、实训准备' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '【填写实训准备】' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '四、实训过程' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '【填写实训过程】' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '五、考核评价' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '【填写考核评价】' }] },
      ],
    },
  }
]

async function main() {
  for (const template of systemTemplates) {
    // Check if exists to prevent duplicates on multiple runs
    const existing = await prisma.teachingTemplate.findFirst({
      where: {
        name: template.name,
        isSystem: true,
      }
    })
    
    if (!existing) {
      await prisma.teachingTemplate.create({
        data: {
          ...template,
          category: template.category as any, // Cast to enum
          creatorId: 'system',
        },
      })
      console.log(`Created template: ${template.name}`)
    } else {
      console.log(`Template already exists: ${template.name}`)
    }
  }
  console.log('System templates seeded')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
