# @magflip/core — CLAUDE.md

MagFlip 의 모델·오케스트레이션·공통 유틸. 다른 `@magflip/*` 패키지에 의존하지 않는다.

## 파일 지도

```
src/
├─ index.ts                 공개 API (export * + core.css import)
├─ common/                  DOM·상태 비의존 코드
│  ├─ models.ts             인터페이스·enum: IBookData, IPageData, IBookView, PageType, Zone, EventStatus …
│  ├─ dimension.ts          ISize, SizeExt(diagonal), BookSize(closed/opened)
│  ├─ shape.ts              Point, Line, Rect(leftTop … centerBottom getter)
│  ├─ mzMath.ts             각도(radian/degree), 거리, 대칭점, 수선의 발, 요소 offset
│  ├─ event.ts              MZEvent (add/remove/emitEvent)
│  └─ helper.ts             deepMerge (target 을 변경함에 주의)
└─ core/
   ├─ base.ts               Base extends MZEvent
   ├─ bookShelfManager.ts   진입점. BookShelf + BookViewer 소유, pickupAndView / returnBookToShelf
   ├─ bookShelf.ts          #bookShelf, .book-holder
   ├─ bookViewer.ts         #bookViewer, #btnClose, 뷰 등록/선택, setZoomLevel, closeViewer, onViewerOpen/Close 콜백
   ├─ book.ts / bookEl.ts   Book(데이터·페이지 맵) extends BookEl(.book/.container/.label-container)
   ├─ page.ts / pageEl.ts   Page extends PageEl(.page[pageIdx] > .content-container > .content)
   ├─ pageLabel(El).ts      책 옆 라벨 탭
   └─ core.css              책장·뷰어 기본 스타일
```

## 핵심 개념

- 상속: `MZEvent ← Base ← BookEl ← Book`, `Base ← PageEl ← Page`, `Base ← BookViewer`.
- `Book.lastPageIndex` 는 짝수면 +1 (항상 홀수). 펼침에서 왼쪽 index 는 홀수, 오른쪽은 짝수. 표지(0)는 오른쪽.
- `Book.getPage(i, true)` 는 없는 index 에 Empty 페이지를 생성·추가한다. `resetBook()` 이 Empty 페이지를 제거한다.
- **페이지 요소는 처음 요구받을 때 만들어진다.** `PageEl.element`/`contentEl` 은 getter 이고, 만드는 순간 `IPageData.render`(또는 `content`/`image`)가 실행된다 — 게시본이라면 그 페이지를 그때 받아 온다. 그래서 수천 쪽 책도 창에 들어온 6쪽만 만들어진다.
  - 모든 페이지를 도는 코드는 `page.hasElements` 를 먼저 보고, 아니면 건드리지 않는다(`Book.resetBook`, `FlipView.appendShadowEl4AllPage` 가 그렇게 한다). 요소를 요구하는 순간 책 전체가 만들어진다.
  - 요소를 DOM 에 넣는 쪽(FlipView)은 `pageElOf()` 한 곳을 지나며, 거기서 처음 만들어진 페이지에 그림자를 붙인다.
- `Book.fetchPages()` / `BookShelfManager.loadAndAddBooks()` 는 서버 연동 전 샘플 코드(TODO).
- `IBookView` 가 뷰 플러그인 규약. core 는 구체 뷰(FlipView)를 모른다.
- `EventStatus`, `Zone`, `AutoFlipType` 은 flipview 전용이지만 현재 core 에 있다 (이동 TODO, breaking).

## 작업 규칙

- 새 공개 타입/클래스는 `src/index.ts` 에 export 되는지 확인. 없으면 추가.
- models.ts 의 인터페이스 변경은 flipview/scrollview 컴파일에 영향 → 루트에서 `npm run typecheck`.
- 공개 API 변경 시 `../magFlipDocs/docs/magflip/user/reference/api.md`, 클래스 관계 변경 시 `../magFlipDocs/docs/magflip/dev/architecture/class-model.md` 갱신.
- 명령: `npm test -w packages/core`(jest, DOM 없이 `__tests__/documentStub.ts` 로 돈다), `npm run typecheck -w packages/core`, `npm run build:local -w packages/core` (`npm run build` 는 버전 증가 — 금지).
- flipview/scrollview 는 core 의 **빌드된** `index.d.ts` 를 본다. models.ts 를 고쳤으면 `npm run build:local -w packages/core` 를 먼저 돌려야 그쪽 typecheck 가 맞는다.
- 관련 skill: `core-model-change`
