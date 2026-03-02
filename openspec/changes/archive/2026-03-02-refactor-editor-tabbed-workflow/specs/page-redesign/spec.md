## MODIFIED Requirements

### Requirement: Editor page SHALL preserve warm layout and template workflow
The editor page SHALL provide warm-styled editing workflow with two-column desktop layout and mobile-safe actions.

#### Scenario: Tabbed editing layout
- **WHEN** teacher edits a plan in editor page
- **THEN** the main form SHALL be grouped by tabbed sections (`基础信息`, `教学设计`, `课堂流程`, `课后沉淀`)
- **AND** tab switching SHALL focus the corresponding section without losing existing content

#### Scenario: Sticky tab navigation with progress feedback
- **WHEN** teacher scrolls a long editor page
- **THEN** tab navigation SHALL remain sticky near the top
- **AND** each tab SHALL display completion ratio and required-missing feedback

#### Scenario: Mobile tab accessibility
- **WHEN** viewport is mobile width
- **THEN** tab navigation SHALL remain operable via horizontal scroll cards
- **AND** tab controls SHALL keep minimum readable width and tap-safe spacing

#### Scenario: Template edit dialog tab consistency
- **WHEN** teacher opens template edit dialog
- **THEN** dialog SHALL use tabbed grouping aligned with main editor mental model
- **AND** rich-text editor state SHALL remain intact while switching tabs
