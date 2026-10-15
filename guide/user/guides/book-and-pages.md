---
sidebar_position: 1
title: 책과 페이지
---

# 책과 페이지

## 데이터 구조

```mermaid
classDiagram
  direction LR
  class IBookData {
    id: string ★
    lastPageIndex: number ★
    title?: string
    author?: string
    type?: BookType
    publication?: IPublication
    size?: IBookSize
    thumbnails?: object
    labels?: map~IPageLabelData~
  }
  class IPageData {
    id: string ★
    index: number ★
    image?: string
    content?: string (HTML)
    type?: PageType
    number?: number
    ignore?: boolean
    size?: ISize
  }
  IBookData "1" o-- "*" IPageData : importPages()
```

★ 표시는 필수 값입니다.

### Book 옵션

| 속성 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `id` | `string` | – | 책의 고유 ID. 한 페이지 안에서 겹치지 않아야 합니다. |
| `lastPageIndex` | `number` | – | 마지막 페이지의 index. **짝수이면 자동으로 +1** 되어 홀수로 맞춰집니다. 책 객체의 두께도 쪽수(`lastPageIndex + 1`)를 따릅니다. |
| `thumbnails.cover.front` / `thumbnails.cover.back` | `string` | – | [책 객체](./bookshelf.mdx)의 앞표지·뒤표지. 없으면 제목으로 정해지는 색에 제목을 씁니다 |
| `thumbnails.spine` | `string` | – | 책 객체의 책등 바탕. 표지를 넣으면 표지의 왼쪽 가장자리가 보입니다 |
| `title` | `string` | `"Title"` | 책등과 격자의 표지 아래에 표시됩니다 |
| `author` | `string` | `"Author"` | 책 정보 (현재 화면에는 표시되지 않음) |
| `type` | `BookType` | `Book` | `Book` / `Magazine` / `Newspaper` |
| `cover` | `BookCover` | `Soft` | 표지 재질. `Hard` 면 [하드커버](#하드커버)입니다 |
| `labels` | `{ [n]: IPageLabelData }` | `{}` | [페이지 라벨](./page-labels.md) |

### 하드커버

`cover: BookCover.Hard` 인 책은 앞·뒤표지가 두꺼운 판지입니다. 판지는 종이처럼 휘지 않고 책등을 축으로 한 장의 판처럼 3D로 넘어가며, 서 있을수록 어두워지고 책등 양쪽 페이지에 그늘을 드리웁니다.

판지에는 양면이 있습니다. **0번(앞표지)과 1번(앞표지 안쪽), 마지막에서 두 번째(뒤표지 안쪽)와 마지막(뒤표지)** 페이지가 판지이고, 그 사이가 본문입니다. 그래서 하드커버 책은 다음 순서로 페이지를 넣습니다.

| index | 페이지 |
| --- | --- |
| 0 | 앞표지 |
| 1 | 앞표지 안쪽 (면지) — 첫 펼침의 왼쪽 |
| 2 … n-3 | 본문. 짝수 장이어야 합니다 |
| n-2 | 뒤표지 안쪽 (면지) — 마지막 펼침의 오른쪽 |
| n-1 | 뒤표지 |

```ts
const book = new Book({ id: 'b1', lastPageIndex: 9, cover: BookCover.Hard });
```

### Page 옵션

| 속성 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `string` | 페이지 ID |
| `index` | `number` | 0부터 시작하는 페이지 순서 |
| `image` | `string` | 페이지 이미지 URL. `<img>`로 렌더링됩니다. |
| `content` | `string` | 페이지에 넣을 HTML 문자열. `image`보다 먼저 렌더링됩니다. |

## 페이지 크기

`importPages(pages, size)` 의 `size` 가 **한 쪽 페이지 크기**입니다. 펼친 책의 너비는 자동으로 `width × 2` 가 됩니다.

```js
book.importPages(pages, { width: 700, height: 700 });
// closed: 700 × 700, opened: 1400 × 700
```

## 페이지 index와 펼침(Spread)

MagFlip은 **표지(index 0)가 오른쪽**에 오는 방식으로 책을 펼칩니다.
왼쪽 페이지는 항상 **홀수** index, 오른쪽 페이지는 **짝수** index 입니다.

```mermaid
flowchart LR
  subgraph S0["① 닫힘 (앞표지)"]
    direction LR
    c0["(비어 있음)"] ~~~ p0["0<br/>표지"]
  end
  subgraph S1["② 펼침"]
    direction LR
    p1["1"] ~~~ p2["2"]
  end
  subgraph S2["③ 펼침"]
    direction LR
    p3["3"] ~~~ p4["4"]
  end
  subgraph S3["④ 닫힘 (뒤표지)"]
    direction LR
    p5["5<br/>뒤표지"] ~~~ c1["(비어 있음)"]
  end
  S0 -->|next| S1 -->|next| S2 -->|next| S3
```

- 페이지 수는 **짝수**(`lastPageIndex`가 홀수)로 맞추는 것이 자연스럽습니다.
- 첫 페이지와 마지막 페이지가 보일 때는 책이 한 쪽 너비로 **닫힌 상태**로 표시됩니다.

## 이미지 대신 HTML 넣기

```js
book.importPages([
  { id: 'p0', index: 0, content: '<h1 style="padding:40px">Hello</h1>' },
  { id: 'p1', index: 1, image: './page1.jpg' },
], { width: 600, height: 900 });
```

:::caution
`content` 는 `innerHTML` 로 삽입됩니다. 사용자 입력을 그대로 넣지 말고 신뢰할 수 있는 HTML만 사용하세요.
:::
