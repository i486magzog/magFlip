---
sidebar_position: 90
title: 알려진 이슈 / 기술 부채
---

# 알려진 이슈 / 기술 부채

코드 분석 중 발견한 항목입니다. 수정할 때 이 목록도 함께 갱신하세요.

## 동작 관련

| # | 위치 | 내용 | 영향 |
| --- | --- | --- | --- |
| 1 | `flipview/src/flipView.ts` `setEvents()` | `window resize` 리스너가 책이 열려 있지 않을 때도 `updateDimension()` 을 호출 → `getBoundingClientRect` of undefined 에러 | 콘솔 에러 (기능 영향 없음) |
| 2 | `flipView.ts` `setEvents()` | `document` / `window` 리스너를 해제하지 않음. `bind(this)` 결과를 저장하지 않아 제거 불가 | SPA에서 뷰 재생성 시 리스너 누적 |
| 3 | `IFlipViewConfig.autoFlip.duration` | 설정값이 사용되지 않음. `autoFlip()` 에서 `500ms` 하드코딩 | 설정 무시 |
| 4 | `IBookShelfManagerConfig.onViewerOpen` | 선언만 있고 호출되지 않음 | 설정 무시 |
| 5 | `core/src/core/book.ts` `fetchPages()` | 로드되지 않은 index를 샘플 경로(`./resources/page{n}.jpg`)로 채움. `maxIndex` 가 `lastPageIndex` 에서 잘려 마지막 페이지는 채우지 않음 | 서버 연동 전 임시 코드 |
| 6 | 전역 id / CSS 변수 | `#bookViewer`, `#bookContainer`, `#mzZone*`, `mask1` 등 고정 id와 `document.documentElement` CSS 변수 사용 | 한 페이지에 뷰어 1개만 가능 |
| 7 | `core.css`, `flipView.css` | `img { width:100%; height:100%; }` 전역 규칙 | 호스트 페이지 이미지에 영향 |
| 8 | 입력 | 마우스 이벤트만 처리 (Pointer/Touch 미지원) | 모바일 제스처 불가 |

## 구조/가독성 관련

| # | 위치 | 내용 | 제안 |
| --- | --- | --- | --- |
| A | `core/src/common/models.ts` | `EventStatus`, `Zone`, `AutoFlipType` 은 FlipView 전용인데 core에 있음 (코드 내 TODO) | `flipview` 로 이동 (breaking change → minor 버전) |
| B | `flipview/src/flipView.ts` (≈1,300줄) | DOM 생성, 이벤트, 그림자 계산, 페이지 이동이 한 클래스에 섞여 있음 | `flipViewElements.ts`, `shadowRenderer.ts`, `flipEvents.ts` 등으로 분리 |
| C | `flipManager.ts` | 클래스 이름은 `Flipping`, 파일/import alias는 `FlipManager` | 이름 통일 |
| D | `flipData.ts` | `alpa` 오타 (`alpha`) | 공개 타입이므로 alias 추가 후 교체 |
| E | `flipManager.ts` `animateReadyToFlip()` | Zone별 `switch` 가 거의 같은 코드 반복 | Zone 비트 플래그로 방향 부호(±1) 계산 |
| F | `helper.ts` `deepMerge` | target(기본 config 객체)을 직접 변경 | 복사본에 merge |
| G | 테스트 | 순수 계산 로직 일부만 테스트 존재 (`flipview/__tests__`) | `Flipping.flip()` 결과 스냅샷 테스트 추가 |

## 긴 책

| # | 위치 | 내용 | 제안 |
| --- | --- | --- | --- |
| L | `core/src/core/page.ts` (`Page extends PageEl`) | `Book.importPages` 가 페이지마다 `PageEl` 을 만들고, 그 생성자가 바로 `render(contentEl)` 을 부른다. 그래서 300쪽 책을 열면 300개의 DOM 과 300번의 surface 요청이 한꺼번에 일어난다 | 페이지 요소를 **보이기 직전에** 만들도록 바꾼다(`IPage.element` 를 지연 생성). `@magflip/render` 쪽은 이미 준비되어 있다 — `createPageDataList()` 는 아무것도 받아오지 않고, 각 페이지는 처음 그려질 때 자기 surface 를 가져온다 |

## 해결됨

| 내용 | 해결 |
| --- | --- |
| core 내부 `import ... from 'src/common/helper'` (baseUrl 의존 경로) | 상대 경로 `../common/helper` 로 변경. Jest 등 다른 도구에서도 해석 가능 |
