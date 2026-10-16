---
sidebar_position: 4
title: 페이지 라벨
---

# 페이지 라벨

책 옆면에 색상 탭을 붙여 목차처럼 사용할 수 있습니다. 라벨을 클릭하면 `onClick(pageIndex)` 가 호출됩니다.

라벨은 실제 책의 인덱스 탭처럼 **자기 페이지의 한 면에 붙어, 그 페이지의 바깥 가장자리 밖으로 삐져나옵니다.** 라벨은 늘 화면에 보입니다.

- 오른쪽 페이지(짝수 index)의 라벨은 오른쪽 가장자리에, 왼쪽 페이지(홀수 index)의 라벨은 왼쪽 가장자리에 붙습니다. 아직 넘기지 않은 장의 라벨은 책 오른쪽에, 넘긴 장의 라벨은 왼쪽에 있습니다.
- 라벨이 붙은 페이지에서는 라벨 전체가 페이지 가장자리 위에 걸쳐 보입니다. 같은 종이의 반대 면에서는 가장자리 밖으로 삐져나온 부분만 보여, 라벨이 어느 페이지에 붙었는지 알 수 있습니다.
- 밑에 있는 페이지의 라벨은 페이지 밑에서 바깥으로 삐져나와 보입니다.
- 모서리에 마우스를 올려 페이지가 살짝 들리거나 페이지를 넘길 때, 라벨도 페이지와 함께 접히고 넘어갑니다. 하드커버의 판지도 라벨과 함께 돌아갑니다.
- `moveTo` 로 여러 장을 한 번에 넘기면, 그 사이 장의 라벨은 넘기는 동안 숨었다가 끝나면 반대쪽에 나타납니다. 페이지가 넘어가는 중에 누른 라벨은 무시됩니다.

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
