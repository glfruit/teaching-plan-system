## ADDED Requirements

### Requirement: Frontend SHALL provide a warm design token system
The frontend SHALL define and consume a centralized warm design token system for color, typography, spacing, radius, and shadow to ensure visual consistency.

#### Scenario: Define core warm tokens
- **WHEN** the application loads global styles
- **THEN** a token file SHALL expose warm palette variables including primary scale, semantic colors, text colors, and backgrounds
- **AND** typography tokens SHALL include display and body font families

#### Scenario: Tailwind extension aligns with design tokens
- **WHEN** component classes are generated via Tailwind
- **THEN** Tailwind extended colors/fonts/shadows SHALL map to the warm design system
- **AND** pages SHALL be able to use warm utility classes without ad-hoc hardcoded theme drift

### Requirement: Frontend SHALL load warm typography assets consistently
The frontend SHALL load and apply the approved font stack for display and body text.

#### Scenario: Font stack bootstrap
- **WHEN** `index.html` and app entry are loaded
- **THEN** the project SHALL preload/use Noto Serif SC and Inter/Noto Sans SC
- **AND** base typography SHALL render with the configured display/body stack
