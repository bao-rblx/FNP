import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../context/LanguageContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-10 flex items-center text-sm text-muted-foreground">…</div>;
  }

  return (
    <div className="flex flex-wrap gap-2 py-1">
      <Button
        type="button"
        size="sm"
        variant={theme === 'light' ? 'default' : 'outline'}
        className={theme === 'light' ? 'bg-red-600 hover:bg-red-700' : ''}
        onClick={() => setTheme('light')}
      >
        <Sun className="w-4 h-4 mr-1" />
        {t.themeLight}
      </Button>
      <Button
        type="button"
        size="sm"
        variant={theme === 'dark' ? 'default' : 'outline'}
        className={theme === 'dark' ? 'bg-red-600 hover:bg-red-700' : ''}
        onClick={() => setTheme('dark')}
      >
        <Moon className="w-4 h-4 mr-1" />
        {t.themeDark}
      </Button>
      <Button
        type="button"
        size="sm"
        variant={theme === 'system' ? 'default' : 'outline'}
        className={theme === 'system' ? 'bg-red-600 hover:bg-red-700' : ''}
        onClick={() => setTheme('system')}
      >
        <Monitor className="w-4 h-4 mr-1" />
        {t.themeSystem}
      </Button>
    </div>
  );
}
