# unknown-node-readonly-fallback Specification

## Purpose
Define compatible fallback behavior for unknown editor node types to keep documents readable and restorable across version gaps.

## Requirements
### Requirement: Unknown node SHALL render as readonly placeholder block
When the editor receives a node type that is not registered in the current build, the system SHALL render it as a readonly placeholder block instead of silently converting it to plain text.

#### Scenario: Unknown node in loaded document
- **WHEN** a teaching plan is opened with an unrecognized node in section JSON
- **THEN** the editor SHALL display a visible placeholder block with the original node type label
- **AND** the placeholder block SHALL be readonly for content editing

### Requirement: Placeholder SHALL preserve original node payload
The placeholder mechanism MUST retain original unknown node payload for round-trip persistence.

#### Scenario: Save after opening unknown node
- **WHEN** a user opens a plan containing unknown node payload and saves without deleting the placeholder
- **THEN** the saved payload SHALL keep the original unknown node type and raw attrs/content
- **AND** reopen SHALL still show a placeholder for that same unknown node

### Requirement: Placeholder SHALL be removable by user action
The readonly placeholder block SHALL allow explicit delete operation to avoid locking document cleanup.

#### Scenario: User deletes unknown placeholder
- **WHEN** a user triggers delete on an unknown placeholder block
- **THEN** the block SHALL be removed from document content
- **AND** subsequent save SHALL not include the removed unknown node payload
