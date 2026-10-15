---
sidebar_position: 1
title: 시스템 구조
---

# 시스템 구조

## 1. 패키지 의존 관계

```mermaid
flowchart BT
  core["<b>@magflip/core</b><br/>Book · 책 객체 · Page · BookShelfManager<br/>BookViewer · BookFlight · MZMath · models"]
  shelf["<b>@magflip/shelf</b><br/>BookShelf (격자 · 책장)"]
  flip["<b>@magflip/flipview</b><br/>FlipView · Flipping(FlipManager)<br/>PageWindow · FlipData"]
  scroll["<b>@magflip/scrollview</b> 🚧<br/>ScrollView"]
  min["<b>@magflip/minjs</b><br/>magflip.min.js (IIFE)"]

  shelf -->|import| core
  flip -->|import| core
  scroll -->|import| core
  min -->|bundle| core
  min -->|bundle| shelf
  min -->|bundle| flip
  min -->|bundle| scroll

  subgraph consumers [사용처]
    html["HTML + script 태그"]
    app["React / Vite 앱"]
  end
  html -.-> min
  app -.-> flip
  app -.-> core
```

- **core** 는 다른 MagFlip 패키지에 의존하지 않습니다. 뷰의 규약은 `IBookView` 인터페이스로만 정의합니다. **책 한 권**(모습, 열고 닫는 움직임)까지만 알고, 여러 권을 늘어놓는 배치는 모릅니다.
- **shelf** 는 여러 권을 격자나 책장으로 늘어놓습니다. [책 객체와 @magflip/shelf](../book-object.md)
- **flipview / scrollview** 는 `IBookView` 를 구현하는 **뷰 플러그인**입니다.
- **minjs** 는 코드가 없고, 패키지들을 re-export 한 뒤 하나의 번들로 묶습니다. (다이어그램에 없는 `input`·`render` 도 들어 있습니다.)

## 2. 레이어

```mermaid
flowchart TB
  subgraph L1["Application (사용자 코드)"]
    user["new Book() · importPages() · registerView()"]
  end
  subgraph L1b["Placement (@magflip/shelf)"]
    shelf[BookShelf<br/>격자 · 책장]
  end
  subgraph L2["Orchestration (core)"]
    sm[BookShelfManager]
    viewer[BookViewer]
    flight[BookFlight]
  end
  subgraph L3["View Plugin (flipview)"]
    fv[FlipView<br/>DOM · 이벤트 · 그림자 렌더링]
    fm[Flipping<br/>상태 · 애니메이션 · 기하 계산]
  end
  subgraph L4["Model + Element (core)"]
    book[Book / BookEl]
    bookObj[BookObjectEl<br/>책 객체]
    page[Page / PageEl]
    label[PageLabel / PageLabelEl]
  end
  subgraph L5["Common (core)"]
    math[MZMath] --- shape[Point · Line · Rect] --- ev[MZEvent] --- models[models.ts]
  end

  user --> shelf & sm
  shelf -->|importBookToShelf| sm
  shelf -->|objectEl 놓기| bookObj
  sm --> viewer & flight
  viewer -->|IBookView| fv
  fv --> fm
  fv --> book
  book --> bookObj & page & label
  fm --> math
  L4 --> L5
```

| 레이어 | 책임 | 규칙 |
| --- | --- | --- |
| Application | 책 데이터 구성, 뷰 등록 | 공개 API만 사용 |
| Placement | 여러 권의 책 객체를 늘어놓음 | core 밖. 책 모양·열기는 core 에 맡김 |
| Orchestration | 제자리 ↔ 뷰어 사이에서 책을 이동(비행), 뷰 선택 | 특정 뷰 구현을 몰라야 함 |
| View Plugin | 책을 화면에 렌더링하고 사용자 입력을 처리 | `IBookView` 구현 |
| Model + Element | 데이터(`Book`)와 DOM(`BookEl`)을 상속으로 결합 | `XxxEl` 은 DOM 생성만 담당 |
| Common | 수학, 도형, 이벤트, 타입 | DOM/상태에 의존하지 않는 순수 코드 우선 |

## 3. 책을 여는 런타임 흐름

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant O as 책 객체 (book.objectEl)
  participant SM as BookShelfManager
  participant BV as BookViewer
  participant FV as FlipView
  participant B as Book
  participant FM as Flipping

  U->>O: click / Enter
  O->>SM: BookEvent.objectActivated → pickupAndView(book)
  SM->>SM: book.status = Open · 자리 비움 · 출발 위치 기억
  SM->>BV: view(book)
  BV->>BV: #bookViewer 에 #bookContainer 붙이기<br/>class "flip-view" 추가
  BV->>FV: view(book, 0)
  FV->>FV: attachBook() · 페이지별 그림자 요소 생성
  FV->>FV: setViewer() · CSS 변수(책 크기) 설정
  FV->>B: fetchPages({start:-3, cnt:6})
  FV->>FM: loadPageToWindow(0..5)
  FV->>B: appendPageEl() × 6
  FV-->>BV: bookContainerEl
  BV->>BV: hidden 클래스 제거 → 화면 표시
  SM->>SM: getClosedBookPlace() 로 표지 자리를 재고 BookFlight 로 날림

  U->>BV: X 버튼 click
  BV->>FV: getClosedBookPlace() — 떼기 전에 잼
  BV->>FV: closeViewer()
  BV->>SM: returnBookToShelf(book, place) — 제자리로 날림
  BV->>B: resetBook() · Empty 페이지 제거
  BV->>BV: onViewerClose 콜백
```

## 4. 뷰 플러그인 규약 (`IBookView`)

```ts
export interface IBookView {
  readonly id: string;                 // 'flip-view' → #bookViewer 의 class 로도 사용
  readonly bookContainerEl: HTMLElement;
  getBookContainerEl(): HTMLElement;
  view(book: IBookData, openPageIndex?: number): HTMLElement;
  closeViewer(): void;
  zoom(zoomLevel: number): void;
  nextPage(offsetY?: number): void;
  prevPage(offsetY?: number): void;
  moveTo(pageIndex: number, offsetY?: number): void;
  readonly openPageIndexes: number[];  // 지금 보이는 페이지 index
  readonly isFlipping: boolean;        // true 인 동안 nextPage/prevPage/moveTo 무시
  onFlipEnd(listener: () => void): () => void;  // 넘김이 끝날 때마다 호출, 제거 함수 반환
  readonly zoomLevel: number;          // 지금 배율 (1 = 뷰어에 맞는 크기)
  pan(dx: number, dy: number): boolean;  // 화면 픽셀만큼 이동. 화면 밖으로는 못 나감 → false
  getClosedBookPlace?(): IClosedBookPlace | undefined;  // 닫힌 책의 자리와 면. 없으면 책이 날지 않음
}
```

새 뷰를 만들 때는 `packages/scrollview` 를 템플릿으로 사용하세요. CSS는 `#bookViewer.<view id>` 로 범위를 한정합니다.
