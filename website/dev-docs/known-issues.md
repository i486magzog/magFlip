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

## 해결됨

| 내용 | 해결 |
| --- | --- |
| core 내부 `import ... from 'src/common/helper'` (baseUrl 의존 경로) | 상대 경로 `../common/helper` 로 변경. Jest 등 다른 도구에서도 해석 가능 |
| `Book.importPages` 가 페이지마다 요소를 만들어서, 300쪽 책을 열면 DOM 300개와 surface 요청 300번이 한꺼번에 일어남 | `PageEl` 이 요소를 **처음 요구받을 때** 만든다(`element`/`contentEl` 이 getter, `hasElements` 로 확인). 뷰어는 창에 들어오는 페이지만 요구하므로 300쪽 책을 열 때 요청은 매니페스트 1개, 페이지 요소는 6개다. FlipView 는 `pageElOf()` 한 곳에서 요소를 얻고 그때 그림자를 붙인다 |
| 책을 열지 않은 채 창 크기를 바꾸면 `getBoundingClientRect` 에서 예외 | `FlipView.updateDimension()` 이 책이 없으면 아무것도 하지 않는다 |
| (#3) `IFlipViewConfig.autoFlip.duration` 설정이 무시되고 `autoFlip()` 이 `500ms` 로 하드코딩 | `autoFlip()` 이 `config.autoFlip.duration` 을 쓴다. 드래그를 놓은 뒤의 `Flipping.animateFlip()` 은 여전히 `400ms` 고정(코드 내 TODO) |
| 넘기는 중인지 밖에서 알 수 없고, 넘기는 중 `nextPage()` 가 조용히 무시됨 | `IBookView.isFlipping` / `onFlipEnd()` 공개. 드래그 중 `nextPage()` 도 이제 무시된다(전에는 드래그와 겹쳐 실행됨) |
