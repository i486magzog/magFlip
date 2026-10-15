---
sidebar_position: 1
title: 설치
---

# 설치

MagFlip은 두 가지 방법으로 사용할 수 있습니다.

## 방법 1. CDN (script 태그)

빌드 도구 없이 HTML 파일 하나로 사용할 때 가장 간단합니다.
`<head>` 안에 아래 스크립트를 추가하세요.

```html
<script src="https://cdn.jsdelivr.net/npm/@magflip/minjs@0.5.48/magflip.min.js"></script>
```

번들을 로드하면 `Book`, `BookShelfManager`, `BookShelf`, `FlipView` 등이 **전역(window)** 에 등록되고, 필요한 CSS도 자동으로 주입됩니다.

:::info 버전
최신 버전은 [npm](https://www.npmjs.com/package/@magflip/minjs)에서 확인하세요. 운영 환경에서는 버전을 고정하는 것을 권장합니다.
:::

## 방법 2. npm 패키지

React, Vue, Vite 같은 번들러 환경에서 사용할 때 권장합니다.

```bash
npm install @magflip/core @magflip/flipview
npm install @magflip/shelf   # 책을 격자나 책장으로 늘어놓을 때
```

```ts
import { Book, BookShelfManager } from '@magflip/core';
import { FlipView } from '@magflip/flipview';
import { BookShelf, ShelfLayout } from '@magflip/shelf';
import '@magflip/shelf/index.css';
```

`@magflip/flipview`를 import하면 core와 flipview의 CSS가 함께 적용됩니다. `@magflip/shelf` 의 CSS 는 위처럼 따로 가져옵니다.

## 요구 사항

| 항목 | 내용 |
| --- | --- |
| 브라우저 | 최신 Chrome / Edge / Safari / Firefox (SVG mask, CSS 변수 사용) |
| 입력 장치 | 마우스 이벤트 기반 (터치 제스처는 아직 지원하지 않음) |
| TypeScript | 타입 선언(`index.d.ts`) 포함 |
