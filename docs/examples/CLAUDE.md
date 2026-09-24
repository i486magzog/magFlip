# docs/examples — CLAUDE.md

MagFlip 사용 예제. **라이브러리 소스가 아니다.**

| 폴더 | 용도 | 주의 |
| --- | --- | --- |
| `local/index.html` | 로컬 빌드 번들(`../../../packages/minjs/magflip.min.js`)로 동작하는 테스트 페이지. 책은 `@magflip/shelf` 의 `BookShelf` 로 늘어놓고(처음은 책장), 위의 Grid/Shelf 버튼은 **페이지가** 만든다(라이브러리에 화면 말을 넣지 않음). 샘플 책에는 한글·영문 제목, 두께를 보려고 그림을 되풀이한 두꺼운 책(180쪽, 64쪽)이 있고, 책장이 한 줄을 넘도록 책등 그림이 없는 책 16권(`MORE_BOOKS`, 제목으로 색이 정해짐)을 더 꽂는다. Prev/Next/Move/Zoom/Expand 툴바, `window.flipView`·`window.shelf` 등 노출. 마지막 책은 `sample-book/`(게시본)을 `PublishedBookSource` 로 읽어 그린다. 키보드 조작은 `onViewerOpen` 에서 `RemoteController` 를 붙이고 `onViewerClose` 에서 `destroy()` 한다 | 루트 `npm run build:local && npm run serve` → `http://localhost:8190/docs/examples/local/`. `?tv=1` 이면 마우스 툴바 없이 TV 처럼 본다. 문서 사이트 `DemoFrame` 도 이 파일을 사용 |
| `prebuild/magflip.html` | CDN 번들 예제. **GitHub Pages 공개 데모 URL** (`i486magzog.github.io/magFlip/examples/prebuild/magflip.html`) | 경로 이동 금지. CDN 버전은 minjs `pub` 시 자동 갱신 — **지금의 0.5.48 은 core 가 책장을 그리던 버전**이라, 새 버전으로 올릴 때 `new BookShelf(...)` 로 바꿔야 책이 보인다. `resources/book1~3` 샘플 이미지는 local 예제와 문서 데모가 공유 |
| `react-ts/` | React 18 + Vite 예제 (Example1: 기본, Example2: 라벨·moveTo·onViewerClose) | 별도 `npm install`. 로컬 패키지는 `npm link` 로 연결 |

## 규칙

- 예제는 사용자 문서(`../magFlipDocs/docs/magflip/user`)의 코드와 일치하게 유지.
- 공개 API 만 사용한다 (private 멤버 접근 금지).
- 샘플 이미지 경로를 바꾸면 `../magFlipDocs/scripts/sync-demo.mjs` 의 복사 목록도 확인.
- `local/sample-book/` 은 손으로 고치지 않는다. `scripts/make-sample-book.mjs` 가 만들며 `npm run sample:book` 으로 다시 생성한다.
- 관련 skill: `update-examples`
