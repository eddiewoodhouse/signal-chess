import { Injectable, signal, computed } from '@angular/core';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  lightSquare: string;
  darkSquare: string;
  text: string;
  pieceLight: string;
  pieceDark: string;
  squareBorder?: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  isDark: boolean;
  pattern: string;
}

const createDarkVariant = (theme: Theme): Theme => ({
  ...theme,
  id: `${theme.id}-dark`,
  name: `${theme.name} Dark`,
  isDark: true,
  colors: {
    ...theme.colors,
    background: theme.colors.secondary,
    surface: theme.colors.text,
    text: theme.colors.pieceLight,
    lightSquare: theme.colors.darkSquare,
    darkSquare: theme.colors.secondary,
    pieceLight: theme.colors.accent,
    pieceDark: theme.colors.background,
    squareBorder: theme.colors.accent + '33' // 20% opacity
  }
});

const BASE_THEMES: Theme[] = [
  {
    id: 'classic',
    name: 'Classic',
    isDark: false,
    colors: {
      primary: '#1e293b',
      secondary: '#475569',
      accent: '#94a3b8',
      background: '#f8fafc',
      surface: '#f1f5f9',
      lightSquare: '#f1f5f9',
      darkSquare: '#94a3b8',
      text: '#1e293b',
      pieceLight: '#f8fafc',
      pieceDark: '#1e293b',
      squareBorder: '#64748b22'
    },
    pattern: ''
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    isDark: false,
    colors: {
      primary: '#0891b2',
      secondary: '#164e63',
      accent: '#38bdf8',
      background: '#ecfeff',
      surface: '#f0fdfa',
      lightSquare: '#cffafe',
      darkSquare: '#67e8f9',
      text: '#164e63',
      pieceLight: '#f0fdfa',
      pieceDark: '#164e63',
      squareBorder: '#38bdf833'
    },
    pattern: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%230891b2' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`
  },
  {
    id: 'forest-mist',
    name: 'Forest Mist',
    isDark: false,
    colors: {
      primary: '#4ade80',
      secondary: '#166534',
      accent: '#86efac',
      background: '#f0fdf4',
      surface: '#ecfdf5',
      lightSquare: '#dcfce7',
      darkSquare: '#86efac',
      text: '#166534',
      pieceLight: '#f0fdf4',
      pieceDark: '#166534',
      squareBorder: '#86efac33'
    },
    pattern: `url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234ade80' fill-opacity='0.1'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
  }];
const THEMES = [
  ...BASE_THEMES,
  ...BASE_THEMES.map(createDarkVariant)
];

// Font used across all themes
const SYSTEM_FONT = "'IBM Plex Sans', system-ui, -apple-system, sans-serif";

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly _currentTheme = signal<Theme>(THEMES[0]);
  private readonly _availableThemes = signal<Theme[]>(THEMES);
  private readonly _isDarkMode = signal<boolean>(false);

  readonly currentTheme = computed(() => this._currentTheme());
  readonly availableThemes = computed(() => this._availableThemes());
  readonly isDarkMode = computed(() => this._isDarkMode());

  constructor() {
    // Always initialize with dark mode
    this._isDarkMode.set(true);
    this.setTheme('classic-dark');
  }

  setTheme(themeId: string) {
    const theme = THEMES.find((t: Theme) => t.id === themeId);
    if (theme) {
      this._currentTheme.set(theme);
      this._isDarkMode.set(theme.isDark);
      this.applyTheme(theme);
    }
  }

  toggleDarkMode() {
    const currentTheme = this._currentTheme();
    const targetThemeId = currentTheme.isDark 
      ? currentTheme.id.replace('-dark', '')
      : `${currentTheme.id}-dark`;
    
    const targetTheme = THEMES.find((t: Theme) => t.id === targetThemeId);
    if (targetTheme) {
      this.setTheme(targetTheme.id);
    }
  }

  private applyTheme(theme: Theme) {
    const root = document.documentElement;
    const colors = theme.colors;

    // Apply colors
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Set font and pattern
    root.style.setProperty('--font-family', SYSTEM_FONT);
    root.style.setProperty('--background-pattern', theme.pattern);
    
    // Update color scheme for system UI
    root.style.setProperty('color-scheme', theme.isDark ? 'dark' : 'light');
  }
}
