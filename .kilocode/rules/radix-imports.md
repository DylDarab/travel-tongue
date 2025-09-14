## Brief overview

This rule defines the proper import patterns for Radix UI components in the Travel Tongue project to ensure consistency and avoid import errors.

## Radix UI Import Guidelines

- Always import Radix UI components directly from the main 'radix-ui' package, not individual scoped packages
- Use named imports for Radix components (e.g., `import { Dialog } from 'radix-ui'`)
- Avoid using `@radix-ui/react-*` scoped package imports
- Follow the existing project pattern of using the unified radix-ui package

## Example Usage

```typescript
// Correct
import { Dialog } from 'radix-ui'

// Incorrect
import * as Dialog from '@radix-ui/react-dialog'
```

## Rationale

- The project uses the unified radix-ui package (version ^1.4.3) as specified in package.json
- Individual @radix-ui/react-\* packages are not installed and will cause TypeScript errors
- Consistent import patterns improve code maintainability and reduce errors
