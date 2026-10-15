# @magflip/render

MagFlip 게시본을 화면에 그리는 렌더러입니다. 뷰어와 에디터가 같은 코드로 페이지를 그리므로, 편집 화면과 독자 화면이 어긋나지 않습니다.

```ts
import { Book, BookShelfManager, FlipView } from '@magflip/core';
import { PublishedBookSource } from '@magflip/render';
import '@magflip/render/index.css';

const source = await PublishedBookSource.load('/books/sample/book.json');
const book = new Book({ id: source.manifest.bookId, lastPageIndex: source.pageCount - 1 });
book.importPages(await source.createAllPageData(), source.manifest.pageSize);
```

- `createSurfaceLayer(surface)` — surface 하나를 DOM 으로
- `PageRenderer` — 한 페이지만 잘라 보여주고 배율을 맞춤, `renderExpanded` 로 확장 보기
- `PublishedBookSource` — 매니페스트·surface 로드와 캐시

문서: [렌더러](https://i486magzog.github.io/magFlip/dev/doc-model/rendering)

```bash
npm run build
npm run pub --otp=<otp>
```
