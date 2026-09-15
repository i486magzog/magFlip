# docs/examples — CLAUDE.md

MagFlip 사용 예제. **라이브러리 소스가 아니다.**

| 폴더 | 용도 | 주의 |
| --- | --- | --- |
| `local/index.html` | 로컬 빌드 번들(`../../../packages/minjs/magflip.min.js`)로 동작하는 테스트 페이지. Prev/Next/Move/Zoom/Expand 툴바, `window.flipView` 등 노출. 네 번째 책은 `sample-book/`(게시본)을 `PublishedBookSource` 로 읽어 그린다 | 루트 `npm run build:local && npm run serve` → `http://localhost:8080/docs/examples/local/`. 문서 사이트 `DemoFrame` 도 이 파일을 사용 |
| `prebuild/magflip.html` | CDN 번들 예제. **GitHub Pages 공개 데모 URL** (`i486magzog.github.io/magFlip/examples/prebuild/magflip.html`) | 경로 이동 금지. CDN 버전은 minjs `pub` 시 자동 갱신. `resources/book1~3` 샘플 이미지는 local 예제와 문서 데모가 공유 |
| `react-ts/` | React 18 + Vite 예제 (Example1: 기본, Example2: 라벨·moveTo·onViewerClose) | 별도 `npm install`. 로컬 패키지는 `npm link` 로 연결 |

## 규칙

- 예제는 사용자 문서(`../magFlipDocs/docs/magflip/user`)의 코드와 일치하게 유지.
- 공개 API 만 사용한다 (private 멤버 접근 금지).
- 샘플 이미지 경로를 바꾸면 `../magFlipDocs/scripts/sync-demo.mjs` 의 복사 목록도 확인.
- `local/sample-book/` 은 손으로 고치지 않는다. `scripts/make-sample-book.mjs` 가 만들며 `npm run sample:book` 으로 다시 생성한다.
- 관련 skill: `update-examples`
