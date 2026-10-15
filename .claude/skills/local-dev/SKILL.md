---
name: local-dev
description: Build, type-check, test and run the MagFlip demo locally without bumping package versions. Use when asked to build, run, test, verify a change in the browser, or start the docs site for the magFlip monorepo.
---

# MagFlip 로컬 개발 / 검증

## 절대 규칙

확인용 빌드는 항상 `build:local` 을 쓴다. `npm run build` 는 배포용(minjs 압축, sourcemap 없음)이다.
빌드는 버전을 바꾸지 않는다. 버전은 배포할 때 `npm run version:set` 으로만 바꾼다(release skill).

## 절차 (저장소 루트)

1. 의존성: `node_modules/@magflip` 가 없으면 `npm install`.
2. 정적 검사: `npm run typecheck`
3. 단위 테스트: `npm test` (core·flipview 는 Jest, 나머지는 Vitest. core 는 TS 소스로 매핑되어 빌드 불필요)
4. 빌드: `npm run build:local` (i18n → doc → render → core → input → shelf → flipview → scrollview → minjs 순서 보장)
   - `@magflip/flipview/index.css ... external` 경고는 정상.
5. 브라우저 확인: `npm run serve` (백그라운드) → `http://localhost:8190/docs/examples/local/`
   - 포트 사용 중이면 `PORT=8191 npm run serve`.
   - 확인 항목: Grid/Shelf 전환, 책장이 적어도 세 칸이고 창을 좁히면 책이 아래 칸으로 넘어감, 책 호버(책장에서는 빠져나오며 표지가 보임 — 왼쪽→오른쪽으로 쓸어도 표지에 덮인 책이 차례로 빠져나와야 한다), 책 클릭·Tab+Enter → 뷰어 표지로 날아와 열림, 오른쪽/왼쪽 zone 드래그 넘김, Next/Prev, Move(앞/뒤), Zoom 슬라이더, X·Esc 닫기 → 제자리로 날아감, 첫/마지막 페이지에서 닫힌 책 모양.
   - 날아가는 중간 모습은 책을 누른 직후 콘솔에서 `document.getAnimations().forEach(a => a.pause())` 하고 `currentTime` 을 옮겨 본다. 앱 브라우저 창이 가려져 있으면 페이지가 숨김 상태라 애니메이션 시간이 멈춘다(`a.finish()` 로 끝까지 돌릴 수 있다).
   - 콘솔: `window.flipView`, `window.bookViewer`, `window.shelf`. resize 시 `getBoundingClientRect` 에러는 알려진 이슈(known-issues #1).
6. 가이드(`guide/`)는 Markdown/MDX 파일이라 이 저장소에서 따로 빌드하지 않는다. 작성 규칙은 `guide/dev/development/writing-docs.md`.

## 수정-확인 반복 (watch)

터미널 여러 개(백그라운드 작업)로: `npm run build:watch:core`, `npm run build:watch:flipview`, `npm run build:dev:watch:minjs`, `npm run serve`.

## 결과 보고

실행한 명령과 결과(통과/실패 로그 요약)를 그대로 보고한다. 브라우저 확인을 못 했으면 못 했다고 말한다.
