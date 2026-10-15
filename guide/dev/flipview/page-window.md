---
sidebar_position: 1
title: Page Window
---

# Page Window

FlipView 는 책의 모든 페이지를 DOM 에 올리지 않고, **넘김에 필요한 6장만** 유지합니다.

## 6칸 슬롯

```mermaid
block-beta
  columns 6
  w0["[0]<br/>hidden"] w1["[1]<br/>hidden"] w2["[2]<br/>왼쪽 보임"] w3["[3]<br/>오른쪽 보임"] w4["[4]<br/>hidden"] w5["[5]<br/>hidden"]
  style w2 fill:#fed7aa,stroke:#c2410c
  style w3 fill:#fed7aa,stroke:#c2410c
```

- `curOpenLeftPageIndex` = 슬롯 `[2]` 에 있는 페이지 index (처음엔 `-1`)
- 넘길 때 **active page** 번호: 1 = 지금 보이는 면, 2 = 넘어오는 뒷면, 3 = 그 아래

| 넘기는 쪽 | page1 | page2 | page3 |
| --- | --- | --- | --- |
| 오른쪽 → 다음 (`Zone.Right`) | `[3]` | `[4]` | `[5]` |
| 왼쪽 → 이전 (`Zone.Left`) | `[2]` | `[1]` | `[0]` |

코드: `FlipView.getActivePage(activePageNum)`

## 다음 페이지로 넘긴 후 (`shiftPages(true)`)

```mermaid
flowchart TB
  subgraph before["Before · curOpenLeftPageIndex = 1"]
    direction LR
    b0["-1"] --- b1["0"] --- b2["1"] --- b3["2"] --- b4["3"] --- b5["4"]
  end
  subgraph after["After · curOpenLeftPageIndex = 3"]
    direction LR
    a0["1"] --- a1["2"] --- a2["3"] --- a3["4"] --- a4["5"] --- a5["6"]
  end
  before -->|"moveRight(page5, page6)<br/>DOM: append 5,6 · remove -1,0"| after
```

1. `Flipping.moveRight(newPage1, newPage2)` — 앞 두 칸 제거, 뒤에 두 칸 추가
2. `book.appendPageEl()` × 2, `book.removePageEl()` × 2 — DOM 순서를 슬롯과 일치
3. `updateDimension()` — 닫힘/펼침 상태와 Gutter 재계산

책에 없는 index(음수, lastPageIndex 초과)는 `Book.getPage(i, true)` 가 **Empty 페이지**를 만들어 채웁니다.

## 책 상태 (3가지)

```mermaid
stateDiagram-v2
  [*] --> ReadyToOpenFront: view()
  ReadyToOpenFront: ready-to-open front<br/>curOpenLeftPageIndex < 0<br/>Gutter = 책 왼쪽 끝
  SpreadOpen: spread open<br/>Gutter = 책 가운데
  ReadyToOpenEnd: ready-to-open end<br/>curOpenLeftPageIndex >= lastPageIndex<br/>Gutter = 책 오른쪽 끝

  ReadyToOpenFront --> SpreadOpen: next
  SpreadOpen --> SpreadOpen: next / prev
  SpreadOpen --> ReadyToOpenFront: prev (첫 펼침에서)
  SpreadOpen --> ReadyToOpenEnd: next (마지막 펼침에서)
  ReadyToOpenEnd --> SpreadOpen: prev
```

코드: `FlipView.updateDimension()` → `setReadyToOpenForward()` / `setSpreadOpen()` / `setReadyToOpenBackward()`

## moveTo(pageIndex)

여러 장을 한 번에 넘길 때도 애니메이션은 **한 번**입니다. 넘어오는 뒷면만 목표 페이지로 바꿔치기합니다.

```mermaid
sequenceDiagram
  participant FV as FlipView
  participant W as PageWindow
  participant DOM as .container
  FV->>FV: targetLeft = 짝수면 pageIndex-1, 홀수면 pageIndex
  FV->>DOM: updateHiddenPages() — 넘어올 쪽 숨김 슬롯을 목표 펼침으로 교체
  FV->>W: loadPageToWindow([4][5] 또는 [0][1], 목표 페이지)
  FV->>FV: autoFlip 애니메이션 (앞으로: RB, 뒤로: LB 에서 시작)
  FV->>FV: shiftPages(isForward, targetLeft)
  FV->>DOM: 현재 펼침 제거 · 앞/뒤 페이지 재배치
```
