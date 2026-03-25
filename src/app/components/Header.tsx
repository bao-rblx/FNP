import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showSearch?: boolean;
}

export function Header({ title, showBack = false }: HeaderProps) {
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  return (
    <header className="md:hidden sticky top-0 bg-card text-card-foreground border-b border-border z-40">
      <div className="flex items-center justify-between h-14 px-4 max-w-6xl mx-auto">
        {showBack ? (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-muted/50 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9" />
        )}

        <h1 className="font-semibold text-base">{title}</h1>

        {/* Language + Theme row */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
            className="text-[11px] font-bold px-2 py-1 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground transition-colors"
          >
            {language === 'vi' ? 'EN' : 'VI'}
          </button>
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground transition-colors"
          >
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
