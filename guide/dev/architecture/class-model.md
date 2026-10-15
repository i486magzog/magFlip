---
sidebar_position: 3
title: 클래스 모델
---

# 클래스 모델

## core

**데이터 클래스가 DOM 클래스를 상속**하는 구조입니다. `XxxEl` 은 요소 생성/정리만, `Xxx` 는 데이터와 동작을 담당합니다.

```mermaid
classDiagram
  direction TB
  class MZEvent {
    -listeners
    +addEventListener(event, listener)
    +removeEventListener(event, listener)
    +emitEvent(event, ...args)
  }
  class Base
  class BookEl {
    +element
    +pageContainerEl
    +labelContainerEl
    +appendPageEl() prependPageEl() removePageEl()
    #resetBookEls()
  }
  class Book {
    +id status type size lastPageIndex
    -pages
    -pageLabels
    -bookObject
    +importPages() addPage() getPage()
    +fetchPages() createEmptyPage() resetBook()
    +objectEl hasObjectEl objectFace
    +setObjectFace() setObjectPickedUp()
    +getObjectPlace() getObjectData()
  }
  class BookObjectEl {
    +element bodyEl face
    +setFace() setSize() setPickedUp()
    +getPlace() IClosedBookPlace
  }
  class BookFlight {
    +finished
    +canFly()$
    +land(fade) cancel()
  }
  class PageEl {
    +element contentContainerEl contentEl
    +resetPageEls()
  }
  class Page {
    +id type index size image content
    +emptyPage()$
    +blankPage()$
  }
  class PageLabelEl
  class PageLabel
  class BookViewer {
    -registeredViews
    -curView: IBookView
    -closing
    +registerView() setCurView() view() closeViewer() setZoomLevel()
    +getClosedBookPlace() awaitBook(arrival)
  }
  class BookShelfManager {
    +config
    -books
    -bookViewer
    -flight: BookFlight
    +animatesBooks
    +importBookToShelf() pickupAndView() returnBookToShelf()
  }
  class IBookView {
    <<interface>>
  }

  MZEvent <|-- Base
  Base <|-- BookEl
  BookEl <|-- Book
  Base <|-- PageEl
  PageEl <|-- Page
  Base <|-- PageLabelEl
  PageLabelEl <|-- PageLabel
  Base <|-- BookViewer

  BookShelfManager *-- BookViewer
  BookShelfManager o-- Book
  BookShelfManager ..> BookFlight : 열고 닫을 때
  Book *-- BookObjectEl : 처음 요구할 때
  BookFlight ..> BookObjectEl : 복사본
  Book *-- Page
  Book *-- PageLabel
  BookViewer o-- IBookView
```

책장은 core 에 없습니다. `BookShelfManager` 는 이름만 남아 **책을 들고 있다가 여는** 일을 합니다.

## shelf

```mermaid
classDiagram
  direction LR
  class BookShelf {
    +element
    -manager: BookShelfManager
    -slots
    +layout: ShelfLayout
    +books
    +addBook() removeBook() setLayout() destroy()
  }
  class ShelfLayout {
    <<enumeration>>
    Grid
    Shelf
  }
  BookShelf --> BookShelfManager : importBookToShelf()
  BookShelf o-- Book : objectEl 을 슬롯에
  BookShelf ..> ShelfLayout
```

## flipview

```mermaid
classDiagram
  direction TB
  class IBookView {
    <<interface>>
  }
  class FlipView {
    +id = "flip-view"
    -config
    -book
    -flipManager: Flipping
    -curOpenLeftPageIndex
    -isSpreadOpen
    +view() closeViewer() zoom()
    +nextPage() prevPage() moveTo()
    +openPageIndexes isFlipping
    +onFlipEnd(listener)
    +zoomLevel pan(dx, dy)
    +getClosedBookPlace()
    -panOffset
    -flipPage(mouseGP)
    -shiftPages() updateHiddenPages()
    -setShadow1/3/5/6()
    -zoneMouseEntered/Moved/Leaved/Downed()
    -documentMouseUp/Move()
  }
  class PageWindow {
    +windows[6]
    +loadPageToWindow() moveLeft() moveRight()
  }
  class Flipping {
    +eventStatus: EventStatus
    +isTurningPage
    +finishFlip() onFlipEnd(listener)
    +eventZone: Zone
    +gutter: Gutter
    +flipActionLine
    +diagonals
    +activeCornerGP activeCornerOppositeGP
    +setInitFlipping()
    +flip(mouseGP, pageWH, isSpreadOpen) FlipData
    +animateFlip() animateFlipFromCorner() animateFlipToCorner()
    +getInfoToFlip()
  }
  class FlipData {
    +page2
    +mask
    +shadow
  }
  class Gutter
  class Rect
  class FlipActionLine
  class FlipDiagonals {
    +area1..area4
  }
  class FlipDiagonal {
    +length
    +radian
  }

  IBookView <|.. FlipView
  MZEvent <|-- PageWindow
  PageWindow <|-- Flipping
  FlipView *-- Flipping
  Flipping ..> FlipData : creates
  Flipping *-- Gutter
  Rect <|-- Gutter
  Flipping *-- FlipActionLine
  Flipping *-- FlipDiagonals
  FlipDiagonals ..> FlipDiagonal
```

### 역할 분리 원칙

| 클래스 | 알고 있는 것 | 모르는 것 |
| --- | --- | --- |
| `FlipView` | DOM, CSS 변수, 책, 현재 펼친 페이지 | 기하 공식 |
| `Flipping` | 좌표, 상태, 애니메이션 타이밍 | 어떤 요소에 적용되는지 (예외: zone 크기 측정, `--page2-origin`) |
| `FlipData` | 한 프레임의 계산 결과 | 상태 |
