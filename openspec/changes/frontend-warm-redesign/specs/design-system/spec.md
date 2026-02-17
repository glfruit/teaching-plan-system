# Design System Spec

## Overview

温暖色系设计系统规范，定义教案管理系统的视觉语言。

## Requirements

### REQ-001: 色彩系统

**必须**定义完整的色彩系统：

```css
/* 主色调 - 琥珀色系 */
--color-primary-50: 255 251 240;    /* #FFFBF0 */
--color-primary-100: 254 243 199;   /* #FEF3C7 */
--color-primary-200: 253 230 138;   /* #FDE68A */
--color-primary-300: 252 211 77;    /* #FCD34D */
--color-primary-400: 251 191 36;    /* #FBBF24 */
--color-primary-500: 245 158 11;    /* #F59E0B */
--color-primary-600: 217 119 6;     /* #D97706 - Primary */
--color-primary-700: 180 83 9;      /* #B45309 */
--color-primary-800: 146 64 14;     /* #92400E */
--color-primary-900: 120 53 15;     /* #78350F */

/* 辅助色 */
--color-secondary: 249 115 22;      /* Orange 500 */
--color-tertiary: 244 63 94;        /* Rose 500 */

/* 功能色 */
--color-success: 5 150 105;         /* Emerald 600 */
--color-warning: 217 119 6;         /* Amber 600 */
--color-error: 220 38 38;           /* Red 600 */
--color-info: 37 99 235;            /* Blue 600 */
```

### REQ-002: 文字颜色

**必须**定义文字色彩系统：

```css
--text-primary: 69 26 3;            /* 暖棕色 #451A03 */
--text-secondary: 120 53 15;        /* Amber 900 */
--text-muted: 161 98 7;             /* Amber 700 */
--text-inverse: 255 255 255;        /* 白色 */
```

### REQ-003: 背景颜色

**必须**定义背景色彩系统：

```css
--bg-cream: 255 251 240;            /* 主背景 #FFFBF0 */
--bg-warm-white: 254 252 248;       /* 卡片背景 */
--bg-card: 255 255 255;             /* 纯白卡片 */
--bg-hover: 254 243 199;            /* 悬停背景 */
```

### REQ-004: 边框与阴影

**必须**定义边框和阴影系统：

```css
/* 边框 */
--border-light: 253 230 138;        /* Amber 200 */
--border-medium: 251 191 36;        /* Amber 400 */

/* 阴影（带暖色 tint） */
--shadow-sm: 0 1px 2px 0 rgb(217 119 6 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(217 119 6 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(217 119 6 / 0.1);
--shadow-warm: 0 4px 20px -2px rgb(217 119 6 / 0.15);
--shadow-warm-lg: 0 10px 40px -4px rgb(217 119 6 / 0.2);
```

### REQ-005: 字体系统

**必须**定义字体系统：

```css
/* 字体家族 */
--font-display: 'Noto Serif SC', 'Source Han Serif CN', Georgia, serif;
--font-body: 'Inter', 'Noto Sans SC', -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* 字体大小 */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */

/* 字重 */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* 行高 */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

### REQ-006: 间距系统

**必须**使用 8px 网格系统：

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### REQ-007: 圆角系统

**必须**定义圆角规范：

```css
--radius-sm: 0.5rem;    /* 8px */
--radius-md: 0.75rem;   /* 12px */
--radius-lg: 1rem;      /* 16px */
--radius-xl: 1.5rem;    /* 24px */
--radius-full: 9999px;
```

## Implementation Notes

1. 所有颜色使用 RGB 格式以便 Tailwind CSS opacity 支持
2. 字体通过 Google Fonts CDN 加载
3. CSS 变量定义在 `styles/variables.css`
4. Tailwind 配置通过 `theme.extend` 扩展
