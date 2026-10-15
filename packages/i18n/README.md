# @magflip/i18n

MagFlip 제품들이 화면의 말을 같은 방식으로 다루기 위한 작은 패키지입니다. 의존성이 없고 DOM 을 쓰지 않아 브라우저·Node·Cloudflare Workers 어디서나 돕니다.

```ts
import { createTranslator, resolveLocale } from '@magflip/i18n';

const MESSAGES = {
  'book.pages': { one: '{count} page', other: '{count} pages' },
  'book.published': 'Published version {version}',
};
const TRANSLATIONS = { ko: { 'book.pages': { other: '{count}쪽' } } };

const locale = resolveLocale({ chosen: user.locale, system: navigator.languages });
const t = createTranslator(locale, MESSAGES, TRANSLATIONS);

t.t('book.pages', { count: 12 });      // ko → '12쪽', en → '12 pages'
t.t('book.published', { version: 3 }); // 번역이 없으면 영어로
t.formatBytes(2_097_152);              // '2MB'
```

- `resolveLocale` — 사용자가 고른 언어 → 기기 언어 → 영어
- `createTranslator` — `t`, `has`, `formatNumber`, `formatDateTime`, `formatList`, `formatBytes`
- `pickText` — 서버가 데이터로 내려보내는 `{ en, ko }` 문자열 고르기
- `parseAcceptLanguage` / `readStoredLocale` / `storeLocale`

책 제목이나 저자가 쓴 글처럼 **문서·DB 에서 온 값은 번역하지 않습니다.**

문서: [다국어](https://i486magzog.github.io/magFlip/dev/i18n)

```bash
npm run build
npm run pub --otp=<otp>
```
