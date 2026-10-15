---
name: release
description: Publish MagFlip packages (@magflip/core, shelf, flipview, scrollview, minjs, and the others) to npm with correct build order and versioning. Use only when the user explicitly asks to release, publish, or bump versions.
---

# MagFlip 배포

배포는 외부 공개 작업이다. **사용자가 명시적으로 요청했을 때만** 진행하고, `npm publish` 직전에 대상 패키지와 버전을 보여주고 확인을 받는다. 로그인(`npm login`)과 OTP 는 사용자가 직접 한다 (에이전트가 OTP 를 요구·입력하지 않음).

## 버전 규칙

- **모든 `@magflip/*` 패키지는 같은 버전을 쓴다.** minjs 가 전부를 번들하고 늘 함께 배포하기 때문이다. 루트(`@magzog/magflip`)는 private 이라 배포하지 않는다.
- 버전은 배포할 때 한 번만 바꾼다: `npm run version:set -- x.y.z` → `npm install`. 모든 패키지의 `version` 과, 패키지끼리 요구하는 범위(`^x.y.z`)가 함께 바뀐다.
- 빌드는 버전을 바꾸지 않는다(`prebuild` 없음).
- 0.x 에서는 기존 사용법을 깨는 변경이면 둘째 자리(0.6.0 → 0.7.0), 아니면 셋째 자리(0.6.0 → 0.6.1)를 올린다. `^0.6.0` 은 0.6.x 만 받으므로, 깨는 변경을 셋째 자리로 내면 외부 프로젝트가 자동으로 따라 올라가 깨진다. 무엇이 깨지는지 모르겠으면 사용자에게 묻는다.

## 절차

1. `git status` 가 깨끗한지 확인 (브랜치 `dev/main`).
2. `npm run version:set -- x.y.z && npm install`
3. CDN 버전 문자열을 맞춘다: `README.md`, `docs/examples/prebuild/magflip.html`, `guide/user/getting-started/*.md` 의 `@magflip/minjs@x.y.z`. (minjs 의 `pub` 도 앞의 둘을 고치지만, 미리 맞춰 두면 배포 뒤 작업 트리가 깨끗하다.)
4. `npm run typecheck && npm test && npm run build` — 루트 `build` 는 의존 순서(i18n → doc → render → core → input → shelf → flipview → scrollview → minjs)로 빌드하고, minjs 는 압축 빌드(`BUILD=prod`)다.
5. local-dev skill 의 브라우저 확인 항목 + `prebuild/magflip.html` 을 로컬 번들로 열어 확인(파일 안의 local test 줄).
6. 패키지마다 `npm pack --dry-run` 으로 버전과 들어갈 파일 확인.
7. `Release x.y.z` 로 커밋하고, 사용자 확인 뒤 `dev/main` 에 push.
8. 사용자가 터미널에서:

```bash
npm login                 # 로그인되어 있지 않을 때 (npm whoami 로 확인)
npm run pub --otp=<OTP>   # 모든 패키지를 알파벳 순서로 배포
```

OTP 는 30초마다 바뀐다. 중간에 만료되어 실패하면, 이미 배포된 패키지는 건너뛰고 나머지만 새 OTP 로 배포한다: `npm run pub --workspace packages/<name> --otp=<OTP>`.

## 마무리

- `npm view @magflip/<name> version` 으로 모든 패키지가 새 버전인지 확인.
- `vx.y.z` 태그를 만들고 GitHub Release 를 쓴다(바뀐 점, 깨지는 변경, 패키지 목록). 태그는 사용자 확인 뒤 push.
- `dev/main` → `main` PR. GitHub Pages(`main:/docs`)의 CDN 데모는 합친 뒤에 새 버전을 쓴다.
