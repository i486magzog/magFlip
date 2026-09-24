# @magflip/minjs — CLAUDE.md

코드 없는 번들 패키지. `src/index.js` 가 render/core/input/shelf/flipview/scrollview 를 re-export 하고 Rollup 이 IIFE(`name: 'window', extend: true`)로 묶어 **모든 export 를 전역(window)에 노출**한다. CSS 는 JS 에 주입된다.

## 파일

- `src/index.js` — `export * from '@magflip/...'` + CSS import
- `rollup.config.js` — iife + terser + postcss. `BUILD=dev` 이면 sourcemap
- `npm_scripts/update_version.mjs` — `pub` 시 루트 `README.md` 와 `docs/examples/prebuild/magflip.html` 의 CDN 버전(`@magflip/minjs@x.y.z`)을 package.json 버전으로 교체
- 출력 `magflip.min.js`(+`.map`) — git ignore, npm 배포 대상 (`jsdelivr` 필드)

## 규칙

- 먼저 core → input → shelf → flipview → scrollview 를 빌드해야 최신 코드가 번들된다 (루트 `npm run build:local` 이 순서 보장). flipview 는 core 를 자기 번들에 넣으므로 core 를 고쳤으면 flipview 도 다시 빌드한다.
- 빌드 시 `@magflip/flipview/index.css`, `@magflip/scrollview/index.css` 가 external 경고로 나오는 것은 기존 동작 (두 패키지는 CSS 를 JS 에 주입하므로 파일이 없음).
- 새 패키지를 번들에 넣으면 `src/index.js` 에 export 추가, 전역 이름 충돌 확인.
- 명령: `npm run build:local -w packages/minjs` (= `BUILD=dev`), 확인은 루트 `npm run serve` → `/docs/examples/local/`
- 관련 skill: `bundle-check`
