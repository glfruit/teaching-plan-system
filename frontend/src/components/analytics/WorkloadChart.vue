<template>
  <div class="chart-container" ref="chartRef" style="width: 100%; height: 400px;"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  data: { teacherId: string; name: string; planCount: number }[]
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
    title: {
      text: 'Teacher Workload'
    },
    tooltip: {},
    xAxis: {
      data: props.data.map(item => item.name)
    },
    yAxis: {},
    series: [
      {
        name: 'Plans',
        type: 'bar',
        data: props.data.map(item => item.planCount)
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
