---
name: update-examples
description: Update MagFlip example pages in docs/examples (local test page, CDN prebuild demo on GitHub Pages, React + Vite app). Use when public API usage changes or when adding a new usage example.
---

# 예제 수정

## 어떤 예제를 고치나

| 예제 | 로드 방식 | 실행 |
| --- | --- | --- |
| `local/index.html` | `../../../packages/minjs/magflip.min.js` (로컬 빌드) | 루트 `npm run dev` → `/docs/examples/local/` |
| `prebuild/magflip.html` | CDN `@magflip/minjs@x.y.z` | 공개 데모. 파일 경로 변경 금지. 버전 문자열은 배포 스크립트가 관리 |
| `react-ts/` | npm 패키지 (`npm link` 로 로컬 연결 가능) | `cd docs/examples/react-ts && npm install && npm run dev` |

## 규칙

- 공개 API 만 사용. 사용자 문서(`../magFlipDocs/docs/magflip/user`)의 코드 예시와 동일한 패턴 유지.
- 새 API 사용 예제는 `local/index.html` 에 먼저 추가해 로컬에서 검증 → 배포 후 `prebuild` 에 반영.
- `local/index.html` 은 문서 사이트 Live Demo 로도 쓰인다 (`../magFlipDocs/scripts/sync-demo.mjs` 가 복사). 상대 경로 구조를 유지.
- 샘플 이미지는 `prebuild/resources/book{1,2,3}/page{n}.jpg` 를 공유한다.
- 사람이 읽기 쉽게: 함수 단위로 나누고(`createSampleBook`, `addToolbar`) 짧은 주석을 단다.

## 검증

루트에서 `npm run build:local && npm run serve`, 브라우저에서 책 열기/넘기기/닫기 확인. 콘솔 에러 확인.
