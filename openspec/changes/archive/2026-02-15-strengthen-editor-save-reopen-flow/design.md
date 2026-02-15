## Context

The editor currently emits both HTML and JSON through TipTap events, but save correctness depends on runtime update timing. If `contentJson` is absent (legacy data) or not yet synchronized, payloads can rely on HTML only and reduce reopen fidelity for structured teaching nodes.

## Goals / Non-Goals

**Goals:**
- Make save payload generation deterministic.
- Ensure each rich-text section has valid JSON before submit.
- Preserve known teaching-layout node identity from fallback HTML.

**Non-Goals:**
- Full HTML-to-ProseMirror parser parity.
- Backend schema/API changes.
- Redesigning editor node schemas.

## Decisions

1. Add a lightweight fallback normalizer in `EditorView.vue` payload building path.
- Why: central save path already exists here, minimal surface area.
- Alternative considered: fallback in store normalize path; rejected because save-time guarantees should happen closest to submit.

2. Convert only known teaching-layout markers + readable text.
- Why: YAGNI and predictable behavior.
- Alternative considered: full HTML parser; rejected due complexity and low short-term value.

3. Keep existing HTML fields and enrich `contentJson` only when missing.
- Why: backward compatibility with export and existing backend validators.

## Risks / Trade-offs

- [Risk] Simplified fallback may not preserve advanced formatting. → Mitigation: only used when JSON missing/incomplete; native TipTap JSON remains source of truth.
- [Risk] HTML marker parsing drift with future node attributes. → Mitigation: keep parser minimal and align with current known node names.
