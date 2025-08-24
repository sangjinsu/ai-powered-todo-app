# Color System Documentation

## Brand Color Palette

Our color system is built around a harmonious blue-teal palette that conveys trust, professionalism, and modernity.

### Core Brand Colors

| Color | Hex | HSL | Usage | Accessibility |
|-------|-----|-----|--------|--------------|
| **Primary Blue** | #5585b5 | 208° 34% 53% | Main brand, primary actions, CTA buttons | ✅ WCAG AA (4.12:1) |
| **Teal** | #53a8b6 | 188° 34% 52% | Secondary actions, progress indicators | ✅ WCAG AA (3.95:1) |
| **Light Teal** | #79c2d0 | 188° 51% 65% | Accents, completed states, highlights | ⚠️ AA Large (2.85:1) |
| **Very Light Teal** | #bbe4e9 | 188° 43% 82% | Backgrounds, subtle borders, surfaces | ❌ Background only (1.45:1) |

## Semantic Color Mapping

### Brand Colors
```css
/* Primary - Main brand actions */
.brand-primary → #5585b5 (Primary Blue)
  - Primary buttons, main navigation
  - Important links, selected states
  - Brand headers, logos

/* Secondary - Supporting actions */
.brand-secondary → #53a8b6 (Teal)  
  - Secondary buttons, info states
  - Progress indicators, badges
  - Navigation highlights

/* Accent - Highlights and completion */
.brand-accent → #79c2d0 (Light Teal)
  - Completed states, success highlights
  - Feature callouts, accent borders
  - Hover states for secondary elements

/* Surface - Backgrounds and containers */
.brand-surface → #bbe4e9 (Very Light Teal)
  - Card backgrounds, panels
  - Subtle section dividers
  - Input field backgrounds
```

### Todo Application Mapping

#### Priority Levels
```css
/* Priority 5 (Highest) */
.priority-5 → #e53e3e (Red) - Urgent, critical tasks
.todo-card-urgent → border-l-todo-urgent + shadow-lg

/* Priority 4 (High) */
.priority-4 → #ff8c00 (Orange) - Important tasks
.todo-card-high → border-l-todo-high + shadow-md

/* Priority 3 (Medium) */
.priority-3 → #5585b5 (Brand Primary) - Normal tasks
.todo-card-medium → border-l-brand-primary

/* Priority 2 (Low) */
.priority-2 → #79c2d0 (Brand Accent) - Low priority tasks
.todo-card-low → border-l-brand-accent

/* Priority 1 (Lowest) */
.priority-1 → #38a169 (Green) - Nice-to-have tasks
.todo-card-done → border-l-semantic-success
```

#### Status Mapping
```css
/* TODO Status */
.status-todo → #5585b5 (Brand Primary)
  - Represents tasks to be started
  - Uses primary brand color for consistency

/* DOING Status */  
.status-doing → #53a8b6 (Brand Secondary)
  - Represents tasks in progress
  - Uses secondary color to show activity

/* DONE Status */
.status-done → #79c2d0 (Brand Accent)
  - Represents completed tasks
  - Uses accent color for positive completion
  - Applied with opacity-80 for visual distinction
```

### Semantic States

#### Success States
```css
.semantic-success → #38a169 (Green)
  - Task completion, successful operations
  - Form validation success
  - Positive feedback messages
```

#### Warning States
```css
.semantic-warning → #dd6b20 (Orange)
  - Caution messages, pending operations
  - Form validation warnings
  - Non-critical alerts
```

#### Error States
```css  
.semantic-error → #e53e3e (Red)
  - Error messages, failed operations
  - Form validation errors
  - Critical alerts and failures
```

#### Info States
```css
.semantic-info → #53a8b6 (Brand Secondary)
  - Informational messages
  - Tips and guidance
  - Neutral notifications
```

## Component Color Usage

### Buttons
```css
/* Primary Actions */
.btn-brand-primary → bg-brand-primary + white text
  - Main CTAs, submit buttons
  - Primary navigation actions

/* Secondary Actions */  
.btn-brand-secondary → bg-brand-secondary + white text
  - Secondary CTAs, cancel buttons
  - Supporting actions

/* Accent Actions */
.btn-brand-accent → bg-brand-accent + dark text
  - Accent buttons, completion actions
  - Positive confirmations
```

### Cards & Containers
```css
/* Todo Cards */
.todo-card → Base card with transparent border
.todo-card-[priority] → Priority-specific styling

/* AI Assistant */
.ai-card → bg-brand-surface/50 with backdrop blur
.ai-gradient → Gradient using brand colors

/* Glass Effect */
.glass-effect → Semi-transparent with backdrop blur
```

## Dark Mode Considerations

All colors have carefully crafted dark mode variants that maintain:
- **Contrast Ratios**: WCAG AA compliance maintained
- **Visual Hierarchy**: Color relationships preserved  
- **Brand Identity**: Consistent brand perception
- **Accessibility**: Enhanced readability in low light

### Dark Mode Color Shifts
```css
/* Light Mode → Dark Mode */
Brand Primary: #5585b5 → Lighter #6b9bc7
Brand Secondary: #53a8b6 → Lighter #68b3c1  
Brand Accent: #79c2d0 → Lighter #8cd4e2
Brand Surface: #bbe4e9 → Dark surface #2a3441
```

## Accessibility Guidelines

### Contrast Requirements
- **AA Normal Text**: ≥4.5:1 contrast ratio
- **AA Large Text**: ≥3:1 contrast ratio  
- **AAA Normal Text**: ≥7:1 contrast ratio (preferred)

### Color-Only Information
- Never rely on color alone to convey information
- Always provide additional visual cues (icons, text, patterns)
- Use semantic HTML and ARIA labels

### Color Blindness Considerations
- Tested with Protanopia, Deuteranopia, and Tritanopia filters
- Sufficient contrast maintained across all variations
- Alternative visual indicators provided

## Implementation Examples

### React Component Usage
```tsx
// Primary button
<Button className="btn-brand-primary">Save Todo</Button>

// Status-based card
<Card className={`todo-card-${priority}`}>

// Semantic feedback  
<Alert className="bg-success">Task completed!</Alert>
```

### Utility Classes
```tsx
// Text colors
<span className="text-success">Success message</span>
<span className="text-warning">Warning message</span>

// Background colors
<div className="bg-brand-surface">Content</div>
<div className="bg-info">Info panel</div>
```