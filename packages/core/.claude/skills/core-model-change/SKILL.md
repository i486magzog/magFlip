---
name: core-model-change
description: Change MagFlip core data models or public API (IBookData, IPageData, Book, Page, PageLabel, BookShelfManager, BookViewer, IBookView). Use when adding/renaming fields or methods in packages/core.
---

# core 모델 / 공개 API 변경

## 1. 영향 범위 파악

```bash
grep -rn "<이름>" packages/*/src docs/examples ../magFlipDocs/docs/magflip
```

- `models.ts` 인터페이스 → `book.ts`/`page.ts`/`pageLabel.ts` 구현 → flipview/scrollview 사용처 → 예제 → 문서.
- `IBookView` 변경은 모든 뷰(`flipView.ts`, `scrollView.ts`)를 수정해야 한다.

## 2. 구현 순서

1. `src/common/models.ts` — 인터페이스/enum 에 필드 추가, 영문 JSDoc 필수. 선택 필드는 `?`.
2. 데이터 클래스(`Book`, `Page` …)에 `readonly` 속성 + 생성자 기본값. Book 은 `bookData` 기본 객체와 `deepMerge` 를 사용.
3. DOM 이 필요하면 `XxxEl` 클래스(`bookEl.ts`, `pageEl.ts`)의 생성 함수에만 추가.
4. 새 파일/클래스는 `src/index.ts` 에 `export *` 추가.
5. 내부 import 는 상대 경로.

## 3. 호환성

- 공개 필드 이름 변경/삭제는 breaking → 기존 이름을 `@deprecated` alias 로 남기거나 minor 버전 계획을 사용자에게 알린다.
- `EventStatus`/`Zone` 을 flipview 로 옮기는 작업은 breaking (known-issues A).

## 4. 검증

`npm run typecheck && npm test && npm run build:local` 후 local-dev skill 의 브라우저 확인.

## 5. 문서

- 공개 API: `../magFlipDocs/docs/magflip/user/reference/api.md`, 필요 시 `guides/book-and-pages.md`
- 클래스 관계: `../magFlipDocs/docs/magflip/dev/architecture/class-model.md`
- `packages/core/CLAUDE.md` 파일 지도
