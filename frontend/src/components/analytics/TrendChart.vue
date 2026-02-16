<template>
  <div class="chart-container" ref="chartRef" style="width: 100%; height: 100%;"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  data: { month: string; count: number }[]
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
      trigger: 'axis',
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
      boundaryGap: false,
      data: props.data.map(item => item.month),
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
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        sampling: 'average',
        itemStyle: { color: '#D97706' },
        areaStyle: {
          color: new (echarts as any).graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(217, 119, 6, 0.4)' },
            { offset: 1, color: 'rgba(217, 119, 6, 0.05)' }
          ])
        },
        lineStyle: { color: '#D97706', width: 3 },
        data: props.data.map(item => item.count)
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
