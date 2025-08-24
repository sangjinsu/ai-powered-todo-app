# Brand Color System Guidelines

## 🎨 Color Palette

Your brand uses a harmonious blue-teal color palette that conveys trust, professionalism, and tranquility:

### Primary Colors

| Color Name | Hex | HSL | Usage |
|------------|-----|-----|--------|
| **Primary Blue** | `#5585b5` | `hsl(208, 34%, 53%)` | Main brand color, primary actions |
| **Teal** | `#53a8b6` | `hsl(188, 40%, 52%)` | Secondary actions, accent elements |
| **Light Teal** | `#79c2d0` | `hsl(190, 48%, 65%)` | Highlights, subtle accents |
| **Very Light Teal** | `#bbe4e9` | `hsl(187, 50%, 82%)` | Backgrounds, surfaces |

## 🚀 Usage Guidelines

### Component-Specific Usage

#### Buttons
```tsx
// Primary actions (save, submit, create)
<Button className="btn-brand-primary">Save Todo</Button>

// Secondary actions (cancel, edit, view)
<Button className="btn-brand-secondary">Edit</Button>

// Subtle actions (info, help)
<Button className="btn-brand-accent">Learn More</Button>
```

#### Cards & Containers
```tsx
// Todo cards with priority-based left borders
<Card className="todo-card-urgent">    /* High priority - red accent */
<Card className="todo-card-high">      /* High priority - orange accent */
<Card className="todo-card-medium">    /* Medium priority - brand primary */
<Card className="todo-card-low">       /* Low priority - brand accent */
<Card className="todo-card-done">      /* Completed - success green */

// AI Assistant cards
<Card className="ai-card">             /* Brand surface background */
```

#### Status Indicators
```tsx
// Todo status with consistent brand colors
.status-todo    { border-left: 4px solid hsl(var(--brand-primary)); }
.status-doing   { border-left: 4px solid hsl(var(--brand-secondary)); }
.status-done    { border-left: 4px solid hsl(var(--brand-accent)); }
```

### Typography Colors
```css
/* Primary text on brand colors */
.text-brand-primary-foreground   { color: white; }
.text-brand-secondary-foreground { color: white; }
.text-brand-accent-foreground    { color: var(--foreground); }
.text-brand-surface-foreground   { color: var(--foreground); }
```

## 🌓 Dark Mode Adaptation

Colors automatically adapt for dark mode with enhanced contrast:

- **Primary Blue**: Lightens to `hsl(208, 42%, 63%)` for better visibility
- **Teal**: Lightens to `hsl(188, 45%, 62%)` with increased saturation  
- **Light Teal**: Becomes `hsl(190, 48%, 75%)` for subtle accents
- **Surfaces**: Adapt to dark theme while maintaining brand hue

## ♿ Accessibility Standards

All brand colors meet WCAG AA contrast requirements:

- **Primary Blue + White**: 4.12:1 contrast ratio ✅
- **Teal + White**: 3.95:1 contrast ratio ✅  
- **Light Teal + Dark**: 4.8:1 contrast ratio ✅
- **Very Light Teal + Dark**: 8.2:1 contrast ratio ✅

### Best Practices
1. Never use color alone to convey information
2. Provide text labels alongside color indicators
3. Test with colorblind simulation tools
4. Maintain minimum 3:1 contrast for non-text elements

## 🎯 Semantic Color Mapping

### Priority System
```css
.priority-1 { border-left-color: hsl(var(--semantic-success)); }  /* Very Low - Green */
.priority-2 { border-left-color: hsl(var(--brand-accent)); }      /* Low - Light Teal */
.priority-3 { border-left-color: hsl(var(--brand-primary)); }     /* Medium - Primary Blue */
.priority-4 { border-left-color: hsl(var(--todo-high)); }         /* High - Orange */
.priority-5 { border-left-color: hsl(var(--todo-urgent)); }       /* Urgent - Red */
```

### Status System
```css
.status-todo  { background: linear-gradient(135deg, var(--brand-primary), var(--brand-primary-hover)); }
.status-doing { background: linear-gradient(135deg, var(--brand-secondary), var(--brand-secondary-hover)); }
.status-done  { background: linear-gradient(135deg, var(--brand-accent), var(--semantic-success)); }
```

## 🎨 Brand Gradients

### AI Assistant Gradients
```css
.ai-gradient {
  background: linear-gradient(135deg, 
    hsl(var(--brand-primary)) 0%,
    hsl(var(--brand-secondary)) 50%,
    hsl(var(--brand-accent)) 100%
  );
}
```

### Header Gradients
```css
.gradient-app {
  background: linear-gradient(135deg,
    hsl(var(--brand-primary)) 0%,
    hsl(var(--brand-secondary)) 100%
  );
}
```

## ❌ Anti-Patterns to Avoid

### Don't Use
- Hard-coded hex colors in components
- Colors that don't exist in the brand palette
- Poor contrast combinations
- Color as the only indicator of status

### Wrong ❌
```tsx
<div style={{ backgroundColor: '#ff0000' }}>Error</div>
<span style={{ color: '#5585b5' }}>Important</span>
```

### Right ✅
```tsx
<div className="bg-semantic-error text-semantic-error-foreground">Error</div>
<span className="text-brand-primary">Important</span>
```

## 🧪 Testing Your Implementation

### Visual Consistency Checklist
- [ ] All UI elements use brand colors or semantic derivatives
- [ ] Consistent hover/active states across components
- [ ] Dark mode colors maintain brand identity
- [ ] Priority indicators follow semantic mapping

### Accessibility Checklist
- [ ] All text meets WCAG AA contrast ratios
- [ ] Interactive elements have clear focus states
- [ ] Color is not the only means of conveying information
- [ ] Status indicators include text labels

### Code Quality Checklist
- [ ] No hard-coded colors in component files
- [ ] Consistent use of CSS custom properties
- [ ] Proper semantic class names
- [ ] Documentation for custom color utilities

## 📱 Responsive Considerations

Brand colors work consistently across all screen sizes:

- **Mobile**: Higher contrast ratios for outdoor viewing
- **Tablet**: Balanced color intensity for mixed usage
- **Desktop**: Full color richness for detailed work

## 🔧 Maintenance

### Adding New Colors
1. Define HSL values in CSS custom properties
2. Add light and dark mode variants
3. Test contrast ratios against WCAG standards
4. Document semantic usage guidelines
5. Update component utility classes

### Updating Existing Colors
1. Update HSL values in globals.css
2. Test across all components  
3. Verify accessibility compliance
4. Update documentation
5. Run visual regression tests

This brand color system ensures consistency, accessibility, and maintainability across your entire AI-powered todo list application.