# Component Library Spec

## Overview

重新设计的 Vue 3 组件库，遵循温暖色系设计系统。

## Components

### CMP-001: BaseButton

**Props:**
| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| variant | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | 按钮样式变体 |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | 按钮尺寸 |
| disabled | `boolean` | `false` | 禁用状态 |
| loading | `boolean` | `false` | 加载状态 |

**样式规范:**

```vue
<!-- Primary -->
<button class="
  px-6 py-3 
  bg-amber-600 hover:bg-amber-700 active:bg-amber-800
  text-white font-medium
  rounded-lg 
  shadow-warm hover:shadow-warm-lg
  transition-all duration-300
  active:scale-95
  disabled:opacity-50 disabled:cursor-not-allowed
">

<!-- Secondary -->
<button class="
  px-6 py-3 
  bg-white hover:bg-amber-50
  text-amber-700 font-medium
  border border-amber-200
  rounded-lg
  transition-all duration-300
">

<!-- Ghost -->
<button class="
  px-4 py-2 
  text-amber-700 hover:text-amber-800
  hover:bg-amber-100
  rounded-md
  transition-colors duration-200
">

<!-- Danger -->
<button class="
  px-6 py-3 
  bg-red-600 hover:bg-red-700
  text-white font-medium
  rounded-lg
  transition-all duration-300
">
```

### CMP-002: BaseCard

**Props:**
| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| padding | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | 内边距 |
| hoverable | `boolean` | `false` | 悬停效果 |
| shadow | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | 阴影大小 |

**样式规范:**

```vue
<div class="
  bg-white 
  rounded-xl 
  border border-amber-100
  shadow-warm
  p-6
  transition-all duration-300
  { hoverable && 'hover:shadow-warm-lg hover:-translate-y-1' }
">
```

### CMP-003: BaseInput

**Props:**
| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | `string` | `''` | 输入值 |
| type | `string` | `'text'` | 输入类型 |
| placeholder | `string` | `''` | 占位文本 |
| disabled | `boolean` | `false` | 禁用状态 |
| error | `string` | `''` | 错误信息 |

**样式规范:**

```vue
<div>
  <input class="
    w-full px-4 py-3
    bg-warm-50
    border border-amber-200 rounded-lg
    text-warm-900 placeholder-warm-400
    focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500
    transition-all duration-200
    disabled:bg-warm-100 disabled:cursor-not-allowed
  ">
  <p v-if="error" class="mt-1.5 text-sm text-red-600">{{ error }}</p>
</div>
```

### CMP-004: BaseBadge

**Props:**
| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| variant | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'default'` | 样式变体 |
| size | `'sm' \| 'md'` | `'md'` | 尺寸 |

**样式规范:**

```vue
<!-- Default -->
<span class="px-2.5 py-1 text-xs font-medium rounded-full bg-warm-100 text-warm-800">

<!-- Primary -->
<span class="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">

<!-- Success -->
<span class="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">

<!-- Warning -->
<span class="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">

<!-- Danger -->
<span class="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
```

### CMP-005: NavBar

**样式规范:**

```vue
<nav class="
  sticky top-0 z-50
  bg-white/80 backdrop-blur-md
  border-b border-amber-100
">
  <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
    <!-- Logo area -->
    <div class="flex items-center gap-3">
      <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 
                  flex items-center justify-center shadow-warm">
        <!-- Icon -->
      </div>
      <div>
        <h1 class="font-display text-xl font-bold text-warm-900">教案管理系统</h1>
        <p class="text-xs text-warm-600">教师工作台</p>
      </div>
    </div>
    
    <!-- Actions -->
    <div class="flex items-center gap-3">
      <!-- User info, buttons -->
    </div>
  </div>
</nav>
```

### CMP-006: PageHeader

**Props:**
| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | `string` | required | 页面标题 |
| subtitle | `string` | `''` | 副标题 |
| backLink | `string` | `''` | 返回链接 |

**样式规范:**

```vue
<header class="mb-8">
  <p v-if="superTitle" class="text-xs font-semibold uppercase tracking-wider text-amber-700">
    {{ superTitle }}
  </p>
  <h1 class="font-display text-3xl font-bold text-warm-900 mt-2">{{ title }}</h1>
  <p v-if="subtitle" class="mt-2 text-warm-600">{{ subtitle }}</p>
</header>
```

### CMP-007: StatCard

**Props:**
| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| label | `string` | required | 标签 |
| value | `string \| number` | required | 数值 |
| trend | `'up' \| 'down' \| null` | `null` | 趋势 |
| trendValue | `string` | `''` | 趋势值 |

**样式规范:**

```vue
<BaseCard class="p-5">
  <p class="text-sm text-warm-600">{{ label }}</p>
  <p class="mt-2 text-4xl font-bold text-warm-900">{{ value }}</p>
  <div v-if="trend" class="mt-2 flex items-center gap-1">
    <TrendIcon :direction="trend" />
    <span :class="trend === 'up' ? 'text-emerald-600' : 'text-red-600'">
      {{ trendValue }}
    </span>
  </div>
</BaseCard>
```

## Usage Patterns

```vue
<template>
  <div class="space-y-6">
    <PageHeader 
      title="我的教案" 
      subtitle="管理和创建您的教学计划"
    />
    
    <div class="grid grid-cols-3 gap-4">
      <StatCard label="总教案数" value="24" />
      <StatCard label="草稿" value="6" trend="up" trendValue="+2" />
      <StatCard label="已发布" value="18" />
    </div>
    
    <BaseCard hoverable>
      <BaseInput 
        v-model="search"
        placeholder="搜索教案..."
      />
    </BaseCard>
  </div>
</template>
```
