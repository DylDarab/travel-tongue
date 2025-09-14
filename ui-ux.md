<![CDATA[# Travel Tongue App - UX/UI Improvement Recommendations

## Onboarding Experience Improvements

### Progressive Profiling
- **Problem**: Current onboarding requires all information upfront, leading to user drop-off
- **Solution**: Implement multi-step onboarding with contextual information gathering
- **Priority**: High
- **Complexity**: Medium
- **Implementation**:
  - Break into 3 steps: Personal Info → Travel Preferences → Additional Context
  - Add visual progress indicator with step numbers
  - Save partial progress to localStorage
- **User Flow**:
  1. Personal info (name, email)
  2. Travel details (destination, dates)
  3. Language preferences
  4. Optional: Learning preferences
- **Data Flow**: Client-state → tRPC mutation → Drizzle ORM → PostgreSQL

### Real-time Validation
- **Problem**: Form errors shown only after submission
- **Solution**: Add inline validation with React Hook Form + Zod
- **Priority**: Medium
- **Complexity**: Low
- **Example**:
```tsx
<TextInput
  label="Email"
  error={errors.email?.message}
  {...register('email', { required: 'Email is required' })}
/>
```

## Navigation & Information Architecture

### Consistent Navigation
- **Problem**: Inconsistent back behavior across sections
- **Solution**: Implement unified navigation pattern
- **Priority**: High
- **Complexity**: Low
- **Component Spec**:
  - Navbar component with persistent back button
  - Breadcrumbs for multi-step flows
  - ARIA: `aria-label="Main navigation"`

### Empty States
- **Problem**: Blank screens when no content exists
- **Solution**: Design contextual empty states
- **Priority**: Medium
- **Complexity**: Low
- **Example**:
```tsx
<div role="status" aria-live="polite">
  <EmptyState 
    icon={<GlobeIcon />}
    title="No phrases added"
    action={<Button>Add First Phrase</Button>}
  />
</div>
```

## Visual Design & Interaction Patterns

### Action Feedback
- **Problem**: No confirmation for user actions
- **Solution**: Implement toast notifications
- **Priority**: High
- **Complexity**: Low
- **Implementation**: Use `sonner` library with tRPC hooks
- **States**:
  - Loading: "Saving phrase..."
  - Success: "Phrase saved!"
  - Error: "Failed to save"

### Accessibility Compliance
- **Problem**: Inconsistent focus states
- **Solution**: System-wide accessibility audit
- **Priority**: High
- **Complexity**: Medium
- **Key Fixes**:
  - Ensure 4.5:1 contrast ratios (WCAG AA)
  - Add focus rings to all interactive elements
  - Implement screen reader announcements

## Content & Messaging

### Contextual Help
- **Problem**: Unclear field purposes
- **Solution**: Add tooltips and helper text
- **Priority**: Medium
- **Complexity**: Low
- **Example**:
```tsx
<TextInput
  label="Target Language"
  helperText="We'll customize lessons based on this"
/>
```

### Error Messaging
- **Problem**: Generic error messages
- **Solution**: Contextual error explanations
- **Priority**: High
- **Complexity**: Medium
- **Patterns**:
  - Field-specific: "Email must be valid"
  - Action-specific: "Couldn't save phrase - try again?"

## Technical Implementation

### Performance Optimizations
- **Problem**: Slow loading scenarios
- **Solution**: Implement React Suspense
- **Priority**: Medium
- **Complexity**: High
- **Implementation**:
```tsx
<Suspense fallback={<ScenarioSkeleton />}>
  <ScenarioList />
</Suspense>
```

### State Management
- **Problem**: Frequent refetching
- **Solution**: Optimize tRPC caching
- **Priority**: Medium
- **Complexity**: High
- **Pattern**:
  - StaleTime: 60 seconds
  - Optimistic updates for mutations

### Error Boundaries
- **Problem**: Full crashes on errors
- **Solution**: Component error boundaries
- **Priority**: High
- **Complexity**: Medium
- **Implementation**:
```tsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <ScenarioPage />
</ErrorBoundary>
```

## Metrics & Analytics
- **Event Tracking**:
  - `onboarding_complete`
  - `phrase_added`
  - `scenario_started`
- **Implementation**: tRPC middleware
]]>
