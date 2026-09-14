---
sidebar_position: 3
title: 요소와 텍스트
---

# 요소와 텍스트

## 공통 필드

모든 요소는 `id`, `type`, `name`, `parentId`, `order`, `opacity`, `isHidden`, `isLocked`, `link?` 를 가집니다.
그룹을 뺀 나머지는 **박스**를 가집니다: `x`, `y`, `width`, `height`, `rotation`(중심 기준 시계 방향, 도), `isFlippedX`, `isFlippedY`.

`x`, `y` 는 **surface 좌표**입니다. 그룹 안에 있어도 마찬가지입니다 — 자세한 이유는 아래 그룹 항목에 있습니다.

| 타입 | 주요 필드 |
| --- | --- |
| `image` | `assetId`, `fit`(cover/contain/fill), `crop`(0~1 정규화), `alt` |
| `text` | `content`, `style`, `verticalAlign`, `sizing`(fixed/autoHeight), `fill`, `padding` |
| `shape` | `shape`(rectangle/ellipse/line/path), `path`, `fill`, `stroke`, `cornerRadius` |
| `video` | `assetId`, `posterAssetId`, `fit`, `isAutoplay`, `isLooping`, `isMuted`, `hasControls` |
| `audio` | `assetId`, `isAutoplay`, `isLooping`, `hasControls` |
| `widget` | `widgetType`, `widgetVersion`, `props`(JSON) — 게시 시 sandbox iframe 으로 렌더 |
| `group` | 박스 없음 |

에셋(이미지·동영상·폰트 파일)은 문서에 들어가지 않습니다. 문서는 `assetId` 만 갖고, 실제 파일과 메타데이터는 서버(R2 + D1)가 소유합니다. 게시할 때 `IPublishedSurface.assets` 에 URL 표가 붙습니다.

## z-order 와 그룹

형제 요소의 앞뒤는 `order`(fractional index) 문자열이 정합니다. 같은 값이면 `id` 로 정합니다.

```ts
// 두 요소 사이에 넣기
const order = createOrderBetween(back.order, front.order);
```

배열 인덱스를 쓰지 않는 이유는 동시 편집 때문입니다. 배열에서의 "이동"은 삭제 + 삽입이라 두 사람이 같은 요소를 옮기면 복제되지만, `order` 는 그 요소의 필드 하나만 바뀌므로 나중 값이 이깁니다.

**그룹은 좌표계를 만들지 않습니다.** 자식은 surface 좌표를 그대로 쓰고, 그룹의 크기는 자식들의 합집합(`getNodeBounds`)입니다. 그룹을 움직이면 자식 좌표가 함께 바뀝니다. 대신 그룹의 `opacity`, `isHidden`, `isLocked`, `link` 는 subtree 전체에 적용됩니다.

트리는 `parentId` 로 만들고 `buildElementTree` 가 조립합니다. 동시 편집에서 생길 수 있는 깨진 모양은 **같은 규칙으로 자동 복구**되므로 모든 클라이언트가 같은 트리를 봅니다.

| 상황 | 복구 | 문제 코드 |
| --- | --- | --- |
| 부모가 삭제됨 | surface 로 올림 | `OrphanElement` |
| 부모가 그룹이 아님 | surface 로 올림 | `InvalidParent` |
| 그룹끼리 서로 포함 | id 가 가장 작은 쪽을 surface 로 올림 | `ElementCycle` |
| 32단계보다 깊음 | surface 로 올림 | `GroupTooDeep` |

## 리치 텍스트

```ts
content: {
  blocks: [{
    type: 'paragraph',
    align: 'start',
    inlines: [
      { text: '1장 ', marks: { fontWeight: 700 } },
      { field: 'pageNumber' },
    ],
  }],
}
```

- `marks` 는 문자 단위 덮어쓰기입니다(`fontFamily`, `fontSize`, `fontWeight`, `isItalic`, `isUnderlined`, `isStruckThrough`, `color`, `letterSpacing`, `link`). 지정하지 않은 값은 요소의 `style` 을 따릅니다.
- **필드**(`pageNumber`, `pageCount`, `bookTitle`)는 값을 저장하지 않고 자리만 잡습니다. 렌더링·게시 시점에 `resolveTextFields` 가 채웁니다. 마스터에 쪽번호를 한 번만 놓으면 모든 페이지에서 제 번호가 나오는 게 이 덕분입니다.
- 펼침에서는 요소의 **중심 x** 가 속한 페이지의 번호를 씁니다(`getFieldValuesAt`).
- `normalizeTextContent` 가 같은 마크의 인접 런을 합칩니다. Yjs 델타가 자동으로 하는 병합과 결과를 맞추기 위해서입니다.

## 마스터

마스터는 페이지 밑에 깔리는 surface 입니다. `ISurfaceDoc.masterId` 로 연결하고, 게시·렌더링 시 `resolveMasterElements` 가 대상 surface 좌표로 옮겨 붙입니다.

| 마스터 kind | 대상 kind | 결과 |
| --- | --- | --- |
| `spread` | `spread` | 그대로 |
| `spread` | `single` | 해당 **쪽 방향의 절반만** 가져와 x 를 페이지 좌표로 이동 |
| `single` | `spread` | 좌·우 페이지에 **각각 복제** (id 에 `@0` / `@1`) |
| `single` | `single` | 그대로 |

- 마스터에서 온 요소의 id 는 `master:` 접두사를 갖습니다. 일반 id 는 `[A-Za-z0-9_-]` 만 허용하므로 충돌이 없습니다.
- 페이지는 `masterOverrides` 로 마스터 요소의 일부 필드를 덮어쓸 수 있습니다(예: 특정 페이지에서 쪽번호 숨기기). 덮어쓰지 않은 필드는 계속 마스터를 따라갑니다.
- `id`, `type`, `parentId`, `order` 는 덮어쓸 수 없고, 결과가 스키마에 맞지 않는 override 는 무시하고 `InvalidMasterOverride` 경고를 냅니다.
- 마스터의 마스터(중첩)는 금지입니다(`NestedMaster` 에러).

## 안전 규칙

- 링크 URL 은 `http`, `https`, `mailto`, `tel` 만 허용합니다. `javascript:` 같은 스킴은 스키마 단계에서 거부됩니다(`isSafeUrl`).
- 페이지 링크는 페이지 index 가 아니라 `surfaceId` 를 가리킵니다. 페이지를 재정렬해도 링크가 깨지지 않습니다.
- 위젯 `props` 는 JSON 이며 길이 제한(64KB)이 있습니다. 실제 값의 유효성은 서버의 위젯 레지스트리가 검사합니다.
- SVG path 문자열은 패스 명령 문자만 허용합니다.
