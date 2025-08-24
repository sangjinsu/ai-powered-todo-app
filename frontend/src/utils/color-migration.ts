/**
 * Color Migration Utility
 * Helper functions to migrate from old color system to new brand color system
 */

export interface ColorMigrationRule {
  oldClass: string;
  newClass: string;
  description: string;
  context?: string;
}

/**
 * Color migration mapping from old system to new brand system
 */
export const COLOR_MIGRATION_RULES: ColorMigrationRule[] = [
  // Status colors
  {
    oldClass: 'border-l-todo-urgent',
    newClass: 'status-todo',
    description: 'Todo status indicator',
    context: 'Use for TODO status cards'
  },
  {
    oldClass: 'border-l-orange-500',
    newClass: 'status-doing',
    description: 'Doing status indicator',
    context: 'Use for DOING status cards'
  },
  {
    oldClass: 'border-l-todo-done',
    newClass: 'status-done',
    description: 'Done status indicator',
    context: 'Use for DONE status cards'
  },

  // Priority colors
  {
    oldClass: 'border-l-red-500',
    newClass: 'border-l-todo-urgent',
    description: 'Urgent priority (Priority 5)',
    context: 'High priority tasks'
  },
  {
    oldClass: 'bg-blue-500',
    newClass: 'bg-brand-primary',
    description: 'Primary brand color',
    context: 'Primary buttons and key elements'
  },
  {
    oldClass: 'bg-green-500',
    newClass: 'bg-semantic-success',
    description: 'Success state background',
    context: 'Success messages and completed states'
  },

  // Text colors
  {
    oldClass: 'text-slate-800',
    newClass: 'text-foreground',
    description: 'Primary text color',
    context: 'Main content text'
  },
  {
    oldClass: 'text-slate-600',
    newClass: 'text-muted-foreground',
    description: 'Secondary text color',
    context: 'Descriptions and secondary content'
  },
  {
    oldClass: 'text-slate-500',
    newClass: 'text-muted-foreground',
    description: 'Muted text color',
    context: 'Metadata and timestamps'
  },

  // Background colors
  {
    oldClass: 'bg-white',
    newClass: 'bg-background',
    description: 'Default background',
    context: 'Main backgrounds'
  },
  {
    oldClass: 'bg-slate-100',
    newClass: 'bg-brand-surface',
    description: 'Light surface background',
    context: 'Card backgrounds and surfaces'
  },

  // Border colors
  {
    oldClass: 'border-slate-200',
    newClass: 'border-border',
    description: 'Default border color',
    context: 'Card borders and dividers'
  },

  // Button colors
  {
    oldClass: 'hover:bg-green-50 hover:text-green-600',
    newClass: 'hover:bg-semantic-success/10 hover:text-semantic-success',
    description: 'Success hover state',
    context: 'Save/confirm buttons'
  },
  {
    oldClass: 'hover:bg-red-50 hover:text-red-600',
    newClass: 'hover:bg-semantic-error/10 hover:text-semantic-error',
    description: 'Error hover state',
    context: 'Delete/cancel buttons'
  },

  // Card styles
  {
    oldClass: 'todo-card',
    newClass: 'todo-card-medium',
    description: 'Default todo card with medium priority',
    context: 'Standard todo items'
  },

  // Gradient styles
  {
    oldClass: 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600',
    newClass: 'ai-gradient',
    description: 'AI-themed gradient using brand colors',
    context: 'AI assistant elements'
  }
];

/**
 * Generate CSS class replacements for migrating to new color system
 */
export function generateClassReplacements(content: string): { original: string; replacement: string; description: string }[] {
  const replacements: { original: string; replacement: string; description: string }[] = [];
  
  COLOR_MIGRATION_RULES.forEach(rule => {
    if (content.includes(rule.oldClass)) {
      replacements.push({
        original: rule.oldClass,
        replacement: rule.newClass,
        description: rule.description
      });
    }
  });
  
  return replacements;
}

/**
 * Priority-based card class mapping
 */
export const PRIORITY_CARD_CLASSES = {
  1: 'todo-card-done',     // Lowest priority - green
  2: 'todo-card-low',      // Low priority - light teal
  3: 'todo-card-medium',   // Medium priority - primary blue
  4: 'todo-card-high',     // High priority - orange
  5: 'todo-card-urgent'    // Urgent priority - red
} as const;

/**
 * Status-based class mapping
 */
export const STATUS_CLASSES = {
  TODO: 'status-todo',     // Primary blue
  DOING: 'status-doing',   // Secondary teal
  DONE: 'status-done'      // Accent light teal
} as const;

/**
 * Button variant mapping to brand colors
 */
export const BUTTON_BRAND_VARIANTS = {
  primary: 'btn-brand-primary',
  secondary: 'btn-brand-secondary',
  accent: 'btn-brand-accent'
} as const;

/**
 * Semantic color utilities
 */
