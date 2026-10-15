---
name: flip-effect-debug
description: Debug or change the page flip effect in @magflip/flipview — fold shape/mask, page2 rotation, shadows, zone mouse events, EventStatus transitions, page window shifting, nextPage/prevPage/moveTo, zoom. Use for any visual or interaction bug in flipping.
---

# Flip 효과 디버깅 / 수정

먼저 `packages/flipview/CLAUDE.md` 와 `guide/dev/flipview/*.md` 를 읽는다.

## 1. 증상 → 위치

| 증상 | 먼저 볼 곳 |
| --- | --- |
| 접힌 모양/찢어짐, 모서리가 이상한 곳으로 감 | `flipManager.ts` `flip()` 분기(b==0, c<0, d<0, d<pageH), `updateMousePointOnArea()`, `FlipDiagonals` |
| 넘어오는 페이지 위치/회전 | `flip()` 의 `page2Left/Top/rotate`, `setInitFlipping()` 의 `--page2-origin` |
| 그림자 | `flipView.ts` `setShadow1/3/5/6`, `flipView.css` 의 `.shadow*` nth-child 규칙 |
| 마우스 반응 안 함 / 상태 꼬임 | `zoneMouseEntered/Moved/Leaved/Downed`, `documentMouseUp/Move`, `EventStatus` 비트 검사 |
| 넘긴 뒤 잘못된 페이지 표시 | `shiftPages()`, `updateHiddenPages()`, `getNewPages()`, `PageWindow.moveLeft/Right`, DOM 순서 = nth-child |
| 첫/마지막 페이지 닫힘 모양 | `updateDimension()`, `setReadyToOpenForward/Backward`, `setSpreadOpen`, CSS `.ready-to-open` |
| 줌에서만 문제 | `/ zoomLevel` 적용 여부 (`FlipData.print*`, CSS 변수 쓰기) |

## 2. 재현

1. local-dev skill 로 `npm run build:local` + `npm run serve`.
2. `docs/examples/local/` 에서 재현. 콘솔로 상태 확인:
   ```js
   flipView.flipManager.eventStatus.toString(2)
   flipView.flipManager.windows.map(w => w.page?.index)
   flipView.curOpenLeftPageIndex
   ```
   (TS private 이지만 런타임에선 접근 가능 — 디버깅 용도로만)
3. 가능하면 계산 문제를 `__tests__` 의 실패 테스트로 먼저 고정한다 (DOM 없이 `Flipping` 인스턴스에 gutter/activeCorner 를 직접 세팅 — `flipGeometry.test.ts` 참고).

## 3. 수정 원칙

- 계산은 `Flipping`(DOM 없음), 렌더링은 `FlipView`. 섞지 않는다.
- `pivot`(±1)과 Zone 비트 플래그를 이용해 좌/우 코드를 대칭으로 유지. 한쪽만 고치지 않았는지 LT/LC/LB/RT/RC/RB 모두 확인.
- 점 이름 f,g,h,i / j,k,l,m 과 a,b,c,d 는 문서 그림과 대응하므로 유지.
- 매 프레임 호출되는 `flipPage()` 에 DOM 조회/생성을 추가하지 않는다 (캐시 사용).

## 4. 검증

- `npm test -w packages/flipview`, `npm run typecheck`
- 브라우저: 6개 zone 호버·드래그, 스냅백/넘김, Next/Prev, moveTo 앞/뒤, Zoom 0.5/2, 첫·마지막 페이지.
- 동작/흐름이 바뀌면 `guide/dev/flipview/*.md` 다이어그램, 버그 해결 시 `known-issues.md` 갱신.
