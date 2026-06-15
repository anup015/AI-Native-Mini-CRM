import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.22)"
      },
      backdropBlur: {
        xs: "2px"
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        sora: ["Sora", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at 12% 15%, rgba(45, 212, 191, 0.16), transparent 25%), radial-gradient(circle at 80% 10%, rgba(56, 189, 248, 0.14), transparent 28%), radial-gradient(circle at 55% 85%, rgba(34, 197, 94, 0.13), transparent 22%)"
      }
    }
  },
  plugins: []
} satisfies Config;

export default config;
