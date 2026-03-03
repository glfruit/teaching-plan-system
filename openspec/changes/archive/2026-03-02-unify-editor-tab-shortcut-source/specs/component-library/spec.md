## MODIFIED Requirements

### Requirement: Frontend SHALL provide reusable warm UI primitives
The frontend SHALL provide reusable base UI components that implement consistent warm visual style and interaction behavior.

#### Scenario: Tab shortcut hints stay behavior-consistent
- **WHEN** tab components render shortcut hint messages
- **THEN** displayed hint keys SHALL remain consistent with actual keyboard handler mapping
- **AND** consistency SHALL be verifiable via automated tests