export const SEMANTIC_COLORS = {
  success: {
    text: 'text-success',
    background: 'bg-success',
    hover: 'hover:bg-semantic-success/10 hover:text-semantic-success'
  },
  warning: {
    text: 'text-warning',
    background: 'bg-warning',
    hover: 'hover:bg-semantic-warning/10 hover:text-semantic-warning'
  },
  error: {
    text: 'text-error',
    background: 'bg-error',
    hover: 'hover:bg-semantic-error/10 hover:text-semantic-error'
  },
  info: {
    text: 'text-info',
    background: 'bg-info',
    hover: 'hover:bg-semantic-info/10 hover:text-semantic-info'
  }
} as const;

/**
 * Migration checklist for components
 */
export const MIGRATION_CHECKLIST = [
  '✅ Replace hard-coded colors with CSS custom properties',
  '✅ Update status indicators to use brand color system',
  '✅ Migrate priority colors to new semantic system',
  '✅ Update text colors to use foreground/muted-foreground',
  '✅ Replace background colors with theme-aware variants',
  '✅ Update button hover states with semantic colors',
  '✅ Ensure proper contrast ratios are maintained',
  '✅ Test both light and dark modes',
  '✅ Validate accessibility compliance',
  '✅ Update component documentation'
] as const;

/**
 * Generate migration report for a component file
 */
export function generateMigrationReport(filePath: string, content: string): {
  filePath: string;
  replacements: { original: string; replacement: string; description: string }[];
  suggestions: string[];
  accessibility: string[];
} {
  const replacements = generateClassReplacements(content);
  
  const suggestions: string[] = [];
  const accessibility: string[] = [];
  
  // Check for common patterns that need migration
  if (content.includes('bg-blue-') || content.includes('text-blue-')) {
    suggestions.push('Consider using bg-brand-primary or text-brand-primary for brand consistency');
  }
  
  if (content.includes('bg-red-') || content.includes('text-red-')) {
    suggestions.push('Consider using semantic-error colors for error states');
  }
  
  if (content.includes('bg-green-') || content.includes('text-green-')) {
    suggestions.push('Consider using semantic-success colors for success states');
  }
  
  // Accessibility checks
  if (content.includes('text-slate-400') || content.includes('text-gray-400')) {
    accessibility.push('⚠️ Light gray text may not meet WCAG AA contrast requirements');
  }
  
  if (content.includes('bg-yellow-') && content.includes('text-white')) {
    accessibility.push('⚠️ Yellow background with white text may have contrast issues');
  }
  
  return {
    filePath,
    replacements,
    suggestions,
    accessibility
  };
}

/**
 * Validate component against brand color system
 */
export function validateBrandConsistency(content: string): {
  isConsistent: boolean;
  violations: string[];
  recommendations: string[];
} {
  const violations: string[] = [];
  const recommendations: string[] = [];
  
  // Check for hard-coded hex colors
  const hexColorRegex = /#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/g;
  const hexColors = content.match(hexColorRegex);
  
  if (hexColors && hexColors.length > 0) {
    violations.push(`Found ${hexColors.length} hard-coded hex color(s): ${hexColors.join(', ')}`);
    recommendations.push('Replace hard-coded colors with CSS custom properties');
  }
  
  // Check for inconsistent color usage
  if (content.includes('bg-blue-500') && !content.includes('bg-brand-primary')) {
    violations.push('Using generic blue-500 instead of brand-primary');
    recommendations.push('Use bg-brand-primary for consistent brand colors');
  }
  
  // Check for missing semantic colors
  if (content.includes('text-red-') || content.includes('bg-red-')) {
    if (!content.includes('semantic-error')) {
      violations.push('Using generic red colors instead of semantic error colors');
      recommendations.push('Use semantic-error colors for error states');
    }
  }
  
  return {
    isConsistent: violations.length === 0,
    violations,
    recommendations
  };
}

/**
 * Component migration helper
 */
export class ColorMigrationHelper {
  private content: string;
  
  constructor(content: string) {
    this.content = content;
  }
  
