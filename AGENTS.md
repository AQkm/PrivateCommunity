# Repository instructions

This repository contains an early-stage private community portal. Follow these instructions when exploring, implementing, or reviewing changes.

## Technology and project conventions

- The intended stack is Vite, React, TypeScript, Tailwind CSS, PocketBase (Go and SQLite), and Playwright. Use React for frontend work; do not introduce Vue or another frontend framework.
- Prefer the project's existing structure, dependencies, and conventions. Avoid introducing dependencies unless they are needed for the requested work.
- Keep TypeScript strict and model PocketBase records with explicit interfaces that match the `Users`, `Events`, and `Photos` collections. Update the types when the collection schema changes; do not hide mismatches with `any` or unchecked casts.

## PocketBase and data access

- Use only the official `pocketbase` JavaScript SDK for PocketBase API access. Do not create raw `fetch()` wrappers or call PocketBase endpoints directly.
- Treat PocketBase API rules as the authorization boundary. Do not rely on client-side filtering to enforce access control or conceal unauthorized records.
- For images in grids and lists, generate thumbnail URLs through the SDK, for example `pb.files.getUrl(record, filename, { thumb: '300x300' })`. Load an original only when the user explicitly opens a single-photo view.
- Keep data access and error handling clear. Do not expose credentials or privileged server configuration in client code.

## Frontend and user experience

- Build mobile-first layouts with the project's Tailwind CSS utilities and responsive Grid/Flexbox patterns.
- Make interactive touch targets at least 44 by 44 CSS pixels where practical, and make swipe-based interactions usable on touch devices.
- Apply native `loading="lazy"` to media that is not immediately needed in the viewport.
- Event timelines must use pagination or infinite scrolling; do not load an unbounded event collection at once.
- Prefer small, functional components. Keep state local to the component or feature unless it represents the authenticated user session or the existing architecture calls for shared state.
- Preserve accessibility: use semantic elements, labels, keyboard-operable controls, and visible focus states.

## Tests and quality checks

- Add coverage from the lowest useful test level upward: unit, integration, API, then end-to-end (E2E). Start at the lowest level that can verify the behavior; add higher-level coverage only for behavior that needs it.
- Organize tests under `tests/unit`, `tests/integration`, `tests/api`, and `tests/e2e` according to their level. Playwright tests live under `tests/` and are divided into the relevant subfolders.

- Use stable `data-testid` attributes for Playwright selectors. Do not select elements by CSS classes or changeable visible text.
- Keep browser tests deterministic. Await the specific PocketBase response or other meaningful condition relevant to the action; do not use hard-coded `page.waitForTimeout()` delays.
- Isolate test data from real user data. Clean up records created by tests in `afterEach` or `afterAll`, including when a test fails. Prefer a dedicated test database or test PocketBase instance and never delete records outside the test's own scope.
- Follow the repository's existing test commands and conventions. Do not claim a check passed unless it was actually run.
