## ADDED Requirements

### Requirement: Frontend SHALL provide route-level transition animation
The app shell SHALL apply route transition animation for page changes with accessibility-safe behavior.

#### Scenario: Route transition
- **WHEN** navigating between major routes
- **THEN** outgoing and incoming views SHALL animate with subtle fade/translate transitions
- **AND** transition duration SHALL remain short enough to avoid perceived lag

### Requirement: Frontend SHALL provide micro-interactions on core controls
The UI SHALL provide consistent micro-interactions for cards, buttons, and inputs.

#### Scenario: Card and button feedback
- **WHEN** users hover cards or press buttons
- **THEN** cards SHALL apply slight lift/elevation and buttons SHALL apply active scale feedback
- **AND** disabled controls SHALL suppress interactive states

#### Scenario: Input focus feedback
- **WHEN** input controls receive focus
- **THEN** controls SHALL display warm focus ring and border emphasis
- **AND** visual focus SHALL remain clear for keyboard navigation

### Requirement: Frontend SHALL provide subtle decorative motion for branding
The UI SHALL support gentle background decorative motion where appropriate.

#### Scenario: Login decorative background
- **WHEN** login page is rendered
- **THEN** decorative blobs SHALL animate with slow float motion
- **AND** effect SHALL remain non-blocking for form usage

### Requirement: Frontend SHALL support reduced motion preference
The global style system SHALL respect reduced motion preference.

#### Scenario: Reduced motion mode
- **WHEN** user agent indicates `prefers-reduced-motion: reduce`
- **THEN** animation and transition durations SHALL be minimized
- **AND** core interactions SHALL remain functional without relying on motion
