---
sidebar_position: 1
title: 개발자 가이드 소개
---

# 개발자 가이드

MagFlip **자체를 개발·유지보수**하는 사람을 위한 문서입니다.
라이브러리를 _사용_하는 방법은 [사용자 가이드](../user/intro.md)를 참고하세요.

## magBook 저장소 구성

MagFlip 제품군은 같은 폴더(`magBook/`)에 나란히 놓인 다섯 저장소입니다. 이 문서는 그중 **magBookFlip** 을 다룹니다.

```mermaid
flowchart LR
  subgraph magflip["magBookFlip"]
    doc["@magflip/doc<br/>문서 모델"]
    render["@magflip/render<br/>렌더러"]
    viewer["core · flipview · minjs<br/>뷰어"]
  end
  editor["magBookEditor"] -->|"file: 링크"| doc
  editor -->|"file: 링크"| render
  server["magBookServer"] -->|"file: 링크"| doc
  tv["magBookTV<br/>(계획)"] -.->|"file: 링크"| viewer
  docs["magBookDocs<br/>이 문서 사이트"]
```

| 저장소 | 역할 | 문서 |
| --- | --- | --- |
| magBookFlip | 뷰어 라이브러리, 공용 문서 모델·렌더러 | 이 가이드 |
| magBookEditor | 책 편집기 | [Editor 개발 가이드](/editor/dev/intro) |
| magBookServer | 동시 편집 방·저장·게시 | [Server 개발 가이드](/server/dev/intro) |
| magBookTV | TV 앱 | [TV 개발 가이드](/tv/dev/intro) |
| magBookDocs | 문서 사이트 | [문서 작성 가이드](./development/writing-docs.md) |

## 이 문서를 읽는 순서

```mermaid
flowchart LR
  A["1. 로컬 개발 환경<br/>설치·빌드·테스트"] --> B["2. 시스템 구조<br/>패키지·런타임 객체"]
  B --> C["3. 폴더 구조<br/>어디에 무엇이"]
  C --> D["4. FlipView 내부<br/>Page Window·이벤트·기하"]
  D --> E["5. 코딩 컨벤션<br/>& 배포"]
```

| 알고 싶은 것 | 문서 |
| --- | --- |
| 처음 clone 후 무엇을 실행하나? | [로컬 개발 환경](./development/local-setup.md) |
| 패키지들이 어떻게 연결되나? | [시스템 구조](./architecture/overview.md) |
| 어떤 파일을 고쳐야 하나? | [폴더 구조](./architecture/folder-structure.mdx) |
| 클래스 관계는? | [클래스 모델](./architecture/class-model.md) |
| 책장·격자와 책이 날아가는 건 어디서? | [책 객체와 @magflip/shelf](./book-object.md) |
| 페이지가 어떻게 교체되나? | [Page Window](./flipview/page-window.md) |
| 마우스 이벤트 → 애니메이션 흐름은? | [이벤트 흐름](./flipview/event-flow.md) |
| 접힘 모양/그림자 계산은? | [Flip 기하 계산](./flipview/flip-geometry.md) |
| 코드 스타일 규칙은? | [코딩 컨벤션](./development/coding-conventions.md) |
| 에디터가 만드는 책 데이터 형식은? | [문서 모델 개요](./doc-model/overview.md) |
| 펼침 2페이지·확장 페이지는 어떻게 표현하나? | [Surface 와 페이지](./doc-model/surface-and-pages.md) |
| 동시 편집은 어떻게 합쳐지나? | [동시 편집](./doc-model/collaboration.md) |
| 게시된 책을 무엇이 그리나? | [렌더러](./doc-model/rendering.md) |
| 화면의 말은 어느 언어로 나오나? | [다국어](./i18n.md) |
| npm 배포는? | [빌드와 배포](./development/build-and-release.md) |
| 알려진 문제는? | [알려진 이슈](./known-issues.md) |

## 30초 요약

- **npm workspaces 모노레포**: `packages/i18n`, `doc`, `render`, `core`, `input`, `shelf`, `flipview`, `scrollview`, `minjs`
- **TypeScript + Rollup** 으로 각 패키지를 ESM(`index.js`) + 타입(`index.d.ts`)으로 빌드
- `minjs` 는 모든 패키지를 IIFE 번들(`magflip.min.js`)로 묶어 전역에 노출
- UI 프레임워크 없이 **DOM을 직접 생성**하고, Flip 효과는 **SVG mask + CSS 변수 + transform** 으로 구현
