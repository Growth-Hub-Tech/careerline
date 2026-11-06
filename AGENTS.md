# AGENTS.md — Frontend Development Standards

These rules must be followed throughout frontend development. They apply to every feature, component, page, refactor and bug fix.

## 1. General Development Principles

- Always inspect the existing codebase before making changes.
- Understand the project architecture, coding patterns and conventions before implementation.
- Follow the existing structure unless there is a strong technical reason to improve it.
- Never introduce unnecessary complexity.
- Prioritise clean code, maintainability, scalability and performance.
- Do not make assumptions about existing functionality.
- Do not rewrite working implementations unnecessarily.
- Build complete, functional features rather than visual placeholders.
- Think through the implementation before writing code.

## 2. Code Quality and Cleanliness

- Write clean, readable, reusable and maintainable code.
- Avoid duplicated logic and unnecessary code.
- Use meaningful and consistent naming conventions.
- Keep components focused on a single responsibility.
- Extract reusable logic where appropriate.
- Avoid excessively large components and files.
- Avoid unnecessary abstractions and overengineering.
- Use proper TypeScript types and interfaces.
- Avoid `any` unless absolutely necessary.
- Avoid deeply nested conditional statements.
- Do not leave commented-out code, debugging statements or temporary implementations.
- Do not use placeholder implementations when actual functionality is required.

## 3. Remove Unused and Unnecessary Code

Always maintain a clean and organised codebase.

- Remove unused imports and exports.
- Remove unused variables, constants, functions and declarations.
- Remove unused interfaces, types and enums.
- Remove unused React hooks and unnecessary state declarations.
- Remove unused components and duplicated components.
- Remove unused CSS classes, styles and styling declarations.
- Remove unused images, icons, fonts and other assets.
- Remove obsolete files and folders that are no longer referenced.
- Remove redundant dependencies where safe and appropriate.
- Remove dead code and unreachable code.
- Remove unnecessary event handlers and effects.
- Remove duplicate API calls and redundant logic.
- Remove temporary files created during development.
- Do not retain old implementations after replacing them.
- Verify that files and assets are genuinely unused before deleting them.
- Check references, dynamic imports, routing and asset usage before removing files.
- Never delete files simply because they appear unused without investigating their purpose.

The objective is to ensure that the project contains only code, declarations, assets and dependencies that are actually needed.

## 4. Component Architecture

- Build reusable components where reuse provides genuine value.
- Avoid creating multiple components that perform the same function.
- Separate business logic from presentation where appropriate.
- Keep page components organised and manageable.
- Use appropriate composition patterns.
- Avoid passing unnecessary props.
- Avoid prop drilling when a suitable shared state solution already exists.
- Keep shared components consistent across the application.
- Do not create unnecessary global components for features used only once.

## 5. UI/UX and Visual Design

- Build modern, premium and professional interfaces.
- Prioritise simplicity, clarity and usability.
- Maintain consistent typography, spacing, sizing and visual hierarchy.
- Use a consistent design language throughout the application.
- Avoid unnecessary colours, gradients, shadows and decorative elements.
- Avoid childish, excessive or distracting animations.
- Do not make interfaces look like generic AI-generated templates.
- Use appropriate icons rather than emojis.
- Ensure buttons, forms, cards, navigation and other interactive elements have consistent styling.
- Pay attention to small details, alignment, spacing and visual balance.
- Every interface must look intentional and production-ready.

## 6. Responsive Design

- Every page and component must be responsive.
- Support mobile, tablet, laptop and desktop screen sizes.
- Use appropriate responsive layouts and breakpoints.
- Avoid fixed dimensions where they negatively affect responsiveness.
- Prevent horizontal overflow.
- Ensure text, images, tables, cards and navigation adapt properly.
- Do not simply shrink desktop layouts to fit mobile screens.
- Design mobile experiences intentionally.
- Test layouts at different viewport sizes.

## 7. Styling Standards

- Follow the styling approach already established in the project.
- Avoid mixing styling systems unnecessarily.
- Reuse existing design tokens, variables and theme configurations.
- Avoid duplicated CSS declarations.
- Remove obsolete and unused styles.
- Avoid excessive use of inline styles.
- Use consistent spacing and sizing values.
- Maintain proper hover, focus, active, disabled and loading states.
- Ensure styles do not unintentionally affect unrelated components.
- Avoid unnecessary use of `!important`.

## 8. React and Next.js Standards

