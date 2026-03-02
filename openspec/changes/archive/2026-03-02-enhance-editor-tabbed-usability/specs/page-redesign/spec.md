## MODIFIED Requirements

### Requirement: Editor page SHALL preserve warm layout and template workflow
The editor page SHALL provide warm-styled editing workflow with two-column desktop layout and mobile-safe actions.

#### Scenario: Keyboard tab switching
- **WHEN** teacher uses editor page on desktop keyboard
- **THEN** the main tab groups SHALL support shortcut switching between tab sections
- **AND** switching behavior SHALL be equivalent to mouse click tab selection

#### Scenario: Restore active tab after refresh
- **WHEN** teacher reloads editor page during draft editing
- **THEN** editor SHALL restore previously active main tab from local preference
- **AND** fallback to `基础信息` when no valid stored value exists

#### Scenario: Template dialog next-incomplete navigation
- **WHEN** teacher edits template content in dialog
- **THEN** dialog SHALL provide a quick action to jump to the next incomplete tab
- **AND** quick action SHALL not reset already edited rich-text content
