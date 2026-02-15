## MODIFIED Requirements

### Requirement: Save payload SHALL include restorable section JSON
The system SHALL construct a valid ProseMirror-like document JSON for each rich-text section during save when `contentJson` is missing or incomplete.

#### Scenario: Missing contentJson for process section
- **WHEN** a plan is saved with process HTML containing teaching-layout markers and no process `contentJson`
- **THEN** the payload SHALL include `contentJson.process` as a valid document JSON
- **AND** known teaching-layout markers SHALL be converted to corresponding node types

#### Scenario: Unknown node exists in section JSON
- **WHEN** a section JSON contains an unknown node type from a newer/foreign editor version
- **THEN** save/reopen SHALL not crash the editor workflow
- **AND** the unknown node SHALL remain restorable through placeholder-based persistence

#### Scenario: Template apply then save and reopen
- **WHEN** a teacher applies a personal full-plan template and then saves the plan
- **THEN** each rich-text section payload SHALL remain valid and restorable through `contentJson`
- **AND** reopening the saved plan SHALL render the same section structure introduced by the template

