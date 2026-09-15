---
name: doc-model-change
description: Change the MagFlip document model shared by editor, server and viewer (IBookDoc, ISurfaceDoc, IElement, published JSON, Yjs mapping). Use when adding or renaming fields, adding an element type, or changing layout, master, publish or validation rules in packages/doc.
---

# @magflip/doc 모델 변경

## 1. 어디를 건드리는지 먼저 확인

```bash
grep -rn "<이름>" packages/doc/src packages/doc/__tests__ ../magFlipDocs/docs/magflip/dev/doc-model
```

편집본(`model/`) → 스키마(`schema/`) → 게시본(`model/published.ts`, `publish/`) → 협업(`collab/`) 순으로 영향이 퍼진다.

## 2. 필드 추가 순서

1. `src/model/*.ts` 에 필드 추가. 영문 JSDoc 필수, 단위(px·도)와 좌표계를 적는다.
2. `src/schema/*.ts` 에 같은 필드 추가. 안 맞으면 `__tests__/schemaTypes.test.ts` 가 타입 에러로 잡는다.
3. `src/model/defaults.ts` 의 `createElement` / `createBookDoc` / `createSurfaceDoc` 에 기본값 추가 (스키마가 필수로 요구하는 필드는 반드시).
4. 게시본에서 빼야 할 편집 전용 필드면 `publish/resolveNodes.ts` 의 `EDITOR_ONLY_FIELDS` 에 추가.
5. 협업: 요소 필드는 자동으로 `Y.Map` 엔트리가 된다. 중첩 Yjs 타입(리치 텍스트 등)을 새로 쓰려면 `collab/surfaceYDoc.ts` 를 손본다.
6. 새 파일은 `src/index.ts`(또는 협업이면 `src/yjs.ts`)에 `export *` 추가.

## 3. 새 요소 타입 추가

`ElementType` → `model/element.ts` 인터페이스 → `IElement` 유니온 → `schema/elementSchema.ts` (`ElementSchema` 배열) → `defaults.ts` 의 `getTypeDefaults` → 에셋을 쓰면 `publish/resolveNodes.ts` 의 `getAssetIds`/`collectAssetIds`.

## 4. 호환성

- 저장된 문서를 못 읽게 되는 변경이면 `common/constants.ts` 의 `SCHEMA_VERSION` 을 올리고 `migrate/migrate.ts` 의 `MIGRATIONS` 에 단계를 추가한다.
- 선택 필드 추가는 버전을 올리지 않아도 된다. 필수 필드 추가·이름 변경·의미 변경은 올린다.

## 5. 검증

```bash
npm run typecheck -w packages/doc && npm test -w packages/doc
npm run typecheck && npm test          # 저장소 전체
```

규칙을 바꿨다면 테스트를 먼저 추가한다. 특히 다음은 회귀가 곧 사고다.

- 확장 영역(`isViewerVisible: false`)의 내용이 게시본에 남지 않는지 (`__tests__/publish.test.ts`)
- 펼침 정렬(`SpreadMisaligned`) 검출 (`__tests__/bookLayout.test.ts`)
- 동시 편집 병합: 이동 vs 크기 변경, 동시 재정렬 (`__tests__/collab.test.ts`)

## 6. 문서

`../magFlipDocs/docs/magflip/dev/doc-model/` 의 해당 문서와 `packages/doc/CLAUDE.md` 파일 지도를 함께 갱신한다.
