---
sidebar_position: 5
title: React에서 사용하기
---

# React에서 사용하기

MagFlip은 DOM을 직접 생성·조작하므로, React에서는 **컨테이너 요소만 렌더링**하고 `useEffect` 안에서 MagFlip 객체를 만듭니다.

```tsx title="FlipBook.tsx"
import { useEffect, useRef } from 'react';
import { Book, BookShelfManager } from '@magflip/core';
import { FlipView } from '@magflip/flipview';

export function FlipBook({ images }: { images: string[] }) {
  const isInitialized = useRef(false);

  useEffect(() => {
    // StrictMode에서 effect가 두 번 실행되는 것을 막습니다.
    if (isInitialized.current) { return; }
    isInitialized.current = true;

    const pages = images.map((image, index) => ({ id: `page${index}`, index, image }));
    const book = new Book({ id: 'book', lastPageIndex: pages.length - 1 });
    book.importPages(pages, { width: 700, height: 700 });

    const shelfManager = new BookShelfManager();
    shelfManager.importBookToShelf(book);

    const bookViewer = shelfManager.getBookViewer();
    const flipView = new FlipView();
    bookViewer.registerView(flipView);
    bookViewer.setCurView(flipView.id);
    shelfManager.pickupAndView(book);
  }, [images]);

  return <div id="bookViewer" />;
}
```

:::caution 한 화면에 하나의 뷰어
MagFlip은 `#bookViewer`, `#bookContainer` 같은 **고정 id**와 문서 전역 CSS 변수를 사용합니다. 책을 늘어놓으려면 `new BookShelf({ manager, element })` 에 컨테이너 요소를 넘기세요([책 고르기](./bookshelf.mdx)).
현재는 한 페이지에 뷰어 하나만 사용할 수 있습니다.
:::

전체 예제는 저장소의 `docs/examples/react-ts` 를 참고하세요.
