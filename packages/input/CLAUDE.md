# @magflip/input — CLAUDE.md

키보드·TV 리모컨 입력을 책 조작으로 바꾸는 패키지. TV 전용이 아니다 — 웹 뷰어의 키보드 조작도 여기를 쓴다.
의존: `@magflip/core` 만(뷰 규약 `IBookView`). DOM 을 만들지 않고, 뷰어를 직접 부르지도 않는다 → 그 연결은 `bookNavigator`/`remoteController`(1-4 단계)가 한다.

## 파일 지도

```
src/
├─ index.ts           공개 API (export *)
├─ actions.ts         InputAction(키 → 뜻), DirectionAction, isDirection
├─ keyMap.ts          DEFAULT_KEY_MAP(key), DEFAULT_KEY_CODE_MAP(keyCode), resolveAction
├─ flipQueue.ts       넘기는 중에 들어온 요청을 limit(기본 1)개만 기억
└─ spatialFocus.ts    IFocusRect 목록 + 방향 → 다음 대상 (findNextFocus / findFirstFocus)
```

## 핵심 규칙

- **플랫폼 차이는 `keyMap.ts` 한 곳에만.** 나머지 코드는 `InputAction` 만 본다. Tizen 뒤로가기 `10009`, webOS `461` 은 `keyCode` 로만 오므로 코드 맵에 있다. Android TV 의 뒤로가기는 DOM 이벤트가 아니라 앱으로 가므로, 앱이 `dispatch(InputAction.Back)` 로 넘긴다.
- `resolveAction` 은 `key` 를 먼저 보고, 없으면 `keyCode` 를 본다. 우리 키가 아니면 `undefined` → 호스트가 이벤트를 건드리지 않는다.
- `FlipQueue` 는 오래된 요청을 버린다(마지막 뜻이 이긴다). 전부 쌓으면 손을 뗀 뒤에도 책이 계속 넘어간다.
- `spatialFocus` 는 좌표 단위를 모른다. 호출자가 `getBoundingClientRect()` 든 무엇이든 **한 기준**으로만 재서 넘긴다.
- 정면 우선: 점수 = 진행 방향 거리 + 옆으로 벗어난 거리 × `CROSS_AXIS_PENALTY`(3). 대각선으로 더 가까운 것보다 정면을 고른다.

## 명령

```bash
npm run typecheck -w packages/input   # @magflip/core 의 빌드된 타입 참조 → core 를 먼저 build:local
npm test -w packages/input            # vitest (core 는 소스로 alias)
npm run build:local -w packages/input
```

## 상태

1-3 단계(순수 로직)까지 들어와 있다. 다음: `bookNavigator`(동작 → `IBookView`), `remoteController`(document keydown + `dispatch`), `input.css`(`.mf-focused`).
계획 전체는 메모리 `magflip-tv-plan` 과 `../magFlipDocs/docs/tv/` 에 있다.
