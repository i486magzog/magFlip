---
name: render-change
description: Change how MagFlip draws a published page — element rendering (image, text, shape, video, widget, group), page clipping and scaling, expanded view, or loading published books in packages/render. Use for any visual bug or new element type in the renderer.
---

# @magflip/render 변경

## 1. 무엇을 그리는지부터 확인

게시본 JSON 을 직접 본다. 화면이 이상하면 문서가 이상한 것인지 렌더러가 이상한 것인지 먼저 가른다.

```bash
cat docs/examples/local/sample-book/surfaces/<id>.json | head -60
```

- 요소가 아예 없다 → 게시 단계에서 지워졌다(숨김·pasteboard·확장 비공개·에셋 없음). `packages/doc/src/publish/` 를 본다.
- 요소는 있는데 안 보인다 → 렌더러 문제. 아래로 진행.

## 2. 고치는 자리

| 증상 | 파일 |
| --- | --- |
| 특정 요소 타입의 모양 | `src/nodes/<타입>Node.ts` |
| 위치·회전·투명도·링크 감싸기 | `src/surfaceLayer.ts` |
| 페이지가 잘리는 범위, 배율, 확장 보기 | `src/pageRenderer.ts` |
| 게시본 로드·캐시, 뷰어용 페이지 데이터 | `src/publishedBookSource.ts` |
| 공통 스타일 | `src/render.css` (`.mf-` 접두사) |

새 요소 타입: `nodes/` 에 파일 추가 → `surfaceLayer.ts` 의 `createContent` switch 에 case 추가 → 필요하면 `render.css` → 테스트.

## 3. 지켜야 할 것

- 텍스트는 `textContent`. `innerHTML` 금지.
- 링크는 `createLink` 를 거친다(URL 재검사, 페이지 링크는 `onPageLink` 콜백, URL 링크는 `onUrlLink` 가 있을 때만 이동을 막고 콜백).
- 위젯 iframe 에 `allow-same-origin` 을 주지 않는다.
- 요소마다 달라지는 값은 인라인 스타일, 공통 규칙만 CSS.
- 렌더러는 문서를 고치거나 검증하지 않는다.

## 4. 검증

```bash
npm test -w packages/render          # vitest + happy-dom
npm run build:local                  # doc → render → core → … 순서
npm run serve                        # http://localhost:8190/docs/examples/local/
```

브라우저에서 네 번째 책(게시본 샘플)으로 확인한다: 표지 텍스트, 펼침을 가로지르는 이미지, 마스터 쪽번호, 본문 링크, Expand 버튼.
게시 형식을 바꿨다면 `npm run sample:book` 으로 샘플을 다시 만든 뒤 확인한다.

## 5. 문서

`../magFlipDocs/docs/magflip/dev/doc-model/rendering.md`, 공개 API 는 `../magFlipDocs/docs/magflip/user/reference/api.md`, 파일 지도는 `packages/render/CLAUDE.md`.
