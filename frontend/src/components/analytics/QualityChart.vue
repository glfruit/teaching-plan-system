<template>
  <div class="chart-container" ref="chartRef" style="width: 100%; height: 100%;"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  data: { metric: string; score: number }[]
}>()

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const initChart = () => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
    updateChart()
  }
}

const updateChart = () => {
  if (!chart) return

  const option = {
    tooltip: {
      backgroundColor: 'rgba(255, 251, 240, 0.95)',
      borderColor: '#FDE68A',
      textStyle: { color: '#451A03' }
    },
    radar: {
      indicator: props.data.map(item => ({ name: item.metric, max: 100 })),
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: '#78350F',
        fontSize: 12
      },
      splitLine: {
        lineStyle: { color: '#FDE68A' }
      },
      splitArea: {
        areaStyle: {
          color: ['#FFFBF0', '#FEF3C7', '#FEF3C7', '#FFFBF0']
        }
      },
      axisLine: {
        lineStyle: { color: '#FDE68A' }
      }
    },
    series: [
      {
        name: '质量评分',
        type: 'radar',
        data: [
          {
            value: props.data.map(item => item.score),
            name: '当前教案',
            areaStyle: {
              color: new (echarts as any).graphic.RadialGradient(0.5, 0.5, 1, [
                { offset: 0, color: 'rgba(217, 119, 6, 0.3)' },
                { offset: 1, color: 'rgba(217, 119, 6, 0.1)' }
              ])
            },
            lineStyle: { color: '#D97706', width: 2 },
            itemStyle: { color: '#D97706' }
          }
        ]
      }
    ]
  }
  chart.setOption(option)
}

onMounted(() => {
  initChart()
})

watch(() => props.data, () => {
  updateChart()
}, { deep: true })

onUnmounted(() => {
  if (chart) {
    chart.dispose()
  }
})
</script>
