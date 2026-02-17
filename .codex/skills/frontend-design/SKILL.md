---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces for the Teaching Plan System. Use when the user asks to redesign, refactor, or build web components, pages, or applications. Generates creative, polished Vue 3 + Tailwind CSS code with warm color palette, modern simplicity, and professional elegance.
---

This skill guides creation of distinctive, production-grade frontend interfaces for the Teaching Plan Management System (教案管理系统) - a platform for vocational college teachers to create and manage teaching plans.

## Design Philosophy

**温暖色系 · 现代简洁 · 专业大方**

### Warm Color Palette (温暖色系)

The design embraces a warm, inviting color scheme that feels professional yet approachable:

```css
:root {
  /* Primary Warm Colors */
  --warm-primary: #D97706;        /* Amber 600 - Main action color */
  --warm-primary-light: #FCD34D;  /* Amber 300 - Highlights */
  --warm-primary-dark: #B45309;   /* Amber 700 - Hover states */
  
  /* Secondary Warm Tones */
  --warm-secondary: #F97316;      /* Orange 500 - Accent */
  --warm-tertiary: #F43F5E;       /* Rose 500 - Special emphasis */
  
  /* Background Colors */
  --bg-cream: #FFFBF0;            /* Warm cream background */
  --bg-warm-white: #FEFCF8;       /* Soft warm white */
  --bg-card: #FFFFFF;             /* Pure white for cards */
  
  /* Neutral Warm Grays */
  --text-primary: #451A03;        /* Warm brown - Primary text */
  --text-secondary: #78350F;      /* Amber 900 - Secondary text */
  --text-muted: #A16207;          /* Muted warm text */
  --border-warm: #FDE68A;         /* Amber 200 - Borders */
  
  /* Success/Warning/Error in Warm Tones */
  --success: #059669;             /* Emerald 600 */
  --warning: #D97706;             /* Amber 600 */
  --error: #DC2626;               /* Red 600 */
  
  /* Gradients */
  --gradient-warm: linear-gradient(135deg, #FCD34D 0%, #F97316 50%, #F43F5E 100%);
  --gradient-soft: linear-gradient(180deg, #FFFBF0 0%, #FEF3C7 100%);
  --gradient-card: linear-gradient(145deg, #FFFFFF 0%, #FFFBF0 100%);
}
```

### Typography (排版)

**Font Stack:**
```css
/* Display/Headings - Distinctive serif for elegance */
--font-display: 'Noto Serif SC', 'Source Han Serif CN', Georgia, serif;

/* Body - Clean sans-serif for readability */
--font-body: 'Inter', 'Noto Sans SC', -apple-system, sans-serif;

/* Monospace - For code/editor */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

**Type Scale:**
- H1: 2.25rem (36px) - font-display, font-bold
- H2: 1.875rem (30px) - font-display, font-semibold
- H3: 1.5rem (24px) - font-body, font-semibold
- H4: 1.25rem (20px) - font-body, font-medium
- Body: 1rem (16px) - font-body, leading-relaxed
- Small: 0.875rem (14px) - font-body
- Caption: 0.75rem (12px) - font-body, uppercase, tracking-wide

### Modern Simplicity (现代简洁)

**Layout Principles:**
- Generous whitespace (padding: 1.5rem - 3rem)
- Clear visual hierarchy
- Consistent 8px grid system
- Maximum content width: 1280px
- Card-based organization

**Components Style:**
- Rounded corners: rounded-xl (12px) for cards, rounded-lg (8px) for buttons
- Subtle shadows: shadow-sm for resting, shadow-md for hover
- Border accents: 1px solid with warm border colors
- Glass morphism for overlays (backdrop-blur + bg-opacity)

### Professional Elegance (专业大方)

**Visual Language:**
- Sophisticated serif for headings (文化气质)
- Clean sans-serif for body (现代感)
- Subtle warm gradients for depth
- Delicate decorative elements (subtle patterns, organic shapes)
- Refined micro-interactions

## Implementation Guidelines

### Vue 3 + Tailwind CSS Setup

**tailwind.config.ts extensions:**
```typescript
{
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#FFFBF0',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        }
      },
      fontFamily: {
        display: ['Noto Serif SC', 'Georgia', 'serif'],
        body: ['Inter', 'Noto Sans SC', 'sans-serif'],
      },
      boxShadow: {
        'warm': '0 4px 20px -2px rgba(217, 119, 6, 0.15)',
        'warm-lg': '0 10px 40px -4px rgba(217, 119, 6, 0.2)',
      }
    }
  }
}
```

### CSS Variables Integration

**styles/variables.css:**
```css
@layer base {
  :root {
    /* Core warm palette */
    --color-primary: 217 119 6;           /* amber-600 */
    --color-primary-light: 252 211 77;    /* amber-300 */
    --color-primary-dark: 180 83 9;       /* amber-700 */
    
    /* Backgrounds */
    --color-bg-cream: 255 251 240;        /* cream */
    --color-bg-card: 255 255 255;         /* white */
    
    /* Text */
    --color-text-primary: 69 26 3;        /* warm brown */
    --color-text-secondary: 120 53 15;    /* amber-900 */
    
    /* Semantic */
    --radius-sm: 0.5rem;
    --radius-md: 0.75rem;
    --radius-lg: 1rem;
    --radius-xl: 1.5rem;
  }
}
```

### Component Patterns

**Buttons:**
```vue
<!-- Primary Button -->
<button class="
  px-6 py-3 
  bg-amber-600 hover:bg-amber-700 
  text-white font-medium
  rounded-lg 
  shadow-warm hover:shadow-warm-lg
  transition-all duration-300
  active:scale-95
