---
sidebar_position: 3
title: Flip 기하 계산
---

# Flip 기하 계산

`Flipping.flip(mouseGP, pageWH, isSpreadOpen)` 은 마우스 위치 하나로 **한 프레임의 모든 모양**을 계산합니다.

## 좌표계와 용어

| 용어 | 의미 |
| --- | --- |
| **GP** (Global Point) | 뷰포트 기준 좌표 (`clientX`, `clientY`) |
| **Gutter** | 펼친 책 가운데 접히는 선 |
| **FlipActionLine** | 드래그 기준 수평선. 코너 Zone이면 책의 위/아래 변, Center Zone이면 마우스 y |
| **activeCornerGP** | 잡은 모서리 (예: 오른쪽 아래) |
| **activeCornerOppositeGP** | Gutter 기준 대칭 모서리 = 넘어간 뒤 도착점 |
| **page1 / page2** | 지금 보이는 면 / 넘어오는 뒷면 |

## 전체 계산 파이프라인

```mermaid
flowchart TD
  M[mouseGP] --> A["updateMousePointOnArea()<br/>종이가 찢어지지 않도록 좌표 제한"]
  A --> B["β = getRadianPositive(activeCorner, mouse)"]
  B --> C["page2 회전 = 2β<br/>page2 위치 = mouse - gutter"]
  B --> D["a, b = mouse - activeCorner<br/>d = -a / cos(2β - π/2) + diffH<br/>c = d / tan(-π/2 - pivot·β)"]
  D --> E["page2 mask: f, g, h, i"]
  E --> F["page1 mask: j, k, l, m (좌우 반전)"]
  C & E & F --> G[FlipData]
  G --> H["closingDistance = |mouse - opposite|<br/>→ 그림자 투명도"]
```

- `pivot` 은 오른쪽 넘김 `+1`, 왼쪽 넘김 `-1` 로, 같은 공식을 좌우에 재사용하기 위한 부호입니다.

## 오른쪽 아래 모서리를 잡았을 때

![Flip effect from right bottom 1](/img/flip-math/flipEffectRightBottom1.png)

- 점 `f, g, h, i` : page2(뒷면)에 씌우는 mask polygon
- 점 `j, k, l, m` : page1(앞면)에서 잘라낼 mask polygon
- `A = a`, `B = b`, `C = c`, `D = d` 가 코드의 변수명과 대응합니다.

![Flip effect from right bottom 2](/img/flip-math/flipEffectRightBottom2.png)

![Flip effect from right bottom 3](/img/flip-math/flipEffectRightBottom3.png)

## Mask 모양 분기

```mermaid
flowchart TD
  S{b == 0 ?} -->|예: 수평 드래그| R1["사각형<br/>h = (g.x, i.y)"]
  S -->|아니오| C1{c < 0 ?}
  C1 -->|예| T1["삼각형 (위 모서리가 꼭짓점)"]
  C1 -->|아니오| D1{d < 0 ?}
  D1 -->|예| T2["사다리꼴 (윗변이 김)<br/>책 아래로 끌 때"]
  D1 -->|아니오| D2{d < pageH ?}
  D2 -->|예| T3["삼각형 (아래 모서리가 꼭짓점)<br/>h = i"]
  D2 -->|아니오| T4["사다리꼴"]
```

## 마우스 제한 영역 (Area 1~4)

실제 종이는 Gutter에 붙어 있으므로 모서리가 갈 수 있는 범위가 제한됩니다.
`FlipDiagonals` 가 영역별 반지름과 각도 범위를 계산하고 `updateMousePointOnArea()` 가 좌표를 원 위로 끌어옵니다.

| Area | 조건 | 보정 |
| --- | --- | --- |
| 1 (위) | Gutter 아래 중앙에서의 거리 > 대각선 길이 | 그 원 위의 점으로 |
| 2 (아래) | Gutter 위 중앙에서의 거리 > 대각선 길이 | 그 원 위의 점으로 |
| 3 (오른쪽) | FlipActionLine 오른쪽 끝 바깥 | 오른쪽 끝 점으로 |
| 4 (왼쪽) | FlipActionLine 왼쪽 끝 바깥 | 왼쪽 끝 점으로 |

![Mouse point area 1](/img/flip-math/mousePointArea1.png)
![Mouse point area 2](/img/flip-math/mousePointArea2.png)
![Mouse point area 3](/img/flip-math/mousePointArea3.png)
![Mouse point area 4](/img/flip-math/mousePointArea4.png)

## 그림자

| 이름 | 요소 | 계산 함수 | 표현 |
| --- | --- | --- | --- |
| shadow1 | `svg.shadow1 path` | `setShadow1` | 표지를 닫을 때 위쪽 곡선 |
| shadow2 | `.shadow2` div | CSS | Gutter 쪽 고정 그림자 |
| shadow3 | `svg.shadow3 polygon` + `#shadow3` gradient | `setShadow3` | 넘어오는 뒷면(page2)의 접힘 하이라이트 |
| shadow5 | CSS `--shadow5-opacity` | `setShadow5` | 회전 각도에 따른 투명도 |
| shadow6 | `svg.shadow6 polygon` + `#shadow6` gradient | `setShadow6` | page1 위에 드리우는 그림자 |

모든 그림자 강도는 `closingDistance / (pageWidth / 3)` 로 스케일되어 **도착 모서리에 가까울수록 옅어집니다**.

## 줌 처리

계산은 화면 좌표(줌 적용됨)로 하고, SVG/CSS에 쓸 때 `/ zoomLevel` 로 되돌립니다. (`FlipData.printPage1MaskShape(zoomLevel)` 등)

## 화면 이동(pan) 처리

`#bookContainer` 의 transform 은 `translate(x, y) scale(zoom)` 입니다. translate 를 먼저 쓰므로 이동 단위는 **화면 픽셀**이고, 배율이 바뀌어도 같은 거리로 움직입니다.

이동은 기하 계산에 영향을 주지 않습니다. 좌표가 모두 화면 기준(`getOffset4Fixed` = `getBoundingClientRect`)이고, 회전 중심(`--page2-origin`)도 `flipActionLine.y - containerRect.top` 처럼 **컨테이너 기준 상대값**이기 때문입니다.

:::warning
딱 하나 예외가 `flipManager.gutter` 입니다. 이 값은 매 프레임 재지 않고 `updateDimension()`(→ `setSpreadOpen` 등)에서만 다시 잽니다. 그래서 **책을 옮긴 뒤에는 반드시 `updateDimension()` 을 불러야** 합니다. 부르지 않으면 접힘이 옛 가운데 선을 기준으로 계산되어 화면에 보이지 않습니다. `FlipView.pan()` 이 그렇게 하고, `zoom()` 은 `setViewer()` 안에서 이미 부릅니다. (측정 비용은 호출당 약 0.012ms)
:::

이동 거리는 `clampPan(pan, bookSize, viewportSize)`(`src/panning.ts`, DOM 없는 순수 함수)이 잘라 냅니다. 책이 화면보다 클 때만, 삐져나온 만큼의 절반까지 움직입니다.
