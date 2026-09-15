# @magflip/doc — CLAUDE.md

Editor·Server·Viewer 가 공유하는 **문서 모델**. 타입, 스키마(zod), 페이지 레이아웃 계산, 마스터 해석, 게시(Publish) 컴파일, Yjs 매핑을 담는다.
다른 `@magflip/*` 패키지에 의존하지 않는다. (의존 방향: core/editor/server → doc)

## 파일 지도

```
src/
├─ index.ts                공개 API (@magflip/doc)
├─ yjs.ts                  공개 API (@magflip/doc/yjs) — 협업 매핑만, 뷰어는 import 하지 않음
├─ common/
│  ├─ constants.ts         SCHEMA_VERSION, DOC_LIMITS, MASTER_ELEMENT_ID_PREFIX
│  ├─ geometry.ts          IPoint/ISize/IRect, 회전 bounds, SAT 교차 판정
│  ├─ order.ts             fractional index (createOrderBetween, compareOrdered)
│  ├─ json.ts              JsonValue, isJsonEqual (키 순서 무시)
│  └─ ids.ts               createId (base62 21자)
├─ model/                  타입 정의 (런타임 코드 최소)
│  ├─ book.ts              IBookDoc, ISurfaceRef, IMasterRef, ReadingDirection, PageSide
│  ├─ surface.ts           ISurfaceDoc, SurfaceKind(single|spread), ISurfaceExtent, trim/visible rect
│  ├─ element.ts           IElement 유니온 (group/image/text/shape/video/audio/widget)
│  ├─ text.ts              ITextContent(blocks→inlines), 마크, 목록(ITextList), TextFieldKind
│  ├─ link.ts paint.ts     ILink(url|page), IFill, IStroke
│  ├─ asset.ts             IAsset(서버 소유), IPublishedAsset
│  ├─ published.ts         IPublishedBook, IPublishedSurface, IPublishedNode
│  ├─ problem.ts           IDocProblem, ProblemCode, hasError
│  └─ defaults.ts          createBookDoc/createSurfaceDoc/createElement, DEFAULT_PAGE_SIZE
├─ schema/                 zod 스키마. model 과 1:1, __tests__/schemaTypes.test.ts 가 동기화 보증
├─ layout/bookLayout.ts    surfaces → 페이지 index/side/surfaceX/page number, spread 정렬 검사
├─ media/imagePlacement.ts crop + fit → 박스 안 이미지 위치 (렌더러·편집기 자르기 공용)
├─ tree/elementTree.ts     parentId+order → 트리. 고아·순환·과깊이 자동 복구(+problem)
├─ master/resolveMaster.ts 마스터를 대상 surface 좌표로 복사 + override 적용
├─ text/textContent.ts     정규화, 필드 치환, 평문 추출
├─ text/textList.ts        목록 번호·기호 계산 (getListMarkers — 편집기·렌더러 공용)
├─ publish/                resolveNodes(에디터·게시 공용) → publishSurface → publishBook
├─ validate/validateBook.ts 스키마 + 의미 검증 (게시 전 필수)
├─ migrate/migrate.ts      schemaVersion 마이그레이션
└─ collab/                 Yjs 매핑 (bookYDoc, surfaceYDoc, textYXml)
```

## 핵심 규칙 (바꾸기 전에 읽을 것)

- **Surface 가 편집 단위**다. `single`(1페이지) 또는 `spread`(펼친 2페이지). 펼침 이미지는 spread surface 위의 폭 2W 요소 하나다.
- **spread surface 는 홀수 page index 에서 시작**해야 한다 (펼침 쌍은 (1,2),(3,4)…). 어긋나면 `SpreadMisaligned` 에러.
- 페이지 크기는 책 전체에서 하나(`IBookDoc.pageSize`). surface 크기는 kind 로 정해진다.
- **trim ⊂ extent ⊂ pasteboard**. trim 은 항상 보임, extent 는 `isViewerVisible` 일 때만 게시, pasteboard 는 절대 게시 안 됨.
- **뷰어에 감출 내용은 게시 단계에서 데이터에서 제거**한다 (CSS 로 숨기지 않는다). `publishSurface` 의 `clipRect` 가 그 역할.
- 요소는 `parentId` + `order`(fractional index)로 트리를 만든다. 배열 순서를 쓰지 않는 이유는 동시 편집에서 중복/손실을 막기 위해서다.
- 마스터 요소 id 는 `master:` 접두사(+ single→spread 복제 시 `@0`/`@1`). 일반 id 는 `[A-Za-z0-9_-]` 라 절대 충돌하지 않는다.
- 링크 URL 은 http/https/mailto/tel 만 허용(`isSafeUrl`). `javascript:` 차단은 스키마의 책임이다.
- **목록은 문단의 속성**(`list: { kind, level }`)이다. 목록 노드로 감싸는 구조로 바꾸지 말 것 — 문단을 지웠다 다시 넣게 되어 그 문단에 동시에 친 글자가 사라진다. 번호는 저장하지 않고 `getListMarkers` 로 계산한다.
- Yjs 문서는 **필드 단위**로 쓴다(요소 하나 = Y.Map, 필드 하나 = 엔트리). 통째로 JSON 을 넣으면 동시 편집이 LWW 로 무너진다.

## 명령

```bash
npm run typecheck -w packages/doc   # tsc --noEmit (src + __tests__)
npm test -w packages/doc            # vitest (다른 패키지는 jest)
npm run build:local -w packages/doc # index.js/.d.ts, yjs.js/.d.ts, chunks/
```

`npm run build`(= 버전 patch 증가)는 배포 때만. 로컬 확인은 `build:local`.

## 변경 체크리스트

1. `model/` 을 고치면 `schema/` 도 같이 고친다. 안 맞으면 `schemaTypes.test.ts` 가 타입 에러로 잡는다.
2. 필드를 추가하면 `defaults.ts`, `collab/surfaceYDoc.ts`(필요 시), `publish/resolveNodes.ts` 의 `EDITOR_ONLY_FIELDS` 를 확인한다.
3. 저장된 문서와 호환이 깨지면 `SCHEMA_VERSION` 을 올리고 `migrate/migrate.ts` 에 단계를 추가한다.
4. `npm run typecheck && npm test` → 문서(`website/dev-docs/doc-model/`) 갱신.
