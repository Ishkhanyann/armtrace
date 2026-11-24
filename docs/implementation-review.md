# Frontend implementation review

Baseline: `e51ca86`. Initial implementation reviewed: `44993d9`, using `git diff e51ca86...HEAD`. Source requirements: `frontend-spec.md`, `requirements.md`, GitHub issue #1.

Two independent read-only reviews examined standards and specification compliance. Corrections were made by the primary implementer and verified with the checks below; no second delegated review was run.

## Standards

No hard violations of documented repository coding standards were found. Three P2 baseline judgment findings were identified and addressed:

1. **Duplicated resolution policy:** the UI permitted resolving a packaging incident with a later mismatching document, while the domain rejected it. Both now use `canResolve`.
2. **Display text used as event semantics:** sender signatures were distinguished from completed custody events by Armenian text. They now have a separate typed `signature` event; the public passport includes only completed custody events.
3. **Duplicated Batch ID allocation:** the form and domain independently calculated the next ID. Allocation now uses `nextBatchId`, and the registration command carries its reserved ID so the domain rejects a stale allocation before storing the associated reference fingerprint.

## Spec

One reproduced P2 finding was identified and addressed:

1. **Identity change during asynchronous hashing:** an upload could retain the previous connected actor after the user changed roles. The central request boundary now compares the captured identity with the current identity and rejects stale requests. It also prevents asynchronous requests from replacing a pending transaction. A browser regression test deliberately pauses SHA-256, switches roles, then resumes hashing and verifies that no document is registered.

No additional material missing requirements or scope creep were reported. The specification reviewer also checked all mobile pages at 320, 360 and 390 pixels.

## Verification

- TypeScript checking and production build.
- Ten domain tests covering custody, refusal, access, document correction, simultaneous incidents, public data, persistence validation and SHA-256.
- Seven Playwright scenarios covering the four use cases, failed transactions, stale identities, real QR PNG round-trip, persistence and mobile consumer/staff navigation.
- Dependency audit: no reported vulnerabilities at verification time.

The application remains a frontend simulation with fictional data and browser-local persistence. Live blockchain, a database, actual customs integration and live GPS are later-phase work.
