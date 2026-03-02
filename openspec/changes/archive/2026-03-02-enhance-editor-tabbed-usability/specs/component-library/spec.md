## MODIFIED Requirements

### Requirement: Frontend SHALL provide reusable warm UI primitives
The frontend SHALL provide reusable base UI components that implement consistent warm visual style and interaction behavior.

#### Scenario: Tab component provides current-state accessibility semantics
- **WHEN** editor tab components render active and inactive tabs
- **THEN** active tab trigger SHALL expose explicit current-state semantics (for example `aria-current`)
- **AND** semantics SHALL remain consistent for both main editor tabs and template dialog tabs