- Follow established React and Next.js conventions.
- Use functional components and appropriate hooks.
- Follow the Rules of Hooks.
- Avoid unnecessary state.
- Avoid unnecessary `useEffect` and `useMemo` usage.
- Use server and client components appropriately in Next.js.
- Add `"use client"` only when client-side functionality is required.
- Avoid unnecessary client-side rendering.
- Use appropriate rendering and data-fetching strategies.
- Keep components predictable and easy to maintain.
- Use stable and meaningful keys when rendering lists.
- Avoid unnecessary re-renders.

## 9. API Integration and Data Handling

- Integrate with actual backend endpoints and documented API contracts.
- Never invent API endpoints or response structures.
- Centralise API logic where appropriate.
- Handle successful and unsuccessful responses correctly.
- Handle loading, empty, error and success states.
- Validate user input before submission.
- Prevent duplicate form submissions.
- Provide useful and understandable error messages.
- Avoid unnecessary API requests.
- Handle missing, null and unexpected data safely.
- Do not hardcode dynamic backend data into the interface.
- Keep API logic separate from UI components where appropriate.

## 10. Forms and User Interactions

- Every interactive element must perform its intended action.
- Validate form inputs properly.
- Display clear validation messages.
- Disable submission when appropriate.
- Show loading indicators during asynchronous operations.
- Prevent duplicate submissions.
- Provide success and failure feedback.
- Preserve user input when appropriate.
- Ensure keyboard accessibility.
- Do not create buttons or links that have no functional purpose.

## 11. Performance Optimisation

- Avoid unnecessary dependencies.
- Optimise image sizes and formats.
- Use lazy loading where appropriate.
- Avoid loading unnecessary assets.
- Use appropriate code splitting and dynamic imports.
- Prevent unnecessary component re-renders.
- Avoid expensive operations during rendering.
- Optimise large lists and data-heavy interfaces.
- Avoid unnecessary network requests.
- Prioritise fast initial page loading and smooth interactions.

## 12. Accessibility

- Use semantic HTML elements.
- Provide appropriate labels for form fields.
- Ensure keyboard navigation works.
- Provide visible focus indicators.
- Use appropriate ARIA attributes when necessary.
- Maintain sufficient colour contrast.
- Provide meaningful alternative text for images.
- Do not rely on colour alone to communicate important information.
- Ensure interactive elements are accessible.

## 13. Error Handling and Debugging

- Investigate the root cause before fixing an issue.
- Never hide errors just to make the interface appear functional.
- Avoid unnecessary empty catch blocks.
- Handle asynchronous errors properly.
- Check browser console errors and warnings.
- Avoid introducing regressions.
- Do not use temporary workarounds as permanent solutions.
- Verify that fixes work across affected screens and components.

## 14. File and Folder Organisation

- Maintain a clear and predictable folder structure.
- Place components, hooks, utilities, types and assets in appropriate locations.
- Use consistent file naming conventions.
- Avoid unnecessary nested folders.
- Avoid creating duplicate files.
- Keep related functionality organised.
- Remove obsolete files and folders after verifying they are no longer needed.
- Do not create new files when an existing appropriate implementation can be extended.

## 15. Security

- Never expose API keys, secrets or private credentials in frontend code.
- Never store sensitive credentials in insecure browser storage.
- Do not rely on frontend validation as the only security measure.
- Never assume that hiding a UI element provides authorisation.
- Handle authentication and session states carefully.
- Avoid rendering untrusted HTML.
- Follow secure data-handling practices.

## 16. Git and Existing Work

- Never overwrite or discard existing user changes.
- Do not reset branches or delete existing work without permission.
- Do not commit or push unless explicitly instructed.
- Review modified files before completing a task.
- Keep changes focused on the requested feature.
- Avoid unrelated refactoring.

## 17. Testing and Verification

Before considering any implementation complete:

- Run the relevant TypeScript checks.
- Run linting where configured.
- Run relevant tests.
- Verify the affected pages and components.
- Check responsiveness.
- Check browser console errors and warnings.
- Verify API integrations.
- Check for unused imports and declarations.
- Check for broken image and asset references.
- Confirm that existing functionality still works.

Never claim that something has been tested if it has not actually been tested.

## 18. Final Implementation Report

After completing a task, provide a concise report containing:

1. What was implemented.
2. Important files created or modified.
3. Unused code, assets or files removed.
4. Tests and checks performed.
5. Any outstanding issues.

## Final Rule

Do not prioritise writing more code over writing better code.

Every implementation must be clean, functional, responsive, maintainable, accessible and production-ready.

Always respect the existing project architecture while continuously improving code quality and removing unnecessary code and resources.
