<template>
  <div class="chart-loader flex items-center justify-center h-64 bg-gray-50 rounded border border-gray-100">
    <div class="text-center">
      <div class="spinner animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
      <span class="text-gray-500 text-sm">Loading chart...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// Simple loading placeholder for charts
</script>

<style scoped>
.spinner {
  border-top: 2px solid transparent;
  border-left: 2px solid transparent;
  border-right: 2px solid transparent;
}
</style>
