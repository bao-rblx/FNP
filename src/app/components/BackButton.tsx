import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { useLanguage } from '../context/LanguageContext';

export function BackButton() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="mb-6 hidden md:block">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="group flex items-center gap-2 -ml-3 px-4 py-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all duration-300"
      >
        <div className="p-1.5 rounded-lg bg-muted group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        </div>
        <span className="font-bold uppercase tracking-widest text-[10px]">{t.back}</span>
      </Button>
    </div>
  );
}
