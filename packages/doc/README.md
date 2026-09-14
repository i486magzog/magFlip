# @magflip/doc

MagFlip 의 문서 모델. MagFlipEditor(편집), MagFlipServer(저장·게시), MagFlip 뷰어(표시)가 같은 책 데이터를 쓰도록 타입·검증·계산을 한곳에 모은 패키지입니다.

- **타입과 스키마** — `IBookDoc`, `ISurfaceDoc`, `IElement` 와 zod 스키마
- **페이지 레이아웃** — surface 순서에서 페이지 index·좌우·쪽번호 계산
- **마스터** — 마스터 surface 를 페이지 좌표로 해석하고 override 적용
- **게시** — 독자가 볼 수 없어야 하는 내용을 제거한 게시본 생성
- **Yjs 매핑** — 동시 편집용 문서 구조 (`@magflip/doc/yjs`)

```ts
import { computeBookLayout, publishBookBundle, validateBookBundle } from '@magflip/doc';
import { writeSurfaceDoc, readSurfaceDoc } from '@magflip/doc/yjs';
```

문서: [문서 모델 개요](https://i486magzog.github.io/magFlip/dev/doc-model/overview)

```bash
npm run build
npm run pub --otp=<otp>
```
