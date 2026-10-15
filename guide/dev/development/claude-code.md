---
sidebar_position: 5
title: Claude Code 설정
---

# Claude Code 설정 (CLAUDE.md & Skills)

AI 코딩 도구(Claude Code)가 저장소 규칙을 이해하도록 폴더마다 가이드를 둡니다.

```mermaid
flowchart TD
  root["CLAUDE.md (루트)<br/>전체 구조 · 명령어 · 공통 규칙"]
  root --> doc["packages/doc/CLAUDE.md"]
  root --> render["packages/render/CLAUDE.md"]
  root --> core["packages/core/CLAUDE.md"]
  root --> flip["packages/flipview/CLAUDE.md"]
  root --> scroll["packages/scrollview/CLAUDE.md"]
  root --> min["packages/minjs/CLAUDE.md"]
  root --> ex["docs/examples/CLAUDE.md"]
```

## Skills

| 위치 | Skill | 언제 쓰나 |
| --- | --- | --- |
| `.claude/skills/` | `local-dev` | 빌드·테스트·로컬 데모 실행 |
| `.claude/skills/` | `release` | npm 배포 절차 |
| `packages/doc/.claude/skills/` | `doc-model-change` | 문서 모델·스키마·게시 규칙 변경 |
| `packages/render/.claude/skills/` | `render-change` | 게시본 렌더링 변경 |
| `packages/core/.claude/skills/` | `core-model-change` | 책/페이지 데이터·공개 API 변경 |
| `packages/flipview/.claude/skills/` | `flip-effect-debug` | 넘김 모양·그림자·이벤트 버그 수정 |
| `packages/scrollview/.claude/skills/` | `new-view-plugin` | `IBookView` 구현 추가 |
| `packages/minjs/.claude/skills/` | `bundle-check` | 번들 구성 변경·검증 |
| `docs/examples/.claude/skills/` | `update-examples` | 예제 페이지 수정 |

문서는 `guide/` 에 있고, 작성 규칙은 [문서 작성 가이드](./writing-docs.md)에 있습니다.

구조를 바꾸면 **코드 → `guide/dev` → CLAUDE.md → skill** 순서로 함께 갱신하세요.
