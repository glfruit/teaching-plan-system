# page-redesign Specification

## Purpose
TBD - created by archiving change frontend-warm-redesign. Update Purpose after archive.
## Requirements
### Requirement: Login page SHALL provide warm split-layout experience
The login page SHALL implement a warm branded split layout on desktop and stacked layout on small screens.

#### Scenario: Desktop login layout
- **WHEN** viewport is desktop width
- **THEN** login page SHALL show brand panel and form panel in a two-column layout
- **AND** brand panel SHALL include warm decorative background and demo account hints

#### Scenario: Mobile login layout
- **WHEN** viewport is mobile width
- **THEN** login page SHALL stack brand and form sections vertically
- **AND** primary login action SHALL remain full-width and easy to tap

### Requirement: Home page SHALL use componentized warm dashboard layout
The home page SHALL present dashboard content using shared layout and UI primitives.

#### Scenario: Dashboard composition
- **WHEN** authenticated user enters home page
- **THEN** page SHALL render `NavBar`, `PageHeader`, KPI stat cards, and a plan list card
- **AND** plan status badges and actions SHALL use shared components and warm variants

#### Scenario: Empty and populated list states
- **WHEN** plan list is empty or populated
- **THEN** both states SHALL be visually consistent and responsive
- **AND** list row actions SHALL remain accessible on desktop and mobile

### Requirement: Editor page SHALL preserve warm layout and template workflow
The editor page SHALL provide warm-styled editing workflow with two-column desktop layout and mobile-safe actions.

#### Scenario: Shortcut mapping single source
- **WHEN** editor page handles tab keyboard switching and displays shortcut help
- **THEN** both behavior and help copy SHALL be derived from the same shortcut mapping source
- **AND** mapping updates SHALL not require editing multiple duplicated lists

### Requirement: Analytics page SHALL provide warm card-based data view
The analytics page SHALL render warm-styled cards for trend and summary sections.

#### Scenario: Analytics rendering
- **WHEN** analytics data loads successfully
- **THEN** page SHALL render trend chart, KPI cards, status distribution, and activity cards
- **AND** all sections SHALL use shared components and warm palette

#### Scenario: Analytics fallback states
- **WHEN** trend or summary data is unavailable
- **THEN** page SHALL render explicit empty placeholders
- **AND** loading and error states SHALL remain readable

