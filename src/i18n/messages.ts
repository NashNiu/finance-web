import common from './locales/common';
import tabbar from './locales/tabbar';
import period from './locales/period';
import home from './locales/home';
import bills from './locales/bills';
import search from './locales/search';
import me from './locales/me';
import record from './locales/record';
import category from './locales/category';
import reports from './locales/reports';
import login from './locales/login';
import components from './locales/components';

interface Fragment {
  name: string;
  zh: Record<string, unknown>;
  en: Record<string, unknown>;
}

const fragments: Fragment[] = [
  common,
  tabbar,
  period,
  home,
  bills,
  search,
  me,
  record,
  category,
  reports,
  login,
  components,
];

export const messages = {
  'zh-CN': Object.fromEntries(fragments.map((f) => [f.name, f.zh])),
  en: Object.fromEntries(fragments.map((f) => [f.name, f.en])),
};
