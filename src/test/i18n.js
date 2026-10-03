import I18nProvider from '@/i18n/I18nProvider';
import en from '@/i18n/messages/en.json';
import ar from '@/i18n/messages/ar.json';

const messages = { en, ar };

/** Wraps a component under test in the translation provider (English unless told otherwise). */
export function withI18n(ui, locale = 'en') {
  return (
    <I18nProvider locale={locale} messages={messages[locale]} fallback={locale === 'en' ? null : en}>
      {ui}
    </I18nProvider>
  );
}
