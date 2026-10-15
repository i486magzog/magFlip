---
sidebar_position: 3
title: 코딩 컨벤션
---

# 코딩 컨벤션

목표는 **처음 보는 사람이 읽고 바로 고칠 수 있는 코드**입니다. 새 코드와 수정하는 코드에 적용하세요.

## 1. 이름

| 대상 | 규칙 | 예 |
| --- | --- | --- |
| 클래스 / enum / 타입 | PascalCase | `BookShelfManager`, `PageType` |
| 인터페이스 | `I` 접두사 | `IBookData`, `IBookView` |
| DOM 담당 클래스 | `Xxx` 데이터 클래스의 부모로 `XxxEl` | `BookEl` → `Book` |
| DOM 요소 변수 | `El` 접미사 | `pageContainerEl`, `zoneLT` 는 예외 |
| 뷰포트 좌표 | `GP` (Global Point) 접미사 | `mouseGP`, `activeCornerGP` |
| boolean | `is` / `has` 접두사 | `isSpreadOpen`, `isFlipping` |
| 파일 | camelCase, 파일당 주요 클래스 1개 | `bookShelfManager.ts` |

## 2. 구조

- **데이터와 DOM 분리**: DOM 생성은 `XxxEl` 또는 `createElements()` 에만 둡니다.
- **계산과 렌더링 분리**: 좌표 계산은 `Flipping` / `MZMath` 처럼 DOM 없이 테스트 가능한 곳에, 속성 쓰기는 `FlipView` 에 둡니다.
- **공개 API는 `index.ts` 에서만 export**. 내부 import 는 상대 경로(`../common/helper`)를 사용합니다. `src/...` 같은 baseUrl 경로는 사용하지 않습니다.
- 한 함수는 한 화면(≈40줄) 이내를 목표로 합니다. 긴 `switch` 반복은 비트 플래그(`zone & Zone.Left`)로 줄입니다.
- 매직 넘버는 이름 있는 상수나 config 로 뺍니다. (`const DURATION_MS = 400`)

## 3. 주석

```ts
/**
 * Returns the point of the corner that flipping page has to go back.
 * @param mouseGP The current position of the mouse pointer.
 * @returns The corner point closest to the mouse pointer.
 */
getTargetCorner(mouseGP: Point) { ... }
```

- 공개 멤버에는 **JSDoc(영문)** 을 답니다. "무엇을"보다 "왜 / 단위 / 좌표계"를 적습니다.
- 기하 계산에는 문서의 그림 기호(`f, g, h, i`)와 대응을 주석으로 남깁니다.
- 주석 처리된 죽은 코드는 커밋하지 않습니다. 필요하면 `TODO:` 와 이유를 남깁니다.

## 4. 포맷

- 들여쓰기 2칸, 세미콜론 사용, 문자열은 기존 파일의 따옴표 스타일을 따릅니다.
- 조기 반환(guard clause)으로 중첩을 줄입니다.

```ts
// Good
if (!this.book) { return; }
if (this.flipManager.eventStatus & EventStatus.Flipping) { return; }
doFlip();
```

## 5. CSS

- 뷰 전용 스타일은 반드시 `#bookViewer.<view-id>` 아래로 한정합니다.
- 매 프레임 바뀌는 값은 CSS 변수로 전달하고, JS 에서 `style.left` 등을 직접 쓰지 않습니다.

## 6. 변경 체크리스트

- [ ] `npm run typecheck`
- [ ] `npm test` (계산 로직을 바꿨다면 테스트 추가)
- [ ] `npm run build:local` 후 `docs/examples/local` 에서 드래그 / Next / Prev / moveTo / Zoom 확인
- [ ] 공개 API 가 바뀌었다면 `guide/user/reference/api.md` 갱신
- [ ] 구조가 바뀌었다면 `guide/dev` 의 다이어그램과 해당 패키지 `CLAUDE.md` 갱신
