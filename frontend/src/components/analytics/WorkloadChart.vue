<template>
  <div class="chart-container" ref="chartRef" style="width: 100%; height: 100%;"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  data: { teacherId: string; name: string; planCount: number }[]
}>()

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

// 温暖色系配色
const warmColors = ['#D97706', '#F97316', '#F43F5E', '#F59E0B', '#FB923C', '#FCA5A5']

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
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255, 251, 240, 0.95)',
      borderColor: '#FDE68A',
      textStyle: { color: '#451A03' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.data.map(item => item.name),
      axisLine: { lineStyle: { color: '#FDE68A' } },
      axisLabel: { color: '#78350F' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#FDE68A' } },
      axisLabel: { color: '#78350F' },
      splitLine: { lineStyle: { color: '#FEF3C7' } }
    },
    series: [
      {
        name: '教案数',
        type: 'bar',
        data: props.data.map((item, index) => ({
          value: item.planCount,
          itemStyle: {
            color: new (echarts as any).graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#FBBF24' },
              { offset: 1, color: '#D97706' }
            ])
          }
        })),
        barWidth: '60%',
        borderRadius: [8, 8, 0, 0]
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