">
  创建教案
</button>

<!-- Secondary Button -->
<button class="
  px-6 py-3 
  bg-white hover:bg-amber-50
  text-amber-700 font-medium
  border border-amber-200
  rounded-lg
  transition-all duration-300
">
  取消
</button>

<!-- Ghost Button -->
<button class="
  px-4 py-2 
  text-amber-700 hover:text-amber-800
  hover:bg-amber-100
  rounded-md
  transition-colors duration-200
">
  编辑
</button>
```

**Cards:**
```vue
<div class="
  bg-white 
  rounded-xl 
  border border-amber-100
  shadow-warm
  p-6
  hover:shadow-warm-lg hover:-translate-y-1
  transition-all duration-300
">
  <!-- Card content -->
</div>
```

**Form Inputs:**
```vue
<input class="
  w-full px-4 py-3
  bg-warm-50
  border border-amber-200
  rounded-lg
  text-warm-900 placeholder-warm-400
  focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500
  transition-all duration-200
">
```

**Navigation:**
```vue
<nav class="
  bg-white/80 backdrop-blur-md
  border-b border-amber-100
  sticky top-0 z-50
">
  <!-- Nav content with warm accents -->
</nav>
```

### Motion & Interactions

**Micro-interactions:**
```css
/* Hover lift effect */
.hover-lift {
  @apply transition-all duration-300;
}
.hover-lift:hover {
  @apply -translate-y-1 shadow-warm-lg;
}

/* Button press */
.btn-press {
  @apply active:scale-95 transition-transform;
}

/* Smooth focus */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2;
}
```

**Page Transitions:**
```vue
<Transition 
  enter-active-class="transition-all duration-300 ease-out"
  enter-from-class="opacity-0 translate-y-4"
  enter-to-class="opacity-100 translate-y-0"
  leave-active-class="transition-all duration-200 ease-in"
  leave-from-class="opacity-100 translate-y-0"
  leave-to-class="opacity-0 -translate-y-4"
>
  <!-- Content -->
</Transition>
```

### Decorative Elements

**Organic Shapes (背景装饰):**
```vue
<!-- Soft gradient orbs -->
<div class="
  absolute -top-20 -right-20 
  w-96 h-96 
  bg-gradient-to-br from-amber-200/30 to-orange-300/30 
  rounded-full blur-3xl
  pointer-events-none
"></div>

<!-- Decorative patterns -->
<div class="
  absolute inset-0 
  bg-[url('data:image/svg+xml,...')] 
  opacity-5
  pointer-events-none
"></div>
```

## Page-Specific Guidelines

### Login Page (登录页)
- Split layout: Illustration left, form right
- Warm gradient background
- Elegant serif for system name
- Card-based form with soft shadow
- Subtle animated background elements

### Dashboard (首页/仪表盘)
- Welcome message with teacher's name
- Statistics cards with warm icons
- Recent plans list with hover effects
- Quick action buttons with gradient accents

### Editor (教案编辑器)
- Clean, distraction-free interface
- Warm-toned toolbar
- Focus mode capability
- TipTap editor styled to match theme

### Analytics (数据分析)
- Charts with warm color scheme
- Cards for metrics display
- Smooth animations for data updates

## Anti-Patterns to Avoid

❌ **Never use:**
- Cool blue/gray primary colors
- Pure black text (#000000)
- Harsh shadows without warm tint
- Generic Inter-only typography
- Purple gradient backgrounds
- Overly rounded (pill-shaped) everything
- Excessive animations

✅ **Always do:**
- Warm amber/orange as primary
- Warm brown for text
- Soft, warm-tinted shadows
- Mix serif + sans-serif fonts
- Cream/off-white backgrounds
- Intentional, restrained motion

## Example: Complete Page Structure

```vue
<template>
  <div class="min-h-screen bg-warm-50">
    <!-- Navigation -->
    <NavBar />
    
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-6 py-8">
      <!-- Page Header -->
      <header class="mb-8">
        <h1 class="font-display text-3xl font-bold text-warm-900">
          我的教案
        </h1>
        <p class="mt-2 text-warm-600">
          管理和创建您的教学计划
        </p>
      </header>
      
      <!-- Content Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card v-for="plan in plans" :key="plan.id" class="hover-lift">
          <!-- Card content -->
        </Card>
      </div>
    </main>
  </div>
</template>
```

## Quality Checklist

Before completing any frontend work:

- [ ] Warm color palette applied consistently
- [ ] Typography uses display + body font combination
- [ ] All interactive elements have hover states
- [ ] Shadows have warm tint (not pure gray)
- [ ] Background is cream/warm-white (not pure white)
- [ ] Animations are smooth and purposeful
- [ ] Components maintain consistent spacing
- [ ] Design feels professional yet inviting
- [ ] No generic "AI slop" aesthetics present
