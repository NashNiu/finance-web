// Pin the locale for unit tests. The formatting utilities are locale-aware;
// these specs assert the default Chinese (zh-CN) output, so make the runtime
// locale deterministic regardless of the jsdom navigator language.
import { setLocale } from '@/i18n';

setLocale('zh-CN');
