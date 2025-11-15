# Color Design System Guide

## Overview
This app uses a **dark theme** with **purple (#8B5CF6)** as the primary brand color. All color usage should follow these guidelines for consistency.

---

## Color Hierarchy & Usage

### 1. **Backgrounds** (Darkest to Lightest)

#### Primary Background
- **Color**: `SemanticColors.background` (Black #000000)
- **Usage**: Main app background, screen containers
- **Example**: Dashboard screens, main content areas

#### Secondary Background
- **Color**: `SemanticColors.surfaceSecondary` (Dark Gray #212121)
- **Usage**: Elevated cards, modals, secondary surfaces
- **Example**: Settings modal background, nested cards

#### Surface/White
- **Color**: `SemanticColors.surface` (White #FFFFFF)
- **Usage**: Card backgrounds, input fields, buttons (when needed)
- **Note**: Use sparingly on dark theme - mainly for contrast

---

### 2. **Text Colors** (By Importance)

#### Primary Text
- **Color**: `SemanticColors.textPrimary` (White #FFFFFF)
- **Usage**: Main headings, important labels, primary content
- **Example**: Screen titles, card titles, main body text

#### Secondary Text
- **Color**: `SemanticColors.textSecondary` (White 70% opacity)
- **Usage**: Subtitles, descriptions, less important info
- **Example**: Card subtitles, hint text, metadata

#### Tertiary Text
- **Color**: `SemanticColors.textTertiary` (White 60% opacity)
- **Usage**: Disabled text, placeholders, very subtle info
- **Example**: Input placeholders, disabled states

#### Purple Text (Accent)
- **Color**: `SemanticColors.primary` (Purple #8B5CF6)
- **Usage**: Section titles, emphasized text, brand elements
- **Example**: "Team Analytics", "Welcome, Coach" titles

---

### 3. **Purple Usage** (Primary Brand Color)

#### When to Use Purple:
✅ **DO USE**:
- Section titles and headings
- Primary buttons (filled)
- Active/selected states
- Borders on important cards
- Chart colors and data visualizations
- Links and interactive elements
- Progress indicators
- Icons that need emphasis

❌ **DON'T USE**:
- Body text (use white instead)
- Background colors (too bright for dark theme)
- Disabled states
- Error/warning messages

#### Purple Variants:
- **Primary**: `SemanticColors.primary` (#8B5CF6) - Main purple
- **Dark**: `SemanticColors.primaryDark` (#7C3AED) - Pressed/hover states
- **With Opacity**: `rgba(139, 92, 246, 0.8)` - Subtle overlays

---

### 4. **Borders**

#### Primary Border (Purple)
- **Color**: `SemanticColors.borderPrimary` (Purple #8B5CF6)
- **Usage**: Important cards, selected states, active inputs
- **Example**: Analytics cards, performance cards

#### Secondary Border (White)
- **Color**: `SemanticColors.borderSecondary` (White #FFFFFF)
- **Usage**: Chart containers, subtle dividers
- **Example**: Bar chart containers

#### Muted Border
- **Color**: `SemanticColors.borderMuted` (White 10% opacity)
- **Usage**: Subtle separators, list item dividers
- **Example**: Athlete roster rows, subtle card borders

---

### 5. **Buttons**

#### Primary Button (Purple)
- **Background**: `SemanticColors.primary` (Purple)
- **Text**: `SemanticColors.textOnPrimary` (White)
- **Usage**: Main actions, CTAs, continue buttons
- **States**:
  - Default: Purple background
  - Pressed: `SemanticColors.primaryDark`
  - Disabled: Gray with reduced opacity

#### Secondary Button
- **Background**: Transparent or dark gray
- **Text**: `SemanticColors.primary` (Purple) or White
- **Border**: `SemanticColors.borderPrimary` (Purple)
- **Usage**: Secondary actions, cancel buttons

#### Error/Destructive Button
- **Background**: `SemanticColors.error` (Red #E44F4F)
- **Text**: White
- **Usage**: Delete, sign out, destructive actions

---

### 6. **Status & Feedback Colors**

#### Success (Green)
- **Color**: `SemanticColors.success` (#78E66C)
- **Usage**: Positive changes, success messages, healthy status
- **Example**: "+2", "+5%", healthy athlete indicators

#### Warning (Yellow)
- **Color**: `SemanticColors.warning` (#D2DB70)
- **Usage**: Warnings, caution states
- **Example**: Yellow zone metrics

#### Error (Red)
- **Color**: `SemanticColors.error` (#E44F4F)
- **Usage**: Errors, critical states, injured status
- **Example**: Error messages, injured athletes

#### Info (Purple)
- **Color**: `SemanticColors.info` (Purple)
- **Usage**: Informational messages, neutral status

---

### 7. **Zone Colors** (For Metrics/Health)

#### Green Zone
- **Color**: `SemanticColors.zoneGreen` (#40BF80)
- **Usage**: Healthy metrics, good performance
- **Example**: "Green Zone" badges, healthy status

#### Yellow Zone
- **Color**: `SemanticColors.zoneYellow` (#D2DB70)
- **Usage**: Caution metrics, moderate performance
- **Example**: "Yellow Zone" badges

#### Red Zone
- **Color**: `SemanticColors.zoneRed` (#E44F4F)
- **Usage**: Critical metrics, poor performance
- **Example**: "Red Zone" badges, injured status

---

### 8. **Cards & Containers**

#### Standard Card
- **Background**: Transparent (inherits from parent)
- **Border**: `SemanticColors.borderPrimary` (Purple)
- **Border Radius**: `BorderRadius.xl` (12px)
- **Padding**: `Spacing.xl` (20px)

#### Elevated Card
- **Background**: `SemanticColors.surfaceSecondary` (Dark gray)
- **Border**: `SemanticColors.borderMuted` (Subtle)
- **Usage**: Modals, popovers, elevated content

#### Chart Container
- **Background**: `BrandColors.black` (Black)
- **Border**: `SemanticColors.borderSecondary` (White)
- **Usage**: Bar charts, line charts, data visualizations

---

### 9. **Input Fields**

#### Active Input
- **Background**: Transparent
- **Border Bottom**: `SemanticColors.borderPrimary` (Purple)
- **Text**: `SemanticColors.textPrimary` (White)
- **Placeholder**: `SemanticColors.textTertiary` (White 60%)

#### Inactive Input
- **Border Bottom**: Gray or muted white
- **Text**: White

---

### 10. **Navigation & Headers**

#### Navigation Bar
- **Background**: `SemanticColors.background` (Black)
- **Title**: `SemanticColors.primary` (Purple) - Large, bold
- **Icons**: White or Purple

#### Section Titles
- **Color**: `SemanticColors.primary` (Purple)
- **Size**: 20px or larger
- **Weight**: Semibold or Bold

---

## Color Usage Rules

### ✅ DO:
1. Use **white** for primary text and content
2. Use **purple** for headings, titles, and emphasis
3. Use **green** for positive/success indicators
4. Use **red** for errors and critical states
5. Use **subtle borders** (muted white) for separation
6. Use **purple borders** for important cards
7. Maintain **high contrast** for readability

### ❌ DON'T:
1. Don't use purple for body text (too bright)
2. Don't use white backgrounds (breaks dark theme)
3. Don't use too many colors at once
4. Don't use low contrast combinations
5. Don't mix different border styles inconsistently
6. Don't use purple for backgrounds (too bright)

---

## Examples by Component Type

### Dashboard Cards
```typescript
{
  backgroundColor: 'transparent',
  borderWidth: 1,
  borderColor: SemanticColors.borderPrimary, // Purple
  borderRadius: BorderRadius.xl,
  padding: Spacing.xl,
}
```

### Section Titles
```typescript
{
  color: SemanticColors.primary, // Purple
  fontSize: 20,
  fontWeight: Typography.fontWeight.semibold,
}
```

### Primary Buttons
```typescript
{
  backgroundColor: SemanticColors.primary, // Purple
  borderRadius: BorderRadius.lg,
  paddingVertical: Spacing.lg,
  paddingHorizontal: Spacing.xl,
}
// Text color: SemanticColors.textOnPrimary (White)
```

### Success Indicators
```typescript
{
  color: SemanticColors.success, // Green
  fontSize: Typography.fontSize.base,
  fontWeight: Typography.fontWeight.medium,
}
```

---

## Quick Reference

| Element | Color | Token |
|---------|-------|-------|
| Main Background | Black | `SemanticColors.background` |
| Primary Text | White | `SemanticColors.textPrimary` |
| Secondary Text | White 70% | `SemanticColors.textSecondary` |
| Titles/Headings | Purple | `SemanticColors.primary` |
| Primary Buttons | Purple | `SemanticColors.primary` |
| Card Borders | Purple | `SemanticColors.borderPrimary` |
| Success | Green | `SemanticColors.success` |
| Error | Red | `SemanticColors.error` |
| Warning | Yellow | `SemanticColors.warning` |

---

## Consistency Checklist

When adding new components, ensure:
- [ ] Text uses appropriate hierarchy (primary/secondary/tertiary)
- [ ] Purple is used for emphasis, not body text
- [ ] Borders follow the hierarchy (primary/muted)
- [ ] Status colors match their semantic meaning
- [ ] Cards use consistent border and padding
- [ ] Buttons follow primary/secondary patterns
- [ ] Dark theme is maintained throughout

