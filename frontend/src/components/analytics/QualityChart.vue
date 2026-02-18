<template>
  <div ref="chartRef" style="width: 100%; height: 100%;"></div>
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
      formatter: '{b}: {c} 分'
    },
    radar: {
      indicator: props.data.map(item => ({ name: item.metric, max: 100 })),
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: '#525252',
        fontSize: 12
      },
      splitLine: {
        lineStyle: { color: '#e5e5e5' }
      },
      splitArea: {
        areaStyle: {
          color: ['#fafafa', '#f5f5f5', '#f5f5f5', '#fafafa']
        }
      },
      axisLine: {
        lineStyle: { color: '#e5e5e5' }
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
              color: 'rgba(100, 114, 105, 0.2)'
            },
            lineStyle: { 
              color: '#647269', 
              width: 2 
            },
            itemStyle: { 
              color: '#647269'
            }
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