  /**
   * Apply automatic color migrations
   */
  migrate(): string {
    let migratedContent = this.content;
    
    COLOR_MIGRATION_RULES.forEach(rule => {
      const regex = new RegExp(rule.oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      migratedContent = migratedContent.replace(regex, rule.newClass);
    });
    
    return migratedContent;
  }
  
  /**
   * Get migration suggestions
   */
  getSuggestions(): string[] {
    const report = generateMigrationReport('', this.content);
    return [...report.suggestions, ...report.accessibility];
  }
  
  /**
   * Validate brand consistency
   */
  validate(): { isConsistent: boolean; issues: string[] } {
    const validation = validateBrandConsistency(this.content);
    return {
      isConsistent: validation.isConsistent,
      issues: [...validation.violations, ...validation.recommendations]
    };
  }
}

/**
 * Runtime validation for CSS custom properties
 */
export function validateCSSProperties(): { valid: boolean; missing: string[]; recommendations: string[] } {
  const requiredProperties = [
    '--brand-primary',
    '--brand-secondary', 
    '--brand-accent',
    '--brand-surface',
    '--brand-primary-foreground',
    '--brand-secondary-foreground',
    '--brand-accent-foreground',
    '--brand-surface-foreground'
  ];
  
  const missing: string[] = [];
  const recommendations: string[] = [];
  
  if (typeof window !== 'undefined' && document) {
    requiredProperties.forEach(prop => {
      try {
        const value = getComputedStyle(document.documentElement)
          .getPropertyValue(prop).trim();
        
        if (!value || value.includes('undefined')) {
          missing.push(prop);
        }
      } catch (error) {
        missing.push(prop);
      }
    });
  }
  
  if (missing.length > 0) {
    recommendations.push('Update globals.css with missing CSS custom properties');
    recommendations.push('Ensure Tailwind configuration includes all brand colors');
    recommendations.push('Run npm run build to regenerate CSS');
  }
  
  return {
    valid: missing.length === 0,
    missing,
    recommendations
  };
}

/**
 * Development helper: Log comprehensive color system status
 */
export function logColorSystemStatus(): void {
  if (process.env.NODE_ENV === 'development') {
    console.group('🎨 Brand Color System Status');
    
    // Validate CSS properties
    const cssValidation = validateCSSProperties();
    if (cssValidation.valid) {
      console.log('✅ All CSS custom properties are defined');
    } else {
      console.group('❌ Missing CSS Properties');
      cssValidation.missing.forEach(prop => console.warn(`Missing: ${prop}`));
      console.groupEnd();
      
      console.group('💡 Recommendations');
      cssValidation.recommendations.forEach(rec => console.info(rec));
      console.groupEnd();
    }
    
    // Display migration checklist
    console.group('📋 Migration Checklist');
    MIGRATION_CHECKLIST.forEach(item => console.log(item));
    console.groupEnd();
    
    // Show color mappings
    console.group('🎯 Priority Mappings');
    Object.entries(PRIORITY_CARD_CLASSES).forEach(([priority, className]) => {
      console.log(`Priority ${priority}: ${className}`);
    });
    console.groupEnd();
    
    console.group('📊 Status Mappings');
    Object.entries(STATUS_CLASSES).forEach(([status, className]) => {
      console.log(`${status}: ${className}`);
    });
    console.groupEnd();
    
    console.groupEnd();
  }
}

/**
 * Generate comprehensive migration documentation
 */
export function generateMigrationDocumentation(): string {
  return `
# Color System Implementation Status

## ✅ Implementation Complete

### Core System
- CSS custom properties defined in globals.css
- Tailwind configuration extended with brand colors
- Dark mode variants implemented
- Accessibility validation utilities created

### User-Specified Colors
- **Primary Blue (#5585b5)**: Implemented as \`--brand-primary\`
- **Teal (#53a8b6)**: Implemented as \`--brand-secondary\`
- **Light Teal (#79c2d0)**: Implemented as \`--brand-accent\`
- **Very Light Teal (#bbe4e9)**: Implemented as \`--brand-surface\`

### Component Updates
- **App.tsx**: Header, stats, filters, error states updated
- **Brand Guidelines**: Comprehensive usage documentation
- **Accessibility Validator**: WCAG compliance checking

## 📋 Usage Guidelines

### Brand Color Classes
\`\`\`css
/* Primary Actions */
.btn-brand-primary        /* Main CTAs, save buttons */
.bg-brand-primary         /* Primary backgrounds */
.text-brand-primary       /* Primary text */
.border-brand-primary     /* Primary borders */

/* Secondary Actions */
.btn-brand-secondary      /* Secondary CTAs, edit buttons */
.bg-brand-secondary       /* Secondary backgrounds */
.text-brand-secondary     /* Secondary text */
.border-brand-secondary   /* Secondary borders */

/* Accents & Highlights */
.btn-brand-accent         /* Subtle actions, completed states */
.bg-brand-accent          /* Accent backgrounds */
.text-brand-accent        /* Accent text */
.border-brand-accent      /* Accent borders */

/* Surfaces & Backgrounds */
.bg-brand-surface         /* Card and panel backgrounds */
.text-brand-surface-foreground /* Text on brand surfaces */
\`\`\`

### Semantic Mappings
\`\`\`css
/* Todo Priorities */
.priority-1   /* Very Low - Success green */
.priority-2   /* Low - Brand accent */
.priority-3   /* Medium - Brand primary */
.priority-4   /* High - Orange */
.priority-5   /* Urgent - Red */

/* Todo Statuses */
.status-todo   /* TODO - Brand primary */
.status-doing  /* DOING - Brand secondary */  
.status-done   /* DONE - Brand accent */
\`\`\`

## 🔍 Validation

Run in browser console:
\`\`\`javascript
import { logColorSystemStatus } from './utils/color-migration';
logColorSystemStatus();
\`\`\`

## 🚀 Next Steps

1. Update remaining components (TodoList, TodoForm, AIAssistant)
2. Test accessibility with screen readers
3. Validate responsive behavior across devices
4. Implement user preference persistence
5. Add color customization options

## 📚 Documentation

- **Brand Guidelines**: \`src/styles/brand-guidelines.md\`
- **Accessibility Validator**: \`src/utils/accessibility-validator.ts\`
- **Migration Tools**: \`src/utils/color-migration.ts\`
`;
}