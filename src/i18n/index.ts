import { createI18n } from 'vue-i18n';
import { Locale } from 'vant';
import vantEn from 'vant/es/locale/lang/en-US';
import vantZh from 'vant/es/locale/lang/zh-CN';
import { messages } from './messages';

export type AppLocale = 'zh-CN' | 'en';

const STORAGE_KEY = 'locale';

function detectInitial(): AppLocale {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'zh-CN' || saved === 'en') return saved;
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: detectInitial(),
  fallbackLocale: 'zh-CN',
  messages,
});

const vantLangs: Record<AppLocale, typeof vantZh> = { 'zh-CN': vantZh, en: vantEn };

export function setLocale(locale: AppLocale) {
  i18n.global.locale.value = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.lang = locale;
  Locale.use(locale === 'en' ? 'en-US' : 'zh-CN', vantLangs[locale]);
}

export function currentLocale(): AppLocale {
  return i18n.global.locale.value as AppLocale;
}

// Translate outside of component setup (e.g. utils, stores).
export function t(key: string, named?: Record<string, unknown>): string {
  return named
    ? (i18n.global.t as (k: string, n: Record<string, unknown>) => string)(key, named)
    : (i18n.global.t as (k: string) => string)(key);
}

// Apply the saved locale to Vant immediately on load.
setLocale(currentLocale());
