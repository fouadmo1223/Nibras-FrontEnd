'use client';

import { Languages, Monitor, Moon, Sun } from 'lucide-react';
import Menu from '@/components/ui/Menu';
import { useSwitchLocale } from '@/hooks/use-switch-locale';
import { LOCALES, LOCALE_META } from '@/i18n/config';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/cn';
import { setTheme, THEMES, useTheme } from '@/lib/theme';

export const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor };

const iconButton =
  'inline-grid size-9 place-items-center rounded-full text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground aria-expanded:bg-surface-muted aria-expanded:text-foreground';

export function ThemeMenu({ className }) {
  const { t } = useI18n();
  const theme = useTheme();
  const Icon = THEME_ICONS[theme];
  return (
    <Menu
      className={className}
      label={t('theme.change', { theme: t(`theme.${theme}`) })}
      triggerClassName={iconButton}
      triggerContent={<Icon className="size-[1.125rem]" aria-hidden="true" />}
      items={THEMES.map((id) => ({ id, label: t(`theme.${id}`), icon: THEME_ICONS[id], selected: theme === id, onSelect: () => setTheme(id) }))}
    />
  );
}

export function LanguageMenu({ className }) {
  const { t, locale } = useI18n();
  const switchLocale = useSwitchLocale();
  return (
    <Menu
      className={className}
      label={t('language.change', { language: LOCALE_META[locale].label })}
      triggerClassName={cn(iconButton, 'inline-flex w-auto items-center gap-1.5 px-2.5 text-sm font-medium')}
      triggerContent={
        <>
          <Languages className="size-[1.125rem]" aria-hidden="true" />
          <span aria-hidden="true">{LOCALE_META[locale].short}</span>
        </>
      }
      items={LOCALES.map((id) => ({
        id,
        label: LOCALE_META[id].label,
        lang: id,
        selected: locale === id,
        onSelect: () => id !== locale && switchLocale(id),
      }))}
    />
  );
}

/** Segmented radio group, for places with room to show every option (drawer, footer, account). */
function Segmented({ label, options, value, onChange, className }) {
  const onKeyDown = (event) => {
    const index = options.findIndex((o) => o.id === value);
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (step === undefined) return;
    event.preventDefault();
    // Arrow keys follow the visual direction, which flips in RTL.
    const visualStep = document.dir === 'rtl' && (event.key === 'ArrowRight' || event.key === 'ArrowLeft') ? -step : step;
    const next = options[(index + visualStep + options.length) % options.length];
    onChange(next.id);
    event.currentTarget.querySelector(`[data-id="${next.id}"]`)?.focus();
  };
  return (
    <div role="radiogroup" aria-label={label} onKeyDown={onKeyDown} className={cn('inline-flex rounded-lg border border-border bg-surface-muted p-1', className)}>
      {options.map((option) => {
        const Icon = option.icon;
        const checked = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            data-id={option.id}
            lang={option.lang}
            onClick={() => onChange(option.id)}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors',
              checked ? 'bg-surface text-foreground shadow-elevation-1' : 'text-foreground-muted hover:text-foreground',
            )}
          >
            {Icon && <Icon className="size-4" aria-hidden="true" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function ThemeSegmented({ className }) {
  const { t } = useI18n();
  const theme = useTheme();
  return (
    <Segmented
      className={className}
      label={t('theme.label')}
      value={theme}
      onChange={setTheme}
      options={THEMES.map((id) => ({ id, label: t(`theme.${id}`), icon: THEME_ICONS[id] }))}
    />
  );
}

export function LanguageSegmented({ className }) {
  const { t, locale } = useI18n();
  const switchLocale = useSwitchLocale();
  return (
    <Segmented
      className={className}
      label={t('language.label')}
      value={locale}
      onChange={(id) => id !== locale && switchLocale(id)}
      options={LOCALES.map((id) => ({ id, label: LOCALE_META[id].label, lang: id }))}
    />
  );
}
