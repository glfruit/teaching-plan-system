## 1. Save payload fallback implementation

- [x] 1.1 Add helper(s) in `EditorView.vue` to derive per-section JSON from HTML when `contentJson` is missing.
- [x] 1.2 Ensure fallback derivation preserves known teaching-layout blocks and returns valid doc structure.
- [x] 1.3 Update `buildPlanPayload` to output complete `contentJson` for all rich-text sections.

## 2. Test coverage

- [x] 2.1 Add/extend tests in `EditorView-layout-blocks.spec.ts` for missing-JSON fallback with teaching-layout markers.
- [x] 2.2 Add test for plain-text legacy HTML fallback behavior.

## 3. Verification

- [x] 3.1 Run targeted frontend tests for editor view payload behavior.
- [x] 3.2 Run frontend test suite to confirm no regressions.
