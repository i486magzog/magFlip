# @magflip/render — CLAUDE.md

게시된 surface(`IPublishedSurface`)를 **DOM 으로 그리는 유일한 코드**. 뷰어와 (Phase 2의) 에디터 캔버스가 같이 쓴다.
의존: `@magflip/doc` 만. core/flipview 를 import 하지 않는다 — 뷰어 연결은 `IPageData.render` 콜백으로 한다.

## 파일 지도

```
src/
├─ index.ts                 공개 API
├─ common/
│  ├─ renderOptions.ts      IRenderOptions (resolveWidgetUrl, onPageLink, onUrlLink, isInteractive, onNodeRendered)
│  ├─ style.ts              px/round, applyRect, applyTransform, toCssFill, toGradientVector, createDiv
│  └─ types.ts              PublishedElementOf<T>
├─ nodes/                   요소 타입별 DOM 생성
│  ├─ imageNode.ts          crop + fit 계산
│  ├─ textNode.ts           문단·목록 기호·런·마크 (textContent 만 사용)
│  ├─ shapeNode.ts          SVG rect/ellipse/line/path, 그라디언트 defs
│  ├─ mediaNode.ts          video/audio
│  ├─ widgetNode.ts         sandbox iframe + postMessage(props)
│  └─ link.ts               <a> 생성, URL 재검사, 페이지 링크 콜백
├─ surfaceLayer.ts          노드 트리 → 층(layer). data-mf-id 부여
├─ pageRenderer.ts          층에서 한 페이지만 잘라 보여주고 배율을 맞춤 (ResizeObserver)
├─ publishedBookSource.ts   매니페스트·surface 로드/캐시, 뷰어용 페이지 데이터 생성
└─ render.css               .mf-* 클래스. 값이 요소마다 다른 것은 인라인 스타일
```

## 핵심 규칙

- **텍스트는 `textContent` 로만** 넣는다. `innerHTML` 은 절대 쓰지 않는다(문서 내용은 신뢰할 수 없다).
- 목록 기호는 글자가 아니라 `.mf-text-li::before { content: attr(data-mf-marker) }` 로 그린다 → 독자가 복사해도 기호가 딸려 가지 않는다. 편집기도 같은 클래스를 쓰므로 이 CSS 를 바꾸면 양쪽이 함께 바뀐다.
- 링크 URL 은 그릴 때 `isSafeUrl` 로 다시 확인한다. 페이지 링크는 직접 이동하지 않고 `onPageLink` 로 넘긴다. URL 링크는 기본적으로 브라우저가 따라가고, 호스트가 `onUrlLink` 를 주면 이동을 막고 넘긴다(앱으로 포장한 TV 앱은 페이지를 떠날 수 없다).
- 위젯 iframe 에 `allow-same-origin` 을 주지 않는다 → iframe 의 origin 은 "null" 이므로 props 는 `postMessage(…, '*')` 로 보낸다(origin 을 지정하면 절대 전달되지 않는다). 주소는 게시본의 `url`, 없으면 `resolveWidgetUrl`. 주소가 없으면 위젯 이름만 보이는 빈 상자.
- 층의 좌표 = surface 좌표 − `visibleRect` 원점. 페이지 잘라내기와 배율은 `PageRenderer` 만 담당한다.
- 그룹은 좌표계를 만들지 않는다(`.mf-el-group` 은 0,0 크기 0). 자식은 surface 좌표 그대로.
- 렌더러는 문서를 고치지 않는다. 값이 이상하면 그대로 그리고, 검증은 `@magflip/doc/authoring` 이 한다.

## 명령

```bash
npm run typecheck -w packages/render   # @magflip/doc 의 빌드된 타입을 참조 → doc 을 먼저 build:local
npm test -w packages/render            # vitest + happy-dom (doc 은 소스로 alias)
npm run build:local -w packages/render # index.js / index.d.ts / index.css
```

## 변경 체크리스트

1. 새 요소 타입 → `nodes/` 에 파일 추가 → `surfaceLayer.ts` 의 `createContent` switch → 테스트.
2. CSS 클래스는 `.mf-` 접두사. 요소마다 달라지는 값은 CSS 가 아니라 인라인 스타일로.
3. `npm test -w packages/render && npm run build:local` 후 `docs/examples/local` 네 번째 책에서 확인(펼침 이미지 / 쪽번호 / 링크 / Expand).
4. 게시 형식을 바꿨다면 `npm run sample:book` 으로 샘플 게시본을 다시 만든다.
5. 문서: `../magFlipDocs/docs/magflip/dev/doc-model/rendering.md`, 공개 API 는 `../magFlipDocs/docs/magflip/user/reference/api.md`.
