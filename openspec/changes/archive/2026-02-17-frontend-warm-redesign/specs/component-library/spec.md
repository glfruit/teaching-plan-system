## ADDED Requirements

### Requirement: Frontend SHALL provide reusable warm UI primitives
The frontend SHALL provide reusable base UI components that implement consistent warm visual style and interaction behavior.

#### Scenario: Base primitives are available for pages
- **WHEN** page views render forms, cards, and actions
- **THEN** they SHALL consume shared primitives including `BaseButton`, `BaseCard`, `BaseInput`, and `BaseBadge`
- **AND** these primitives SHALL expose typed props for size/variant/state customization

#### Scenario: Interaction behavior is standardized
- **WHEN** users hover/focus/click on interactive primitives
- **THEN** the component library SHALL apply consistent hover elevation, focus ring, and active press feedback
- **AND** disabled/loading states SHALL remain visually and behaviorally correct

### Requirement: Frontend SHALL provide shared layout components
The frontend SHALL provide shared layout components for navigation and page heading.

#### Scenario: Layout composition
- **WHEN** authenticated pages are rendered
- **THEN** pages SHALL use `NavBar` for top navigation and `PageHeader` for section heading
- **AND** layout components SHALL support responsive behavior for mobile and desktop

### Requirement: Frontend SHALL provide reusable stat visualization card
The frontend SHALL provide a shared `StatCard` component for KPI blocks.

#### Scenario: KPI rendering
- **WHEN** home or analytics pages show summary metrics
- **THEN** metrics SHALL render through shared `StatCard` with icon/color variants
- **AND** card hover and typography behavior SHALL remain consistent with the design system
