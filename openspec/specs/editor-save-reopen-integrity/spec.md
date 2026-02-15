# editor-save-reopen-integrity Specification

## Purpose
TBD - created by archiving change strengthen-editor-save-reopen-flow. Update Purpose after archive.
## Requirements
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

### Requirement: Known teaching-layout blocks MUST be preserved in fallback
The system MUST preserve known teaching-layout block semantics when deriving JSON from HTML fallback data.

#### Scenario: Timeline block in fallback HTML
- **WHEN** process HTML includes `data-node-type="lessonTimeline"`
- **THEN** derived `contentJson.process` SHALL include a `lessonTimeline` node
- **AND** the save payload SHALL remain reopenable without losing this block type

### Requirement: Fallback SHALL stay compatible for plain text sections
The system SHALL keep plain-text compatibility for legacy HTML without block markers.

#### Scenario: Legacy paragraph HTML
- **WHEN** section HTML contains plain paragraph text without known markers
- **THEN** derived section JSON SHALL be a valid document with paragraph/text content
- **AND** text content SHALL remain readable after reopen
