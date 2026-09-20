# @magflip/i18n — CLAUDE.md

화면에 나오는 **말의 언어**를 다루는 공용 코드. Editor·Server·TV 가 같이 쓴다.
아무 패키지에도 의존하지 않는다(`@magflip/doc` 보다도 아래). DOM 을 쓰지 않으므로 Workers 에서도 돈다.

**말 자체(카탈로그)는 여기 없다.** 각 앱이 자기 `i18n/messages/` 에 갖는다 — 에디터 문구를 서버가 알 필요가 없다.

## 파일 지도

```
src/
├─ index.ts           공개 API
├─ locale.ts          Locale('en'|'ko'), DEFAULT_LOCALE='en', LOCALE_NAMES, matchLocale/matchLocales,
│                     resolveLocale({chosen, system}), parseAcceptLanguage
├─ message.ts         Message(문자열 | 복수형), MessageCatalog/MessageTranslations, formatMessage
├─ translator.ts      createTranslator(locale, 카탈로그, 번역) → ITranslator (t·has·format*)
├─ localizedText.ts   데이터로 오가는 문자열 { en, ko } 와 pickText (위젯 이름·필드 라벨)
└─ storage.ts         브라우저 캐시 'magflip.locale' (readStoredLocale / storeLocale)
```

## 핵심 규칙

- **영어(`DEFAULT_LOCALE`)가 타입의 주인.** 카탈로그는 `en` 이 전부 채운 것이고 다른 언어는 `Partial` — 빠진 키는 영어로 나온다. 그래서 새 문구를 영어로만 넣고 번역을 다음 커밋에 해도 빌드가 깨지지 않는다. 반대로 `en` 에 없는 키는 타입 오류다.
- **번역기는 값이다. 전역 "현재 언어"가 없다.** 서버는 요청마다, 에디터는 store 의 locale 로 만든다. 한 프로세스가 두 언어를 동시에 답할 수 있어야 하기 때문이다.
- **문장 단위로 키를 만든다.** 문자열을 코드에서 이어 붙이지 않는다(어순이 언어마다 다르다). 조건이 있으면 키 두 개로 나눈다.
- 숫자·날짜·목록·파일 크기는 `Intl` 로 — `t` 에 넘긴 숫자도 `Intl.NumberFormat` 을 거친다. 직접 `toLocaleString()` 을 부르거나 단위를 손으로 붙이지 않는다.
- 값이 없는 `{name}` 은 그대로 남긴다. 조용히 지우면 말이 되는 다른 문장이 되어 버린다.
- **문서·DB 에서 온 값은 여기를 거치지 않는다.** 책 제목, 텍스트 요소 내용, 저자가 위젯에 써 넣은 값, 파일 이름, 사용자 이름은 그대로 보여 준다. `ILocalizedText` 는 *제품이 쓴* 문자열이 데이터로 오갈 때만 쓴다(서버 위젯 등록부).

## 언어를 하나 더 넣을 때

1. `locale.ts` 의 `LOCALES` 와 `LOCALE_NAMES` 에 추가 (이름은 그 언어로 쓴 제 이름).
2. 각 앱의 `i18n/messages/<코드>.ts` 를 만들고 `messages/index.ts` 의 `TRANSLATIONS` 에 등록. 다 못 채워도 된다.
3. 서버 `src/i18n/` 의 위젯 등록부처럼 데이터로 나가는 문자열에 그 언어 칸을 채운다.
4. 복수형이 영어와 다른 언어라면 `IPluralMessage` 의 나머지 칸(`few`·`many` 등)을 쓴다. 이름은 `Intl.PluralRules` 가 돌려주는 그대로.

## 명령

```bash
npm run typecheck -w packages/i18n
npm test -w packages/i18n              # vitest, node 환경
npm run build:local -w packages/i18n   # index.js / index.d.ts (버전 안 올림)
```

## 변경 체크리스트

1. `npm test -w packages/i18n && npm run build:local -w packages/i18n`
2. 소비하는 쪽(`../../magFlipEditor`, `../../magFlipServer`, `../../magFlipTV`)은 `file:` 링크로 **빌드 산출물**을 본다 → 여기서 build:local 을 먼저 돌려야 반영된다.
3. 문서: `../../magFlipDocs/docs/magflip/dev/i18n.md`
