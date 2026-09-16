# MagFlip — CLAUDE.md

웹에서 책장을 넘기는 Page Flip 효과 라이브러리. npm workspaces 모노레포 (TypeScript + Rollup, 프레임워크 없이 DOM 직접 조작).

## 저장소 지도

| 경로 | 내용 | 가이드 |
| --- | --- | --- |
| `packages/doc` | `@magflip/doc` — Editor/Server/Viewer 공용 문서 모델(타입·zod 스키마·페이지 레이아웃·마스터·게시·Yjs 매핑) | `packages/doc/CLAUDE.md` |
| `packages/render` | `@magflip/render` — 게시된 surface 를 DOM 으로 그리는 공용 렌더러(뷰어·에디터 공용) | `packages/render/CLAUDE.md` |
| `packages/core` | `@magflip/core` — Book/Page 모델, BookShelfManager, BookViewer, MZMath, models.ts | `packages/core/CLAUDE.md` |
| `packages/input` | `@magflip/input` — 키보드·TV 리모컨 입력을 책 조작으로(키 매핑, 넘김 대기열, 방향 포커스) | `packages/input/CLAUDE.md` |
| `packages/flipview` | `@magflip/flipview` — FlipView(IBookView 구현), Flipping(상태·애니메이션·기하) | `packages/flipview/CLAUDE.md` |
| `packages/scrollview` | `@magflip/scrollview` — 스크롤 뷰 (개발 중, 뷰 플러그인 템플릿) | `packages/scrollview/CLAUDE.md` |
| `packages/minjs` | `@magflip/minjs` — 모든 패키지를 IIFE `magflip.min.js` 로 번들 | `packages/minjs/CLAUDE.md` |
| `docs/examples` | `local/`(로컬 번들 테스트), `prebuild/`(CDN 공개 데모, GitHub Pages), `react-ts/` | `docs/examples/CLAUDE.md` |
| `scripts/serve.mjs` | 의존성 없는 로컬 정적 서버 | |
| `docs/img/flip-math` | README 용 Flip 기하 그림 (문서 사이트에도 같은 그림) | |

문서 사이트는 옆 저장소 **`../magFlipDocs`** 에 있다(Docusaurus). 이 저장소의 문서는 `../magFlipDocs/docs/magflip/{user,dev}`, 작성 규칙은 그 저장소의 `CLAUDE.md` 와 `write-docs` skill.

의존 방향: `flipview`, `scrollview`, `input` → `core`; `render` → `doc`; `minjs` → 전부. **core 는 다른 MagFlip 패키지를 import 하지 않는다.**
`input` 은 뷰 구현(flipview)이 아니라 규약(`IBookView`)에만 의존한다 → 어떤 뷰에도 붙는다.
`doc` 은 아무 패키지에도 의존하지 않는다(가장 아래). Editor·Server 와 공유하는 형식이므로 DOM 코드를 넣지 않는다.
뷰어가 게시본을 그리는 경로는 `IPageData.render` 콜백이다 → core 는 게시 형식을 모른다.

## 명령어 (저장소 루트)

```bash
npm install              # workspaces 링크 (node_modules/@magflip/* → packages/*)
npm run build:local      # doc → render → core → input → flipview → scrollview → minjs 빌드. 버전 변경 없음
npm test                 # 전 패키지 (doc·render·input: Vitest, core·flipview: Jest)
npm run sample:book      # docs/examples/local/sample-book 게시본 다시 생성
npm run typecheck        # 모든 패키지 tsc --noEmit
npm run serve            # http://localhost:8090/docs/examples/local/
npm run dev              # build:local + serve
```

## 반드시 지킬 것

- **`npm run build` 를 로컬 확인용으로 실행하지 말 것.** 각 패키지 `prebuild` 가 `npm version patch` 로 package.json 버전을 올린다. 확인은 `build:local`, `build` 는 배포(release skill) 때만.
- 빌드 순서가 중요: flipview/scrollview 는 빌드된 `packages/core/index.js` 를, minjs 는 모든 `index.js` 를 import 한다.
- 빌드 산출물(`index.js`, `index.d.ts`, `index.css`, `dist/`, `types/`, `magflip.min.js`)은 git ignore 대상. `src/` 만 수정.
- 패키지 내부 import 는 상대 경로. `src/...` (baseUrl) 경로 금지.
- 공개 API 는 각 패키지 `src/index.ts` 의 `export *` 로만 노출.
- 고정 DOM id(`#bookShelf`, `#bookViewer`, `#bookContainer`, `#mzZone*`)와 `document.documentElement` CSS 변수를 사용한다 → 뷰어는 페이지당 1개.

## 코드 스타일 (사람이 읽기 쉬운 코드)

- 이름: 클래스 PascalCase, 인터페이스 `I` 접두사, DOM 변수 `...El`, 뷰포트 좌표 `...GP`, boolean `is/has...`.
- 데이터 클래스(`Book`)는 DOM 클래스(`BookEl`)를 상속. DOM 생성은 `XxxEl` / `createElements()` 에만.
- 좌표 계산은 DOM 없는 곳(`Flipping`, `MZMath`)에 두고 테스트 가능하게. 렌더링(속성/CSS 변수 쓰기)은 `FlipView`.
- 공개 멤버에 영문 JSDoc. 조기 반환으로 중첩 줄이기. 매직 넘버는 이름 있는 상수/config 로.
- 주석 처리된 죽은 코드를 새로 추가하지 않는다. 기존 파일의 들여쓰기(2칸)·따옴표 스타일을 따른다.
- 상세: `../magFlipDocs/docs/magflip/dev/development/coding-conventions.md`

## 변경 후 체크리스트

1. `npm run typecheck && npm test`
2. `npm run build:local` 후 `docs/examples/local` 에서 드래그 / Next / Prev / moveTo / Zoom / 닫기 확인
3. 공개 API 변경 → `../magFlipDocs/docs/magflip/user/reference/api.md` 갱신
4. 구조·흐름 변경 → `../magFlipDocs/docs/magflip/dev` 다이어그램, 해당 `CLAUDE.md`, 관련 skill 갱신
5. 발견한 버그/부채 → `../magFlipDocs/docs/magflip/dev/known-issues.md`

## Skills

- 루트 `.claude/skills/`: `local-dev`(빌드·테스트·데모), `release`(npm 배포)
- 패키지/폴더별: doc `doc-model-change`, render `render-change`, core `core-model-change`, flipview `flip-effect-debug`, scrollview `new-view-plugin`, minjs `bundle-check`, docs/examples `update-examples`

## Git

- 작업 브랜치 `dev/main`, 기본 브랜치 `main`. 커밋 메시지는 짧은 영어 명령형 (예: `Add docs site`, `Fix rounding error.`).
