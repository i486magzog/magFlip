# MagFlip — CLAUDE.md

웹에서 책장을 넘기는 Page Flip 효과 라이브러리. npm workspaces 모노레포 (TypeScript + Rollup, 프레임워크 없이 DOM 직접 조작).

## 저장소 지도

| 경로 | 내용 | 가이드 |
| --- | --- | --- |
| `packages/i18n` | `@magflip/i18n` — 앱 공용 다국어 기반(로케일·메시지 카탈로그·복수형·Intl 서식). 말 자체는 각 앱이 가진다 | `packages/i18n/CLAUDE.md` |
| `packages/doc` | `@magflip/doc` — 편집기·서버·뷰어가 함께 쓰는 문서 모델(타입·zod 스키마·페이지 레이아웃·마스터·게시·Yjs 매핑) | `packages/doc/CLAUDE.md` |
| `packages/render` | `@magflip/render` — 게시된 surface 를 DOM 으로 그리는 공용 렌더러(뷰어·에디터 공용) | `packages/render/CLAUDE.md` |
| `packages/core` | `@magflip/core` — Book/Page 모델, 책 한 권의 모습(책 객체)과 열고 닫는 비행, BookShelfManager, BookViewer, MZMath, models.ts | `packages/core/CLAUDE.md` |
| `packages/input` | `@magflip/input` — 키보드·TV 리모컨 입력을 책 조작으로(키 매핑, 넘김 대기열, 방향 포커스) | `packages/input/CLAUDE.md` |
| `packages/shelf` | `@magflip/shelf` — 책 고르기 화면: 여러 권을 격자(표지)나 책장(책등)으로 배치 | `packages/shelf/CLAUDE.md` |
| `packages/flipview` | `@magflip/flipview` — FlipView(IBookView 구현), Flipping(상태·애니메이션·기하) | `packages/flipview/CLAUDE.md` |
| `packages/scrollview` | `@magflip/scrollview` — 스크롤 뷰 (개발 중, 뷰 플러그인 템플릿) | `packages/scrollview/CLAUDE.md` |
| `packages/minjs` | `@magflip/minjs` — 모든 패키지를 IIFE `magflip.min.js` 로 번들 | `packages/minjs/CLAUDE.md` |
| `docs/examples` | `local/`(로컬 번들 테스트), `prebuild/`(CDN 공개 데모, GitHub Pages), `react-ts/`(React 코드 예제) | `docs/examples/CLAUDE.md` |
| `scripts/serve.mjs` | 의존성 없는 로컬 정적 서버 | |
| `guide` | `user/`(라이브러리를 쓰는 사람), `dev/`(MagFlip 을 개발하는 사람) 가이드. Docusaurus 형식 Markdown/MDX | `guide/dev/development/writing-docs.md` |
| `docs/img/flip-math` | Flip 기하 그림 (README 와 `guide/dev/flipview/flip-geometry.md` 가 같이 쓴다) | |

문서는 `guide/{user,dev}` 에 있다. Docusaurus 문서 사이트가 이 폴더를 그대로 읽어 보여 준다. 작성 규칙은 `guide/dev/development/writing-docs.md`.

의존 방향: `flipview`, `scrollview`, `input`, `shelf` → `core`; `render` → `doc`; `minjs` → 전부. **core 는 다른 MagFlip 패키지를 import 하지 않는다.**
**core 에는 책 한 권에 대한 것만 둔다.** 책장·격자처럼 여러 권을 늘어놓는 배치는 `shelf`(또는 앱)가 한다 — core 는 책의 모습(`book.objectEl`)과 열고 닫는 움직임까지만 안다.
`input` 은 뷰 구현(flipview)이 아니라 규약(`IBookView`)에만 의존한다 → 어떤 뷰에도 붙는다.
`doc` 과 `i18n` 은 아무 패키지에도 의존하지 않는다(가장 아래). 편집기·서버(브라우저 밖)에서도 쓰므로 DOM 코드를 넣지 않는다.
화면의 말은 `i18n`, 문서·DB 에서 온 값은 번역하지 않는다 → 뷰어·렌더러는 `i18n` 을 import 하지 않는다(글자가 전부 내용이다).
뷰어가 게시본을 그리는 경로는 `IPageData.render` 콜백이다 → core 는 게시 형식을 모른다.

## 명령어 (저장소 루트)

