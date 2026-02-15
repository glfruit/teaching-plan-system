## MODIFIED Requirements

### Requirement: Teacher SHALL manage personal full-plan templates
The system SHALL provide CRUD capabilities for teacher-owned plan templates, and each template MUST be accessible only by its owner.

#### Scenario: Create personal template
- **WHEN** an authenticated teacher submits a valid template payload
- **THEN** the system SHALL persist a new template associated with that teacher
- **AND** the response SHALL include template identifier and timestamps

#### Scenario: List personal templates
- **WHEN** an authenticated teacher requests template list
- **THEN** the system SHALL return only templates owned by that teacher
- **AND** templates SHALL be sorted by most recently updated first

#### Scenario: Access denied for foreign template
- **WHEN** a teacher requests update or delete on a template owned by another teacher
- **THEN** the system SHALL reject the operation
- **AND** the foreign template data SHALL not be returned

#### Scenario: Edit selected template in dialog
- **WHEN** a teacher opens template edit dialog for a selected template and submits updated title/body
- **THEN** the client SHALL call template update API with edited full-plan payload
- **AND** template list SHALL reflect the updated template values after save

#### Scenario: Cancel template edit
- **WHEN** a teacher opens template edit dialog and cancels
- **THEN** the template SHALL remain unchanged
