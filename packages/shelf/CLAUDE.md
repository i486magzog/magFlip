# @magflip/shelf — CLAUDE.md

책 고르기 화면. 여러 권을 **격자**(앞표지 + 제목)나 **책장**(책등이 보이게, 선반 위)으로 늘어놓는다.
의존: `@magflip/core` 만. **책 한 권의 모습과 움직임은 core 에 있다** — 표지·책등·두께·호버(`book.objectEl`), 누르면 열기(`BookEvent.objectActivated` → `BookShelfManager.pickupAndView`), 뷰어까지 날아가기(`BookFlight`). 이 패키지는 그 요소를 놓기만 한다.

## 파일 지도

```
src/
├─ index.ts        공개 API (export * + shelf.css import)
├─ bookShelf.ts    BookShelf(addBook·removeBook·setLayout·destroy), ShelfLayout(Grid·Shelf)
└─ shelf.css       .mf-shelf.layout-grid (CSS grid) / .layout-shelf (flex-wrap + 선반 그라디언트)
__tests__/bookShelf.test.ts   Vitest + happy-dom, core 는 소스로 alias (vitest.config.ts)
```

## 핵심 규칙

- **배치만 한다.** 책 모양을 바꾸려면 core 의 `bookObjectEl.ts`/`bookObject.css` 를 고친다. 여기서 책 요소 안쪽(`.book-object-*`)을 꾸미지 않는다. 예외는 책 높이 `--mf-book-height` 하나 — 배치가 정한다.
- 클릭을 연결하지 않는다. `addBook` 이 `manager.importBookToShelf(book)` 을 부르면 core 가 누르기를 받는다.
- 배치마다 면이 정해져 있다(`LAYOUT_FACE`): 격자 = `BookFace.Front`, 책장 = `BookFace.Spine`. 바꿀 때는 `book.setObjectFace` 로만 — 비행이 `book.objectFace` 를 읽는다.
- 책장의 줄 높이는 모두 같다(가장 큰 책 + 여백 + 선반). 그래서 선반을 배경 반복 그라디언트로 그린다 — 줄 수만큼 요소를 만들지 않는다. 책이 적어도 `--mf-shelf-min-rows`(기본 3) 칸을 그리고(`min-height`), 한 줄에 들어가지 않는 책은 flex-wrap 으로 아래 칸에 선다.
- 나무는 `--mf-shelf-wood` 위에 결 그림을 `overlay` 로 겹친 것이다. 결은 브라우저가 그리는 잡음(SVG `feTurbulence` data URI, 0.5 회색 중심)이라 색을 바꿔도 결은 남는다. 선반·윗판은 컨테이너 배경(가로 결), 옆판은 `::before`/`::after`(세로 결). 그 위의 벽 층이 선반 자리만 비워 두어 결이 선반에만 보인다.
  - 빌드의 cssnano(svgo)가 SVG 를 줄인다(`rect` → `path`, id 이름 바꿈). 결을 고치면 빌드된 `index.css` 에서 필터가 남았는지 보고, 브라우저에서 1:1 크기로 본다.
- 책 사이 간격은 0. 틈이 있으면 포인터가 틈을 지날 때 빠져나온 책이 들어갔다 다시 나온다. 포인터를 받는 곳이 책의 자리라는 것은 core 의 규칙이다(`bookObject.css`).
- 책마다의 높이는 CSS 가 계산한다: `--mf-book-trim-height`(core 가 책에 씀) ÷ `--mf-shelf-tallest`(여기서 컨테이너에 씀). 가장 큰 책이 바뀔 때만 JS 가 개입하고, 그때는 `.is-resizing` 으로 전환 없이 적용한다.
- **화면 말을 넣지 않는다.** 제목은 책의 내용이라 번역하지 않고, 격자/책장 전환 버튼은 앱이 만든다(규칙: `../magBookDocs/docs/magflip/dev/i18n.md`).
- 내부 계산 함수를 export 하지 않는다 — minjs 가 모든 export 를 `window` 에 올린다.

## 명령

```bash
npm test -w packages/shelf            # vitest (core 는 소스로 alias → core 빌드 불필요)
npm run typecheck -w packages/shelf   # core 의 빌드된 타입 참조 → core 를 먼저 build:local
npm run build:local -w packages/shelf
```

CSS 는 `index.css` 로 추출된다. npm 으로 쓰는 앱은 `import '@magflip/shelf/index.css'` 를 따로 한다(minjs 번들은 주입).

## 문서

- 사용법: `../magBookDocs/docs/magflip/user/guides/bookshelf.mdx`
- 내부(core ↔ shelf 경계, 자세·비행): `../magBookDocs/docs/magflip/dev/book-object.md`
