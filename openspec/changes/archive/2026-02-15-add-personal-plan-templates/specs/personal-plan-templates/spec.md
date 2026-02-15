## ADDED Requirements

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

### Requirement: System SHALL support save-current-plan-as-template
The system SHALL allow teachers to save current editor form data as a new personal template, including rich-text HTML and section JSON.

#### Scenario: Save current plan as template from editor
- **WHEN** a teacher triggers "save as template" in editor with complete form data
- **THEN** the system SHALL create a template containing all configured plan fields
- **AND** stored `contentJson` SHALL remain structurally valid for reopen

### Requirement: Applying template SHALL overwrite current plan form
The system SHALL support full-template application that overwrites the current plan form fields after explicit user confirmation.

#### Scenario: Confirm overwrite and apply
- **WHEN** a teacher confirms applying a selected template in editor
- **THEN** the client SHALL replace current form fields with template data in one operation
- **AND** the editor SHALL reflect the new rich-text and block content immediately

#### Scenario: Cancel overwrite
- **WHEN** a teacher cancels the apply confirmation
- **THEN** the current plan form SHALL remain unchanged

