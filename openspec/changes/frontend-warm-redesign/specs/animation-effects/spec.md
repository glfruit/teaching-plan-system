# Animation Effects Spec

## Overview

动效与交互系统规范，提升用户体验但不喧宾夺主。

## Principles

1. **有目的性**: 每个动效都应有明确的功能目的
2. **有节制**: 动效应该微妙，不分散注意力
3. **高性能**: 优先使用 CSS 动画，避免布局抖动
4. **可访问**: 支持 prefers-reduced-motion

## Animations

### ANM-001: 页面过渡

**触发:** 路由切换时

**效果:** 淡入 + 轻微上移

```css
.page-enter-active {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-enter-to {
  opacity: 1;
  transform: translateY(0);
}
```

**Vue Transition:**
```vue
<Transition 
  enter-active-class="transition-all duration-300 ease-out"
  enter-from-class="opacity-0 translate-y-2"
  enter-to-class="opacity-100 translate-y-0"
>
  <RouterView />
</Transition>
```

### ANM-002: 卡片悬停

**触发:** 鼠标悬停在卡片上

**效果:** 轻微上浮 + 阴影增强

```css
.card-hover {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 40px -4px rgb(217 119 6 / 0.2);
}
```

**Tailwind:**
```
class="transition-all duration-300 hover:-translate-y-1 hover:shadow-warm-lg"
```

### ANM-003: 按钮交互

**触发:** 按钮悬停/点击

**效果:**
- 悬停: 背景色变深 + 阴影增强
- 点击: 轻微缩小 (scale-95)

```css
.btn-interactive {
  transition: all 0.2s ease;
}
.btn-interactive:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px -2px rgb(217 119 6 / 0.2);
}
.btn-interactive:active {
  transform: scale(0.95);
}
```

### ANM-004: 输入框聚焦

**触发:** 输入框获得焦点

**效果:** 边框颜色变化 + 柔和光晕

```css
.input-focus {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.input-focus:focus {
  border-color: #D97706;
  box-shadow: 0 0 0 3px rgb(217 119 6 / 0.1);
}
```

**Tailwind:**
```
class="focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200"
```

### ANM-005: 列表项进入

**触发:** 列表数据加载时

**效果:** 依次淡入 + 上移（staggered）

```vue
<TransitionGroup 
  enter-active-class="transition-all duration-300 ease-out"
  enter-from-class="opacity-0 translate-y-4"
  enter-to-class="opacity-100 translate-y-0"
>
  <div v-for="(item, index) in items" :key="item.id" :style="{ transitionDelay: `${index * 50}ms` }">
    <!-- Item content -->
  </div>
</TransitionGroup>
```

### ANM-006: 加载骨架屏

**触发:** 数据加载中

**效果:** 脉冲动画

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.skeleton {
  background: linear-gradient(90deg, #FEF3C7 25%, #FDE68A 50%, #FEF3C7 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### ANM-007: 模态框/对话框

**触发:** 模态框打开/关闭

**效果:**
- 背景: 淡入
- 内容: 缩放 + 淡入

```css
.modal-backdrop-enter {
  opacity: 0;
}
.modal-backdrop-enter-active {
  opacity: 1;
  transition: opacity 0.2s ease;
}
.modal-content-enter {
  opacity: 0;
  transform: scale(0.95);
}
.modal-content-enter-active {
  opacity: 1;
  transform: scale(1);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
```

### ANM-008: 数字变化

**触发:** 统计数据更新

**效果:** 数字滚动效果（可选）

```vue
<template>
  <span class="tabular-nums">{{ displayValue }}</span>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ value: Number })
const displayValue = ref(props.value)

watch(() => props.value, (newVal, oldVal) => {
  const duration = 500
  const start = oldVal || 0
  const end = newVal
  const startTime = performance.now()
  
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeProgress = 1 - Math.pow(1 - progress, 3) // ease-out-cubic
    displayValue.value = Math.round(start + (end - start) * easeProgress)
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  
  requestAnimationFrame(animate)
})
</script>
```

### ANM-009: 装饰背景动画

**触发:** 页面加载完成

**效果:** 缓慢漂浮的有机形状

```css
@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -30px) rotate(2deg); }
  66% { transform: translate(-20px, 20px) rotate(-2deg); }
}
.floating-shape {
  animation: float 20s ease-in-out infinite;
}
.floating-shape-delayed {
  animation: float 25s ease-in-out infinite;
  animation-delay: -5s;
}
```

## Accessibility

### 减少动效支持

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Vue 实现:**
```vue
<script setup>
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
</script>

<Transition 
  :enter-active-class="prefersReducedMotion ? '' : 'transition-all duration-300'"
  enter-from-class="opacity-0"
  enter-to-class="opacity-100"
>
  <!-- Content -->
</Transition>
```

## Duration Guidelines

| 类型 | 时长 | 缓动函数 |
|------|------|----------|
| 微交互（hover） | 150-200ms | ease |
| 按钮点击 | 100ms | ease-out |
| 页面过渡 | 300-400ms | ease-out |
| 模态框 | 200-300ms | cubic-bezier(0.16, 1, 0.3, 1) |
| 列表 stagger | 50ms 延迟 | ease-out |
| 背景装饰 | 15-25s | ease-in-out |

## Performance Best Practices

1. **仅使用 transform 和 opacity** - 避免触发 layout/paint
2. **使用 will-change 谨慎** - 仅对频繁动画的元素
3. **避免 box-shadow 动画** - 如需动画阴影，使用伪元素
4. **使用 CSS 动画优先** - 比 JS 动画性能更好
5. **限制同时动画数量** - 避免过多元素同时动画
