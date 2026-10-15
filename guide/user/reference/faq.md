---
sidebar_position: 2
title: FAQ / 문제 해결
---

# FAQ / 문제 해결

### 썸네일을 클릭해도 아무 일이 일어나지 않아요
`bookViewer.registerView(flipView)` 를 호출했는지 확인하세요. 뷰가 없으면 콘솔에 `Please select one view.` 에러가 발생합니다.

### 페이지 이미지가 일부만 보이거나 엉뚱한 이미지가 나와요
`importPages` 로 **0 ~ lastPageIndex 의 모든 페이지**를 등록했는지 확인하세요.
등록되지 않은 index는 내부 샘플 경로(`./resources/page{n}.jpg`)로 채워질 수 있습니다.

### 책이 화면보다 커요
`importPages` 의 `size` 를 줄이거나 `bookViewer.setZoomLevel(0.8)` 처럼 줌을 사용하세요.

### 한 페이지에 책 뷰어를 두 개 띄울 수 있나요?
현재는 지원하지 않습니다. 고정 DOM id와 전역 CSS 변수를 사용하기 때문입니다.

### 모바일 터치로 넘길 수 있나요?
아직은 마우스 이벤트만 지원합니다. `nextPage` / `prevPage` 버튼을 함께 제공하는 것을 권장합니다.
