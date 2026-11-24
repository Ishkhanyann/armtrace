# ArmTrace requirements

## Sources

Local coursework materials, reviewed on 2026-11-24:

- `blockchain-web3-phase1-guide.pdf`: Phase 1 rules on pages 2–3; topic 9 on page 9; assessment criteria on page 19.
- `kursayinword.docx`: research, four role interfaces, event-based traceability, custody signatures and Web3 simulation.
- `Կուրսային_աշխատանք.docx`: revised research and problem statement for the same topic.
- `Տիտղոսաթերթ.docx`: individual coursework assignment for the same topic.

The two main coursework documents cover the same product. Their different research sections do not establish separate applications or divide development responsibilities. The PDF supplies the complete Phase 1 requirements.

## Confirmed by the user

1. Build one shared application.
2. Use clothing as the demonstration product category.
3. Use Armenian UI text, allowing familiar Web3 terms in English.
4. Use a light business interface with a sidebar, batch tables, route map, and blue/green accents.
5. Use GitHub for project tracking.
6. Create a new public repository.
7. Interview the user before implementing the frontend.
8. Track whole clothing batches: one article, color and size per batch, with one QR code per batch. Individual-item codes and batch splitting are deferred.
9. Include four international demonstration routes with different use cases and problems, including customs. The originally suggested single domestic route is superseded.
10. Use a demonstration role switcher without registration. Staff use simulated wallets; consumers may view history without signing in.

`ArmTrace` / `armtrace` is a provisional project and repository name selected during setup. The user has not chosen a final product brand.

## Required by the coursework

### Manufacturer

Register a new batch, create its Batch ID and generate a unique QR code.

### Logistics operator

Identify a batch using the QR interface; record receipt/transfer, GPS coordinates and timestamps; confirm custody.

### Administrator/controller

Monitor the full chain. The Word coursework additionally describes access management.

### Consumer

View the product route, event history and current status.

### Web3 UI and simulation

- An active Connect Wallet control in the top-right of every screen; connected state displays an abbreviated address and balance.
- Simulated wallet signing/confirmation dialogs.
- Explicit Pending, Success and Fail/Reverted transaction states.
- Mock tokens and a faucet control.
- Distinct Batch ID and simulated blockchain hash displays.
- QR scanning and location UI.
- Multisig logistics transfers.
- A Digital Product Passport represented as an NFT.
- Demonstration flow: logistics receives goods → scans a QR code → selects Confirm Custody → sees Mining Transaction → batch becomes In Transit → consumer route gains a timestamped point.

Phase 1 is a frontend simulation. Hashes, mock signatures and NFT displays must not claim to prove an actual on-chain transaction or real-world authenticity.

## Proposed international scenarios — awaiting agreement

These are fictional teaching scenarios, not descriptions of actual customs procedures or transport services. Specific documents, checkpoints and countries' rules have not been selected.

1. Armenia → Georgia: successful clothing delivery, with a complete custody trail and consumer passport.
2. Georgia → Armenia: customs hold for a missing supporting document, followed by document submission and release.
3. Italy → Armenia: a submitted document differs from its recorded fingerprint; an additional correction event preserves the original history.
4. Armenia → Germany: damaged packaging is detected at handover; the receiver declines to sign, custody stays with the sender, and an incident must be resolved before retrying.

Exact routes, incident behavior and resolutions are proposals, not confirmed user decisions.

## Open decisions

- Final product name and clothing brand/demo data.
- Clothing fields and example batches.
- Demonstration organizations, route stops and four international scenarios.
- Exact lifecycle states and transfer/multisig rules.
- Whether customs is a route stage managed from the controller interface or an additional role.
- Demo organization identities and wallet behavior when switching roles.
- Consumer-visible versus internal information.
- QR scanning behavior and fallback input.
- Map and location simulation behavior.
- Local persistence and a repeatable demonstration/reset flow.
- Frontend tooling and any additional instructor restrictions.
- Detailed screen composition and delivery/run expectations.
