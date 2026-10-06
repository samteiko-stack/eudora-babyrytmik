# Eudora UI system

The public registration experience and the admin application share one design system. New UI should use the tokens and components below instead of introducing one-off colors, spacing, controls, or card styles.

## Foundations

Global tokens live in `app/globals.css` and are exposed to Tailwind in `tailwind.config.ts`.

- Color: `bg`, `surface`, `surface-subtle`, `ink`, `muted`, `border`, `border-strong`, `teal`, `field`, `accent`, `success`, `warning`, and `error`.
- Spacing: the shared `space-1` through `space-12` scale.
- Shape: `rounded-sm`, `rounded-md`, `rounded-lg`, and `rounded-full`.
- Elevation: `shadow-sm`, `shadow-card`, and `shadow-dropdown`.
- Typography: `font-sans` for interface text and `font-heading` for page and feature headings.
- Focus: interactive controls use the shared `--focus-ring` treatment.

### Type scale

Use the shared type scale by role; do not introduce one-off font sizes.

- `text-xs` (12px): table headings, eyebrows, timestamps, and compact counts.
- `text-sm` (14px): supporting text, metadata, validation, and navigation.
- `text-base` (16px): body copy, form controls, labels, and primary table content.
- `text-lg` (18px): emphasized body text and small card titles.
- `text-xl` (20px): section and modal titles.
- `text-2xl` (24px): feature headings.
- `text-3xl` (30px): page titles.
- `text-4xl` and `text-5xl` (36px and 48px): display and metric values only.

Do not add another `:root` token block to a page stylesheet. Extend the global semantic tokens instead.

## Shared components

Reusable primitives are exported from `components/ui/index.ts`:

- Actions: `Button`, `NavItem`, `Switch`
- Forms: `Field`, `Label`, `Input`, `PasswordInput`, `Select`, `Checkbox`, `RadioGroup`, `ChoiceCard`, `SessionPicker`
- Feedback: `Alert`, `Badge`, `EmptyState`, `Modal`, `ConfirmModal`
- Layout and hierarchy: `Card`, `CardHeader`, `PageHeader`, `StatCard`

Prefer composing these primitives over copying their class strings into a page.

## Interaction rules

- Every interactive control needs a visible keyboard focus state.
- Destructive actions use the `danger` button variant and require confirmation.
- Empty collections use `EmptyState`; do not leave a blank table or panel.
- Success and error states use semantic tokens and plain-language outcomes.
- Tables may scroll horizontally on small screens; primary actions must remain reachable without horizontal scrolling.
- Page titles and actions use `PageHeader` so hierarchy remains consistent across admin views.

## Responsive layout

- Start with a single-column mobile layout.
- Use `sm`, `md`, and `lg` breakpoints only when content requires additional columns.
- Keep page gutters at `px-4 sm:px-6 lg:px-8` and content widths constrained where long lines would hurt readability.
