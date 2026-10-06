# Feature: openfeature-framework-examples

## Objective

Show how to use the Flagward OpenFeature web provider with OpenFeature's React and Angular SDKs, and link the official OpenFeature ecosystem listing.

## Why

open-feature/openfeature.dev#1562 merged on 2026-10-05: Flagward is listed as an official OpenFeature provider. The page names `@openfeature/react-sdk` and `@openfeature/angular-sdk` but shows no code; Angular has no Flagward adapter, so this provider is its only path.

## Scope

- `content/docs/sdks/openfeature.mdx` and `content/docs/sdks/openfeature.es.mdx`.
- Link to https://openfeature.dev/ecosystem?instant_search%5Bquery%5D=flagward.
- React example (`OpenFeatureProvider`, `useBooleanFlagValue`) and Angular example (`provideOpenFeature`, `*booleanFeatureFlag`), verified against react-sdk 1.4.1 and angular-sdk 1.3.2 READMEs.

Out of scope: server-side SDKs (no server provider exists), OFREP.

## Tasks

- [x] T1 Add listing link + React and Angular examples (en + es)
- [x] T2 Verify lint, types and build