```bash
npm install              # workspaces 링크 (node_modules/@magflip/* → packages/*)
npm run build:local      # i18n → doc → render → core → input → shelf → flipview → scrollview → minjs 빌드 (minjs 는 sourcemap 있는 dev 빌드)
npm test                 # 전 패키지 (i18n·doc·render·input·shelf: Vitest, core·flipview: Jest)
npm run sample:book      # docs/examples/local/sample-book 게시본 다시 생성
npm run typecheck        # 모든 패키지 tsc --noEmit
npm run serve            # http://localhost:8190/docs/examples/local/
npm run dev              # build:local + serve
```

## 반드시 지킬 것

- **모든 `@magflip/*` 패키지는 같은 버전을 쓴다.** 버전은 배포할 때 `npm run version:set -- x.y.z` 로만 바꾼다(패키지끼리 요구하는 범위도 `^x.y.z` 로 함께). 빌드는 버전을 바꾸지 않는다. 확인은 `build:local`, 배포용 빌드(minjs 압축)는 `npm run build`(release skill).
- 빌드 순서가 중요: flipview/scrollview 는 빌드된 `packages/core/index.js` 를, minjs 는 모든 `index.js` 를 import 한다.
- 빌드 산출물(`index.js`, `index.d.ts`, `index.css`, `dist/`, `types/`, `magflip.min.js`)은 git ignore 대상. `src/` 만 수정.
- 패키지 내부 import 는 상대 경로. `src/...` (baseUrl) 경로 금지.
- 공개 API 는 각 패키지 `src/index.ts` 의 `export *` 로만 노출.
- 고정 DOM id(`#bookViewer`, `#bookContainer`, `#mzZone*`)와 `document.documentElement` CSS 변수를 사용한다 → 뷰어는 페이지당 1개. `#bookShelf` 는 `shelf` 가 요소를 받지 못했을 때 쓰는 기본 id.
- `minjs` 는 모든 export 를 `window` 에 올린다 → 패키지 내부에서만 쓰는 계산 함수·상수는 `src/index.ts` 에서 re-export 하지 않는다(예: core 의 `bookObjectMetrics`, `flightPath`).

## 코드 스타일 (사람이 읽기 쉬운 코드)

- 이름: 클래스 PascalCase, 인터페이스 `I` 접두사, DOM 변수 `...El`, 뷰포트 좌표 `...GP`, boolean `is/has...`.
- 데이터 클래스(`Book`)는 DOM 클래스(`BookEl`)를 상속. DOM 생성은 `XxxEl` / `createElements()` 에만.
- 좌표 계산은 DOM 없는 곳(`Flipping`, `MZMath`)에 두고 테스트 가능하게. 렌더링(속성/CSS 변수 쓰기)은 `FlipView`.
- 공개 멤버에 영문 JSDoc. 조기 반환으로 중첩 줄이기. 매직 넘버는 이름 있는 상수/config 로.
- 주석 처리된 죽은 코드를 새로 추가하지 않는다. 기존 파일의 들여쓰기(2칸)·따옴표 스타일을 따른다.
- 상세: `guide/dev/development/coding-conventions.md`

## 변경 후 체크리스트

1. `npm run typecheck && npm test`
2. `npm run build:local` 후 `docs/examples/local` 에서 책장·격자 전환, 책 호버·클릭(날아가 열림), 드래그 / Next / Prev / moveTo / Zoom / 닫기(제자리로 돌아감) 확인
3. 공개 API 변경 → `guide/user/reference/api.md` 갱신
4. 구조·흐름 변경 → `guide/dev` 다이어그램, 해당 `CLAUDE.md`, 관련 skill 갱신
5. 발견한 버그/부채 → `guide/dev/known-issues.md`

## Skills

- 루트 `.claude/skills/`: `local-dev`(빌드·테스트·데모), `release`(npm 배포)
- 패키지/폴더별: doc `doc-model-change`, render `render-change`, core `core-model-change`, flipview `flip-effect-debug`, scrollview `new-view-plugin`, minjs `bundle-check`, docs/examples `update-examples`
- 책 고르기 화면의 설계(core ↔ shelf 경계, 자세·비행 계산): `guide/dev/book-object.md`

## Git

- 작업 브랜치 `claude`, 기본 브랜치 `main`. `claude` 에서 작업하고 `claude` → `main` PR 로 합친다. 커밋 메시지는 짧은 영어 명령형 (예: `Add docs site`, `Fix rounding error.`).
