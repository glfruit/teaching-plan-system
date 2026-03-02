## MODIFIED Requirements

### Requirement: Frontend SHALL provide reusable warm UI primitives
The frontend SHALL provide reusable base UI components that implement consistent warm visual style and interaction behavior.

#### Scenario: Editor tab primitives are reusable
- **WHEN** editor view renders tabbed navigation for main form and template dialog
- **THEN** shared tab components SHALL be used instead of duplicating large inline templates
- **AND** visual tokens (warm border, gradient background, progress feedback) SHALL remain consistent across both tab groups
