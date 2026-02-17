<template>
  <router-view v-slot="{ Component, route }">
    <Transition
      mode="out-in"
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <component :is="Component" :key="route.fullPath" />
    </Transition>
  </router-view>
</template>

<script setup lang="ts"></script>
