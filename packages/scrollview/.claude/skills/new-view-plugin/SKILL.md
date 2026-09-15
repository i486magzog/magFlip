---
name: new-view-plugin
description: Create or complete a MagFlip view plugin that implements IBookView (e.g. finishing @magflip/scrollview or adding a new view package). Use when implementing a new way to display a Book in BookViewer.
---

# 뷰 플러그인 만들기 / 완성하기

## 규약 (`packages/core/src/common/models.ts` 의 `IBookView`)

| 멤버 | 해야 할 일 |
| --- | --- |
| `id` | 고유 문자열. `BookViewer.view()` 가 `#bookViewer` 에 class 로 추가 → CSS 범위 |
| `bookContainerEl` / `getBookContainerEl()` | 생성자에서 `#bookContainer` div 생성 |
| `view(book, openPageIndex)` | 책 연결 → CSS 변수(책 크기) 설정 → `book.fetchPages` → `book.appendPageEl` → 컨테이너 반환 |
| `closeViewer()` | 이벤트 해제, 책 참조 해제 (DOM 정리는 `BookViewer.closeViewer` 와 `book.resetBook` 이 함) |
| `zoom(level)` | 컨테이너 scale |
| `nextPage/prevPage/moveTo` | 페이지 이동 |
| `openPageIndexes` | 지금 보이는 페이지 index 배열 (책이 없으면 `[]`) |
| `isFlipping` | 페이지가 움직이는 중이면 `true`. 이때 `nextPage/prevPage/moveTo` 는 무시해야 한다 |
| `onFlipEnd(listener)` | 이동이 끝날 때마다 호출, 리스너 제거 함수를 반환. 이동 애니메이션이 없는 뷰는 빈 제거 함수만 반환 |

## 새 패키지 절차

1. `packages/scrollview` 를 복사 → `packages/<name>`; `package.json` 의 name/description/repository.directory, 버전 `0.1.0`.
2. `src/<name>View.ts` 에 클래스, `src/<name>View.css` 는 모두 `#bookViewer.<id>` 아래로.
3. `src/index.ts` export + CSS import.
4. 루트 `npm install` (workspace 링크), 루트 `package.json` 의 `build:local` 체인에 minjs **앞**에 추가, `build:<name>` 스크립트 추가.
5. `packages/minjs/src/index.js` 에 export/CSS 추가.
6. `CLAUDE.md` 작성 (다른 패키지 형식 참고).

## 검증

- `npm run typecheck && npm run build:local`
- `docs/examples/local/index.html` 에서 임시로 `bookViewer.registerView(new ScrollView())` / `changeView(id)` 로 확인 (커밋 전 원복하거나 별도 예제 파일로).

## 문서

- 사용자: `website/user-docs/intro.md` 패키지 표, `reference/api.md`
- 개발자: `website/dev-docs/architecture/overview.md` 의존 그래프, `folder-structure.mdx`
