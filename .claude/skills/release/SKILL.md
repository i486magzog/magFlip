---
name: release
description: Publish MagFlip packages (@magflip/core, flipview, scrollview, minjs) to npm with correct build order and versioning. Use only when the user explicitly asks to release, publish, or bump versions.
---

# MagFlip 배포

배포는 외부 공개 작업이다. **사용자가 명시적으로 요청했을 때만** 진행하고, `npm publish` 직전에 대상 패키지와 버전을 보여주고 확인을 받는다. OTP 는 사용자가 직접 입력한다 (에이전트가 OTP 를 요구·입력하지 않음).

## 사전 검증

1. `git status` 가 깨끗한지 확인 (브랜치 `dev/main`).
2. `npm run typecheck && npm test && npm run build:local`
3. local-dev skill 의 브라우저 확인 항목 통과.

## 버전 규칙

- 각 패키지 `npm run build` 는 `prebuild: npm version patch` 로 patch 버전을 자동 증가.
- minor: `npm run versionup:minor` (git tag 생성).
- 패키지별 버전은 독립. 루트(`@magzog/magflip`)는 private.

## 순서

core 를 바꿨다면 번들에 반영되도록 전부 다시 빌드·배포:

```bash
npm run build            # workspaces 알파벳 순서 → minjs 가 scrollview 보다 먼저 빌드됨에 주의
```

순서가 걱정되면 개별 실행: `npm run build:core` → `build:flipview` → `build:scrollview` → `build:minjs`.

그 다음 사용자가 터미널에서:

```bash
npm run pub --otp=<OTP>
```

- minjs 의 `pub` 은 먼저 `npm_scripts/update_version.mjs` 로 `README.md` 와 `docs/examples/prebuild/magflip.html` 의 CDN 버전을 갱신한다.

## 마무리

- 변경된 `package.json`, `package-lock.json`, `README.md`, `docs/examples/prebuild/magflip.html` 을 `Update versions` 로 커밋.
- `../magFlipDocs/docs/magflip/user/getting-started/*.md` 의 CDN 버전 예시가 오래됐으면 갱신.
