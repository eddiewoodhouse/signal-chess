import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-theme-switcher',
  templateUrl: './theme-switcher.component.html',
  styleUrls: ['./theme-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitcherComponent {
  private readonly themeService = inject(ThemeService);
  
  protected readonly currentTheme = this.themeService.currentTheme;
  protected readonly isDarkMode = this.themeService.isDarkMode;
  
  // Filter out dark variants from the theme list
  protected readonly baseThemes = computed(() => 
    this.themeService.availableThemes().filter(theme => !theme.isDark)
  );

  protected onThemeChange(themeId: string): void {
    this.themeService.setTheme(themeId);
  }

  protected toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }
}