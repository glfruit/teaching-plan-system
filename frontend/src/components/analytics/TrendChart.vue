<template>
  <div ref="chartRef" style="width: 100%; height: 100%;"></div>
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
      formatter: '{b}: {c} 个'
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
      boundaryGap: false,
      data: props.data.map(item => item.month),
      axisLine: { 
        lineStyle: { color: '#e5e5e5' } 
      },
      axisLabel: { 
        color: '#525252',
        fontSize: 11
      },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { 
        color: '#525252',
        fontSize: 11
      },
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
        type: 'line',
        smooth: false,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { 
          color: '#647269',
          borderWidth: 2,
          borderColor: '#fff'
        },
        areaStyle: {
          color: 'rgba(100, 114, 105, 0.12)'
        },
        lineStyle: { 
          color: '#647269', 
          width: 2 
        },
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
