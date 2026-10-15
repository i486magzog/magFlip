# @magflip/flipview — CLAUDE.md

책장을 넘기는 뷰 플러그인. `FlipView` 가 `IBookView` 를 구현한다. 가장 복잡한 패키지.

## 파일 지도

| 파일 | 책임 |
| --- | --- |
| `src/flipView.ts` (~1300줄) | DOM/SVG defs 생성, 6개 Zone 마우스 이벤트, `flipPage()` 렌더링(mask points·CSS 변수·그림자), `shiftPages`/`updateHiddenPages`, `nextPage`/`prevPage`/`moveTo`/`autoFlip` |
| `src/flipManager.ts` | `class Flipping extends PageWindow` (import alias `FlipManager`). `eventStatus`, `setInitFlipping`, `flip()` 기하 계산 → `FlipData`, `animateFlip*`, `getInfoToFlip`, `updateMousePointOnArea` |
| `src/pageWindow.ts` | 6칸 슬롯 `windows[0..5]`, `moveRight`/`moveLeft` |
| `src/panning.ts` | `clampPan()` — 확대·이동 시 책이 화면 밖으로 나가지 않게 자르는 순수 함수 |
| `src/flipData.ts` | 프레임 계산 결과: `page2{top,left,rotate}`, `mask.page1/page2{p1..p4}`, `shadow` |
| `src/flipDiagonals.ts`, `flipDiagonal.ts` | 마우스 제한 Area 1~4 (반지름·각도 범위) |
| `src/flipActionLine.ts`, `gutter.ts` | 드래그 기준 수평선, 책 가운데 선 |
| `src/flipView.css` | `.page:nth-child(1..6)` 배치·z-index, 상태 클래스, 그림자, `#mzZone*` 크기 |
| `__tests__/` | Jest. `@magflip/core` → core TS 소스로 매핑(jest.config.cjs). `example.test.ts` 는 주석 처리된 초안(무시됨) |

## 머릿속 모델

- 슬롯: `[0][1]` 왼쪽 숨김, `[2]` 보이는 왼쪽(`curOpenLeftPageIndex`), `[3]` 보이는 오른쪽, `[4][5]` 오른쪽 숨김. DOM 순서 = 슬롯 순서 = CSS nth-child.
- 오른쪽 넘김: page1=`[3]`, page2=`[4]`, page3=`[5]`. 왼쪽 넘김: page1=`[2]`, page2=`[1]`, page3=`[0]`.
- 책 상태: `ready-to-open front`(cur<0) / spread open / `ready-to-open end`(cur>=lastPageIndex). `updateDimension()` 이 Gutter 를 재계산.
- `EventStatus` 는 비트 플래그: `None → AutoFlipFromCorner ⇄ AutoFlipToCorner`, `Dragging → SnappingBack|FlippingForward|FlippingBackward → None`, `Flipping`(버튼) `→ None`. `status & EventStatus.Flipping` 이면 입력 무시.
- 넘김/드래그가 끝나 `None` 으로 돌아갈 때는 `eventStatus = None` 을 직접 쓰지 말고 `flipManager.finishFlip()` 을 부른다 → 공개 `onFlipEnd` 리스너가 불린다. 공개 `isFlipping` 은 `Flipping|Dragging` 비트, 내부 `isPageLifted` 는 여기에 `AutoFlip`(호버)까지 포함.
- `Zone` 도 비트 플래그 (`zone & Zone.Left`, `zone & Zone.Top`).
- 좌표는 뷰포트 기준(`...GP`). SVG/CSS 에 쓸 때 `/ zoomLevel`.
- `#bookContainer` transform 은 `translate(pan) scale(zoom)`. 이동 단위는 화면 픽셀. **책을 옮기면 `updateDimension()` 을 불러 `gutter` 를 다시 재야 한다**(안 그러면 접힘이 옛 가운데 선 기준으로 계산된다). `zoom()` 은 `setViewer()` 안에서 이미 부른다.
- `pivot` = 오른쪽 +1 / 왼쪽 -1 로 공식을 좌우 재사용.
- 하드커버(`book.cover === BookCover.Hard`): 0·1번과 마지막 두 쪽이 판지. 판이 넘어갈 때 `flipPage()` 는 마스크 대신 `turnHardSheet()` 로 각도(`--hard-angle`, `Flipping.getHardSheetAngle`)만 쓰고, `#bookContainer.hard-sheet-turning` 의 CSS(flipView.css "Hard cover")가 page1/page2 를 책등 축으로 `rotateY` 한다. 그늘은 `.hard-shade`: 책등 쪽 그늘(`--hard-lift`)에 더해, 판이 기운 쪽 페이지에 판의 그림자(`--hard-reach` 까지, `--hard-cast-own`/`--hard-cast-far`). `autoFlip` 은 판이면 각도를 이징으로 움직인다.
- 라벨: core 의 `book.labelEls`(`{ pageIndex, element }`). `placeLabels()` 가 `pageIndex <= curOpenLeftPageIndex` 면 `.left`, 아니면 `.right` 를 붙인다(`updateDimension()` 에서, 넘기는 중이면 건너뜀). 넘김이 시작될 때(드래그 mousedown, `autoFlip`) `hideLabelsTurnedOver(현재 왼쪽, 목표 왼쪽)` 가 그 사이 페이지의 라벨에 `.hidden-while-flipping`, 넘김·스냅백이 끝나면 `placeLabels()` 로 다시 보인다.
- `config.flipOnClick`(기본 true): `documentMouseUp` 이 `getInfoToRelease(viewport, flipOnClick)` 로 넘긴다. false 면 클릭도 보통 놓기처럼 가까운 모서리로(대개 제자리) 간다.

## 작업 규칙

- 계산 변경은 `flipManager.ts`(DOM 없이) 에, 렌더링 변경은 `flipView.ts` 에. 새 계산은 `__tests__` 에 테스트 추가.
- `flip()` 의 점 이름(f,g,h,i / j,k,l,m)과 a,b,c,d 는 `docs/img/flip-math/*.png` 그림과 대응 — 이름 유지.
- 한 페이지당 뷰어 1개 가정(고정 id, 전역 CSS 변수)을 깨지 않도록.
- 검증: `npm test -w packages/flipview`, `npm run typecheck`, 루트 `npm run dev` 후 드래그(6개 zone)·Next·Prev·moveTo(앞/뒤)·Zoom·첫/마지막 페이지 닫힘.
- 알려진 버그(resize 시 book 없음 에러 등): `guide/dev/known-issues.md`
- 문서: `guide/dev/flipview/{page-window,event-flow,flip-geometry}.md`
- 관련 skill: `flip-effect-debug`
