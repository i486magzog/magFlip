---
sidebar_position: 4
title: 페이지 라벨
---

# 페이지 라벨

책 옆면에 색상 탭을 붙여 목차처럼 사용할 수 있습니다. 라벨을 클릭하면 `onClick(pageIndex)` 가 호출됩니다.

```js
const book = new Book({
  id: 'catalogue',
  lastPageIndex: 9,
  labels: {
    2: { index: 0, pageIndex: 2, content: 'A', backgroundColor: '#B74628', opacity: 0.5, onClick: (i) => flipView.moveTo(i) },
    4: { index: 1, pageIndex: 4, content: 'B', backgroundColor: '#92B53E', opacity: 0.5, onClick: (i) => flipView.moveTo(i) },
  },
});
```

| 속성 | 설명 |
| --- | --- |
| `index` | 라벨 순서. 세로 위치 계산에 사용됩니다. (`top` 미지정 시) |
| `pageIndex` | 연결된 페이지 index. `onClick`에 전달됩니다. |
| `content` | 라벨 안에 표시할 HTML |
| `backgroundColor` | 배경색 (기본 `rgb(48, 171, 237)`) |
| `opacity` | 투명도 (기본 `1`) |
| `top` | 세로 위치(px). 지정하지 않으면 `index` 기준으로 자동 배치 |
| `type` | `PageLabelType.Default` / `PageLabelType.Empty` |
| `onClick` | 클릭 핸들러 `(pageIndex) => void` |
