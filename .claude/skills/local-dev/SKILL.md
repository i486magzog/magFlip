---
name: local-dev
description: Build, type-check, test and run the MagFlip demo locally without bumping package versions. Use when asked to build, run, test, verify a change in the browser, or start the docs site for the magFlip monorepo.
---

# MagFlip 로컬 개발 / 검증

## 절대 규칙

`npm run build`(루트 또는 패키지)를 실행하지 않는다. `prebuild` 가 `npm version patch` 로 버전을 올린다. 항상 `build:local` 을 쓴다.
실수로 실행했다면 `git diff -- '*package.json' package-lock.json` 로 확인하고 사용자에게 알린 뒤 되돌린다.

## 절차 (저장소 루트)

1. 의존성: `node_modules/@magflip` 가 없으면 `npm install`.
2. 정적 검사: `npm run typecheck`
3. 단위 테스트: `npm test` (core·flipview 는 Jest, 나머지는 Vitest. core 는 TS 소스로 매핑되어 빌드 불필요)
4. 빌드: `npm run build:local` (i18n → doc → render → core → input → shelf → flipview → scrollview → minjs 순서 보장)
   - `@magflip/flipview/index.css ... external` 경고는 정상.
5. 브라우저 확인: `npm run serve` (백그라운드) → `http://localhost:8190/docs/examples/local/`
   - 포트 사용 중이면 `PORT=8081 npm run serve`.
   - 확인 항목: Grid/Shelf 전환, 책 호버(책장에서는 빠져나오며 표지가 보임), 책 클릭·Tab+Enter → 뷰어 표지로 날아와 열림, 오른쪽/왼쪽 zone 드래그 넘김, Next/Prev, Move(앞/뒤), Zoom 슬라이더, X·Esc 닫기 → 제자리로 날아감, 첫/마지막 페이지에서 닫힌 책 모양.
   - 날아가는 중간 모습은 책을 누른 직후 콘솔에서 `document.getAnimations().forEach(a => a.pause())` 하고 `currentTime` 을 옮겨 본다. 앱 브라우저 창이 가려져 있으면 페이지가 숨김 상태라 애니메이션 시간이 멈춘다(`a.finish()` 로 끝까지 돌릴 수 있다).
   - 콘솔: `window.flipView`, `window.bookViewer`, `window.shelf`. resize 시 `getBoundingClientRect` 에러는 알려진 이슈(known-issues #1).
6. 문서 사이트가 필요하면 옆 저장소 `../magFlipDocs` 에서: `npm install`(최초) → `npm run build:magflip` → `npm start` 또는 검증용 `npm run build`.

## 수정-확인 반복 (watch)

터미널 여러 개(백그라운드 작업)로: `npm run build:watch:core`, `npm run build:watch:flipview`, `npm run build:dev:watch:minjs`, `npm run serve`.

## 결과 보고

실행한 명령과 결과(통과/실패 로그 요약)를 그대로 보고한다. 브라우저 확인을 못 했으면 못 했다고 말한다.
