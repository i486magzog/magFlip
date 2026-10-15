---
sidebar_position: 2
title: 빠른 시작
---

# 빠른 시작

HTML 파일 하나로 Flip Book을 띄워 봅니다.

## 1. 준비물

- 페이지 이미지 (예: `page0.jpg` ~ `page5.jpg`)
- 모든 페이지의 크기가 같아야 합니다 (예: 700 × 700 px).

## 2. 전체 코드

```html title="index.html"
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/@magflip/minjs@0.5.48/magflip.min.js"></script>
</head>
<body>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      // (1) 페이지 데이터 준비
      const pages = [0, 1, 2, 3, 4, 5].map((i) => ({
        id: `page${i}`,
        index: i,
        image: `./images/page${i}.jpg`,
      }));

      // (2) 책 생성 + 페이지 등록
      const cover = pages[0].image;
      const book = new Book({
        id: 'my-book',
        lastPageIndex: 5,
        thumbnails: { spine: cover, small: cover, medium: cover, cover: { front: cover, back: cover } },
      });
      book.importPages(pages, { width: 700, height: 700 });

      // (3) 매니저 생성 + Flip 뷰 등록
      const shelfManager = new BookShelfManager();
      const bookViewer = shelfManager.getBookViewer();
      const flipView = new FlipView();
      bookViewer.registerView(flipView);
      bookViewer.setCurView(flipView.id);

      // (4) 책장에 책 놓기 — 격자로 두려면 ShelfLayout.Grid
      const shelf = new BookShelf({ manager: shelfManager, layout: ShelfLayout.Shelf });
      shelf.addBook(book);
    });
  </script>
</body>
</html>
```

브라우저에서 열면 책장에 책등이 보이고, 누르면 책이 빠져나와 뷰어로 날아가 표지부터 열립니다. 격자·책장과 책의 모습은 [책 고르기](../guides/bookshelf.mdx)를 보세요.

:::info 배포 버전
책장(`BookShelf`)은 `@magflip/shelf` 로 옮겨졌습니다. 위 코드의 CDN 버전(0.5.48)에는 아직 없으므로, 그 버전에서는 (4) 대신 `shelfManager.importBookToShelf(book)` 만 부르면 core 가 예전 책장을 그립니다.
:::

## 3. 무슨 일이 일어났나요?

```mermaid
sequenceDiagram
  autonumber
  participant You as 내 코드
  participant SM as BookShelfManager
  participant Shelf as BookShelf (#bookShelf)
  participant Book as Book (objectEl)
  participant Viewer as BookViewer (#bookViewer)
  participant FV as FlipView

  You->>SM: new BookShelfManager()
  SM->>Viewer: 뷰어 DOM 생성 (hidden)
  You->>Viewer: registerView(flipView)
  You->>Shelf: new BookShelf({ manager })
  You->>Shelf: addBook(book)
  Shelf->>SM: importBookToShelf(book)
  Shelf->>Book: objectEl 을 책장에 놓기
  Note over You,FV: 사용자가 책을 누름
  Book->>SM: pickupAndView(book)
  SM->>Viewer: view(book)
  Viewer->>FV: view(book, 0) — 닫힌 앞표지
  SM->>SM: 책이 제자리에서 표지 자리로 날아감
```

## 4. 책장 없이 바로 열기

책장을 만들지 않고 코드로 바로 책을 열 수도 있습니다. 화면에 놓인 책이 없으니 날아가지 않고 바로 열립니다.

```js
const shelfManager = new BookShelfManager();
shelfManager.importBookToShelf(book);
// ... registerView / setCurView ...
shelfManager.pickupAndView(book);
```

## 다음 단계

- [책과 페이지 이해하기](../guides/book-and-pages.md)
- [책 고르기 (격자·책장)](../guides/bookshelf.mdx)
- [뷰어 제어하기](../guides/viewer-control.md)
