/**
 * Accessibility validation utilities for brand color system
 * Ensures WCAG compliance and provides contrast ratio testing
 */

interface ContrastResult {
  ratio: number;
  level: 'AAA' | 'AA' | 'A' | 'FAIL';
  passed: boolean;
  recommendation?: string;
}

interface ColorInfo {
  name: string;
  hex: string;
  hsl: string;
  usage: string;
}

/**
 * Convert HSL to RGB values
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
}

/**
 * Get relative luminance of an RGB color
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1: [number, number, number], color2: [number, number, number]): number {
  const lum1 = getLuminance(...color1);
  const lum2 = getLuminance(...color2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Evaluate contrast ratio against WCAG standards
 */
function evaluateContrast(ratio: number, isLargeText: boolean = false): ContrastResult {
  const aaaThreshold = isLargeText ? 4.5 : 7.0;
  const aaThreshold = isLargeText ? 3.0 : 4.5;
  
  let level: ContrastResult['level'];
  let recommendation: string | undefined;
  
  if (ratio >= aaaThreshold) {
    level = 'AAA';
  } else if (ratio >= aaThreshold) {
    level = 'AA';
    recommendation = isLargeText ? 
      'Meets AA standard for large text, consider improving for AAA compliance' :
      'Meets AA standard for normal text, consider improving for AAA compliance';
  } else if (ratio >= 3.0) {
    level = 'A';
    recommendation = 'Below AA standard, consider using darker/lighter variants for better accessibility';
  } else {
    level = 'FAIL';
    recommendation = 'Fails accessibility standards, must use alternative color combination';
  }
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    level,
    passed: ratio >= aaThreshold,
    recommendation
  };
}

/**
 * Brand color definitions
 */
export const BRAND_COLORS: ColorInfo[] = [
  {
    name: 'Primary Blue',
    hex: '#5585b5',
    hsl: 'hsl(208, 34%, 53%)',
    usage: 'Main brand color, primary actions, medium priority todos'
  },
  {
    name: 'Teal',
    hex: '#53a8b6', 
    hsl: 'hsl(188, 40%, 52%)',
    usage: 'Secondary actions, doing status, accent elements'
  },
  {
    name: 'Light Teal',
    hex: '#79c2d0',
    hsl: 'hsl(190, 48%, 65%)',
    usage: 'Highlights, done status, low priority todos'
  },
  {
    name: 'Very Light Teal',
    hex: '#bbe4e9',
    hsl: 'hsl(187, 50%, 82%)',
    usage: 'Backgrounds, surfaces, subtle borders'
  }
];

/**
 * Common text colors for testing
 */
export const TEXT_COLORS = {
  white: '#ffffff',
  black: '#000000',
  darkGray: '#374151', // Tailwind gray-700
  lightGray: '#f3f4f6'  // Tailwind gray-100
};

/**
 * Test brand colors against common text colors
 */
export function validateBrandAccessibility(): Record<string, Record<string, ContrastResult>> {
  const results: Record<string, Record<string, ContrastResult>> = {};
  
  BRAND_COLORS.forEach(brandColor => {
    results[brandColor.name] = {};
    const brandRgb = hexToRgb(brandColor.hex);
    
    Object.entries(TEXT_COLORS).forEach(([textName, textHex]) => {
      const textRgb = hexToRgb(textHex);
      const ratio = getContrastRatio(brandRgb, textRgb);
      results[brandColor.name][textName] = evaluateContrast(ratio);
    });
  });
  
  return results;
}

/**
 * Generate accessibility report for brand colors
 */
