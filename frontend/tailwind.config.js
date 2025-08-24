/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Brand color palette - blue-teal harmony
        brand: {
          // Primary blue (#5585b5) - Main brand color
          primary: "hsl(var(--brand-primary))",
          "primary-hover": "hsl(var(--brand-primary-hover))",
          "primary-active": "hsl(var(--brand-primary-active))",
          "primary-foreground": "hsl(var(--brand-primary-foreground))",
          
          // Teal (#53a8b6) - Secondary brand color  
          secondary: "hsl(var(--brand-secondary))",
          "secondary-hover": "hsl(var(--brand-secondary-hover))",
          "secondary-active": "hsl(var(--brand-secondary-active))",
          "secondary-foreground": "hsl(var(--brand-secondary-foreground))",
          
          // Light teal (#79c2d0) - Accent color
          accent: "hsl(var(--brand-accent))",
          "accent-hover": "hsl(var(--brand-accent-hover))",
          "accent-active": "hsl(var(--brand-accent-active))",
          "accent-foreground": "hsl(var(--brand-accent-foreground))",
          
          // Very light teal (#bbe4e9) - Surface/background
          surface: "hsl(var(--brand-surface))",
          "surface-hover": "hsl(var(--brand-surface-hover))",
          "surface-active": "hsl(var(--brand-surface-active))",
          "surface-foreground": "hsl(var(--brand-surface-foreground))",
        },
        // Semantic colors for todo application
        todo: {
          urgent: "hsl(var(--todo-urgent))",
          high: "hsl(var(--todo-high))", 
          medium: "hsl(var(--todo-medium))",
          low: "hsl(var(--todo-low))",
          done: "hsl(var(--todo-done))",
          // Status colors using brand palette
          status: {
            todo: "hsl(var(--brand-primary))",
            doing: "hsl(var(--brand-secondary))", 
            done: "hsl(var(--brand-accent))",
          }
        },
        // Success/warning/error states with brand harmony
        semantic: {
          success: "hsl(var(--semantic-success))",
          "success-foreground": "hsl(var(--semantic-success-foreground))",
          warning: "hsl(var(--semantic-warning))",
          "warning-foreground": "hsl(var(--semantic-warning-foreground))",
          error: "hsl(var(--semantic-error))",
          "error-foreground": "hsl(var(--semantic-error-foreground))",
          info: "hsl(var(--brand-secondary))", // Use brand secondary for info
          "info-foreground": "hsl(var(--brand-secondary-foreground))",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // TODO 앱 전용 애니메이션
        "slide-up": {
          from: { transform: "translateY(10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "shimmer": {
          "0%": { "background-position": "200% 0" },
          "100%": { "background-position": "-200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "bounce-in": "bounce-in 0.5s ease-out",
        "shimmer": "shimmer 1.5s infinite",
      },
      // TODO 앱 전용 그라데이션
      backgroundImage: {
        'gradient-app': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-ai': 'linear-gradient(45deg, #667eea, #764ba2)',
        'gradient-success': 'linear-gradient(45deg, #48bb78, #38a169)',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
}