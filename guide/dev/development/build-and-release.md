---
sidebar_position: 2
title: 빌드와 배포
---

# 빌드와 배포

## 빌드 파이프라인

```mermaid
flowchart LR
  subgraph core["packages/core"]
    cs[src/**/*.ts] -->|tsc| cd[dist/ 타입 검사]
    cs -->|rollup + dts| cdts[index.d.ts]
    cs -->|rollup + typescript + postcss extract| cjs[index.js + index.css]
  end
  subgraph flip["packages/flipview"]
    fs[src/**/*.ts] -->|rollup + dts| fdts[index.d.ts]
    fs -->|rollup + postcss inject| fjs["index.js (CSS 포함)"]
  end
  subgraph scroll["packages/scrollview"]
    ss[src] --> sjs[index.js / index.d.ts]
  end
  subgraph min["packages/minjs"]
    mi[src/index.js] -->|rollup iife + terser| mjs["magflip.min.js<br/>(window 전역)"]
  end
  cjs --> fs
  cjs --> ss
  cjs & fjs & sjs --> mi
```

| 패키지 | 출력 | CSS 처리 |
| --- | --- | --- |
| core | `index.js`, `index.d.ts`, `index.css` | 별도 파일로 추출 |
| flipview | `index.js`, `index.d.ts` | JS 안에 주입 (+ core `index.css` import) |
| scrollview | `index.js`, `index.d.ts` | JS 안에 주입 |
| minjs | `magflip.min.js` (+ dev 빌드 시 `.map`) | JS 안에 주입 |

빌드 결과는 모두 `.gitignore` 대상이며, npm 배포 시 `.npmignore` 로 `src` 등이 제외됩니다.

## 버전 규칙

```mermaid
flowchart LR
  A["npm run build (패키지)"] -->|prebuild| B["npm version patch<br/>0.5.49 → 0.5.50"]
  C["npm run versionup:minor"] --> D["0.5.x → 0.6.0<br/>+ git tag"]
```

- 패키지마다 버전이 **독립적**입니다. (core 0.5.49, flipview 0.5.45 …)
- 루트 `package.json` 버전은 배포되지 않습니다. (`private: true`)

## 배포 절차

```mermaid
sequenceDiagram
  autonumber
  participant Dev
  participant Repo as Git
  participant NPM as npm registry
  Dev->>Dev: npm test && npm run typecheck && npm run build:local
  Dev->>Dev: 로컬 데모로 동작 확인
  Dev->>Dev: npm run build (패키지별 patch 버전 증가)
  Dev->>NPM: npm run pub --otp=<OTP>
  Note over NPM: minjs 의 pub 은 README / prebuild 예제의<br/>CDN 버전을 먼저 갱신 (update_version.mjs)
  Dev->>Repo: 버전 변경 커밋 ("Update versions")
```

```bash
# 전체
npm run build
npm run pub --otp=123456

# 개별 패키지
npm run build:core
npm run pub --workspace packages/core --otp=123456
```

:::warning 배포 순서
flipview / scrollview 는 core 를, minjs 는 모두를 **빌드 시점에 번들**합니다.
core 를 수정했다면 core → flipview → scrollview → minjs 순서로 모두 다시 빌드·배포해야 CDN 번들에 반영됩니다.
:::
