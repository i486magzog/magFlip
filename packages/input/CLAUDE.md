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
├─ spatialFocus.ts    IFocusRect 목록 + 방향 → 다음 대상 (findNextFocus / findFirstFocus)
├─ focusTargets.ts    페이지 DOM → 포커스 대상 (a.mf-link, .mf-el-video/audio/widget)
├─ bookNavigator.ts   동작 → IBookView 호출. 페이지 모드 ⇄ 요소 모드, 대기열, 포커스 표시
├─ remoteController.ts  keydown 연결 + dispatch(네이티브 브리지) + destroy
└─ input.css          `.mf-focused` 표시 (--mf-focus-color/width/offset 로 덮어쓰기)
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

## 두 가지 모드

- **페이지 모드**(시작): ←/→ 넘김, Ok → 요소 모드, Back → `onBack` 콜백(뷰어를 직접 닫지 않는다 — 순서는 플랫폼마다 다르다).
  - 화면 이동: ↑/↓ 는 책이 화면보다 높으면 **언제나** 이동(다른 용도가 없으므로). ←/→ 는 **확대했을 때만**(`zoomLevel > 1`) 이동하고, 그 방향 끝에 닿으면 페이지를 넘긴다. 배율 1에서 좌우가 조금씩 미끄러지면 넘김이 늦어지기 때문이다.
  - 확대 배율은 `view.zoomLevel` 을 그때그때 읽는다(호스트가 슬라이더 등으로 따로 바꿀 수 있다).
- **요소 모드**: 방향키로 링크·미디어·위젯 사이 이동, Ok → 사용, Back → 페이지 모드. 좌우 끝에서 더 가면 그쪽으로 한 장 넘기고 페이지 모드로 돌아온다.
- `handle()` 은 **썼는지 여부**를 반환한다. 쓰지 않은 키는 `RemoteController` 가 `preventDefault` 하지 않는다.

## 규칙 (추가)

- **진짜 `focus()` 를 부르지 않는다.** 위젯은 다른 출처 iframe 이라 포커스가 들어가면 키 이벤트가 페이지로 오지 않아 빠져나올 수 없다. `.mf-focused` 클래스로만 표시한다.
- 링크는 직접 해석하지 않고 `element.click()` 한다 → 렌더러의 `onPageLink`/`onUrlLink` 규칙을 그대로 따른다(중복 구현 금지).
- 포커스 대상과 좌표는 **쓸 때마다 다시 잰다**. 페이지는 처음 보일 때 만들어지고 넘기는 동안 움직인다.
- 넘김이 끝나면(`onFlipEnd`) 표시를 지우고 **페이지 모드로 돌아간다**. 페이지 링크로 이동한 뒤에도 마찬가지 — 새 펼침에서는 좌우가 다시 넘김이어야 한다.

## 상태

1-4 단계까지 들어와 있다(순수 로직 + DOM 연결 + `minjs` 번들 포함).
남은 것: 예제·문서(1-6), 확대·화면 이동(1-5, 조사 후 결정).
계획 전체는 메모리 `magflip-tv-plan` 과 `../magFlipDocs/docs/tv/` 에 있다.
