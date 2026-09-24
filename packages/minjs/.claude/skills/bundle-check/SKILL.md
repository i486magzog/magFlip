---
name: bundle-check
description: Verify or change the @magflip/minjs browser bundle (magflip.min.js) — what it exports to window, CSS injection, sourcemaps, CDN version references. Use when the bundle is missing classes, styles, or when adding a package to it.
---

# minjs 번들 확인 / 변경

## 확인 절차

1. 루트에서 `npm run build:local` (의존 패키지 먼저 빌드됨).
2. 전역 노출 확인 — `npm run serve` 후 `docs/examples/local/` 콘솔에서:
   ```js
   ['Book', 'BookShelfManager', 'BookShelf', 'ShelfLayout', 'BookFace', 'FlipView', 'ScrollView', 'RemoteController', 'MZMath'].map(n => [n, typeof window[n]])
   ```
   내부 계산이 새지 않았는지도 본다: `['getBookPose', 'getFlightPath', 'RAISE_TURN'].filter(n => n in window)` 는 빈 배열이어야 한다.
3. CSS 주입 확인: `document.querySelectorAll('style').length > 0`, 뷰어 배경·페이지 배치가 정상인지.
4. 크기: `ls -la packages/minjs/magflip.min.js` (2026-09-24 기준 약 120KB — render·input·shelf 포함). 크게 늘면 원인 확인.

## 변경

- 패키지 추가/제거: `src/index.js` 의 `export *` 와 CSS import.
- IIFE `name: 'window', extend: true` 이므로 **모든 export 이름이 전역에 올라간다.** 일반적인 이름(`Point`, `Line`, `Rect` 등)이 호스트 페이지와 충돌할 수 있음을 고려.
- `rollup.config.js` 수정 후에는 prebuild 예제(CDN)와 local 예제 둘 다 영향 여부 확인.

## CDN 버전 문자열

`npm_scripts/update_version.mjs` 가 `pub` 때 `@magflip/minjs@x.y.z` 패턴을 `README.md`, `docs/examples/prebuild/magflip.html` 에서 교체한다. 다른 파일에 CDN URL 을 추가했다면 이 스크립트의 대상에도 추가할지 결정한다.
