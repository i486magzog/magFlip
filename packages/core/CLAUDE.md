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
│  ├─ helper.ts             deepMerge (target 을 변경함에 주의)
│  ├─ bookObjectMetrics.ts  책 객체: 두께(getSpineRatio), 면의 각도·깊이, 자세(getBookPose). index 에서 export 안 함
│  └─ flightPath.ts         제자리 ↔ 뷰어 비행의 프레임(getFlightPath). index 에서 export 안 함
└─ core/
   ├─ base.ts               Base extends MZEvent
   ├─ bookShelfManager.ts   진입점. 책 목록 + BookViewer 소유, pickupAndView / returnBookToShelf 에서 비행 시작
   ├─ bookViewer.ts         #bookViewer, #btnClose, 뷰 등록/선택, setZoomLevel, closeViewer(흐려지며 사라짐), getClosedBookPlace, awaitBook
   ├─ book.ts / bookEl.ts   Book(데이터·페이지 맵·책 객체) extends BookEl(.book/.container/.label-container)
   ├─ bookObjectEl.ts       책 객체 — 밖에서 본 닫힌 책(3D 상자: 표지·책등·종이 면). book.objectEl
   ├─ bookFlight.ts         날아가는 복사본 (Web Animations). canFly / land / cancel
   ├─ page.ts / pageEl.ts   Page extends PageEl(.page[pageIdx] > .content-container > .content)
   ├─ pageLabel(El).ts      책 옆 라벨 탭 (BookEl.labelEls 에 { pageIndex, element } 로 모임; 어느 쪽에 붙일지는 뷰가 정한다. resetBookEls 는 라벨 컨테이너를 지우지 않는다)
   ├─ core.css              뷰어 기본 스타일, .book-arriving / .is-closing
   └─ bookObject.css        책 객체의 크기 변수·면·자세·.is-picked-up / .is-flying
```

## 핵심 개념

- 상속: `MZEvent ← Base ← BookEl ← Book`, `Base ← PageEl ← Page`, `Base ← BookViewer`.
- `Book.lastPageIndex` 는 짝수면 +1 (항상 홀수). 펼침에서 왼쪽 index 는 홀수, 오른쪽은 짝수. 표지(0)는 오른쪽.
- `Book.getPage(i, true)` 는 없는 index 에 Empty 페이지를 생성·추가한다. `resetBook()` 이 Empty 페이지를 제거한다.
- **페이지 요소는 처음 요구받을 때 만들어진다.** `PageEl.element`/`contentEl` 은 getter 이고, 만드는 순간 `IPageData.render`(또는 `content`/`image`)가 실행된다 — 게시본이라면 그 페이지를 그때 받아 온다. 그래서 수천 쪽 책도 창에 들어온 6쪽만 만들어진다.
  - 모든 페이지를 도는 코드는 `page.hasElements` 를 먼저 보고, 아니면 건드리지 않는다(`Book.resetBook`, `FlipView.appendShadowEl4AllPage` 가 그렇게 한다). 요소를 요구하는 순간 책 전체가 만들어진다.
  - 요소를 DOM 에 넣는 쪽(FlipView)은 `pageElOf()` 한 곳을 지나며, 거기서 처음 만들어진 페이지에 그림자를 붙인다.
- **core 는 책 한 권만 안다.** 책장·격자 배치는 `packages/shelf`(또는 앱). core 에 레이아웃·선반 개념을 넣지 않는다. `BookShelfManager` 는 이름만 남았고 책을 들고 있다가 여는 일을 한다(`hideBookShelf` 는 폐기, 아무 일도 안 함).
- **책 객체(`book.objectEl`)도 처음 요구받을 때 만들어진다.** 이미 있는지는 `hasObjectEl`. `setObjectFace`·`setObjectPickedUp`·`getObjectPlace` 는 만들어지지 않은 객체를 만들지 않는다(TV 처럼 읽기만 하는 곳이 표지 그림을 받지 않게).
  - 누르면(`click`, `Enter`, `Space`) `BookEvent.objectActivated` → 책을 가진 매니저가 `pickupAndView`. 배치하는 쪽은 클릭을 연결하지 않는다.
  - 크기는 CSS 변수(`--mf-book-height` 는 놓는 쪽, `--mf-book-aspect`/`-spine`/`-trim-height` 는 책). 자세는 모두 `translate3d() rotateY()` 모양 — `getBookPose()` 와 `bookObject.css` 의 숫자를 같이 고친다.
  - 포인터는 책의 **자리**(`.book-object` 의 레이아웃 상자)만 받는다. 도는 몸체 `.book-object-body` 는 `pointer-events: none`. 빠져나온 표지가 오른쪽 책들을 덮어도 포인터가 그 책의 자리에 들어가면 그 책이 올라오고, 자리는 움직이지 않으니 책이 포인터 밑에서 빠져나가 떨리는 일도 없다. 몸체나 면에 포인터를 다시 켜지 않는다.
- **비행**: 원본이 아니라 복사본(`BookFlight`)이 날고, 원본은 `.is-picked-up` 으로 자리만 비운다. 도착·출발 위치는 뷰의 `getClosedBookPlace?()`(없으면 날지 않음). 동작 줄이기·`animateBook: false`·`Element.animate` 없음이면 `canFly()` 가 false.
- `Book.fetchPages()` / `BookShelfManager.loadAndAddBooks()` 는 서버 연동 전 샘플 코드(TODO).
- `IBookView` 가 뷰 플러그인 규약. core 는 구체 뷰(FlipView)를 모른다.
- `EventStatus`, `Zone`, `AutoFlipType` 은 flipview 전용이지만 현재 core 에 있다 (이동 TODO, breaking).

## 작업 규칙

- 새 공개 타입/클래스는 `src/index.ts` 에 export 되는지 확인. 없으면 추가.
- models.ts 의 인터페이스 변경은 flipview/scrollview 컴파일에 영향 → 루트에서 `npm run typecheck`.
- 공개 API 변경 시 `guide/user/reference/api.md`, 클래스 관계 변경 시 `guide/dev/architecture/class-model.md` 갱신. 책 객체·비행은 `guide/dev/book-object.md`.
- 명령: `npm test -w packages/core`(jest, DOM 없이 `__tests__/documentStub.ts` 로 돈다 — 책 객체의 DOM 은 여기서 만들지 않고 `packages/shelf` 의 happy-dom 테스트에서 본다), `npm run typecheck -w packages/core`, `npm run build:local -w packages/core` (`npm run build` 는 버전 증가 — 금지).
- flipview/scrollview 는 core 의 **빌드된** `index.d.ts` 를 본다. models.ts 를 고쳤으면 `npm run build:local -w packages/core` 를 먼저 돌려야 그쪽 typecheck 가 맞는다.
- 관련 skill: `core-model-change`
