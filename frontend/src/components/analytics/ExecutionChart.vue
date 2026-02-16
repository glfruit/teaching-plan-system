<template>
  <div class="chart-container" ref="chartRef" style="width: 100%; height: 100%;"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  data: { status: string; count: number }[]
}>()

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const warmColors = ['#D97706', '#059669', '#64748B', '#F97316']

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
      trigger: 'item',
      backgroundColor: 'rgba(255, 251, 240, 0.95)',
      borderColor: '#FDE68A',
      textStyle: { color: '#451A03' }
    },
    legend: {
      bottom: '0%',
      textStyle: { color: '#78350F' }
    },
    series: [
      {
        name: '状态分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#FFFBF0',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#451A03'
          }
        },
        labelLine: { show: false },
        data: props.data.map((item, index) => ({
          value: item.count,
          name: item.status,
          itemStyle: { color: warmColors[index % warmColors.length] }
        }))
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