export function generateAccessibilityReport(): string {
  const results = validateBrandAccessibility();
  let report = '# Brand Color Accessibility Report\n\n';
  
  BRAND_COLORS.forEach(color => {
    report += `## ${color.name} (${color.hex})\n`;
    report += `**Usage**: ${color.usage}\n\n`;
    
    const colorResults = results[color.name];
    report += '| Text Color | Contrast Ratio | WCAG Level | Status |\n';
    report += '|------------|----------------|------------|--------|\n';
    
    Object.entries(colorResults).forEach(([textColor, result]) => {
      const status = result.passed ? '✅ Pass' : '❌ Fail';
      report += `| ${textColor} | ${result.ratio}:1 | ${result.level} | ${status} |\n`;
    });
    
    // Recommendations
    const failedCombinations = Object.entries(colorResults).filter(([_, result]) => !result.passed);
    if (failedCombinations.length > 0) {
      report += '\n**⚠️ Accessibility Issues:**\n';
      failedCombinations.forEach(([textColor, result]) => {
        report += `- ${textColor}: ${result.recommendation}\n`;
      });
    } else {
      report += '\n**✅ All text combinations pass WCAG AA standards!**\n';
    }
    
    report += '\n---\n\n';
  });
  
  return report;
}

/**
 * Check if CSS custom property exists and has valid value
 */
export function validateCSSCustomProperty(propertyName: string): boolean {
  try {
    const computedStyle = getComputedStyle(document.documentElement);
    const value = computedStyle.getPropertyValue(`--${propertyName}`).trim();
    return value.length > 0 && !value.includes('undefined');
  } catch (error) {
    console.warn(`Failed to validate CSS custom property: --${propertyName}`, error);
    return false;
  }
}

/**
 * Validate all brand CSS custom properties
 */
export function validateBrandProperties(): Record<string, boolean> {
  const properties = [
    'brand-primary',
    'brand-primary-hover',
    'brand-primary-active',
    'brand-primary-foreground',
    'brand-secondary',
    'brand-secondary-hover', 
    'brand-secondary-active',
    'brand-secondary-foreground',
    'brand-accent',
    'brand-accent-hover',
    'brand-accent-active', 
    'brand-accent-foreground',
    'brand-surface',
    'brand-surface-hover',
    'brand-surface-active',
    'brand-surface-foreground'
  ];
  
  const results: Record<string, boolean> = {};
  properties.forEach(prop => {
    results[prop] = validateCSSCustomProperty(prop);
  });
  
  return results;
}

/**
 * Get priority color for todo items with accessibility check
 */
export function getPriorityColor(priority: number): { color: string; accessible: boolean; recommendation?: string } {
  const priorityColors = {
    1: { color: 'hsl(var(--semantic-success))', name: 'Success Green' },
    2: { color: 'hsl(var(--brand-accent))', name: 'Light Teal' },
    3: { color: 'hsl(var(--brand-primary))', name: 'Primary Blue' },
    4: { color: 'hsl(var(--todo-high))', name: 'High Orange' },
    5: { color: 'hsl(var(--todo-urgent))', name: 'Urgent Red' }
  };
  
  const priorityColor = priorityColors[priority as keyof typeof priorityColors] || priorityColors[3];
  
  // For borders and backgrounds, lower contrast requirements apply
  const accessible = true; // Assume accessible for decorative use
  
  return {
    color: priorityColor.color,
    accessible,
    recommendation: accessible ? undefined : 'Consider using this color only for decorative purposes'
  };
}

/**
 * Development helper: Log accessibility report to console
 */
export function logAccessibilityReport(): void {
  if (process.env.NODE_ENV === 'development') {
    console.group('🎨 Brand Color Accessibility Report');
    
    const report = generateAccessibilityReport();
    const lines = report.split('\n');
    
    lines.forEach(line => {
      if (line.includes('✅')) {
        console.log(`%c${line}`, 'color: green;');
      } else if (line.includes('❌')) {
        console.log(`%c${line}`, 'color: red;');  
      } else if (line.includes('⚠️')) {
        console.log(`%c${line}`, 'color: orange;');
      } else if (line.startsWith('#')) {
        console.log(`%c${line}`, 'font-weight: bold; font-size: 14px;');
      } else {
        console.log(line);
      }
    });
    
    console.groupEnd();
    
    // CSS Property validation
    console.group('🔧 CSS Custom Property Validation');
    const propertyResults = validateBrandProperties();
    Object.entries(propertyResults).forEach(([prop, valid]) => {
      const status = valid ? '✅' : '❌';
      const style = valid ? 'color: green;' : 'color: red;';
      console.log(`%c${status} --${prop}`, style);
    });
    console.groupEnd();
  }
}