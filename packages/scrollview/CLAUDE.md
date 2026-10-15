# @magflip/scrollview — CLAUDE.md

스크롤 형태 뷰 플러그인. **개발 중**: `view()` 로 페이지 6장을 붙이는 것까지만 구현되어 있고 `nextPage`/`prevPage`/`moveTo`/`zoom` 은 빈 메서드.

## 파일

- `src/scrollView.ts` — `class ScrollView implements IBookView`, `id = 'scroll-view'`
- `src/scrollView.css` — `#bookViewer.scroll-view` 범위 스타일 (첫 규칙의 `.scroll-type.hidden` 은 오타로 보임 → `.scroll-view.hidden` 확인 필요)
- `src/index.ts` — export + CSS import

## 의미

가장 작은 `IBookView` 구현이므로 **새 뷰 플러그인의 템플릿**으로 사용한다.

## 규칙

- `id` 는 `#bookViewer` 의 class 로 추가되므로 CSS 는 `#bookViewer.<id>` 아래로 한정.
- `view()` 는 `bookContainerEl` 을 반환하고, `closeViewer()` 에서 책 참조를 해제.
- 기능을 완성하면 `packages/minjs` 는 이미 포함하므로 추가 작업 없음. 사용자 문서(`guide/user`)의 "개발 중" 표기 갱신.
- 명령: `npm run typecheck -w packages/scrollview`, `npm run build:local -w packages/scrollview`
- 관련 skill: `new-view-plugin`
