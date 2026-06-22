# ReactJS Component Builder Skill

## Description

Enforces modern ReactJS architectural patterns, strict functional components, customized hooks, and TypeScript structures.

## Invocations

- Explicit: "Create a new feature using the reactjs-builder skill."
- Implicit: Triggers whenever creating, refactoring, or optimizing React components (.tsx, .jsx).

## Instructions

### 1. Component Structure & Architecture

- All components must be written as functional components using the `export function ComponentName()` syntax. Do not use default exports.
- Components must be placed in `src/components/atoms/`, `src/components/molecules/`, or `src/components/organisms/` based on Atomic Design principles.
- Every component must have a dedicated styling file using Tailwind CSS or CSS Modules.

### 2. State & Hooks Patterns

- Prioritize primitive state configurations over complex single-object states unless values are strictly interdependent.
- Custom logic exceeding 15 lines within a component must be extracted into a localized custom hook named `use[ComponentName].ts`.
- Avoid data fetching inside `useEffect`. Utilize asynchronous state libraries or frameworks if available.

### 3. Strict Quality Checks

- Do not use the `any` keyword. Use exact TypeScript interfaces or type aliases for component props.
- Run linting checks using local configuration parameters before finishing code delivery.
