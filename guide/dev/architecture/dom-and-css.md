---
sidebar_position: 4
title: DOM 과 CSS 변수
---

# DOM 과 CSS 변수

## DOM 트리 (FlipView 가 열린 상태)

```mermaid
flowchart LR
  viewer["#bookViewer<br/>.flip-view"] --> btn["#btnClose"]
  viewer --> container["#bookContainer<br/>.ready-to-open .front<br/>.right-page-flipping …"]
  container --> z["#mzZoneLT/LC/LB/RT/RC/RB<br/>.event-zone"]
  container --> svg["svg > defs<br/>#mask1 #mask2<br/>#shadow1 #shadow3 #shadow6"]
  container --> book[".book"]
  book --> lc[".label-container"] --> pl[".page-label > .page-label-content"]
  book --> pc[".container"]
  pc --> p1[".page (nth-child 1~6)"]
  p1 --> cc[".content-container"] --> ct[".content (img / HTML)"]
  cc --> sh2[".shadow2 (gutter)"]
  p1 --> sh6["svg.shadow6"]
  p1 --> sh3["svg.shadow3"]
  p1 --> sh1["svg.shadow1"]
```

책을 고르는 화면의 DOM(`#bookShelf`, 책 객체 `.book-object`)과 그 CSS 변수는 [책 객체와 @magflip/shelf](../book-object.md)에 있습니다.

## 페이지 배치는 `nth-child` 로 결정된다

`.container` 의 자식 순서 = [Page Window](../flipview/page-window.md) 의 슬롯 순서입니다.
그래서 **DOM 순서를 바꾸는 것만으로 페이지가 이동**합니다.

| nth-child | 슬롯 | 위치 | z-index | 역할 (오른쪽 넘김 시) |
| --- | --- | --- | --- | --- |
| 1 | windows[0] | 왼쪽 | 1 | 숨김 |
| 2 | windows[1] | 왼쪽 | 2 | 숨김 |
| 3 | windows[2] | 왼쪽 | 3 | **보이는 왼쪽 페이지** |
| 4 | windows[3] | 오른쪽 | 3 | **보이는 오른쪽 페이지** = page1 |
| 5 | windows[4] | 오른쪽 | 2 | 넘어오는 뒷면 = page2 (회전) |
| 6 | windows[5] | 오른쪽 | 1 | 그 아래 = page3 |

## CSS 변수 (document.documentElement)

| 변수 | 설정 위치 | 의미 |
| --- | --- | --- |
| `--closed-book-width` / `--opened-book-width` / `--book-height` | `FlipView.setViewer()` | 책 크기 |
| `--page-width` / `--page-height` / `--page-diagonal-length` | `setViewer()` | 페이지 크기 |
| `--page2-top` / `--page2-left` / `--page2-rotate` | `flipPage()` 매 프레임 | 넘어가는 페이지의 위치/회전 |
| `--page2-origin` | `Flipping.setInitFlipping()` | 회전 기준점 |
| `--shadow5-opacity` | `setShadow5()` | 그림자 투명도 |

```mermaid
flowchart LR
  mouse[마우스 좌표] --> flip["Flipping.flip()"]
  flip --> data[FlipData]
  data -->|points| mask["#mask1-shape / #mask2-shape"]
  data -->|--page2-*| css[CSS 변수]
  data -->|gradient x1,y1…| shadow["#shadow3 / #shadow6"]
  css --> render[브라우저 렌더링]
  mask --> render
  shadow --> render
```

프레임마다 JS는 **숫자만 계산해서 속성/변수에 쓰고**, 실제 모양은 CSS와 SVG가 그립니다.
