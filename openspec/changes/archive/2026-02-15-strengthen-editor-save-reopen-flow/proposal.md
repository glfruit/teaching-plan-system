## Why

Teachers rely on structured teaching-layout blocks in the lesson process section. In edge cases (legacy records without `contentJson`, stale form state, or immediate save after page load), save/reopen can lose JSON-level structure and degrade the editing experience.

## What Changes

- Add a deterministic payload builder fallback that derives `contentJson` from section HTML when `contentJson` is missing or incomplete.
- Preserve known teaching-layout blocks (`lessonTimeline`, `activityStepCard`, `goalActivityAssessmentGrid`) during fallback derivation.
- Guarantee each rich-text section has a valid document JSON shape before save.
- Add focused tests for fallback generation and save/reopen integrity.

## Capabilities

### New Capabilities
- `editor-save-reopen-integrity`: Ensure editor payload always carries restorable section JSON, even when live editor updates are missing or delayed.

### Modified Capabilities
- None.

## Impact

- Frontend editor form mapping and payload builder in `/frontend/src/views/EditorView.vue`.
- Frontend tests in `/frontend/src/views/__tests__/EditorView-layout-blocks.spec.ts`.
- No backend API contract change; continues using existing `contentJson` and HTML fields.
