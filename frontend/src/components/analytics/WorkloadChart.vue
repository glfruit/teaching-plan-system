<template>
  <div ref="chartRef" class="chart-container w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  data: { teacherId: string; name: string; planCount: number }[]
}>()

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const colors = ['#647269', '#7b8e84', '#95a89e', '#b7c6bc', '#a16207', '#d97706']

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
      formatter: '{b}: {c} 个教案'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.data.map(item => item.name),
      axisLine: { lineStyle: { color: '#e5e5e5' } },
      axisLabel: { 
        color: '#525252',
        interval: 0,
        rotate: props.data.length > 5 ? 30 : 0
      },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#525252' },
      splitLine: { 
        lineStyle: { 
          color: '#f5f5f5',
          type: 'dashed'
        } 
      }
    },
    series: [
      {
        name: '教案数',
        type: 'bar',
        data: props.data.map((item, index) => ({
          value: item.planCount,
          itemStyle: {
            color: colors[index % colors.length]
          }
        })),
        barWidth: '50%'
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
